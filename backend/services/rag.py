from google import genai

from config import GEMINI_API_KEY
from services.embeddings import query_similar

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def build_rag_prompt(context_chunks: list[str], question: str, history: list[dict]) -> str:
    """Build a RAG prompt with retrieved context and chat history."""
    context = "\n\n---\n\n".join(context_chunks)

    history_text = ""
    if history:
        for msg in history[-6:]:  # Keep last 6 messages for context
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"

    prompt = f"""You are a helpful learning assistant. Answer the user's question based on the provided context.
If the context doesn't contain enough information, say so honestly but still try to be helpful.
Keep your answers clear, educational, and concise.

Context from the learning material:
{context}

{f"Previous conversation:{chr(10)}{history_text}" if history_text else ""}

User's question: {question}

Provide a helpful, educational response:"""

    return prompt


async def chat_stream(session_id: str, message: str, history: list[dict]):
    """Stream a RAG-based chat response."""
    # Retrieve relevant context from Pinecone
    context_chunks = query_similar(session_id, message, top_k=5)

    # Build the prompt
    prompt = build_rag_prompt(context_chunks, message, history)

    # Stream the response from Gemini using new SDK
    client = _get_client()
    async for chunk in await client.aio.models.generate_content_stream(
        model="gemini-2.5-flash-lite", contents=prompt
    ):
        if chunk.text:
            yield chunk.text
