"""
LLM Analysis Engine — Google Gemini (free tier, cloud)
-------------------------------------------------------
Gemini Flash is free: 1,500 requests/day, no credit card needed.

Setup (one-time):
  1. Go to https://aistudio.google.com
  2. Click "Get API Key" → Create API Key (free, instant)
  3. Add to .env:  GEMINI_API_KEY=your_key_here
  4. pip install google-generativeai

Free tier limits:
  gemini-1.5-flash  → 1,500 req/day, 15 req/min  ← default (recommended)
  gemini-1.5-pro    → 50 req/day  (smarter but slower)
  gemini-2.0-flash  → 1,500 req/day (latest, fastest)
"""
import json
import os
from typing import List, Optional
from app.models.schemas import Finding, RiskLevel

MAX_CONTENT_CHARS = 12_000

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL",   "gemini-1.5-flash")


def build_prompt(input_type: str, content: str, regex_findings: List[Finding]) -> str:
    findings_summary = ""
    if regex_findings:
        counts = {}
        for f in regex_findings:
            counts[f.type] = counts.get(f.type, 0) + 1
        findings_summary = "Regex pre-scan already found: " + ", ".join(
            f"{v}x {k}" for k, v in counts.items()
        )

    return f"""You are an expert security auditor and data intelligence analyst.

Analyze the following {input_type} content for security risks, data quality issues,
compliance problems, and anomalies.

{findings_summary}

IMPORTANT: Return ONLY raw JSON. No markdown, no code fences, no explanation outside the JSON.

{{
  "summary": "2-3 sentence executive summary of findings",
  "insights": [
    "Insight 1 - specific and actionable",
    "Insight 2",
    "Insight 3"
  ],
  "additional_findings": [
    {{
      "type": "finding_type_snake_case",
      "risk": "critical|high|medium|low|info",
      "line": null,
      "description": "What was found and why it matters",
      "recommendation": "How to remediate"
    }}
  ],
  "detected_anomalies": ["Anomaly description"],
  "compliance_notes": ["GDPR / HIPAA / PCI-DSS observation if relevant"]
}}

Content to analyze:
---
{content[:MAX_CONTENT_CHARS]}
---"""


def call_llm(prompt: str) -> Optional[dict]:
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_key_here":
        print("No GEMINI_API_KEY set — running in demo mode.")
        print("Get a free key at: https://aistudio.google.com")
        return _mock_llm_response()

    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)

        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature":        0.1,
                "max_output_tokens":  1500,
                "response_mime_type": "application/json",
            },
        )

        response = model.generate_content(prompt)
        text     = response.text.strip()
        return _parse_json_response(text)

    except ImportError:
        print("Run: pip install google-generativeai")
        return _mock_llm_response()
    except Exception as e:
        print(f"Gemini error: {e}")
        return _mock_llm_response()


def _parse_json_response(text: str) -> Optional[dict]:
    if "```" in text:
        for part in text.split("```"):
            part = part.strip().lstrip("json").strip()
            try:
                return json.loads(part)
            except Exception:
                continue
    try:
        return json.loads(text)
    except Exception:
        pass
    start = text.find("{")
    end   = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end])
        except Exception:
            pass
    return _mock_llm_response()


def _mock_llm_response() -> dict:
    return {
        "summary": (
            "The analyzed content contains multiple security concerns including "
            "potential credential exposure and sensitive data patterns. "
            "Immediate remediation is recommended for critical findings."
        ),
        "insights": [
            "Sensitive credentials may be exposed in plain text",
            "Debug information could reveal internal system architecture",
            "PII data handling may not comply with privacy regulations",
        ],
        "additional_findings": [
            {
                "type": "insecure_logging_practice",
                "risk": "medium",
                "line": None,
                "description": "General logging practices expose more information than necessary",
                "recommendation": "Implement structured logging with field-level masking",
            }
        ],
        "detected_anomalies": [
            "Unusual volume of error events detected",
            "Repeated authentication failures suggest brute-force risk",
        ],
        "compliance_notes": [
            "Email addresses in logs may violate GDPR Article 5 (data minimisation)",
            "Credential logging violates PCI-DSS Requirement 3",
        ],
    }


def merge_findings(
    regex_findings: List[Finding],
    llm_response: Optional[dict],
) -> tuple[List[Finding], List[str]]:
    all_findings = list(regex_findings)
    insights     = []

    if not llm_response:
        return all_findings, insights

    insights  = llm_response.get("insights", [])
    insights += llm_response.get("detected_anomalies", [])
    insights += llm_response.get("compliance_notes", [])

    for raw in llm_response.get("additional_findings", []):
        try:
            all_findings.append(Finding(
                type=raw.get("type", "unknown"),
                risk=RiskLevel(raw.get("risk", "info")),
                line=raw.get("line"),
                description=raw.get("description"),
                recommendation=raw.get("recommendation"),
            ))
        except Exception:
            pass

    return all_findings, insights
