"""
Parser router — maps file extension / input_type → extractor function.
All parsers return plain utf-8 text.
"""
import io
from pathlib import Path
from app.models.schemas import InputType


def extract_text(content: str, input_type: InputType, filename: str = "") -> str:
    """Return plain text from whatever input was given."""
    ext = Path(filename).suffix.lower() if filename else ""

    if input_type in (InputType.text, InputType.chat):
        return content

    if input_type == InputType.log or ext in (".log",):
        return content  # already text

    if input_type == InputType.sql or ext in (".sql",):
        return _parse_sql(content)

    if ext == ".pdf":
        return _parse_pdf(content)

    if ext in (".doc", ".docx"):
        return _parse_docx(content)

    if ext in (".csv",):
        return _parse_csv(content)

    if ext in (".json",):
        return _parse_json(content)

    if ext in (".xml", ".yaml", ".yml"):
        return content  # treat as text

    # default: return as-is
    return content


def _parse_sql(content: str) -> str:
    try:
        import sqlparse
        statements = sqlparse.split(content)
        return "\n\n--- STATEMENT ---\n\n".join(statements)
    except ImportError:
        return content


def _parse_pdf(b64_or_text: str) -> str:
    """
    Accepts either base64-encoded PDF bytes or raw text (for testing).
    In production the router decodes the upload before calling this.
    """
    try:
        import base64, fitz  # PyMuPDF
        raw = base64.b64decode(b64_or_text)
        doc = fitz.open(stream=raw, filetype="pdf")
        pages = [page.get_text() for page in doc]
        return "\n\n".join(pages)
    except Exception:
        return b64_or_text


def _parse_docx(b64_or_text: str) -> str:
    try:
        import base64, docx, io
        raw = base64.b64decode(b64_or_text)
        doc = docx.Document(io.BytesIO(raw))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return b64_or_text


def _parse_csv(content: str) -> str:
    try:
        import csv, io
        reader = csv.reader(io.StringIO(content))
        lines = [" | ".join(row) for row in reader]
        return "\n".join(lines)
    except Exception:
        return content


def _parse_json(content: str) -> str:
    import json
    try:
        obj = json.loads(content)
        return json.dumps(obj, indent=2)
    except Exception:
        return content
