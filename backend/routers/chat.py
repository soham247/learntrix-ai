import json
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from supabase import create_client

from config import SUPABASE_URL, SUPABASE_KEY
from services.db import get_supabase
from services.rag import chat_stream

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: list[ChatMessage] = []


@router.post("/chat")
async def chat(request: ChatRequest):
    """RAG-based chat with streaming response."""
    try:
        supabase = get_supabase()
        # Verify session exists
        session = (
            supabase.table("sessions")
            .select("id")
            .eq("id", request.session_id)
            .single()
            .execute()
        )

        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found.")

        # Save user message to chat history
        supabase.table("chat_history").insert(
            {
                "session_id": request.session_id,
                "role": "user",
                "content": request.message,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()

        history = [{"role": m.role, "content": m.content} for m in request.history]

        async def event_stream():
            full_response = ""
            async for chunk in chat_stream(request.session_id, request.message, history):
                full_response += chunk
                # JSON-encode the chunk so newlines and special chars survive SSE transport
                yield f"data: {json.dumps(chunk)}\n\n"

            # Save assistant response to chat history
            supabase.table("chat_history").insert(
                {
                    "session_id": request.session_id,
                    "role": "assistant",
                    "content": full_response,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            ).execute()

            yield "data: [DONE]\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
