from pydantic import BaseModel
from typing import Optional, List, Any
from enum import Enum

class RiskLevel(str, Enum):
    critical = "critical"
    high     = "high"
    medium   = "medium"
    low      = "low"
    info     = "info"

class InputType(str, Enum):
    text = "text"
    file = "file"
    sql  = "sql"
    chat = "chat"
    log  = "log"

class Finding(BaseModel):
    type:        str
    risk:        RiskLevel
    line:        Optional[int]   = None
    column:      Optional[str]   = None
    value:       Optional[str]   = None   # masked value
    description: Optional[str]  = None
    recommendation: Optional[str] = None

class AnalysisOptions(BaseModel):
    mask:            bool = True
    block_high_risk: bool = False
    log_analysis:    bool = True

class AnalyzeRequest(BaseModel):
    input_type: InputType
    content:    str
    filename:   Optional[str]   = None
    options:    AnalysisOptions = AnalysisOptions()

class AnalyzeResponse(BaseModel):
    summary:       str
    content_type:  str
    findings:      List[Finding]
    risk_score:    int                  # 1–10
    risk_level:    RiskLevel
    action:        str                  # "allowed" | "masked" | "blocked"
    insights:      List[str]
    masked_content: Optional[str] = None
    line_map:      Optional[List[Any]]  = None  # per-line risk for UI
