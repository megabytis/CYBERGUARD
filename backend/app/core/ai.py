import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
import httpx

from app.config import settings
from app.core.rules import RuleFinding

logger = logging.getLogger("cyberguard.ai")

class GroqAIClient:
    """Server-side LLM reasoning engine supporting DeepSeek Flash/Chat and Groq with intelligent fallback."""

    @classmethod
    def get_active_provider(cls) -> Optional[Tuple[str, str, str, str]]:
        """
        Returns active provider tuple: (provider_name, api_endpoint, model_name, api_key)
        Prioritizes DeepSeek if configured, with Groq fallback.
        """
        if settings.deepseek_api_key and settings.deepseek_api_key.strip():
            endpoint = f"{settings.deepseek_base_url.rstrip('/')}/chat/completions"
            raw_model = (settings.deepseek_model or "deepseek-chat").strip()
            model_name = "deepseek-chat" if raw_model in ["deepseek-flash", "deepseek-chat", "default", ""] else raw_model
            return (
                "DeepSeek",
                endpoint,
                model_name,
                settings.deepseek_api_key.strip(),
            )
        if settings.groq_api_key and settings.groq_api_key.strip():
            return (
                "Groq",
                "https://api.groq.com/openai/v1/chat/completions",
                settings.groq_model or "llama-3.3-70b-versatile",
                settings.groq_api_key.strip(),
            )
        return None

    @classmethod
    def is_available(cls) -> bool:
        return cls.get_active_provider() is not None

    @classmethod
    async def generate_scan_explanation(
        cls,
        input_type: str,
        risk_score: int,
        risk_level: str,
        findings: List[RuleFinding],
        heuristic_score: float,
        ml_score: float,
        metadata: Dict[str, Any],
    ) -> Optional[Tuple[str, str, List[str]]]:
        """
        Calls DeepSeek or Groq LLM to generate an executive summary, markdown narrative, and response steps.
        Returns None on any network/API failure to trigger instant deterministic fallback.
        """
        provider_info = cls.get_active_provider()
        if not provider_info:
            return None

        provider_name, endpoint, model_name, api_key = provider_info

        # Prepare strictly factual prompt context
        evidence_list = [
            f"- [{f.severity}] {f.title}: {f.description} (Confidence: {int(f.confidence * 100)}%)"
            for f in findings
        ]
        evidence_text = "\n".join(evidence_list) if evidence_list else "No heuristic violations detected."

        system_prompt = (
            "You are CYBERGUARD's defensive threat intelligence reasoning engine. "
            "Your role is to strictly analyze the verified scanner telemetry provided and explain the findings concisely and clearly for security analysts. "
            "CRITICAL RULES:\n"
            "1. NEVER hallucinate or invent non-existent evidence or indicators.\n"
            "2. Keep the explanation concise, high-signal, and easy to read. Do NOT dump raw JSON metadata or repeat bullet lists.\n"
            "3. If evidence is clean, state in 1-2 sentences why the payload is safe.\n"
            "4. For suspicious/critical payloads, explain the attacker's motive and attack mechanism in 2 short, crisp paragraphs.\n"
            "5. Include relevant MITRE ATT&CK codes inline where appropriate (e.g. T1566, T1078).\n"
            "6. Return your output strictly as valid JSON with keys:\n"
            "   - 'executive_summary': A 1-2 sentence executive verdict.\n"
            "   - 'markdown_explanation': 2 short, clear paragraphs explaining the threat and defensive context.\n"
            "   - 'recommendations': An array of 3-4 concise mitigation actions."
        )

        user_content = f"""
ANALYZE SCAN TELEMETRY:
- Input Type: {input_type.upper()}
- Final Risk Score: {risk_score}/100 ({risk_level} Risk)
- Deterministic Heuristic Score: {heuristic_score}/100
- Local Machine Learning Score: {ml_score}/100
- Detected Evidence Items:
{evidence_text}

- Structural Context:
{json.dumps(metadata, default=str)}

Provide a concise, executive-level security analysis.
"""

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(
                    endpoint,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content},
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"},
                    },
                )

                if response.status_code != 200:
                    logger.warning(f"{provider_name} API returned non-200 status: {response.status_code} ({response.text[:200]})")
                    return None

                data = response.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)

                exec_summary = parsed.get("executive_summary", "")
                markdown_exp = parsed.get("markdown_explanation", "")
                recs = parsed.get("recommendations", [])

                if exec_summary and markdown_exp and isinstance(recs, list):
                    return exec_summary, markdown_exp, recs
                return None

        except Exception as e:
            logger.warning(f"{provider_name} API call failed or timed out: {e}. Falling back to deterministic rules.")
            return None

    @classmethod
    async def generate_copilot_response(
        cls,
        user_message: str,
        scan_context: Optional[Dict[str, Any]] = None,
    ) -> Tuple[str, str]:
        """
        Handles interactive conversational Q&A in the AI Copilot drawer and page.
        Returns: (assistant_response_markdown, source_string)
        """
        provider_info = cls.get_active_provider()
        if provider_info:
            provider_name, endpoint, model_name, api_key = provider_info

            system_prompt = (
                "You are CYBERGUARD's AI Security Copilot — an expert Tier-3 SOC analyst and defensive cybersecurity engineer. "
                "Your mission is to help security analysts understand scan findings, explain forensic evidence, "
                "calculate risk implications, and formulate actionable incident response containment playbooks. "
                "Tone: Professional, direct, technical, and strictly defensive. "
                "Rules:\n"
                "- Reference MITRE ATT&CK technique IDs where applicable.\n"
                "- Provide clear, numbered SOC remediation procedures when requested.\n"
                "- Never generate offensive exploits or malicious code."
            )

            messages = [{"role": "system", "content": system_prompt}]

            if scan_context:
                findings_preview = [
                    f"- [{cls._extract_finding_attr(f, 'severity', 'INFO')}] {cls._extract_finding_attr(f, 'title', 'Indicator')}: {cls._extract_finding_attr(f, 'description', '')}"
                    for f in scan_context.get("findings", [])
                ]
                context_str = (
                    f"ACTIVE TELEMETRY CONTEXT:\n"
                    f"- Input Type: {scan_context.get('input_type', '').upper()}\n"
                    f"- Risk Score: {scan_context.get('risk_score')}/100 ({scan_context.get('risk_level')})\n"
                    f"- Summary: {scan_context.get('input_summary')}\n"
                    f"- Findings Detected:\n" + ("\n".join(findings_preview) if findings_preview else "None") + "\n"
                    f"- Executive Summary: {scan_context.get('executive_summary', '')}\n"
                    f"- Existing Recommendations: {json.dumps(scan_context.get('recommendations', []))}"
                )
                messages.append({"role": "system", "content": context_str})

            messages.append({"role": "user", "content": user_message})

            try:
                async with httpx.AsyncClient(timeout=14.0) as client:
                    response = await client.post(
                        endpoint,
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": model_name,
                            "messages": messages,
                            "temperature": 0.3,
                            "max_tokens": 1200,
                        },
                    )

                    if response.status_code == 200:
                        data = response.json()
                        assistant_text = data["choices"][0]["message"]["content"]
                        return assistant_text, f"{provider_name.upper()}_LLM"
            except Exception as e:
                logger.warning(f"Copilot {provider_name} call failed: {e}. Falling back to Local Copilot Engine.")

        # High-intelligence local expert fallback (100% offline & reliable for hackathons)
        return cls._generate_local_copilot_reasoning(user_message, scan_context)

    @classmethod
    def _extract_finding_attr(cls, finding: Any, key: str, default: Any = "") -> Any:
        if isinstance(finding, dict):
            return finding.get(key, default)
        return getattr(finding, key, default)

    @classmethod
    def _generate_local_copilot_reasoning(
        cls,
        user_message: str,
        scan_context: Optional[Dict[str, Any]] = None,
    ) -> Tuple[str, str]:
        """
        Deep contextual rule-grounded cybersecurity Copilot engine.
        Answers queries intelligently based on active scan telemetry and security knowledge base.
        """
        msg_lower = user_message.lower().strip()

        # Context-Aware Inquiry
        if scan_context:
            input_type = scan_context.get("input_type", "unknown").upper()
            risk_score = scan_context.get("risk_score", 0)
            risk_level = scan_context.get("risk_level", "UNKNOWN")
            findings = scan_context.get("findings", [])
            recommendations = scan_context.get("recommendations", [])
            summary = scan_context.get("input_summary", "")

            # Query Intent 1: Why / Explanation / Reasons
            if any(k in msg_lower for k in ["why", "reason", "explain", "flag", "score", "how come", "evidence"]):
                response_lines = [
                    f"### Forensic Telemetry Breakdown (Scan Context: {input_type})",
                    f"**Composite Risk Score:** `{risk_score}/100` ({risk_level} Risk)",
                    f"**Target:** `{summary}`",
                    "",
                    "#### Primary Trigger Findings:",
                ]
                if findings:
                    for idx, f in enumerate(findings[:5], 1):
                        sev = cls._extract_finding_attr(f, "severity", "MEDIUM")
                        title = cls._extract_finding_attr(f, "title", "Indicator")
                        desc = cls._extract_finding_attr(f, "description", "")
                        response_lines.append(f"{idx}. **[{sev}] {title}**: {desc}")
                else:
                    response_lines.append(
                        "- No critical heuristic anomalies were identified. The payload adheres to baseline operational specifications."
                    )

                response_lines.extend([
                    "",
                    "#### Scoring Mechanics:",
                    f"- **Rule Heuristics (70% weight):** Evaluates structural RFC violations, lexical deception patterns, and known evasion signatures.",
                    f"- **Statistical ML Classifier (30% weight):** TF-IDF vector analysis calibrated against enterprise security threat corpora.",
                    "",
                    "Would you like me to generate a tailored SOC containment playbook or explain a specific indicator?",
                ])
                return "\n".join(response_lines), "LOCAL_DEFENSIVE_HEURISTIC"

            # Query Intent 2: Action / Mitigation / Response / What should I do
            if any(k in msg_lower for k in ["action", "what should", "mitigate", "contain", "respond", "playbook", "fix", "next step"]):
                response_lines = [
                    f"### Incident Response Containment Playbook ({input_type} • {risk_level} Risk)",
                    f"Based on the identified threat indicators, execute the following standardized SOC workflow:",
                    "",
                    "#### Phase 1: Immediate Triage & Isolation",
                ]
                if risk_score >= 70:
                    response_lines.extend([
                        "1. **Defensive Blocking:** Immediately submit the target domain or IP to firewall edge filters and DNS sinkholes.",
                        "2. **Session Invalidation:** Revoke all active enterprise sessions for any identity associated with this payload.",
                        "3. **Endpoint Quarantine:** Isolate recipient workstations from corporate VLAN segments pending forensic triage.",
                    ])
                elif risk_score >= 30:
                    response_lines.extend([
                        "1. **Elevated Monitoring:** Flag the originating entity in security event monitoring and check proxy logs for identical queries.",
                        "2. **Out-of-Band Verification:** Contact the purported sender via a verified telephone or secondary channel to confirm legitimacy.",
                    ])
                else:
                    response_lines.extend([
                        "1. **Standard Posture:** Content is evaluated as safe. No operational network isolation is warranted.",
                        "2. **Log Retention:** Record transaction hash in audit log for compliance baselining.",
                    ])

                if recommendations:
                    response_lines.extend([
                        "",
                        "#### Automated Recommendations:",
                    ])
                    for r in recommendations[:4]:
                        response_lines.append(f"- {r}")

                return "\n".join(response_lines), "LOCAL_DEFENSIVE_HEURISTIC"

            # Query Intent 3: Incident Report / Summary
            if any(k in msg_lower for k in ["report", "summary", "brief", "executive", "ciso"]):
                report_lines = [
                    f"### Executive Security Briefing",
                    f"**Incident ID:** `SCN-{risk_score}{hash(summary) % 10000:04d}` | **Vector:** `{input_type}`",
                    f"**Threat Level:** **{risk_level}** (`{risk_score}/100`)",
                    "",
                    f"**Executive Statement:** {scan_context.get('executive_summary', 'Analysis completed.')}",
                    "",
                    f"**Key Findings Total:** {len(findings)} technical indicators captured.",
                    f"**Immediate Action Required:** {'Mandatory containment within 15 minutes.' if risk_score >= 70 else 'Standard analyst review.'}",
                    "",
                    "_You can generate and export a formal PDF incident dossier directly from the Reports tab._",
                ]
                return "\n".join(report_lines), "LOCAL_DEFENSIVE_HEURISTIC"

        # General Cybersecurity Knowledge Inquiries
        if any(k in msg_lower for k in ["spf", "dkim", "dmarc", "email header"]):
            return (
                "### Email Authentication Architecture (SPF, DKIM, DMARC)\n\n"
                "1. **SPF (Sender Policy Framework):** Publishes authorized sending mail server IP addresses in DNS TXT records. Prevents basic Return-Path spoofing.\n"
                "2. **DKIM (DomainKeys Identified Mail):** Uses public-key cryptography to digitally sign message headers and body, ensuring message transit integrity.\n"
                "3. **DMARC (Domain-based Message Authentication):** Binds SPF and DKIM to the user-facing `From:` header. Policies: `none` (monitoring), `quarantine` (spam folder), and `reject` (hard drop).\n\n"
                "**SOC Recommendation:** Always enforce `p=reject` with strict alignment to prevent brand domain impersonation.",
                "LOCAL_DEFENSIVE_HEURISTIC",
            )

        if any(k in msg_lower for k in ["typosquat", "lookalike", "punycode", "domain"]):
            return (
                "### Domain Spoofing & Typosquatting Mechanics\n\n"
                "- **Character Substitution:** Swapping visually identical glyphs (e.g. `1` for `l`, `0` for `o`, `rn` for `m`).\n"
                "- **IDN / Punycode Attacks:** Inserting Cyrillic or Greek characters into the domain name encoded with `xn--` prefix (e.g. `apple.com` rendered with Cyrillic 'a').\n"
                "- **Subdomain Nesting:** Crafting chains like `login.paypal.com.verify-accounts.net` to mislead users on mobile or truncating viewports.\n\n"
                "**Defensive Countermeasure:** CYBERGUARD's lexical parser inspects Unicode homoglyphs and compares target root domains against verified brand registries.",
                "LOCAL_DEFENSIVE_HEURISTIC",
            )

        if any(k in msg_lower for k in ["brute force", "ssh", "auth log"]):
            return (
                "### Authentication Anomaly Detection & Mitigation\n\n"
                "- **Burst Velocity:** Sudden spikes in failed authentication attempts within a narrow timeframe indicate automated credential stuffing or dictionary attacks.\n"
                "- **Common Target Accounts:** Systematic queries for `root`, `admin`, `oracle`, `deploy` demonstrate automated scanner reconnaissance.\n"
                "- **Containment Actions:**\n"
                "  1. Implement Fail2Ban or edge firewall dynamic IP rate-limiting.\n"
                "  2. Disable SSH password authentication in `/etc/ssh/sshd_config` (`PasswordAuthentication no`).\n"
                "  3. Enforce cryptographic hardware keys (ED25519) and multi-factor authentication.",
                "LOCAL_DEFENSIVE_HEURISTIC",
            )

        if any(k in msg_lower for k in ["c2", "beacon", "network", "metasploit", "4444"]):
            return (
                "### Command-and-Control (C2) Detection Strategy\n\n"
                "- **Beaconing Rhythm:** Regular periodic outbound TCP/UDP handshakes with minimal jitter indicate automated agent telemetry.\n"
                "- **Suspicious Ports:** Ports like `4444` (default Metasploit payload handler) or `6667` (IRC botnets) represent high-severity lateral compromise flags.\n"
                "- **Containment Playbook:**\n"
                "  1. Immediately terminate active socket connections to the destination IP.\n"
                "  2. Dump volatile host memory (`RAM`) for signature and payload extraction.\n"
                "  3. Query EDR telemetry for the parent process spawning outbound network connections.",
                "LOCAL_DEFENSIVE_HEURISTIC",
            )

        if any(k in msg_lower for k in ["qr", "quishing"]):
            return (
                "### QR Code (Quishing) Defensive Telemetry\n\n"
                "- **The Threat Vector:** Attackers embed credential harvesting URLs in physical posters, parking meters, or PDF invoices to circumvent Secure Email Gateways (SEGs).\n"
                "- **CYBERGUARD Architecture:** We decode the QR matrix in-memory via `pyzbar` without triggering any browser navigation or DNS resolution, ensuring absolute zero-SSRF safety.",
                "LOCAL_DEFENSIVE_HEURISTIC",
            )

        # Default Helpful Cyber Assistant Response
        default_resp = (
            "### CYBERGUARD Defensive Copilot Active\n\n"
            f"I have reviewed your query: *\"{user_message}\"*\n\n"
            "As your automated SOC analyst assistant, I can help you with:\n"
            "- **Deconstruct Active Scans:** Select any historical scan or analyze a target to inspect why it was flagged.\n"
            "- **Generate Response Playbooks:** Ask for step-by-step containment protocols for phishing, C2 beaconing, or brute-force attacks.\n"
            "- **Technical Protocol Analysis:** Request in-depth forensic breakdowns of SPF/DKIM/DMARC headers, punycode spoofing, or network NetFlow records.\n\n"
            "_Tip: Connect your active scan using the inspection context panel to run granular forensic queries._"
        )
        return default_resp, "LOCAL_DEFENSIVE_HEURISTIC"
