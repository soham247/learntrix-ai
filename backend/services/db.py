from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY

_client: Client | None = None
_admin_client: Client | None = None


def get_supabase() -> Client:
    """Return a lazily-initialised Supabase anon client (singleton)."""
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def get_supabase_admin() -> Client:
    """Return a lazily-initialised Supabase service-role client.
    Bypasses RLS — use only for server-side operations.
    """
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _admin_client
