import re

MAX_PDF_SIZE = 5 * 1024 * 1024  
MAX_PDF_PAGES = 10
MAX_RESUME_TEXT_LENGTH = 20000
MAX_CHAT_LENGTH = 2000


def validate_pdf_content(contents: bytes) -> None:
    """Validate the uploaded PDF before processing it."""

    if not contents:
        raise ValueError("Uploaded file is empty.")

    if len(contents) > MAX_PDF_SIZE:
        raise ValueError("PDF file is too large. Maximum size is 5 MB.")

    
    if not contents.startswith(b"%PDF-"):
        raise ValueError("Uploaded file is not a valid PDF.")


def validate_page_count(page_count: int) -> None:
    """Prevent excessively large PDF documents."""

    if page_count > MAX_PDF_PAGES:
        raise ValueError(
            f"PDF contains too many pages. Maximum allowed is {MAX_PDF_PAGES}."
        )


def validate_resume_text(text: str) -> str:
    """Validate and normalize extracted resume text."""

    text = text.strip()

    if not text:
        raise ValueError("No readable text found in the uploaded PDF.")

    if len(text) > MAX_RESUME_TEXT_LENGTH:
        raise ValueError(
            "Resume contains too much text. Please upload a shorter document."
        )

    return text


def mask_pii(text: str) -> str:
    """
    Mask common personally identifiable information before
    sending resume content to an external AI service.
    """

    
    text = re.sub(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        "[EMAIL REDACTED]",
        text,
    )

    
    text = re.sub(
        r"(?<!\d)(?:\+91[-\s]?)?[6-9]\d{9}(?!\d)",
        "[PHONE REDACTED]",
        text,
    )

    return text


def detect_prompt_injection(text: str) -> bool:
    """
    Detect common prompt-injection patterns.

    This is only a heuristic detection layer.
    It should not be treated as a complete prompt-injection solution.
    """

    suspicious_patterns = [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"ignore\s+the\s+instructions",
        r"disregard\s+(all\s+)?previous",
        r"system\s+prompt",
        r"reveal\s+your\s+instructions",
        r"you\s+are\s+now\s+",
        r"act\s+as\s+",
        r"developer\s+message",
    ]

    lowered = text.lower()

    return any(
        re.search(pattern, lowered)
        for pattern in suspicious_patterns
    )


def validate_chat_message(message: str) -> str:
    """Validate mentor-chat input."""

    message = message.strip()

    if not message:
        raise ValueError("Message cannot be empty.")

    if len(message) > MAX_CHAT_LENGTH:
        raise ValueError(
            f"Message is too long. Maximum length is "
            f"{MAX_CHAT_LENGTH} characters."
        )

    return message