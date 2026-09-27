import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import httpx

from app.config import settings
from app.core.rules import RuleFinding

logger = logging.getLogger("cyberguard.ai")

class GroqAIClient:
    """Server-side Groq Cloud LLM client with defensive prompt constraints and graceful degradation."""

    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

    @classmethod
    def is_available(cls) -> bool:
        return bool(settings.groq_api_key and settings.groq_api_key.strip())

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
        Calls Groq LLM to generate an executive summary, markdown narrative, and response steps.
        Returns None on any network/API failure to trigger instant deterministic fallback.
        """
        if not cls.is_available():
            return None

        # Prepare strictly factual prompt context
        evidence_list = [
            f"- [{f.severity}] {f.title}: {f.description} (Confidence: {int(f.confidence * 100)}%)"
            for f in findings
        ]
        evidence_text = "\n".join(evidence_list) if evidence_list else "No heuristic violations detected."

        system_prompt = (
            "You are CYBERGUARD's defensive threat intelligence reasoning engine. "
            "Your role is to strictly analyze the verified scanner telemetry provided and explain the findings clearly. "
            "CRITICAL RULES:\n"
            "1. NEVER hallucinate or invent non-existent evidence or indicators.\n"
            "2. Rely ONLY on the detected evidence, scores, and metadata supplied in the prompt.\n"
            "3. If evidence is clean, clearly confirm the low risk verdict.\n"
            "4. Return your output strictly as valid JSON with keys: 'executive_summary', 'markdown_explanation', 'recommendations' (array of strings)."
        )

        user_content = f"""
ANALYZE SCAN TELEMETRY:
- Input Type: {input_type.upper()}
- Final Risk Score: {risk_score}/100 ({risk_level} Risk)
- Deterministic Heuristic Score: {heuristic_score}/100
- Local Machine Learning Score: {ml_score}/100
- Detected Evidence Items:
{evidence_text}

- Structural Metadata:
{json.dumps(metadata, default=str)}

Provide a structured, professional defensive assessment.
"""

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(
                    cls.GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.groq_api_key.strip()}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.groq_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content},
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"},
                    },
                )

                if response.status_code != 200:
                    logger.warning(f"Groq API returned non-200 status: {response.status_code}")
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
            logger.warning(f"Groq API call failed or timed out: {e}. Falling back to deterministic rules.")
            return None

    @classmethod
    async def generate_copilot_response(
        cls,
        user_message: str,
        scan_context: Optional[Dict[str, Any]] = None,
    ) -> Tuple[str, str]:
        """
        Handles interactive conversational Q&A in the AI Copilot drawer.
        Returns: (assistant_response_markdown, source_string)
        """
        if not cls.is_available():
            # Local fallback response
            fallback_text = (
                "**Local Security Copilot (Offline Mode)**\n\n"
                "External AI reasoning is currently operating in offline mode. "
                "Based on deterministic defensive policies:\n"
                "- Verify all unexpected messages through out-of-band communication.\n"
                "- Always inspect full sender email headers (SPF/DKIM/DMARC) for domain spoofing.\n"
                "- Never enter credentials into domains hosted on raw IP addresses or lookalike TLDs."
            )
            return fallback_text, "LOCAL_DEFENSIVE_HEURISTIC"

        system_prompt = (
            "You are CYBERGUARD's AI Security Copilot. "
            "You assist cybersecurity analysts in understanding scan findings, demystifying threat evidence, "
            "and recommending SOC response procedures. "
            "Be concise, technical, precise, and defensive. Never output exploit code or attack instructions."
        )

        messages = [{"role": "system", "content": system_prompt}]

        if scan_context:
            context_str = (
                f"CURRENT SCAN CONTEXT:\n"
                f"- Input Type: {scan_context.get('input_type')}\n"
                f"- Risk Score: {scan_context.get('risk_score')}/100 ({scan_context.get('risk_level')})\n"
                f"- Summary: {scan_context.get('input_summary')}\n"
                f"- Findings Count: {len(scan_context.get('findings', []))}\n"
            )
            messages.append({"role": "system", "content": context_str})

        messages.append({"role": "user", "content": user_message})

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    cls.GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.groq_api_key.strip()}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.groq_model,
                        "messages": messages,
                        "temperature": 0.3,
                        "max_tokens": 1000,
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    assistant_text = data["choices"][0]["message"]["content"]
                    return assistant_text, "GROQ_LLM"
        except Exception as e:
            logger.warning(f"Copilot Groq call failed: {e}")

        # Fallback if request fails
        fallback_text = (
            "**Defensive Advisory (Local Engine):**\n\n"
            f"Regarding your query on '{user_message[:60]}...': "
            "Maintain defense-in-depth protocols. When handling suspicious artifacts, ensure they remain isolated "
            "from internal production networks and confirm all DNS/SPF alignments before release."
        )
        return fallback_text, "LOCAL_DEFENSIVE_HEURISTIC"
