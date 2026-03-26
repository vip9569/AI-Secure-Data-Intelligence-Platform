from fastapi import APIRouter
from app.routers.analyze import _history

router = APIRouter()

@router.get("/history")
def history():
    return list(reversed(_history[-50:]))
