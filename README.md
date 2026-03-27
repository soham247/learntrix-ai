# Learntrix – AI Learning Assistant

Learntrix is an AI-powered learning assistant that converts YouTube videos and PDFs into flashcards, quizzes, and contextual chat using Retrieval-Augmented Generation (RAG).

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TailwindCSS
- **Backend**: Python (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **Vector Store**: Pinecone
- **AI Model**: gemini-2.5-flash-lite
- **Embeddings**: gemini-embedding-001

## Features

- 📺 Process YouTube transcripts
- 📄 Extract text from PDFs
- 🧠 Generate flashcards automatically
- ❓ Create multiple-choice quizzes
- 💬 Contextual AI chat using RAG
- ⚡ Fast and responsive UI

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Supabase](https://supabase.com) project
- [Pinecone](https://pinecone.io) account with an index (768 dimensions, cosine metric)
- [Google AI Studio](https://aistudio.google.com) API key

## Setup

### 1. Supabase

1. Create a new Supabase project
2. Run the SQL in `supabase/migration.sql` in the Supabase SQL Editor
3. Copy the project URL and service role key

### 2. Pinecone

1. Create an index named `learning-assistant`
2. Set dimensions to **768** and metric to **cosine**
3. Copy the API key

### 3. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
```

Start the dev server:

```bash
npm run dev
```

Visit **http://localhost:3000**

## API Endpoints

| Method | Endpoint               | Description                           |
|--------|------------------------|---------------------------------------|
| POST   | `/process-video`       | Process YouTube video transcript      |
| POST   | `/process-pdf`         | Process uploaded PDF file             |
| POST   | `/generate-flashcards` | Generate flashcards for a session     |
| POST   | `/generate-quiz`       | Generate quiz questions for a session |
| POST   | `/chat`                | RAG chat with streaming response      |
| GET    | `/health`              | Health check                          |
