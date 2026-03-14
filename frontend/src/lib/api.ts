const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function processVideo(url: string) {
  const res = await fetch(`${API_BASE}/process-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to process video");
  }
  return res.json();
}

export async function processPdf(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/process-pdf`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to process PDF");
  }
  return res.json();
}

export async function generateFlashcards(sessionId: string) {
  const res = await fetch(`${API_BASE}/generate-flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to generate flashcards");
  }
  return res.json();
}

export async function generateQuiz(sessionId: string) {
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
          // Chunks are JSON-encoded strings from the backend
          const decoded = JSON.parse(data);
          onChunk(decoded);
        } catch {
          // Fallback: use raw data if not valid JSON
          onChunk(data);
        }
      }
    }
  }
  onDone();
}
