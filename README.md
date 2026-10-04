# VidyaMitra

VidyaMitra is an **AI-powered career guidance platform** that helps students analyze resumes, identify skill gaps, explore suitable career roles, and get personalized learning guidance.

## Features

* **Resume Analysis** – Extracts and analyzes information from uploaded resumes.
* **ATS Score** – Provides an AI-based score to evaluate resume readiness.
* **Role Matching** – Compares resume skills with the selected career role.
* **Skill Gap Analysis** – Identifies matched and missing skills for the target role.
* **Career Recommendations** – Suggests suitable career roles based on the resume.
* **Learning Roadmap** – Generates a personalized 12-week learning roadmap.
* **Project Suggestions** – Suggests portfolio projects based on the selected career role.
* **AI Mentor** – Provides interactive career, resume, interview, and learning guidance.
* **Secure Input Handling** – Validates uploaded files and user inputs before processing them through the AI service.

## Tech Stack

* **Frontend:** React.js, JavaScript, CSS, Axios, React Router
* **Backend:** FastAPI, Python
* **AI:** Groq API
* **Document Processing:** PyMuPDF
* **Validation:** Pydantic

## Security

* Validates uploaded PDF files before processing.
* Applies file size, page, and text limits.
* Treats uploaded resume content as untrusted input.
* Detects basic prompt injection patterns.
* Validates user chat input before AI processing.
* Masks basic personal information such as email addresses and phone numbers.

## Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/GudishettyManasvini/VidyaMitra.git
cd VidyaMitra
