import pytest
from app.core.ai import GroqAIClient

@pytest.mark.anyio
async def test_local_copilot_why_reasoning():
    scan_context = {
        "input_type": "url",
        "input_summary": "http://apple-id-verify.security-update.cc/login",
        "risk_score": 92,
        "risk_level": "HIGH",
        "findings": [
            {
                "severity": "CRITICAL",
                "title": "Brand Target Impersonation (Apple)",
                "description": "Hostname mimics Apple brand infrastructure.",
            },
            {
                "severity": "CRITICAL",
                "title": "Credential Harvest Path Indicator",
                "description": "Path '/login' solicits authentication data.",
            }
        ],
        "recommendations": [
            "Block domain in DNS sinkhole",
            "Do not enter credentials",
        ],
        "executive_summary": "High risk phishing link detected."
    }

    # Test "why" intent
    resp, source = await GroqAIClient.generate_copilot_response(
        user_message="Why was this URL flagged as high risk?",
        scan_context=scan_context,
    )
    assert source in ("LOCAL_DEFENSIVE_HEURISTIC", "GROQ_LLM")
    assert "92/100" in resp or "Brand" in resp

@pytest.mark.anyio
async def test_local_copilot_mitigation_intent():
    scan_context = {
        "input_type": "email",
        "input_summary": "CEO Wire Request",
        "risk_score": 88,
        "risk_level": "HIGH",
        "findings": [
            {
                "severity": "CRITICAL",
                "title": "CEO Wire Fraud Lure",
                "description": "High urgency request for executive wire transfer.",
            }
        ],
        "recommendations": ["Report to SOC", "Isolate message"],
    }

    resp, source = await GroqAIClient.generate_copilot_response(
        user_message="What should our SOC do to mitigate this?",
        scan_context=scan_context,
    )
    assert source in ("LOCAL_DEFENSIVE_HEURISTIC", "GROQ_LLM")
    assert "Containment" in resp or "SOC" in resp or "Phase 1" in resp

@pytest.mark.anyio
async def test_local_copilot_protocol_inquiry():
    resp, source = await GroqAIClient.generate_copilot_response(
        user_message="Explain what SPF and DMARC do",
        scan_context=None,
    )
    assert source in ("LOCAL_DEFENSIVE_HEURISTIC", "GROQ_LLM")
    assert "SPF" in resp
    assert "DMARC" in resp
