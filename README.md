# AI Secure Data Intelligence Platform
> AI Gateway · Data Scanner · Log Analyzer · Risk Engine  
> Powered by **Ollama** — 100% local, free, no API key needed

---

## Quick Start

### 1. Install & start Ollama (one-time setup)

```bash
# Download Ollama from https://ollama.com/download
# Then pull a model (recommended):
ollama pull llama3.2

# Start the Ollama server (keep this running):
ollama serve
```

Ollama runs at `http://localhost:11434` by default.

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env to change model if needed (default: llama3.2)

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: http://localhost:8000  
API docs at:     http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
open index.html
# or: python -m http.server 3000
```

---

## Choosing a Model

| Model           | Size  | Speed  | Quality      | Command                      |
|-----------------|-------|--------|--------------|------------------------------|
| llama3.2        | ~2GB  | Fast   | Great        | `ollama pull llama3.2`       |
| mistral         | ~4GB  | Fast   | Great        | `ollama pull mistral`        |
| llama3.1:8b     | ~5GB  | Medium | Very capable | `ollama pull llama3.1:8b`    |
| phi3            | ~2GB  | Fast   | Good         | `ollama pull phi3`           |
| deepseek-r1:8b  | ~5GB  | Slower | Best reason. | `ollama pull deepseek-r1:8b` |

Change the active model in `.env`:
```
OLLAMA_MODEL=mistral
```

No restart needed — just update the env var and restart uvicorn.

---

## API Reference

### POST /api/analyze
Analyze text, SQL, log content, or chat input.

**Request:**
```json
{
  "input_type": "text | file | sql | chat | log",
  "content": "...",
  "filename": "optional_filename.log",
  "options": {
    "mask": true,
    "block_high_risk": false,
    "log_analysis": true
  }
}
```

**Response:**
```json
{
  "summary": "Found 3 issues. 1 critical finding needs immediate attention.",
  "content_type": "log",
  "findings": [
    {
      "type": "password",
      "risk": "critical",
      "line": 12,
      "value": "adm***23",
      "description": "Password found in plain text on line 12",
      "recommendation": "Never log passwords. Use environment variables."
    }
  ],
  "risk_score": 8,
  "risk_level": "critical",
  "action": "masked",
  "insights": [
    "Sensitive credentials exposed in logs",
    "Debug information leaked"
  ],
  "masked_content": "...content with secrets replaced...",
  "line_map": [...]
}
```

### POST /api/upload
Upload a file for analysis (multipart/form-data).

Fields: `file`, `mask` (bool), `block_high_risk` (bool), `log_analysis` (bool)

### GET /api/history
Returns the last 50 analyses.

---

## What Gets Detected

| Pattern           | Risk Level | Description                          |
|-------------------|------------|--------------------------------------|
| password=...      | Critical   | Passwords in plain text              |
| AWS AKIA keys     | Critical   | AWS access keys                      |
| URL credentials   | Critical   | Passwords in connection strings      |
| SQL injection     | Critical   | UNION SELECT, DROP TABLE, etc.       |
| api_key=...       | High       | API keys and tokens                  |
| Bearer tokens     | High       | Auth tokens                          |
| Hardcoded secrets | High       | Client secrets, private keys         |
| Stack traces      | Medium     | Exception details leaking internals  |
| Failed logins     | Medium     | Brute-force indicators               |
| Debug mode on     | Medium     | Debug flags enabled                  |
| Email addresses   | Low        | PII in logs                          |
| Phone numbers     | Low        | PII in logs                          |
| IP addresses      | Info       | May violate privacy policy           |

---

## Project Structure

```
ai-security-platform/
├── backend/
│   ├── app/
│   │   ├── main.py               ← FastAPI entry point
│   │   ├── routers/
│   │   │   ├── analyze.py        ← POST /analyze
│   │   │   ├── upload.py         ← POST /upload
│   │   │   └── history.py        ← GET /history
│   │   ├── parsers/
│   │   │   └── router.py         ← file type → text extractor
│   │   ├── analyzer/
│   │   │   ├── detector.py       ← regex pattern engine
│   │   │   └── llm_client.py     ← Anthropic Claude integration
│   │   └── models/
│   │       └── schemas.py        ← Pydantic request/response models
│   └── requirements.txt
└── frontend/
    └── index.html                ← Full SPA (no build step required)
```

---

## Environment Variables

Create `backend/.env`:
```
ANTHROPIC_API_KEY=your_key_here   # optional, enables AI deep analysis
```

Without an API key, the platform runs in **demo mode**:
- All regex detection still works (15+ patterns)
- Risk scoring and masking still works
- AI insights return a static demo response
- Everything in the frontend works the same way

---

## Extending the Platform

### Add a new pattern
Edit `backend/app/analyzer/detector.py` and add to the `PATTERNS` list:
```python
(
    "my_pattern",
    r'my-regex-here',
    RiskLevel.high,
    "Recommendation text",
),
```

### Add a new file type
Edit `backend/app/parsers/router.py` and add a new `_parse_xxx()` function,
then register the extension in `extract_text()`.

### Persist history to a database
Replace the `_history` list in `routers/analyze.py` with SQLAlchemy calls.
Add `sqlalchemy` models in `app/models/`.
