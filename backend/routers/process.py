import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel

from services.db import get_supabase_admin
from services.auth import get_current_user
from services.youtube import get_transcript
from services.pdf import extract_text_from_pdf
from services.chunker import chunk_text
from services.embeddings import store_embeddings

router = APIRouter()
logger = logging.getLogger(__name__)

MONTHLY_VIDEO_LIMIT = 10


class VideoRequest(BaseModel):
    url: str


def _current_month() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def _check_and_increment_video_usage(user_id: str, supabase) -> int:
    """Check monthly video usage, raise 429 if over limit, else increment and return new count."""
    month = _current_month()

    # Upsert a usage row for this user+month, initialising count to 0 if new
    supabase.table("usage").upsert(
        {"user_id": user_id, "month": month, "video_count": 0},
        on_conflict="user_id,month",
        ignore_duplicates=True,
    ).execute()

    # Fetch current count
    result = (
        supabase.table("usage")
        .select("video_count")
        .eq("user_id", user_id)
        .eq("month", month)
        .single()
        .execute()
    )
    current_count = result.data["video_count"]

    if current_count >= MONTHLY_VIDEO_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"You've reached your {MONTHLY_VIDEO_LIMIT} YouTube video limit for this month. It resets on the 1st.",
        )

    # Increment
    supabase.table("usage").update({"video_count": current_count + 1}).eq(
        "user_id", user_id
    ).eq("month", month).execute()

    return current_count + 1


@router.post("/process-video")
async def process_video(
    request: VideoRequest,
    current_user=Depends(get_current_user),
):
    """Process a YouTube video: extract transcript, chunk, embed, and store."""
    try:
        supabase = get_supabase_admin()
        user_id = str(current_user.id)

        # --- Deduplication: return existing session if same user + URL ---
        existing = (
            supabase.table("sessions")
            .select("id, title")
            .eq("source_url", request.url)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            return {
                "session_id": existing.data[0]["id"],
                "title": existing.data[0]["title"],
                "reused": True,
            }

        # --- Usage limit check ---
        _check_and_increment_video_usage(user_id, supabase)

        # Extract transcript
        result = get_transcript(request.url)
        text = result["text"]
        title = result["title"]

        # Create session
        session_id = str(uuid.uuid4())

        supabase.table("sessions").insert(
            {
                "id": session_id,
                "user_id": user_id,
                "source_type": "youtube",
                "source_url": request.url,
                "title": title,
                "raw_text": text,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()

        # Chunk and embed
        chunks = chunk_text(text)
        num_stored = store_embeddings(session_id, chunks)

        return {
            "session_id": session_id,
            "title": title,
            "num_chunks": len(chunks),
            "num_vectors": num_stored,
            "text_preview": text[:500],
            "reused": False,
        }

    except ValueError as e:
        logger.error("Video processing ValueError for URL %s: %s", request.url, e)
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Video processing failed for URL %s", request.url)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/process-pdf")
async def process_pdf(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Process a PDF file: extract text, chunk, embed, and store."""
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

        supabase = get_supabase_admin()
        user_id = str(current_user.id)

        file_bytes = await file.read()
        result = extract_text_from_pdf(file_bytes, file.filename)
        text = result["text"]
        title = result["title"]

        session_id = str(uuid.uuid4())

        supabase.table("sessions").insert(
            {
                "id": session_id,
                "user_id": user_id,
                "source_type": "pdf",
                "source_url": file.filename,
                "title": title,
                "raw_text": text,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()

        chunks = chunk_text(text)
        num_stored = store_embeddings(session_id, chunks)

        return {
            "session_id": session_id,
            "title": title,
            "num_chunks": len(chunks),
            "num_vectors": num_stored,
            "num_pages": result["num_pages"],
            "text_preview": text[:500],
        }

    except HTTPException:
        raise
    except ValueError as e:
        logger.error("PDF processing ValueError for file %s: %s", file.filename, e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("PDF processing failed for file %s", file.filename)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
