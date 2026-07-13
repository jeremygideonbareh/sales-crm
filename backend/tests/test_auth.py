import pytest


@pytest.mark.asyncio
async def test_login_success(client, test_user):
    response = await client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "Test1234",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_failure(client):
    response = await client.post("/api/auth/login", json={
        "email": "wrong@test.com",
        "password": "wrong",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] in ["ok", "degraded"]


@pytest.mark.asyncio
async def test_auth_me(client, auth_token):
    response = await client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {auth_token}",
    })
    assert response.status_code == 200
    assert response.json()["email"] == "test@test.com"


@pytest.mark.asyncio
async def test_auth_me_no_token(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
