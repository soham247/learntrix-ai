from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from services.db import get_supabase_admin
from services.auth import get_current_user
from services.generator import generate_flashcards, generate_quiz

router = APIRouter()


class GenerateRequest(BaseModel):
    session_id: str


@router.post("/generate-flashcards")
async def create_flashcards(
    request: GenerateRequest,
    current_user=Depends(get_current_user),
):
    """Generate flashcards for a session's content."""
    try:
        supabase = get_supabase_admin()
        result = (
            supabase.table("sessions")
            .select("raw_text, title, user_id")
            .eq("id", request.session_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found.")

        if result.data["user_id"] != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied.")

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
async def create_quiz(
    request: GenerateRequest,
    current_user=Depends(get_current_user),
):
    """Generate quiz questions for a session's content."""
    try:
        supabase = get_supabase_admin()
        result = (
            supabase.table("sessions")
            .select("raw_text, title, user_id")
            .eq("id", request.session_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found.")

        if result.data["user_id"] != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied.")

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
