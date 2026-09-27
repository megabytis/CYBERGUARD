from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator
from datetime import datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class ProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str
    organization: str
    department: str
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    role: str
    is_active: bool
    profile: Optional[ProfileSchema] = None

# --- Scanner Schemas ---
class AnalyzeRequest(BaseModel):
    input_type: str = Field(..., description="url, email, message, qr, auth_log, network, headers")
    payload: str = Field(..., max_length=500000, description="Payload content or raw text")
    enable_ai: bool = True

class EvidenceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category: str
    finding: str
    severity: str
    rule_id: Optional[str] = None
    confidence: Optional[float] = None

class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    category: str
    title: str
    description: str
    severity: str # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence: float
    rule_id: str
    created_at: Optional[datetime] = None

class ScanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    input_type: str
    input_summary: str
    input_payload: str
    risk_score: int
    risk_level: str
    classification: Optional[str] = None
    heuristic_score: float
    ml_score: float
    detection_mode: str
    executive_summary: str
    ai_explanation: Optional[str] = None
    is_ai_generated: bool = False
    findings: List[FindingResponse] = []
    evidence: List[EvidenceItem] = []
    recommendations: List[str] = []
    recommended_actions: List[str] = []
    metadata_payload: Optional[Dict[str, Any]] = None
    processing_time_ms: int
    created_at: datetime

    @model_validator(mode='after')
    def sync_explainability_fields(self):
        if not self.classification:
            self.classification = self.risk_level
        if not self.recommended_actions and self.recommendations:
            self.recommended_actions = list(self.recommendations)
        if not self.recommendations and self.recommended_actions:
            self.recommendations = list(self.recommended_actions)
        if not self.evidence and self.findings:
            self.evidence = [
                EvidenceItem(
                    category=f.category,
                    finding=f.title,
                    severity=f.severity.lower(),
                    rule_id=f.rule_id,
                    confidence=f.confidence,
                )
                for f in self.findings
            ]
        return self

class ScanSummaryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    input_type: str
    input_summary: str
    risk_score: int
    risk_level: str
    detection_mode: str
    findings_count: int
    created_at: datetime

class ScanListResponse(BaseModel):
    items: List[ScanSummaryItem]
    total: int
    page: int
    pages: int

# --- Reports Schemas ---
class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scan_id: str
    report_number: str
    title: str
    summary: str
    classification: str
    download_url: str
    generated_at: datetime

# --- Dashboard Schemas ---
class DistributionItem(BaseModel):
    label: str
    count: int
    percentage: float

class TypeCountItem(BaseModel):
    type: str
    count: int

class DashboardStatsResponse(BaseModel):
    total_scans: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_risk_score: float
    risk_distribution: List[DistributionItem]
    scanner_distribution: List[TypeCountItem]
    detection_method_distribution: List[DistributionItem]
    recent_scans: List[ScanSummaryItem]

# --- Copilot Schemas ---
class CopilotChatRequest(BaseModel):
    scan_id: Optional[str] = None
    conversation_id: Optional[str] = None
    message: str = Field(..., max_length=4000)

class CopilotChatResponse(BaseModel):
    conversation_id: str
    response: str
    source: str # GROQ_LLM or LOCAL_DEFENSIVE_HEURISTIC

class CopilotMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sender: str
    content: str
    created_at: datetime

# --- User Preferences ---
class PreferencesSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    enable_groq_ai: bool
    groq_model: str
    heuristic_weight: float
    ml_weight: float
    reduced_motion: bool

class PreferencesUpdateRequest(BaseModel):
    enable_groq_ai: Optional[bool] = None
    groq_model: Optional[str] = None
    heuristic_weight: Optional[float] = None
    ml_weight: Optional[float] = None
    reduced_motion: Optional[bool] = None
