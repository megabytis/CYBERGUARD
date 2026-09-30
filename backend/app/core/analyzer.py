import time
from typing import Dict, Any, List
from app.core.normalizer import Normalizer
from app.core.rules import RulesEngine, RuleFinding
from app.core.ml import ThreatClassifier
from app.core.scorer import RiskScorer
from app.core.explanations import ExplanationGenerator
from app.core.ai import GroqAIClient

class ThreatAnalyzer:
    """Master orchestrator executing the 8-stage defensive inspection pipeline."""

    @classmethod
    async def analyze(
        cls,
        input_type: str,
        payload: str,
        enable_ai: bool = True,
    ) -> Dict[str, Any]:
        start_time = time.perf_counter()
        input_type = input_type.lower().strip()
        payload_clean = payload.strip()

        # Stage 1: Validation
        if not payload_clean:
            raise ValueError("Input payload cannot be empty.")

        # Stage 2 & 3: Normalization & Structural Extraction
        metadata: Dict[str, Any] = {}
        findings: List[RuleFinding] = []
        input_summary = payload_clean[:80] + ("..." if len(payload_clean) > 80 else "")

        if input_type == "url":
            metadata = Normalizer.normalize_url(payload_clean)
            input_summary = metadata.get("normalized_url", payload_clean)[:80]
            findings = RulesEngine.evaluate_url(metadata)

        elif input_type == "email":
            metadata = Normalizer.normalize_email(payload_clean)
            subj = metadata.get("subject", "")
            input_summary = f"Email: {subj}" if subj else f"Email: {payload_clean[:60]}..."
            findings = RulesEngine.evaluate_email(metadata)

        elif input_type == "message":
            metadata = Normalizer.normalize_message(payload_clean)
            input_summary = f"SMS/Chat: {payload_clean[:60]}..."
            findings = RulesEngine.evaluate_message(metadata)

        elif input_type == "auth_log":
            metadata = Normalizer.normalize_auth_log(payload_clean)
            input_summary = f"Auth Log ({metadata.get('total_lines', 0)} lines, {metadata.get('failed_attempts', 0)} failures)"
            findings = RulesEngine.evaluate_auth_log(metadata)

        elif input_type == "network":
            metadata = Normalizer.normalize_network(payload_clean)
            input_summary = f"NetFlow ({metadata.get('total_records', 0)} records)"
            findings = RulesEngine.evaluate_network(metadata)

        elif input_type == "headers":
            metadata = Normalizer.normalize_headers(payload_clean)
            from_hdr = metadata.get("from_header", "Unknown")
            input_summary = f"Headers From: {from_hdr[:60]}"
            findings = RulesEngine.evaluate_headers(metadata)

        elif input_type == "qr":
            # Text or decoded image payload extracted from QR code
            qr_meta = Normalizer.normalize_qr(payload_clean)
            metadata = qr_meta
            findings = RulesEngine.evaluate_qr(qr_meta)

            # Smart human-readable telemetry summary
            if qr_meta.get("is_dangerous_scheme"):
                input_summary = f"QR Exploit Scheme: {payload_clean[:55]}..."
            elif qr_meta.get("is_dynamic_qr_generator"):
                input_summary = f"QR Quishing ({qr_meta.get('redirector_domain')}): {payload_clean[:50]}..."
            elif qr_meta.get("is_wifi_lure"):
                input_summary = f"QR Wi-Fi Config: SSID '{qr_meta.get('wifi_ssid')}'"
            elif qr_meta.get("is_telecom_dispatch"):
                input_summary = f"QR Telecom Dispatch: {qr_meta.get('telecom_target')}"
            elif qr_meta.get("url_payload"):
                input_summary = f"QR Destination: {qr_meta.get('url_payload')[:60]}"
            else:
                input_summary = f"QR Payload: {payload_clean[:60]}..."
        else:
            raise ValueError(f"Unsupported scanner vector: '{input_type}'")

        # Stage 5: Machine Learning Inference (30%)
        classifier = ThreatClassifier.get_instance()
        ml_score, _ = classifier.predict(payload_clean)

        # Stage 6: Evidence Aggregation & Risk Scoring (70% Rules + 30% ML)
        risk_score, risk_level, heuristic_score = RiskScorer.compute_risk(
            findings=findings,
            ml_score=ml_score,
        )

        # Stage 7: Evidence-Based Narrative & Mitigation
        exec_summary = ""
        markdown_narrative = ""
        recommendations: List[str] = []
        is_ai_generated = False
        detection_mode = "HYBRID_LOCAL"

        if enable_ai and GroqAIClient.is_available():
            provider_info = GroqAIClient.get_active_provider()
            provider_label = provider_info[0].upper() if provider_info else "AI"
            ai_result = await GroqAIClient.generate_scan_explanation(
                input_type=input_type,
                risk_score=risk_score,
                risk_level=risk_level,
                findings=findings,
                heuristic_score=heuristic_score,
                ml_score=ml_score,
                metadata=metadata,
            )
            if ai_result:
                exec_summary, markdown_narrative, recommendations = ai_result
                is_ai_generated = True
                detection_mode = "HYBRID_AI"

        # Fallback to local rule explanation if Groq disabled or unavailable
        if not is_ai_generated:
            exec_summary, markdown_narrative, recommendations = (
                ExplanationGenerator.generate_local_explanation(
                    input_type=input_type,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    findings=findings,
                    metadata=metadata,
                )
            )

        elapsed_ms = int((time.perf_counter() - start_time) * 1000)

        return {
            "input_type": input_type,
            "input_summary": input_summary,
            "input_payload": payload_clean,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "heuristic_score": heuristic_score,
            "ml_score": ml_score,
            "detection_mode": detection_mode,
            "executive_summary": exec_summary,
            "ai_explanation": markdown_narrative,
            "is_ai_generated": is_ai_generated,
            "findings": findings,
            "recommendations": recommendations,
            "metadata_payload": metadata,
            "processing_time_ms": elapsed_ms,
        }
