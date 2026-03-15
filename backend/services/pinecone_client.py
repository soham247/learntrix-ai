from pinecone import Pinecone

from config import PINECONE_API_KEY, PINECONE_INDEX_NAME

_pc: Pinecone | None = None
_index = None


def get_index():
    """Return a lazily-initialised Pinecone index (singleton)."""
    global _pc, _index
    if _index is None:
        _pc = Pinecone(api_key=PINECONE_API_KEY)
        _index = _pc.Index(PINECONE_INDEX_NAME)
    return _index
