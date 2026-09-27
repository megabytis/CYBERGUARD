import os
import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database import get_db
from app.models import User, ScanRecord, ThreatReport, AuditEvent
from app.schemas import ReportResponse
from app.security import get_current_user
from app.services.pdf_generator import PDFReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])

REPORT_DIR = os.path.join("data", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

def generate_report_number() -> str:
    now = datetime.now(timezone.utc)
    rand_seq = random.randint(1000, 9999)
    return f"CG-{now.strftime('%Y%m%d')}-{rand_seq}"

@router.post("/generate/{scan_id}", response_model=ReportResponse)
async def generate_report(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generates official ReportLab PDF incident report from stored scan findings."""
    stmt = select(ScanRecord).where(
        ScanRecord.id == scan_id,
        ScanRecord.user_id == current_user.id,
    )
    scan = db.execute(stmt).scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found.",
        )

    # Check if report already exists
    stmt_rep = select(ThreatReport).where(ThreatReport.scan_id == scan_id)
    existing_rep = db.execute(stmt_rep).scalar_one_or_none()

    report_number = existing_rep.report_number if existing_rep else generate_report_number()

    # Compile scan data dict for ReportLab generator
    scan_dict = {
        "id": scan.id,
        "input_type": scan.input_type,
        "input_summary": scan.input_summary,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "heuristic_score": scan.heuristic_score,
        "ml_score": scan.ml_score,
        "detection_mode": scan.detection_mode,
        "executive_summary": scan.executive_summary,
        "recommendations": scan.recommendations,
        "processing_time_ms": scan.processing_time_ms,
        "findings": scan.findings,
    }

    pdf_bytes = PDFReportGenerator.generate(scan_dict, report_number)

    # Save to storage
    filename = f"{report_number}.pdf"
    filepath = os.path.join(REPORT_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(pdf_bytes)

    if not existing_rep:
        existing_rep = ThreatReport(
            scan_id=scan.id,
            user_id=current_user.id,
            report_number=report_number,
            title=f"CYBERGUARD Threat Assessment: {scan.input_summary[:50]}",
            summary=scan.executive_summary,
            file_path=filepath,
        )
        db.add(existing_rep)

    audit = AuditEvent(
        user_id=current_user.id,
        action="REPORT_GENERATED",
        target_resource=f"report:{report_number}",
        details={"scan_id": scan_id},
    )
    db.add(audit)
    db.commit()
    db.refresh(existing_rep)

    return {
        "id": existing_rep.id,
        "scan_id": scan.id,
        "report_number": existing_rep.report_number,
        "title": existing_rep.title,
        "summary": existing_rep.summary,
        "classification": existing_rep.classification,
        "download_url": f"/api/reports/download/{existing_rep.id}",
        "generated_at": existing_rep.generated_at,
    }

@router.get("/download/{report_id}")
async def download_report_pdf(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Streams compiled PDF binary."""
    # Find either by report_id or scan_id
    stmt = select(ThreatReport).where(
        (ThreatReport.id == report_id) | (ThreatReport.scan_id == report_id),
        ThreatReport.user_id == current_user.id,
    )
    report = db.execute(stmt).scalar_one_or_none()

    if not report or not report.file_path or not os.path.exists(report.file_path):
        # If file missing on disk, regenerate on the fly
        if report:
            scan = report.scan
        else:
            scan = db.get(ScanRecord, report_id)

        if not scan or scan.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

        scan_dict = {
            "id": scan.id,
            "input_type": scan.input_type,
            "input_summary": scan.input_summary,
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
            "heuristic_score": scan.heuristic_score,
            "ml_score": scan.ml_score,
            "detection_mode": scan.detection_mode,
            "executive_summary": scan.executive_summary,
            "recommendations": scan.recommendations,
            "processing_time_ms": scan.processing_time_ms,
            "findings": scan.findings,
        }
        report_number = generate_report_number()
        pdf_bytes = PDFReportGenerator.generate(scan_dict, report_number)
        filename = f"{report_number}.pdf"
    else:
        with open(report.file_path, "rb") as f:
            pdf_bytes = f.read()
        filename = f"{report.report_number}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
