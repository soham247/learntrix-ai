import time

from google import genai
from google.genai import types

from config import GEMINI_API_KEY

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _embed_with_retry(client: genai.Client, contents, max_retries: int = 5) -> list:
    """Call embed_content with exponential backoff on 429 rate-limit errors."""
    for attempt in range(max_retries):
        try:
            result = client.models.embed_content(
                model="gemini-embedding-001",
                contents=contents,
                config=types.EmbedContentConfig(output_dimensionality=768),
            )
            return result.embeddings
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = 30 * (2 ** attempt)  # 30s, 60s, 120s ...
                print(f"Rate limited, retrying in {wait}s (attempt {attempt + 1})")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Gemini embedding API rate limit exceeded after retries.")


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts using Gemini."""
    client = _get_client()
    embeddings = _embed_with_retry(client, texts)
    return [emb.values for emb in embeddings]


def get_query_embedding(text: str) -> list[float]:
    """Generate embedding for a single query text."""
    client = _get_client()
    embeddings = _embed_with_retry(client, text)
    return embeddings[0].values


def store_embeddings(session_id: str, chunks: list[str]) -> int:
    """Embed chunks and upsert them into Pinecone under the session namespace."""
    from services.pinecone_client import get_index

    batch_size = 100
    total_stored = 0

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        embeddings = get_embeddings(batch)

        vectors = []
        for j, (chunk, embedding) in enumerate(zip(batch, embeddings)):
            vectors.append(
                {
                    "id": f"{session_id}-{i + j}",
                    "values": embedding,
                    "metadata": {"text": chunk, "session_id": session_id},
                }
            )

        get_index().upsert(vectors=vectors, namespace=session_id)
        total_stored += len(vectors)
        if i + batch_size < len(chunks):
            time.sleep(2)  # Brief pause between batches to avoid rate limits

    return total_stored


def query_similar(session_id: str, query: str, top_k: int = 5) -> list[str]:
    """Query Pinecone for the most similar chunks to the query."""
    from services.pinecone_client import get_index

    query_emb = get_query_embedding(query)
    results = get_index().query(
        vector=query_emb,
        top_k=top_k,
        namespace=session_id,
        include_metadata=True,
    )
    return [match["metadata"]["text"] for match in results["matches"]]
