import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings

@pytest.mark.anyio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["app"] == "CYBERGUARD"

@pytest.mark.anyio
async def test_unauthorized_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Should be protected
        res = await client.get("/api/auth/me")
        assert res.status_code == 401

@pytest.mark.anyio
async def test_login_and_logout_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid credentials
        res = await client.post("/api/auth/login", json={
            "email": "invalid@cyberguard.internal",
            "password": "WrongPassword123"
        })
        assert res.status_code == 401

        # Valid demo credentials
        res = await client.post("/api/auth/login", json={
            "email": settings.demo_admin_email,
            "password": settings.demo_admin_password
        })
        assert res.status_code == 200
        user_data = res.json()
        assert user_data["email"] == settings.demo_admin_email
        assert settings.cookie_name in client.cookies

        # Protected route works with cookie
        me_res = await client.get("/api/auth/me")
        assert me_res.status_code == 200
        assert me_res.json()["email"] == settings.demo_admin_email

        # Logout
        logout_res = await client.post("/api/auth/logout")
        assert logout_res.status_code == 200

        # After logout, accessing /me should fail
        me_after_res = await client.get("/api/auth/me")
        assert me_after_res.status_code == 401
