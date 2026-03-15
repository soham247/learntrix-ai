import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound


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
    """Fetch transcript from a YouTube video URL (compatible with v1.x API)."""
    video_id = extract_video_id(url)
    api = YouTubeTranscriptApi()

    # --- Attempt 1: preferred languages directly ---
    try:
        fetched = api.fetch(video_id, languages=["en", "en-US", "en-GB", "hi"])
        full_text = " ".join(seg.text for seg in fetched)
        return {
            "video_id": video_id,
            "title": f"YouTube Video ({video_id})",
            "text": full_text,
        }
    except (NoTranscriptFound, TranscriptsDisabled):
        pass
    except Exception:
        pass

    # --- Attempt 2: list available and pick the best ---
    try:
        transcript_list = api.list(video_id)

        # Try manually created first, then auto-generated
        transcript = None
        for t in transcript_list:
            if not t.is_generated:
                transcript = t
                break
        if transcript is None:
            transcript = next(iter(transcript_list))

        # Translate to English if possible
        if transcript.is_translatable:
            try:
                transcript = transcript.translate("en")
            except Exception:
                pass

        fetched = transcript.fetch()
        full_text = " ".join(seg.text for seg in fetched)
        return {
            "video_id": video_id,
            "title": f"YouTube Video ({video_id})",
            "text": full_text,
        }

    except TranscriptsDisabled:
        raise ValueError("Transcripts are disabled for this video.")
    except Exception as e:
        raise ValueError(f"Could not retrieve transcript: {str(e)}")
