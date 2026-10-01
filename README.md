# VidyaMitra

VidyaMitra is an **AI-powered career guidance platform** that helps users analyze resumes, identify skill gaps, explore suitable career roles, and get personalized learning guidance.

## Features

* **Resume Analysis** – Extracts and analyzes information from uploaded resumes.
* **Role Matching** – Provides career-role recommendations based on resume skills and experience.
* **Skill Gap Analysis** – Identifies skills that can be improved for a target role.
* **Learning Roadmap** – Suggests areas to focus on based on identified gaps.
* **AI Mentor** – Provides interactive career and interview guidance.
* **Secure Input Handling** – Validates uploaded files and user inputs before processing them through the AI service.

## Tech Stack

* **Frontend:** React.js, Axios
* **Backend:** FastAPI, Python
* **AI:** Groq API
* **Document Processing:** PyMuPDF

## Security

* Validates uploaded PDF files before processing.
* Applies file size, page, and text limits.
* Treats uploaded resume content as untrusted input.
* Validates user chat input before AI processing.
* Protects sensitive information during AI interactions.

## Running Locally

1. Clone the repository.
2. Install the required frontend and backend dependencies.
3. Configure the required API credentials as environment variables.
4. Start the backend and frontend applications.

> 
