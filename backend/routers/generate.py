from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client

from config import SUPABASE_URL, SUPABASE_KEY
from services.db import get_supabase
from services.generator import generate_flashcards, generate_quiz

router = APIRouter()


class GenerateRequest(BaseModel):
    session_id: str


@router.post("/generate-flashcards")
async def create_flashcards(request: GenerateRequest):
    """Generate flashcards for a session's content."""
    try:
        supabase = get_supabase()
        # Get session text from Supabase
        result = (
            supabase.table("sessions")
            .select("raw_text, title")
            .eq("id", request.session_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found.")

        text = result.data["raw_text"]
        flashcards = generate_flashcards(text)

        return {
            "session_id": request.session_id,
            "title": result.data["title"],
            "flashcards": flashcards,
            "count": len(flashcards),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flashcard generation failed: {str(e)}")


@router.post("/generate-quiz")
async def create_quiz(request: GenerateRequest):
    """Generate quiz questions for a session's content."""
    try:
        supabase = get_supabase()
        result = (
            supabase.table("sessions")
            .select("raw_text, title")
            .eq("id", request.session_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found.")

        text = result.data["raw_text"]
        quiz = generate_quiz(text)

        return {
            "session_id": request.session_id,
            "title": result.data["title"],
            "questions": quiz,
            "count": len(quiz),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")
