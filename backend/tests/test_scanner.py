import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings

@pytest.mark.anyio
async def test_scanner_end_to_end():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Authenticate first
        login_res = await client.post("/api/auth/login", json={
            "email": settings.demo_admin_email,
            "password": settings.demo_admin_password
        })
        assert login_res.status_code == 200

        # Scan URL
        scan_res = await client.post("/api/scans/analyze", json={
            "input_type": "url",
            "payload": "https://apple-support.security-verify.cc/login",
            "enable_ai": False
        })
        assert scan_res.status_code == 200
        scan_data = scan_res.json()
        assert scan_data["risk_score"] > 30
        assert len(scan_data["findings"]) > 0
        scan_id = scan_data["id"]

        # Fetch scan details
        detail_res = await client.get(f"/api/scans/{scan_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["id"] == scan_id

        # Generate Report
        rep_res = await client.post(f"/api/reports/generate/{scan_id}")
        assert rep_res.status_code == 200
        rep_data = rep_res.json()
        assert "CG-" in rep_data["report_number"]

        # Download Report PDF
        pdf_res = await client.get(f"/api/reports/download/{rep_data['id']}")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert len(pdf_res.content) > 1000

        # Dashboard stats check
        stats_res = await client.get("/api/dashboard/stats")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["total_scans"] >= 1

        # Export CSV
        csv_res = await client.get("/api/scans/export/csv")
        assert csv_res.status_code == 200
        assert "Scan ID" in csv_res.text
