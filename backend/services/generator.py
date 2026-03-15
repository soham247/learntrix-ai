import json
from google import genai

from config import GEMINI_API_KEY

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _clean_json(raw: str) -> str:
    """Strip markdown code fences if present."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    return raw.strip()


def generate_flashcards(text: str) -> list[dict]:
    """Generate 10-15 flashcards from the given text using Gemini."""
    prompt = f"""You are an expert educator. Based on the following content, generate 10 to 15 flashcards \
that help a student learn the key concepts.

Each flashcard should have a "front" (question or prompt) and a "back" (answer or explanation).

Return ONLY a valid JSON array of objects with "front" and "back" keys. No markdown, no extra text.

Example format:
[
  {{"front": "What is X?", "back": "X is..."}},
  {{"front": "Define Y", "back": "Y means..."}}
]

Content:
{text[:8000]}"""

    response = _get_client().models.generate_content(
        model="gemini-2.5-flash-lite", contents=prompt
    )
    return json.loads(_clean_json(response.text))


def generate_quiz(text: str) -> list[dict]:
    """Generate 5-10 multiple-choice quiz questions from the given text using Gemini."""
    prompt = f"""You are an expert educator. Based on the following content, generate 5 to 10 \
multiple-choice quiz questions to test a student's understanding.

Each question should have:
- "question": the question text
- "options": an array of exactly 4 answer choices (strings)
- "correct_answer": the index (0-3) of the correct option
- "explanation": a brief explanation of why the answer is correct

Return ONLY a valid JSON array. No markdown, no extra text.

Example format:
[
  {{
    "question": "What is X?",
    "options": ["A", "B", "C", "D"],
    "correct_answer": 0,
    "explanation": "A is correct because..."
  }}
]

Content:
{text[:8000]}"""

    response = _get_client().models.generate_content(
        model="gemini-2.5-flash-lite", contents=prompt
    )
    return json.loads(_clean_json(response.text))
