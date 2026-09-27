from typing import List, Dict, Any, Tuple
from app.core.rules import RuleFinding

class ExplanationGenerator:
    """Generates deterministic, evidence-grounded narratives and protective actions."""

    @classmethod
    def generate_local_explanation(
        cls,
        input_type: str,
        risk_score: int,
        risk_level: str,
        findings: List[RuleFinding],
        metadata: Dict[str, Any],
    ) -> Tuple[str, str, List[str]]:
        """
        Produces (executive_summary, detailed_markdown_explanation, recommendations).
        Works 100% offline with zero external network or LLM dependency.
        """
        # 1. Executive Summary
        if not findings:
            exec_summary = (
                f"No significant malicious or anomalous indicators were detected in the analyzed {input_type.upper()}. "
                f"Static heuristics and local machine learning evaluated the content as {risk_level} risk ({risk_score}/100)."
            )
        elif risk_level == "HIGH":
            exec_summary = (
                f"CRITICAL DEFENSIVE ALERT: High-confidence threat indicators ({risk_score}/100) detected in {input_type.upper()}. "
                f"Immediate defensive isolation and containment recommended."
            )
        elif risk_level == "MEDIUM":
            exec_summary = (
                f"ELEVATED SUSPICION: Moderate-risk anomalies ({risk_score}/100) identified in {input_type.upper()}. "
                f"Manual security verification advised before authorizing interaction."
            )
        else:
            exec_summary = (
                f"LOW RISK VERDICT: Content appears benign ({risk_score}/100) with minor or negligible structural anomalies."
            )

        # 2. Detailed Evidence-Based Narrative
        lines = [
            f"### Security Analysis Summary",
            f"**Assessed Risk Level:** {risk_level} (Score: {risk_score}/100)",
            f"**Analysis Vector:** {input_type.upper()}",
            f"**Evaluation Mode:** Deterministic Rule Heuristics & Local ML Inference",
            "",
            "#### Detected Evidence & Observations:",
        ]

        if findings:
            for f in findings:
                confidence_pct = int(f.confidence * 100)
                lines.append(f"- **[{f.severity}] {f.title}** ({confidence_pct}% confidence): {f.description}")
        else:
            lines.append("- No heuristic violation signatures or structural anomalies were identified.")

        lines.extend([
            "",
            "#### Potential Security Impact:",
        ])

        if risk_level == "HIGH":
            lines.append(
                "High probability of credential harvesting, unauthorized session interception, "
                "or endpoint compromise if unverified actions are permitted."
            )
        elif risk_level == "MEDIUM":
            lines.append(
                "Potential social engineering or reconnaissance attempt. "
                "Low direct exploit payload detected, but content presents deceptive characteristics."
            )
        else:
            lines.append(
                "Minimal defensive impact. Content aligns with standard operational traffic norms."
            )

        lines.extend([
            "",
            "#### Technical Limitations & Scope:",
            "Static analysis evaluates lexical patterns, RFC compliance, and statistical machine learning tokens. "
            "It does not execute browser sandboxing or dynamic payload detonation."
        ])

        markdown_narrative = "\n".join(lines)

        # 3. Actionable Countermeasures / Recommendations
        recommendations = cls.generate_recommendations(input_type, risk_level, findings)

        return exec_summary, markdown_narrative, recommendations

    @classmethod
    def generate_recommendations(
        cls,
        input_type: str,
        risk_level: str,
        findings: List[RuleFinding],
    ) -> List[str]:
        """Provides concrete, step-by-step SOC response actions."""
        recs = []

        if risk_level == "HIGH":
            recs.append("Do not open, click, or follow embedded links.")
            recs.append("Verify the authentic identity of the sender through a known, out-of-band channel.")
            if input_type == "url":
                recs.append("Submit the target domain to perimeter DNS sinkhole and proxy blocklists.")
                recs.append("Check internal proxy/firewall logs for any historical queries to this domain.")
            elif input_type in ("email", "message", "headers"):
                recs.append("Report message to enterprise SOC / Anti-Phishing mailbox.")
                recs.append("Purge identical messages from mail server inboxes via administrative search.")
                recs.append("Reset credentials immediately if any authentication data was entered.")
            elif input_type == "auth_log":
                recs.append("Temporarily disable or force-rotate credentials for the affected user accounts.")
                recs.append("Block the attacking source IP addresses at the edge firewall.")
            elif input_type == "network":
                recs.append("Isolate the source workstation from the local network segment immediately.")
                recs.append("Initiate memory and persistence forensics for potential C2 compromise.")
        elif risk_level == "MEDIUM":
            recs.append("Exercise elevated caution before opening attachments or submitting data.")
            recs.append("Cross-reference sender email address with official company directories.")
            recs.append("Inspect SSL/TLS certificate details directly in browser URL bar if visiting.")
        else:
            recs.append("Standard defensive posture: no active intervention required.")
            recs.append("Continue monitoring standard organizational telemetry.")

        return recs
