import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from supabase import create_client

from config import SUPABASE_URL, SUPABASE_KEY
from services.db import get_supabase
from services.youtube import get_transcript
from services.pdf import extract_text_from_pdf
from services.chunker import chunk_text
from services.embeddings import store_embeddings

router = APIRouter()
logger = logging.getLogger(__name__)


class VideoRequest(BaseModel):
    url: str


@router.post("/process-video")
async def process_video(request: VideoRequest):
    """Process a YouTube video: extract transcript, chunk, embed, and store."""
    try:
        # Extract transcript
        result = get_transcript(request.url)
        text = result["text"]
        title = result["title"]

        # Create session
        session_id = str(uuid.uuid4())

        supabase = get_supabase()
        # Store in Supabase
        supabase.table("sessions").insert(
            {
                "id": session_id,
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
        }

    except ValueError as e:
        logger.error("Video processing ValueError for URL %s: %s", request.url, e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Video processing failed for URL %s", request.url)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    """Process a PDF file: extract text, chunk, embed, and store."""
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

        file_bytes = await file.read()
        result = extract_text_from_pdf(file_bytes, file.filename)
        text = result["text"]
        title = result["title"]

        # Create session
        session_id = str(uuid.uuid4())

        supabase = get_supabase()
        # Store in Supabase
        supabase.table("sessions").insert(
            {
                "id": session_id,
                "source_type": "pdf",
                "source_url": file.filename,
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
