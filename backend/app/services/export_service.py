import csv
import io
import json
from typing import List
from app.models import ScanRecord

class ExportService:
    """Exports scan telemetry into CSV or JSON format for SIEM and SOC ingestion."""

    @staticmethod
    def export_csv(scans: List[ScanRecord]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        # CSV Header
        writer.writerow([
            "Scan ID",
            "Timestamp UTC",
            "Input Type",
            "Risk Score",
            "Risk Level",
            "Detection Mode",
            "Heuristic Score",
            "ML Score",
            "Processing Time MS",
            "Summary",
            "Executive Summary",
            "Findings Count",
            "Recommendations",
        ])

        for s in scans:
            recs_str = " | ".join(s.recommendations or [])
            writer.writerow([
                s.id,
                s.created_at.isoformat() if s.created_at else "",
                s.input_type,
                s.risk_score,
                s.risk_level,
                s.detection_mode,
                s.heuristic_score,
                s.ml_score,
                s.processing_time_ms,
                s.input_summary,
                s.executive_summary,
                len(s.findings or []),
                recs_str,
            ])

        return output.getvalue()

    @staticmethod
    def export_json(scans: List[ScanRecord]) -> str:
        data = []
        for s in scans:
            findings_data = [
                {
                    "id": f.id,
                    "category": f.category,
                    "title": f.title,
                    "description": f.description,
                    "severity": f.severity,
                    "confidence": f.confidence,
                    "rule_id": f.rule_id,
                }
                for f in (s.findings or [])
            ]

            data.append({
                "id": s.id,
                "timestamp": s.created_at.isoformat() if s.created_at else "",
                "input_type": s.input_type,
                "input_summary": s.input_summary,
                "input_payload": s.input_payload,
                "risk_score": s.risk_score,
                "risk_level": s.risk_level,
                "heuristic_score": s.heuristic_score,
                "ml_score": s.ml_score,
                "detection_mode": s.detection_mode,
                "executive_summary": s.executive_summary,
                "ai_explanation": s.ai_explanation,
                "recommendations": s.recommendations or [],
                "metadata": s.metadata_payload or {},
                "processing_time_ms": s.processing_time_ms,
                "findings": findings_data,
            })

        return json.dumps({"cyberguard_export": data, "count": len(data)}, indent=2)
