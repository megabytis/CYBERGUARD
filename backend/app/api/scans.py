import io
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func
from PIL import Image
try:
    from pyzbar.pyzbar import decode as pyzbar_decode
except (ImportError, Exception):
    pyzbar_decode = None


from app.database import get_db
from app.models import User, ScanRecord, ScanFinding, AuditEvent
from app.schemas import AnalyzeRequest, ScanResponse, ScanListResponse, ScanSummaryItem
from app.security import get_current_user
from app.core.analyzer import ThreatAnalyzer
from app.services.export_service import ExportService

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.post("/analyze", response_model=ScanResponse)
async def analyze_payload(
    payload: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Executes full defensive analysis across URLs, emails, messages, auth logs, network streams, or headers.
    Persists scan results, findings, and logs an audit record.
    """
    try:
        result = await ThreatAnalyzer.analyze(
            input_type=payload.input_type,
            payload=payload.payload,
            enable_ai=payload.enable_ai,
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Defensive pipeline error: {str(e)}",
        )

    # Persist ScanRecord
    scan = ScanRecord(
        user_id=current_user.id,
        input_type=result["input_type"],
        input_summary=result["input_summary"],
        input_payload=result["input_payload"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        heuristic_score=result["heuristic_score"],
        ml_score=result["ml_score"],
        detection_mode=result["detection_mode"],
        executive_summary=result["executive_summary"],
        ai_explanation=result["ai_explanation"],
        recommendations=result["recommendations"],
        metadata_payload=result["metadata_payload"],
        processing_time_ms=result["processing_time_ms"],
    )
    db.add(scan)
    db.flush()

    # Persist Findings
    persisted_findings = []
    for f in result["findings"]:
        finding = ScanFinding(
            scan_id=scan.id,
            category=f.category,
            title=f.title,
            description=f.description,
            severity=f.severity,
            confidence=f.confidence,
            rule_id=f.rule_id,
        )
        db.add(finding)
        persisted_findings.append(finding)

    # Audit Trail
    audit = AuditEvent(
        user_id=current_user.id,
        action="SCAN_CREATED",
        target_resource=f"scan:{scan.id}",
        details={
            "input_type": scan.input_type,
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(scan)

    response_data = {
        "id": scan.id,
        "input_type": scan.input_type,
        "input_summary": scan.input_summary,
        "input_payload": scan.input_payload,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "heuristic_score": scan.heuristic_score,
        "ml_score": scan.ml_score,
        "detection_mode": scan.detection_mode,
        "executive_summary": scan.executive_summary,
        "ai_explanation": scan.ai_explanation,
        "is_ai_generated": result["is_ai_generated"],
        "findings": scan.findings,
        "recommendations": scan.recommendations,
        "metadata_payload": scan.metadata_payload,
        "processing_time_ms": scan.processing_time_ms,
        "created_at": scan.created_at,
    }
    return response_data

@router.post("/analyze-qr", response_model=ScanResponse)
async def analyze_qr_code(
    file: UploadFile = File(...),
    enable_ai: bool = Query(default=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Decodes an uploaded QR code image strictly in-memory without auto-navigating to the destination.
    Passes extracted payload through the defensive analysis pipeline.
    """
    if file.content_type not in ("image/png", "image/jpeg", "image/jpg", "image/webp"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported formats: PNG, JPEG, WebP.",
        )

    try:
        image_bytes = await file.read()
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image file exceeds 5MB size limit.")

        if pyzbar_decode is None:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="QR decoding engine (libzbar) is not installed on this environment. Please run via Docker.",
            )

        image = Image.open(io.BytesIO(image_bytes))
        decoded_objs = pyzbar_decode(image)

        if not decoded_objs:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No readable QR code found in the uploaded image. Please ensure high contrast and clear lighting.",
            )

        extracted_text = decoded_objs[0].data.decode("utf-8", errors="ignore")
        if not extracted_text.strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="QR code payload is empty.")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process QR image: {str(e)}",
        )

    # Hand off to analyze_payload
    scan_req = AnalyzeRequest(input_type="qr", payload=extracted_text, enable_ai=enable_ai)
    return await analyze_payload(payload=scan_req, current_user=current_user, db=db)

@router.get("", response_model=ScanListResponse)
async def list_scans(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    query: Optional[str] = None,
    input_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves paginated, filtered scan records owned by the authenticated analyst."""
    stmt = select(ScanRecord).where(ScanRecord.user_id == current_user.id)

    if input_type:
        stmt = stmt.where(ScanRecord.input_type == input_type.lower())
    if risk_level:
        stmt = stmt.where(ScanRecord.risk_level == risk_level.upper())
    if query:
        search_filter = f"%{query}%"
        stmt = stmt.where(
            (ScanRecord.input_summary.ilike(search_filter)) |
            (ScanRecord.executive_summary.ilike(search_filter))
        )

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    stmt = stmt.order_by(desc(ScanRecord.created_at)).offset(offset).limit(limit)
    records = db.execute(stmt).scalars().all()

    items = [
        ScanSummaryItem(
            id=r.id,
            input_type=r.input_type,
            input_summary=r.input_summary,
            risk_score=r.risk_score,
            risk_level=r.risk_level,
            detection_mode=r.detection_mode,
            findings_count=len(r.findings),
            created_at=r.created_at,
        )
        for r in records
    ]

    pages = (total + limit - 1) // limit if total > 0 else 1
    return ScanListResponse(items=items, total=total, page=page, pages=pages)

@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan_details(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves single scan details with full evidence findings."""
    stmt = select(ScanRecord).where(
        ScanRecord.id == scan_id,
        ScanRecord.user_id == current_user.id,
    )
    scan = db.execute(stmt).scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or unauthorized.",
        )

    return scan

@router.delete("/{scan_id}")
async def delete_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes scan record, findings, and associated reports."""
    stmt = select(ScanRecord).where(
        ScanRecord.id == scan_id,
        ScanRecord.user_id == current_user.id,
    )
    scan = db.execute(stmt).scalar_one_or_none()

    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan record not found.")

    db.delete(scan)

    audit = AuditEvent(
        user_id=current_user.id,
        action="SCAN_DELETED",
        target_resource=f"scan:{scan_id}",
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Scan deleted successfully"}

@router.get("/export/csv")
async def export_scans_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Exports authenticated analyst's scan records as RFC 4180 CSV."""
    stmt = (
        select(ScanRecord)
        .where(ScanRecord.user_id == current_user.id)
        .order_by(desc(ScanRecord.created_at))
    )
    scans = db.execute(stmt).scalars().all()
    csv_content = ExportService.export_csv(scans)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="cyberguard_scans.csv"'},
    )

@router.get("/export/json")
async def export_scans_json(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Exports authenticated analyst's scan records as structured SIEM JSON."""
    stmt = (
        select(ScanRecord)
        .where(ScanRecord.user_id == current_user.id)
        .order_by(desc(ScanRecord.created_at))
    )
    scans = db.execute(stmt).scalars().all()
    json_content = ExportService.export_json(scans)

    return Response(
        content=json_content,
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="cyberguard_scans.json"'},
    )
