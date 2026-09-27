import os
import io
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PDFReportGenerator:
    """Generates official SOC cybersecurity incident reports using ReportLab."""

    @classmethod
    def generate(cls, scan_data: Dict[str, Any], report_number: str) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        styles = getSampleStyleSheet()

        # Custom high-contrast enterprise palette
        c_dark = colors.HexColor("#08090C")
        c_surface = colors.HexColor("#111820")
        c_cyan = colors.HexColor("#00D9FF")
        c_green = colors.HexColor("#00FF9D")
        c_amber = colors.HexColor("#FFBF3F")
        c_red = colors.HexColor("#FF4D6D")
        c_text_muted = colors.HexColor("#687580")

        # Typography Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=c_dark,
        )

        h2_style = ParagraphStyle(
            "Heading2Custom",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#0D1217"),
            spaceBefore=12,
            spaceAfter=6,
        )

        body_style = ParagraphStyle(
            "BodyCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#222831"),
        )

        bullet_style = ParagraphStyle(
            "BulletCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#222831"),
            leftIndent=15,
        )

        meta_label_style = ParagraphStyle(
            "MetaLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=c_text_muted,
        )

        meta_val_style = ParagraphStyle(
            "MetaVal",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=c_dark,
        )

        story = []

        # Classification Banner
        story.append(Paragraph(
            "<b>RESTRICTED &bull; CYBER DEFENSE INCIDENT REPORT &bull; TLP:AMBER</b>",
            ParagraphStyle("TLP", fontName="Helvetica-Bold", fontSize=8, alignment=1, textColor=c_amber)
        ))
        story.append(Spacer(1, 10))

        # Header Table with Logo / Title
        header_data = [
            [
                Paragraph("<b>CYBERGUARD</b><br/><font size=8 color='#687580'>Defensive Threat Intelligence</font>", title_style),
                Paragraph(f"<b>REPORT NO:</b> {report_number}<br/><b>DATE:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", meta_val_style),
            ]
        ]
        t_header = Table(header_data, colWidths=[320, 210])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        story.append(t_header)
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=c_cyan, spaceBefore=4, spaceAfter=14))

        # Risk Score Banner Box
        risk_score = scan_data.get("risk_score", 0)
        risk_level = scan_data.get("risk_level", "LOW")
        score_color = c_green if risk_level == "LOW" else (c_amber if risk_level == "MEDIUM" else c_red)

        score_table_data = [
            [
                Paragraph(f"<b>RISK ASSESSMENT:</b> <font color='{score_color.hexval()}'><b>{risk_level} ({risk_score}/100)</b></font>", h2_style),
                Paragraph(f"<b>VECTOR:</b> {scan_data.get('input_type', '').upper()} &nbsp;|&nbsp; <b>MODE:</b> {scan_data.get('detection_mode', 'HYBRID')}", meta_val_style),
            ]
        ]
        t_score = Table(score_table_data, colWidths=[280, 250])
        t_score.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F4F6F8")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#DDE2E5")),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_score)
        story.append(Spacer(1, 12))

        # 1. Executive Summary
        story.append(Paragraph("1. Executive Summary", h2_style))
        exec_summary = scan_data.get("executive_summary", "Analysis completed.")
        story.append(Paragraph(exec_summary, body_style))
        story.append(Spacer(1, 10))

        # 2. Inspected Artifact Details
        story.append(Paragraph("2. Telemetry Metadata", h2_style))
        summary_txt = scan_data.get("input_summary", "")
        processing_ms = scan_data.get("processing_time_ms", 0)

        meta_rows = [
            [Paragraph("Target Summary", meta_label_style), Paragraph(summary_txt, meta_val_style)],
            [Paragraph("Latency", meta_label_style), Paragraph(f"{processing_ms} ms", meta_val_style)],
            [Paragraph("Heuristic Score (70%)", meta_label_style), Paragraph(f"{scan_data.get('heuristic_score', 0):.1f} / 100", meta_val_style)],
            [Paragraph("ML Score (30%)", meta_label_style), Paragraph(f"{scan_data.get('ml_score', 0):.1f} / 100", meta_val_style)],
        ]
        t_meta = Table(meta_rows, colWidths=[130, 400])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FAFAFA")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E9EC")),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 12))

        # 3. Itemized Detection Evidence
        story.append(Paragraph("3. Detected Threat Evidence", h2_style))
        findings = scan_data.get("findings", [])
        if findings:
            finding_rows = [
                [
                    Paragraph("<b>Severity</b>", meta_label_style),
                    Paragraph("<b>Category</b>", meta_label_style),
                    Paragraph("<b>Indicator / Description</b>", meta_label_style),
                    Paragraph("<b>Confidence</b>", meta_label_style),
                ]
            ]
            for f in findings:
                sev = getattr(f, "severity", f.get("severity", "INFO") if isinstance(f, dict) else "INFO")
                cat = getattr(f, "category", f.get("category", "") if isinstance(f, dict) else "")
                title = getattr(f, "title", f.get("title", "") if isinstance(f, dict) else "")
                desc = getattr(f, "description", f.get("description", "") if isinstance(f, dict) else "")
                conf = getattr(f, "confidence", f.get("confidence", 0.0) if isinstance(f, dict) else 0.0)

                sev_color = c_red if sev in ("CRITICAL", "HIGH") else (c_amber if sev == "MEDIUM" else c_green)
                sev_p = Paragraph(f"<font color='{sev_color.hexval()}'><b>{sev}</b></font>", meta_val_style)
                desc_p = Paragraph(f"<b>{title}</b><br/>{desc}", body_style)

                finding_rows.append([
                    sev_p,
                    Paragraph(cat, meta_val_style),
                    desc_p,
                    Paragraph(f"{int(conf * 100)}%", meta_val_style),
                ])

            t_findings = Table(finding_rows, colWidths=[65, 85, 330, 50])
            t_findings.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EAEFF2")),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#DDE2E5")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(t_findings)
        else:
            story.append(Paragraph("No anomalous indicators or heuristic rule violations fired during inspection.", body_style))
        story.append(Spacer(1, 12))

        # 4. Actionable Protective Recommendations
        story.append(Paragraph("4. Recommended Defensive Actions", h2_style))
        recs = scan_data.get("recommendations", [])
        if recs:
            for r in recs:
                story.append(Paragraph(f"&bull; {r}", bullet_style))
        else:
            story.append(Paragraph("Standard baseline defense protocol applies.", body_style))
        story.append(Spacer(1, 12))

        # 5. Technical Limitations & Disclaimers
        story.append(Paragraph("5. Analysis Limitations & Governance", h2_style))
        disclaimer_text = (
            "CYBERGUARD performs static lexical parsing, deterministic rule evaluation, and statistical token inference. "
            "It does not perform dynamic browser automation or binary detonation. "
            "Threat ratings reflect defensive indicators identified within the supplied payload."
        )
        story.append(Paragraph(disclaimer_text, ParagraphStyle("Disc", parent=body_style, fontSize=8, textColor=c_text_muted)))

        doc.build(story)
        return buffer.getvalue()
