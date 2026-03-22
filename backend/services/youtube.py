import re
import logging
from supadata import Supadata, SupadataError

from config import SUPADATA_API_KEY

logger = logging.getLogger(__name__)

_client = Supadata(api_key=SUPADATA_API_KEY)


def extract_video_id(url: str) -> str:
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
        r"(?:youtu\.be\/)([0-9A-Za-z_-]{11})",
        r"(?:embed\/)([0-9A-Za-z_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


def get_transcript(url: str) -> dict:
    """Fetch transcript from a YouTube video URL via Supadata SDK."""
    video_id = extract_video_id(url)

    try:
        logger.info("Fetching transcript for video %s via Supadata", video_id)
        transcript = _client.youtube.transcript(
            video_id=video_id,
            lang="en",
            text=True,
        )

        content = transcript.content
        if isinstance(content, list):
            full_text = " ".join(seg.get("text", "") for seg in content if seg.get("text"))
        else:
            full_text = str(content).strip()

        if not full_text:
            raise ValueError("Transcript returned empty content.")

        logger.info("Transcript fetched for video %s (%d chars)", video_id, len(full_text))
        return {
            "video_id": video_id,
            "title": f"YouTube Video ({video_id})",
            "text": full_text,
        }

    except SupadataError as e:
        logger.error("Supadata error for video %s: [%s] %s", video_id, e.error, e.message)
        if e.error in ("NOT_FOUND", "TRANSCRIPT_NOT_FOUND"):
            raise ValueError("No transcript available for this video.")
        if e.error == "RATE_LIMITED":
            raise ValueError("Transcript service is rate-limited. Please try again in a moment.")
        if e.error in ("UNAUTHORIZED", "FORBIDDEN"):
            raise ValueError("Transcript service authentication failed. Please contact support.")
        raise ValueError("Could not fetch the transcript. Please try again later.")

    except ValueError:
        raise

    except Exception as e:
        logger.exception("Unexpected error fetching transcript for video %s", video_id)
        raise ValueError(f"Could not retrieve transcript: {str(e)}")
