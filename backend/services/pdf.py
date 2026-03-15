import io
from PyPDF2 import PdfReader


def extract_text_from_pdf(file_bytes: bytes, filename: str) -> dict:
    """Extract text content from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages_text = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages_text.append(text)

    full_text = "\n\n".join(pages_text)
    if not full_text.strip():
        raise ValueError("Could not extract any text from the PDF.")

    return {
        "title": filename,
        "text": full_text,
        "num_pages": len(reader.pages),
    }
