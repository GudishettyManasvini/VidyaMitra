import json
import os
from pathlib import Path

import fitz
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field

from security import (
    checking_pdf_info,
    checks_page_count,
    check_resume_text,
    mask_personal_info,
    check_prompt_injection,
    chatbot_message,
)


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
    target_role: str = Field(
        default="General career guidance",
        min_length=2,
        max_length=100,
    )


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000,
    )


def get_groq_client():

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured."
        )

    return Groq(api_key=api_key.strip())


def parse_json_response(raw_text):

    if not raw_text:
        raise HTTPException(
            status_code=502,
            detail="Groq returned an empty response."
        )

    text = raw_text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

    try:
        result = json.loads(text)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="Groq returned invalid JSON. Please try again."
        )

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=502,
            detail="Groq response was not a JSON object."
        )

    return result


def call_groq(prompt):

    try:
        completion = get_groq_client().chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Return only one valid JSON object. "
                        "Do not use Markdown, code fences, "
                        "or text outside the JSON."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.4,
            max_completion_tokens=4096,
            response_format={"type": "json_object"},
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Groq request failed: {error}"
        )

    if not completion.choices:
        raise HTTPException(
            status_code=502,
            detail="Groq returned no response choices."
        )

    return parse_json_response(
        completion.choices[0].message.content
    )


@app.get("/")
def read_root():

    return {
        "message": "VidyaMitra backend is running"
    }


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    contents = await file.read(5 * 1024 * 1024 + 1)

    try:
        checking_pdf_info(contents)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    try:
        document = fitz.open(
            stream=contents,
            filetype="pdf"
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    try:
        checks_page_count(document.page_count)

        text_parts = []

        for page in document:
            text = page.get_text()

            if text:
                text_parts.append(text)

        resume_text = "\n".join(text_parts)

    finally:
        document.close()

    try:
        resume_text = check_resume_text(resume_text)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    injection_detected = check_prompt_injection(resume_text)

    protected_resume_text = mask_personal_info(resume_text)

    response = {
        "resume_text": protected_resume_text
    }

    if injection_detected:
        response["security_warning"] = (
            "Suspicious content found in the resume."
        )

    return response


role_skills = {

    "Software Developer": {
        "required": [
            "OOP", "Data Structures", "Algorithms", "SQL", "DBMS",
            "Operating Systems", "Computer Networks", "Git", "REST APIs",
            "Software Testing", "Debugging"
        ],
        "groups": [
            ["Java", "Python", "C++", "C#", "JavaScript"]
        ]
    },

    "Frontend Developer": {
        "required": [
            "HTML", "CSS", "JavaScript", "Responsive Design",
            "REST APIs", "Git"
        ],
        "groups": [
            ["React", "Angular", "Vue.js"]
        ]
    },

    "Backend Developer": {
        "required": [
            "REST APIs", "HTTP", "SQL", "DBMS", "Git",
            "Authentication", "Authorization"
        ],
        "groups": [
            ["Java", "Python", "JavaScript", "C#"],
            ["Spring Boot", "FastAPI", "Django", "Express.js", "ASP.NET"]
        ]
    },

    "Full Stack Developer": {
        "required": [
            "HTML", "CSS", "JavaScript", "REST APIs", "SQL",
            "DBMS", "Git", "Authentication", "Authorization"
        ],
        "groups": [
            ["React", "Angular", "Vue.js"],
            ["Node.js", "Spring Boot", "FastAPI", "Django", "Express.js"]
        ]
    },

    "Data Analyst": {
        "required": [
            "SQL", "Excel", "Data Cleaning", "Data Analysis",
            "Statistics", "Data Visualization"
        ],
        "groups": [
            ["Python", "R"],
            ["Power BI", "Tableau"]
        ]
    },

    "Data Scientist": {
        "required": [
            "Python", "SQL", "Statistics", "Probability", "Data Analysis",
            "Data Cleaning", "Data Preprocessing", "Model Evaluation",
            "Data Visualization"
        ],
        "groups": [
            ["NumPy", "Pandas", "Scikit-learn"],
            ["TensorFlow", "PyTorch"]
        ]
    },

    "AI/ML Engineer": {
        "required": [
            "Python", "Data Preprocessing", "Model Evaluation",
            "Model Deployment", "Git", "REST APIs"
        ],
        "groups": [
            ["Scikit-learn", "TensorFlow", "PyTorch"],
            ["FastAPI", "Flask", "Django"]
        ]
    },

    "UI/UX Designer": {
        "required": [
            "UI Design", "UX Design", "User Research", "Wireframing",
            "Prototyping", "Usability Testing", "Design Systems"
        ],
        "groups": [
            ["Figma", "Adobe XD", "Sketch"]
        ]
    },

    "Cybersecurity Analyst": {
        "required": [
            "Networking", "TCP/IP", "Linux", "Firewalls",
            "Vulnerability Assessment", "Incident Response",
            "Security Monitoring", "SIEM", "Security Operations"
        ],
        "groups": [
            ["Python", "PowerShell", "Bash"],
            ["Splunk", "Microsoft Sentinel", "Wireshark", "Nessus", "Microsoft Defender"]
        ]
    }
}


def check_skills(resume_text, role):

    resume_text = resume_text.lower()

    matched_skills = []
    missing_skills = []

    if role not in role_skills:
        print("Error: Role not found!")
        return matched_skills, missing_skills

    role_data = role_skills[role]

    required_list = role_data["required"]
    groups_list = role_data["groups"]

    for skill in required_list:

        if skill.lower() in resume_text:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    for group in groups_list:

        found = False

        for skill in group:

            if skill.lower() in resume_text:
                matched_skills.append(skill)
                found = True
                break

        if not found:
            missing_skills.append(
                "One of: " + ", ".join(group)
            )

    return matched_skills, missing_skills


@app.post("/analyze")
def analyze_resume(request: ResumeTextRequest):

    try:
        resume_text = check_resume_text(request.resume_text)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    target_role = request.target_role.strip()

    if target_role not in role_skills:
        raise HTTPException(
            status_code=400,
            detail="This role is not available."
        )

    matched_skills, missing_skills = check_skills(
        resume_text,
        target_role
    )

    prompt = (
        "You are helping a college student improve their resume. "
        "Use simple and clear English. "
        "Give advice that is easy for a college student to understand. "
        "Use only the information given below. "
        "Do not invent skills, experience, or achievements. "

        f"\n\nTarget role: {target_role}"

        f"\n\nMatched skills: {matched_skills}"

        f"\n\nMissing skills: {missing_skills}"

        f"\n\nResume:\n{resume_text}"

        "\n\nReturn a JSON object with these keys: "
        "target_role, ats_score, role_match_score, strengths, "
        "matched_skills, improvements, missing_skills, "
        "priority_skills, project_suggestions, feedback. "

        "\nUse the matched and missing skills provided by Python. "

        "\nDo not create new missing skills. "

        "\nIf there are no missing skills, return an empty "
        "missing_skills array and an empty priority_skills array. "

        "\nGive 3 strengths. "

        "\nGive 3 simple resume improvements. "

        "\nGive project suggestions based on the actual missing skills. "

        "\nIf there are no missing skills, suggest projects that "
        "help improve the existing skills. "

        "\nKeep the feedback simple and practical."
    )

    result = call_groq(prompt)

    # Calculate the role match score using Python.
    # Groq should not decide this number.
    total_skills = (
        len(role_skills[target_role]["required"])
        + len(role_skills[target_role]["groups"])
    )

    if total_skills > 0:
        role_match_score = round(
            (len(matched_skills) / total_skills) * 100
        )
    else:
        role_match_score = 0

    result["target_role"] = target_role
    result["matched_skills"] = matched_skills
    result["missing_skills"] = missing_skills
    result["role_match_score"] = role_match_score

    return result


@app.post("/career")
def get_career_recommendations(request: ResumeTextRequest):

    target_role = request.target_role.strip()

    prompt = (
        "You are a career guidance assistant for a college student. "
        "Use simple and clear English. "
        "Use only the information from the resume. "
        "Do not invent skills or experience. "

        f"\n\nSelected target role: {target_role}"

        "\n\nReturn JSON in this format: "
        '{"careers":[{"role":"career role","fit":75,'
        '"reason":"reason based on resume",'
        '"skills":["skill1","skill2","skill3"]}]}'

        "\n\nGive exactly 4 career recommendations. "

        "\nDo not include the selected target role. "

        "\nRecommend other roles that match the candidate's resume. "

        "\nGive a fit percentage based on the candidate's resume. "

        f"\n\nResume text:\n{request.resume_text}"
    )

    result = call_groq(prompt)

    careers = result.get("careers", [])

    filtered_careers = []

    for career in careers:

        role = career.get("role", "").strip()

        if role.lower() != target_role.lower():
            filtered_careers.append(career)

    result["careers"] = filtered_careers[:3]

    return result


@app.post("/roadmap")
def get_roadmap(request: ResumeTextRequest):

    resume_text = check_resume_text(request.resume_text)

    if request.target_role not in role_skills:
        raise HTTPException(
            status_code=400,
            detail="This role is not available."
        )

    matched_skills, missing_skills = check_skills(
        resume_text,
        request.target_role
    )

    prompt = (
        "You are a learning planner for a college student. "
        "Use simple and clear English. "

        f"\n\nTarget role: {request.target_role}"

        f"\n\nMatched skills: {matched_skills}"

        f"\n\nMissing skills: {missing_skills}"

        "\n\nCreate a simple 12-week learning roadmap. "

        "Return JSON in this format: "
        '{"roadmap":[{"week":"Weeks 1-4",'
        '"title":"phase title",'
        '"tasks":["task1","task2","task3"]},'
        '{"week":"Weeks 5-8",'
        '"title":"phase title",'
        '"tasks":["task1","task2","task3"]},'
        '{"week":"Weeks 9-12",'
        '"title":"phase title",'
        '"tasks":["task1","task2","task3"]}]}'

        "\nFocus mainly on the missing skills. "

        "If there are no missing skills, suggest ways to improve "
        "the existing skills."
    )

    return call_groq(prompt)


@app.post("/chat")
def chat_with_mentor(request: ChatRequest):

    try:
        message = chatbot_message(request.message)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    prompt = (
        "You are a supportive career mentor for college students. "
        "Respond warmly and practically. "

        "Return JSON with exactly one key, response, "
        "whose value is a short supportive career mentor answer."

        f"\n\nStudent message:\n{message}"
    )

    result = call_groq(prompt)

    response_text = result.get("response")

    if not response_text:
        raise HTTPException(
            status_code=502,
            detail="Groq did not return a valid chat response."
        )

    return {
        "response": response_text.strip()
    }