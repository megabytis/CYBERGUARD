import io
import pytest
from httpx import AsyncClient, ASGITransport
from PIL import Image
import qrcode
from app.main import app
from app.config import settings

@pytest.mark.anyio
async def test_all_seven_vectors_end_to_end():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login
        login_res = await client.post("/api/auth/login", json={
            "email": settings.demo_admin_email,
            "password": settings.demo_admin_password
        })
        assert login_res.status_code == 200

        # Vector 1: URL
        res = await client.post("/api/scans/analyze", json={
            "input_type": "url",
            "payload": "https://apple-id-verify.security-update.cc/login",
            "enable_ai": False
        })
        assert res.status_code == 200
        assert res.json()["input_type"] == "url"

        # Vector 2: Email
        res = await client.post("/api/scans/analyze", json={
            "input_type": "email",
            "payload": "From: billing@paypal.com\nReply-To: bad@evil.ru\nSubject: Account suspended\nVerify your credentials immediately.",
            "enable_ai": False
        })
        assert res.status_code == 200
        assert res.json()["risk_level"] in ("HIGH", "MEDIUM")

        # Vector 3: Message / SMS
        res = await client.post("/api/scans/analyze", json={
            "input_type": "message",
            "payload": "Your bank account has been locked. Verify OTP code 88219 at bit.ly/bank-unlock",
            "enable_ai": False
        })
        assert res.status_code == 200
        assert res.json()["risk_score"] > 40

        # Vector 4: QR Code Image Upload
        qr = qrcode.QRCode(box_size=10, border=4)
        qr.add_data("https://paypal-security-verification.com.ru/auth/login")
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        img_bytes = img_buffer.getvalue()

        files = {"file": ("test_qr.png", img_bytes, "image/png")}
        res = await client.post("/api/scans/analyze-qr?enable_ai=false", files=files)
        assert res.status_code == 200
        qr_data = res.json()
        assert qr_data["input_type"] == "qr"
        assert qr_data["risk_score"] > 30

        # Vector 5: Auth Log
        res = await client.post("/api/scans/analyze", json={
            "input_type": "auth_log",
            "payload": "Failed password for admin from 10.0.0.5\nFailed password for root from 10.0.0.5\nFailed password for user1 from 10.0.0.5\nFailed password for user2 from 10.0.0.5\nFailed password for user3 from 10.0.0.5\nFailed password for user4 from 10.0.0.5",
            "enable_ai": False
        })
        assert res.status_code == 200
        assert res.json()["risk_score"] >= 30

        # Vector 6: Network Flow
        res = await client.post("/api/scans/analyze", json={
            "input_type": "network",
            "payload": "10.0.0.1:5000 -> 198.51.100.2:4444 PROTO=TCP BYTES=5000",
            "enable_ai": False
        })
        assert res.status_code == 200
        assert res.json()["risk_score"] > 30

        # Vector 7: Raw Email Headers
        res = await client.post("/api/scans/analyze", json={
            "input_type": "headers",
            "payload": "From: service@paypal.com\nAuthentication-Results: mx.google.com; spf=fail; dkim=fail; dmarc=fail\nReceived: from unknown (1.2.3.4)",
            "enable_ai": False
        })
        assert res.status_code == 200
        assert res.json()["risk_score"] > 40

        # Test Copilot Chat
        copilot_res = await client.post("/api/copilot/chat", json={
            "message": "Explain why this domain was flagged as lookalike"
        })
        assert copilot_res.status_code == 200
        assert "response" in copilot_res.json()

        # Test Preferences Update
        pref_res = await client.put("/api/preferences", json={
            "heuristic_weight": 0.8,
            "ml_weight": 0.2
        })
        assert pref_res.status_code == 200
        assert pref_res.json()["heuristic_weight"] == 0.8
