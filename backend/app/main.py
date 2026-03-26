from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze, upload, history

app = FastAPI(
    title="AI Secure Data Intelligence Platform",
    description="AI Gateway + Scanner + Log Analyzer + Risk Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(upload.router,  prefix="/api", tags=["upload"])
app.include_router(history.router, prefix="/api", tags=["history"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "AI Secure Data Intelligence Platform"}
