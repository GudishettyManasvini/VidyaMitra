max_size_of_pdf = 5 * 1024 * 1024
pdf_pages_max = 10
resume_text_length = 20000
chatbot_message_length = 2000

def checking_pdf_info(contents: bytes) -> None:

    if not contents:
        raise ValueError("Uploaded file is empty.")

    if len(contents) > max_size_of_pdf:
        raise ValueError("PDF file is too large. Maximum size is 5 MB.")

    if not contents.startswith(b"%PDF-"):
        raise ValueError("Uploaded file is not a valid PDF.")

def checks_page_count(page_count: int) -> None:

    if page_count > pdf_pages_max:
        raise ValueError(
            f"PDF contains too many pages. Maximum allowed is {pdf_pages_max}."
        )

def check_resume_text(text: str) -> str:

    text = text.strip()

    if text == "":
        raise ValueError("No readable text found in the uploaded PDF.")

    if len(text) > resume_text_length:
        raise ValueError("Resume contains too much text.")

    return text

def mask_personal_info(text: str) -> str:

    words = text.split()
    new_words = []

    for word in words:
        if "@" in word and "." in word:
            new_words.append("[EMAIL MASKED]")
        elif word.isdigit() and len(word) == 10:
            new_words.append("[PHONE MASKED]")
        else:
            new_words.append(word)

    return " ".join(new_words)

def check_prompt_injection(text: str) -> bool:

    suspicious_patterns = [
        "ignore previous instructions",
        "ignore the instructions",
        "disregard previous instructions",
        "system prompt",
        "reveal your instructions",
        "you are now",
        "act as",
        "developer message",
    ]

    text = text.lower()

    for pattern in suspicious_patterns:
        if pattern in text:
            return True

    return False

def chatbot_message(message: str) -> str:

    message = message.strip()

    if message == "":
        raise ValueError("Chatbot message is empty.")

    if len(message) > chatbot_message_length:
        raise ValueError("Message is too long.")

    return message