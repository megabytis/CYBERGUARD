import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship

from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    scans = relationship("ScanRecord", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("ThreatReport", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    full_name = Column(String(150), default="Security Analyst", nullable=False)
    organization = Column(String(150), default="Cyber Defense Operations", nullable=False)
    department = Column(String(150), default="SOC Tier-2", nullable=False)
    avatar_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="profile")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    expires_at = Column(DateTime, index=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="sessions")

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    input_type = Column(String(32), index=True, nullable=False) # url, email, message, qr, auth_log, network, headers
    input_summary = Column(String(255), nullable=False)
    input_payload = Column(Text, nullable=False)
    risk_score = Column(Integer, nullable=False) # 0 to 100
    risk_level = Column(String(16), index=True, nullable=False) # LOW, MEDIUM, HIGH
    heuristic_score = Column(Float, nullable=False)
    ml_score = Column(Float, nullable=False)
    detection_mode = Column(String(32), default="HYBRID_LOCAL", nullable=False)
    executive_summary = Column(Text, nullable=False)
    ai_explanation = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=False, default=list)
    metadata_payload = Column(JSON, nullable=True, default=dict)
    processing_time_ms = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utc_now, index=True, nullable=False)

    user = relationship("User", back_populates="scans")
    findings = relationship("ScanFinding", back_populates="scan", cascade="all, delete-orphan", order_by="desc(ScanFinding.confidence)")
    report = relationship("ThreatReport", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class ScanFinding(Base):
    __tablename__ = "scan_findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scan_records.id", ondelete="CASCADE"), index=True, nullable=False)
    category = Column(String(64), nullable=False) # STRUCTURAL, IMPERSONATION, BEHAVIORAL, NETWORK, CONTENT
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(16), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence = Column(Float, nullable=False) # 0.0 to 1.0
    rule_id = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    scan = relationship("ScanRecord", back_populates="findings")

class ThreatReport(Base):
    __tablename__ = "threat_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scan_records.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_number = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    classification = Column(String(32), default="RESTRICTED / TLP:AMBER", nullable=False)
    file_path = Column(String(500), nullable=True)
    generated_at = Column(DateTime, default=utc_now, nullable=False)

    scan = relationship("ScanRecord", back_populates="report")
    user = relationship("User", back_populates="reports")

class CopilotConversation(Base):
    __tablename__ = "copilot_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scan_id = Column(String(36), nullable=True)
    title = Column(String(200), default="Security Advisory", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    messages = relationship("CopilotMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="CopilotMessage.created_at")

class CopilotMessage(Base):
    __tablename__ = "copilot_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("copilot_conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(16), nullable=False) # user or assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    conversation = relationship("CopilotConversation", back_populates="messages")

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    enable_groq_ai = Column(Boolean, default=True, nullable=False)
    groq_model = Column(String(64), default="llama-3.3-70b-versatile", nullable=False)
    heuristic_weight = Column(Float, default=0.70, nullable=False)
    ml_weight = Column(Float, default=0.30, nullable=False)
    reduced_motion = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="preferences")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(64), nullable=False) # LOGIN, LOGOUT, SCAN_CREATED, SCAN_DELETED, REPORT_GENERATED
    target_resource = Column(String(128), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime, default=utc_now, index=True, nullable=False)

    user = relationship("User", back_populates="audit_events")
