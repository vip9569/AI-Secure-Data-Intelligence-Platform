from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    AnalyzeRequest, AnalyzeResponse, RiskLevel, InputType
)
from app.parsers.router import extract_text
from app.analyzer.detector import scan_lines, compute_risk_score
from app.analyzer.llm_client import build_prompt, call_llm, merge_findings
import json, os
from datetime import datetime

router = APIRouter()

# Simple in-memory history store (replace with DB in production)
_history: list = []


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    # 1. Extract plain text from whatever input type was sent
    try:
        text = extract_text(req.content, req.input_type, req.filename or "")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Extraction failed: {e}")

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="No extractable content found.")

    # 2. Regex pattern scan
    regex_findings, masked_content, line_map = scan_lines(text)

    # 3. Compute preliminary risk score
    risk_score, risk_level = compute_risk_score(regex_findings)

    # 4. Block immediately if configured and risk is critical
    if req.options.block_high_risk and risk_level in (RiskLevel.critical, RiskLevel.high):
        action = "blocked"
    elif req.options.mask and regex_findings:
        action = "masked"
    else:
        action = "allowed"

    # 5. LLM deep analysis (skip if blocked or analysis turned off)
    llm_result = None
    if req.options.log_analysis and action != "blocked":
        prompt = build_prompt(req.input_type.value, text, regex_findings)
        llm_result = call_llm(prompt)

    # 6. Merge findings
    all_findings, insights = merge_findings(regex_findings, llm_result)

    # Recompute with all findings
    risk_score, risk_level = compute_risk_score(all_findings)

    summary = (
        llm_result.get("summary") if llm_result
        else _auto_summary(all_findings, req.input_type)
    )

    response = AnalyzeResponse(
        summary=summary,
        content_type=req.input_type.value,
        findings=all_findings,
        risk_score=risk_score,
        risk_level=risk_level,
        action=action,
        insights=insights,
        masked_content=masked_content if req.options.mask else None,
        line_map=line_map,
    )

    # Store in history
    _history.append({
        "id":         len(_history) + 1,
        "timestamp":  datetime.utcnow().isoformat(),
        "input_type": req.input_type.value,
        "filename":   req.filename,
        "risk_score": risk_score,
        "risk_level": risk_level.value,
        "finding_count": len(all_findings),
        "summary":    summary[:120],
    })

    return response


@router.get("/history")
def get_history():
    return list(reversed(_history[-50:]))


def _auto_summary(findings, input_type) -> str:
    if not findings:
        return f"No significant risks detected in the {input_type.value} content."
    critical = sum(1 for f in findings if f.risk == RiskLevel.critical)
    high     = sum(1 for f in findings if f.risk == RiskLevel.high)
    total    = len(findings)
    parts = [f"Analysis found {total} issue(s) in the {input_type.value} content."]
    if critical:
        parts.append(f"{critical} critical risk(s) require immediate attention.")
    if high:
        parts.append(f"{high} high-severity issue(s) detected.")
    return " ".join(parts)
