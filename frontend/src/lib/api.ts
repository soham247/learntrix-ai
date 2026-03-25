import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("You must be signed in to use this feature.");
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

function friendlyVideoError(detail: string): string {
  const lower = detail.toLowerCase();
  if (lower.includes("10 youtube video limit") || lower.includes("reached your")) {
    return detail; // Already a friendly message from backend
  }
  if (
    lower.includes("transcript") &&
    (lower.includes("disabled") || lower.includes("not available"))
  ) {
    return "This video doesn't have captions/subtitles available. Please try a different video.";
  }
  if (
    lower.includes("could not retrieve transcript") ||
    lower.includes("blocked") ||
    lower.includes("429") ||
    lower.includes("too many")
  ) {
    return "Unable to fetch the transcript right now. YouTube may be temporarily limiting requests. Please try again in a few minutes.";
  }
  if (
    lower.includes("video id") ||
    lower.includes("invalid") ||
    lower.includes("url")
  ) {
    return "That doesn't look like a valid YouTube URL. Please check and try again.";
  }
  return "Something went wrong while processing the video. Please try again later.";
}

export async function processVideo(url: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/process-video`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(friendlyVideoError(err.detail || ""));
  }
  return res.json();
}

export async function processPdf(file: File) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("You must be signed in to use this feature.");
  }
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/process-pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to process PDF");
  }
  return res.json();
}

export async function generateFlashcards(sessionId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/generate-flashcards`, {
    method: "POST",
    headers,
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to generate flashcards");
  }
  return res.json();
}

export async function generateQuiz(sessionId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: "POST",
    headers,
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to generate quiz");
  }
  return res.json();
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatStream(
  sessionId: string,
  message: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ session_id: sessionId, message, history }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Chat failed");
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("No response body");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") {
          onDone();
          return;
        }
        try {
          const decoded = JSON.parse(data);
          onChunk(decoded);
        } catch {
          onChunk(data);
        }
      }
    }
  }
  onDone();
}
