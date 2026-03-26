"""
Pattern Detection Engine
Runs fast regex scans before sending to the LLM.
Returns per-line findings with risk level + masked content.
"""
import re
from typing import List, Tuple
from app.models.schemas import Finding, RiskLevel

# ── Pattern registry ──────────────────────────────────────────────────────────
PATTERNS: List[Tuple[str, str, RiskLevel, str]] = [
    # (name, regex, risk_level, recommendation)
    (
        "password",
        r'(?i)(password|passwd|pwd)\s*[=:]\s*["\']?(\S+)["\']?',
        RiskLevel.critical,
        "Never log passwords. Use environment variables and redact before logging.",
    ),
    (
        "api_key",
        r'(?i)(api[_\-]?key|apikey|api[_\-]?secret)\s*[=:]\s*["\']?([A-Za-z0-9\-_]{16,})["\']?',
        RiskLevel.high,
        "Rotate this key immediately and move it to a secrets manager.",
    ),
    (
        "token",
        r'(?i)(token|auth[_\-]?token|bearer|jwt)\s*[=:]\s*["\']?([A-Za-z0-9\-_.]{20,})["\']?',
        RiskLevel.high,
        "Revoke the token and store it in a vault, not in logs.",
    ),
    (
        "aws_access_key",
        r'(?<![A-Z0-9])(AKIA[0-9A-Z]{16})(?![A-Z0-9])',
        RiskLevel.critical,
        "Rotate AWS credentials immediately via IAM.",
    ),
    (
        "private_key",
        r'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
        RiskLevel.critical,
        "Private keys must NEVER appear in logs or code.",
    ),
    (
        "email",
        r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
        RiskLevel.low,
        "Mask or hash PII (emails) before logging.",
    ),
    (
        "phone_number",
        r'(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})',
        RiskLevel.low,
        "Redact phone numbers to comply with privacy regulations.",
    ),
    (
        "ip_address",
        r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
        RiskLevel.info,
        "Ensure IP addresses are not logged in violation of privacy policy.",
    ),
    (
        "stack_trace",
        r'(Traceback \(most recent call last\)|at [a-zA-Z]+\.[a-zA-Z]+\(|Exception in thread|java\.lang\.|System\.Exception)',
        RiskLevel.medium,
        "Stack traces can leak internal paths and library versions. Suppress in production.",
    ),
    (
        "sql_injection_pattern",
        r"(?i)(union\s+select|drop\s+table|insert\s+into|exec\s*\(|xp_cmdshell|'\s*or\s*'1'\s*=\s*'1)",
        RiskLevel.critical,
        "Possible SQL injection pattern detected. Review and sanitize inputs.",
    ),
    (
        "hardcoded_secret",
        r'(?i)(secret|private_key|client_secret)\s*[=:]\s*["\']?([A-Za-z0-9\-_!@#$%^&*]{8,})["\']?',
        RiskLevel.high,
        "Move secrets to environment variables or a secrets manager.",
    ),
    (
        "debug_mode",
        r'(?i)(debug\s*=\s*true|DEBUG\s*:\s*true|--debug|verbose\s*=\s*true)',
        RiskLevel.medium,
        "Disable debug mode in production environments.",
    ),
    (
        "failed_login",
        r'(?i)(failed\s+login|authentication\s+failed|invalid\s+password|login\s+attempt|unauthorized)',
        RiskLevel.medium,
        "Multiple failed login patterns may indicate a brute-force attack.",
    ),
    (
        "url_with_credentials",
        r'(?i)(https?://[^:]+:[^@]+@[^\s]+)',
        RiskLevel.critical,
        "Credentials embedded in URLs must be removed immediately.",
    ),
    (
        "connection_string",
        r'(?i)(server=|data source=|initial catalog=|user id=|password=).*',
        RiskLevel.high,
        "Connection strings should be stored in secure configuration, not in logs.",
    ),
]


def _mask_value(value: str) -> str:
    """Keep first 3 and last 2 chars, mask the rest."""
    if len(value) <= 6:
        return "***"
    return value[:3] + "*" * (len(value) - 5) + value[-2:]


def scan_lines(text: str) -> Tuple[List[Finding], str, List[dict]]:
    """
    Scan text line by line.
    Returns:
      findings    — list of Finding objects
      masked_text — original text with secrets replaced
      line_map    — [{line_no, text, risks:[...], max_risk}] for frontend
    """
    lines = text.splitlines()
    findings: List[Finding] = []
    masked_lines = list(lines)
    line_map = []

    for line_no, line in enumerate(lines, start=1):
        line_risks = []
        masked_line = line

        for name, pattern, risk_level, recommendation in PATTERNS:
            for match in re.finditer(pattern, line):
                # Try to extract an actual secret value (group 2 if present)
                try:
                    raw_val = match.group(2)
                except IndexError:
                    raw_val = match.group(0)

                masked_val = _mask_value(raw_val)
                masked_line = masked_line.replace(raw_val, masked_val)

                findings.append(Finding(
                    type=name,
                    risk=risk_level,
                    line=line_no,
                    value=masked_val,
                    description=f"Detected {name.replace('_', ' ')} on line {line_no}",
                    recommendation=recommendation,
                ))
                line_risks.append({
                    "type": name,
                    "risk": risk_level.value,
                })

        masked_lines[line_no - 1] = masked_line
        line_map.append({
            "line_no": line_no,
            "text":    line,
            "masked":  masked_line,
            "risks":   line_risks,
            "max_risk": _max_risk(line_risks),
        })

    return findings, "\n".join(masked_lines), line_map


def _max_risk(risks: List[dict]) -> str:
    order = ["critical", "high", "medium", "low", "info", "none"]
    found = {r["risk"] for r in risks}
    for level in order:
        if level in found:
            return level
    return "none"


def compute_risk_score(findings: List[Finding]) -> Tuple[int, RiskLevel]:
    """Turn findings into a 1-10 score and a RiskLevel."""
    weights = {
        RiskLevel.critical: 4,
        RiskLevel.high:     3,
        RiskLevel.medium:   2,
        RiskLevel.low:      1,
        RiskLevel.info:     0,
    }
    score = sum(weights.get(f.risk, 0) for f in findings)
    capped = min(10, score)

    if capped >= 8:
        level = RiskLevel.critical
    elif capped >= 6:
        level = RiskLevel.high
    elif capped >= 4:
        level = RiskLevel.medium
    elif capped >= 2:
        level = RiskLevel.low
    else:
        level = RiskLevel.info

    return max(1, capped), level
