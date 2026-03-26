import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, InputType, AnalysisOptions
from app.routers.analyze import analyze

router = APIRouter()

ALLOWED_EXTENSIONS = {
    ".txt", ".log", ".pdf", ".doc", ".docx",
    ".sql", ".csv", ".json", ".xml", ".yaml", ".yml", ".py", ".js", ".ts", ".sh"
}
MAX_SIZE_MB = 10

FILE_TYPE_MAP = {
    ".log":  InputType.log,
    ".txt":  InputType.text,
    ".sql":  InputType.sql,
    ".pdf":  InputType.file,
    ".doc":  InputType.file,
    ".docx": InputType.file,
}


@router.post("/upload", response_model=AnalyzeResponse)
async def upload_file(
    file: UploadFile = File(...),
    mask: bool = Form(True),
    block_high_risk: bool = Form(False),
    log_analysis: bool = Form(True),
):
    from pathlib import Path
    ext = Path(file.filename or "").suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f"File type '{ext}' is not supported.")

    raw = await file.read()
    if len(raw) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_SIZE_MB}MB limit.")

    # For binary files, base64-encode for the parser
    binary_exts = {".pdf", ".doc", ".docx"}
    if ext in binary_exts:
        content = base64.b64encode(raw).decode()
    else:
        try:
            content = raw.decode("utf-8")
        except UnicodeDecodeError:
            content = raw.decode("latin-1")

    input_type = FILE_TYPE_MAP.get(ext, InputType.text)

    req = AnalyzeRequest(
        input_type=input_type,
        content=content,
        filename=file.filename,
        options=AnalysisOptions(
            mask=mask,
            block_high_risk=block_high_risk,
            log_analysis=log_analysis,
        ),
    )
    return await analyze(req)
