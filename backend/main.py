import json
import os
import re
from pathlib import Path
from typing import Any

import fitz
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="VidyaMitra Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResumeTextRequest(BaseModel):
    resume_text: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


def _get_gemini_client() -> Any:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    try:
        from google import genai

        return genai.Client(api_key=api_key)
    except Exception as exc:  # pragma: no cover - defensive path
        raise HTTPException(status_code=500, detail="Unable to initialize Gemini client.") from exc


def _extract_text_from_response(response: Any) -> str:
    text = getattr(response, "text", None)
    if text:
        return text

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if part_text:
                return part_text

    return str(response)


def _parse_json_response(raw_text: str) -> dict[str, Any]:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="Gemini returned invalid JSON.") from exc

    if not isinstance(parsed, dict):
        raise HTTPException(status_code=502, detail="Gemini response was not a JSON object.")

    return parsed


def _call_gemini_json(prompt: str) -> dict[str, Any]:
    client = _get_gemini_client()

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
    except Exception as exc:  # pragma: no cover - defensive path
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}") from exc

    try:
        return _parse_json_response(_extract_text_from_response(response))
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive path
        raise HTTPException(status_code=502, detail="Gemini response could not be parsed.") from exc


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "VidyaMitra backend is running"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)) -> dict[str, str]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

    try:
        document = fitz.open(stream=contents, filetype="pdf")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid PDF file.") from exc

    try:
        text_parts = [page.get_text() for page in document]
        resume_text = "\n".join(part for part in text_parts if part).strip()
    finally:
        document.close()

    if not resume_text:
        raise HTTPException(status_code=400, detail="No readable text found in the uploaded PDF.")

    return {"resume_text": resume_text}


@app.post("/analyze")
def analyze_resume(request: ResumeTextRequest) -> dict[str, Any]:
    prompt = (
        "You are an ATS resume evaluator. Analyse only the resume provided. Return valid JSON with exactly:"
        "{"
        "ats_score: number between 0 and 100,"
        "strengths: array of 3 specific strengths found in the resume,"
        "improvements: array of 3 specific resume improvements,"
        "missing_skills: array of 4 useful missing skills based on the candidate profile,"
        "feedback: one personalised paragraph"
        "}"
        "Never use fixed or demo results. Do not invent existing skills."
        f"\nResume text:\n{request.resume_text}"
    )

    return _call_gemini_json(prompt)


@app.post("/career")
def get_career_recommendations(request: ResumeTextRequest) -> dict[str, Any]:
    prompt = (
        "You are a career guidance assistant. Return valid JSON in this exact shape:"
        "{\"careers\":[{\"role\":\"career role\",\"fit\":number 0 to 100,\"reason\":\"specific reason based on resume\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\"]}]}"
        "Return exactly 3 personalised career recommendations based only on the resume provided. Do not return static responses."
        f"\nResume text:\n{request.resume_text}"
    )

    return _call_gemini_json(prompt)


@app.post("/roadmap")
def get_roadmap(request: ResumeTextRequest) -> dict[str, Any]:
    prompt = (
        "You are a learning planner. Return valid JSON in this exact shape:"
        "{\"roadmap\":[{\"week\":\"Weeks 1–4\",\"title\":\"phase title\",\"tasks\":[\"task1\",\"task2\",\"task3\"]},"
        "{\"week\":\"Weeks 5–8\",\"title\":\"phase title\",\"tasks\":[\"task1\",\"task2\",\"task3\"]},"
        "{\"week\":\"Weeks 9–12\",\"title\":\"phase title\",\"tasks\":[\"task1\",\"task2\",\"task3\"]}]}"
        "Make the plan personalised to the skills and gaps in the actual resume."
        f"\nResume text:\n{request.resume_text}"
    )

    return _call_gemini_json(prompt)


@app.post("/chat")
def chat_with_mentor(request: ChatRequest) -> dict[str, str]:
    prompt = (
        "You are a supportive career mentor for college students. Respond warmly and practically."
        f"\nStudent message:\n{request.message}"
    )

    result = _call_gemini_json(
        "Return valid JSON with exactly one key 'response' and a short supportive career mentor answer."
        f"\n{prompt}"
    )

    response_text = result.get("response")
    if not isinstance(response_text, str) or not response_text.strip():
        raise HTTPException(status_code=502, detail="Gemini did not return a valid chat response.")

    return {"response": response_text}
