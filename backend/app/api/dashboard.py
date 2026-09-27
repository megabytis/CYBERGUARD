from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models import User, ScanRecord
from app.schemas import DashboardStatsResponse, DistributionItem, TypeCountItem, ScanSummaryItem
from app.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes dashboard KPIs and distributions strictly based on authenticated analyst's stored records.
    Never fabricates metrics. If database has 0 records, returns exact 0 counts.
    """
    user_id = current_user.id

    # Total Scans
    total_stmt = select(func.count(ScanRecord.id)).where(ScanRecord.user_id == user_id)
    total_scans = db.execute(total_stmt).scalar() or 0

    if total_scans == 0:
        return DashboardStatsResponse(
            total_scans=0,
            high_risk_count=0,
            medium_risk_count=0,
            low_risk_count=0,
            average_risk_score=0.0,
            risk_distribution=[
                DistributionItem(label="HIGH", count=0, percentage=0.0),
                DistributionItem(label="MEDIUM", count=0, percentage=0.0),
                DistributionItem(label="LOW", count=0, percentage=0.0),
            ],
            scanner_distribution=[],
            detection_method_distribution=[],
            recent_scans=[],
        )

    # Risk Counts
    high_stmt = select(func.count(ScanRecord.id)).where(ScanRecord.user_id == user_id, ScanRecord.risk_level == "HIGH")
    med_stmt = select(func.count(ScanRecord.id)).where(ScanRecord.user_id == user_id, ScanRecord.risk_level == "MEDIUM")
    low_stmt = select(func.count(ScanRecord.id)).where(ScanRecord.user_id == user_id, ScanRecord.risk_level == "LOW")

    high_count = db.execute(high_stmt).scalar() or 0
    med_count = db.execute(med_stmt).scalar() or 0
    low_count = db.execute(low_stmt).scalar() or 0

    # Average Score
    avg_stmt = select(func.avg(ScanRecord.risk_score)).where(ScanRecord.user_id == user_id)
    avg_score = float(db.execute(avg_stmt).scalar() or 0.0)

    # Risk Distribution
    risk_dist = [
        DistributionItem(label="HIGH", count=high_count, percentage=round((high_count / total_scans) * 100, 1)),
        DistributionItem(label="MEDIUM", count=med_count, percentage=round((med_count / total_scans) * 100, 1)),
        DistributionItem(label="LOW", count=low_count, percentage=round((low_count / total_scans) * 100, 1)),
    ]

    # Scanner Type Distribution
    type_stmt = (
        select(ScanRecord.input_type, func.count(ScanRecord.id))
        .where(ScanRecord.user_id == user_id)
        .group_by(ScanRecord.input_type)
        .order_by(desc(func.count(ScanRecord.id)))
    )
    type_rows = db.execute(type_stmt).all()
    scanner_dist = [TypeCountItem(type=row[0], count=row[1]) for row in type_rows]

    # Detection Method Distribution
    mode_stmt = (
        select(ScanRecord.detection_mode, func.count(ScanRecord.id))
        .where(ScanRecord.user_id == user_id)
        .group_by(ScanRecord.detection_mode)
    )
    mode_rows = db.execute(mode_stmt).all()
    mode_dist = [
        DistributionItem(
            label=row[0],
            count=row[1],
            percentage=round((row[1] / total_scans) * 100, 1),
        )
        for row in mode_rows
    ]

    # Recent Scans (top 5)
    recent_stmt = (
        select(ScanRecord)
        .where(ScanRecord.user_id == user_id)
        .order_by(desc(ScanRecord.created_at))
        .limit(5)
    )
    recent_records = db.execute(recent_stmt).scalars().all()
    recent_scans = [
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
        for r in recent_records
    ]

    return DashboardStatsResponse(
        total_scans=total_scans,
        high_risk_count=high_count,
        medium_risk_count=med_count,
        low_risk_count=low_count,
        average_risk_score=round(avg_score, 1),
        risk_distribution=risk_dist,
        scanner_distribution=scanner_dist,
        detection_method_distribution=mode_dist,
        recent_scans=recent_scans,
    )
