import json
import os
import re
import traceback
from pathlib import Path
from typing import Any

import fitz
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
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


client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _extract_json(text: str):
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text)
        text = re.sub(r"```$", "", text)
        text = text.strip()

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:
        text = text[start:end + 1]

    return json.loads(text)


def _call_groq_json(prompt: str):

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You always return valid JSON only. Never use markdown."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.5,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )

        output = response.choices[0].message.content

        return _extract_json(output)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



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

    return _call_groq_json(prompt)


@app.post("/career")
def get_career_recommendations(request: ResumeTextRequest) -> dict[str, Any]:
    prompt = (
        "You are a career guidance assistant. Return valid JSON in this exact shape:"
        "{\"careers\":[{\"role\":\"career role\",\"fit\":number 0 to 100,\"reason\":\"specific reason based on resume\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\"]}]}"
        "Return exactly 3 personalised career recommendations based only on the resume provided. Do not return static responses."
        f"\nResume text:\n{request.resume_text}"
    )

    return _call_groq_json(prompt)


@app.post("/roadmap")
def get_roadmap(request: ResumeTextRequest) -> dict[str, Any]:
    prompt = (
        "You are a learning planner. Return valid JSON in this exact shape:"
        "{\"roadmap\":[{\"week\":raise\"Weeks 1–4\",\"title\":\"phase title\",\"tasks\":[\"task1\",\"task2\",\"task3\"]},"
        "{\"week\":\"Weeks 5–8\",\"title\":\"phase title\",\"tasks\":[\"task1\",\"task2\",\"task3\"]},"
        "{\"week\":\"Weeks 9–12\",\"title\":\"phase title\",\"tasks\":[\"task1\",\"task2\",\"task3\"]}]}"
        "Make the plan personalised to the skills and gaps in the actual resume."
        f"\nResume text:\n{request.resume_text}"
    )

    return _call_groq_json(prompt)


@app.post("/chat")
def chat_with_mentor(request: ChatRequest) -> dict[str, str]:
    prompt = (
        "You are a supportive career mentor for college students. Respond warmly and practically."
        f"\nStudent message:\n{request.message}"
    )

    result = _call_groq_json(
        "Return valid JSON with exactly one key 'response' and a short supportive career mentor answer."
        f"\n{prompt}"
    )

    response_text = result.get("response")
    if not isinstance(response_text, str) or not response_text.strip():
        raise HTTPException(
    status_code=502,
    detail="Groq did not return a valid chat response.",
)

    return {"response": response_text}
