from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import process, generate, chat

app = FastAPI(title="AI Learning Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router)
app.include_router(generate.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Learning Assistant API!"}


@app.get("/health")
async def health():
    return {"status": "ok"}
