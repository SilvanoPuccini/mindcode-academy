"""
Tests for the dual-transport session handling:

- login/register deliver the JWT as an httpOnly "mindcode_token" cookie.
- POST /auth/logout clears the cookie.
- Protected endpoints accept the token from EITHER the Bearer header
  (mobile/API clients) or the session cookie (web client).
- A missing token is rejected with 401 uniformly (not the legacy 403).

These tests do not need a live database: the DB session and AuthService are
dependency-overridden with mocks, and the cookie tests use a real signed JWT
created with the same secret/algorithm the dependencies decode with.
"""

from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.testclient import TestClient

from app.core.config import ACCESS_TOKEN_COOKIE_NAME, settings
from app.core.dependencies import _resolve_token
from app.core.security import create_access_token
from app.db.base import get_db
from app.main import app
from app.routers.auth import get_auth_service
from app.services.auth_service import AuthService


FAKE_USER = SimpleNamespace(
    id=42,
    email="user@test.com",
    name="Test User",
    is_active=True,
    is_verified=False,
    created_at=None,
)


@pytest.fixture
def mock_auth_service():
    """Mock AuthService for register/login flows."""
    service = Mock(spec=AuthService)
    service.authenticate_user.return_value = FAKE_USER
    service.register_user.return_value = FAKE_USER
    service.create_user_token.return_value = "jwt-token-abc"
    return service


@pytest.fixture
def mock_db():
    """Mock DB session whose user query resolves FAKE_USER."""
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = FAKE_USER
    return db


@pytest.fixture
def client(mock_auth_service, mock_db):
    """Test client with mocked AuthService and DB session."""
    app.dependency_overrides[get_auth_service] = lambda: mock_auth_service
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


class TestSessionCookieDelivery:
    """login/register must set the httpOnly session cookie."""

    def test_login_sets_httponly_session_cookie(self, client):
        response = client.post(
            "/auth/login",
            json={"email": "user@test.com", "password": "secret1A!"},
        )

        assert response.status_code == 200
        set_cookie = response.headers["set-cookie"]
        assert f"{ACCESS_TOKEN_COOKIE_NAME}=jwt-token-abc" in set_cookie
        assert "HttpOnly" in set_cookie
        assert "Secure" in set_cookie
        assert "SameSite=none" in set_cookie
        # Cookie lifetime mirrors the JWT expiry configured in Settings.
        assert f"Max-Age={settings.access_token_expire_minutes * 60}" in set_cookie
        assert "Path=/" in set_cookie

    def test_register_sets_session_cookie_too(self, client):
        service = client.app.dependency_overrides[get_auth_service]()
        service.register_user.return_value = FAKE_USER

        response = client.post(
            "/auth/register",
            json={
                "email": "user@test.com",
                "password": "secret1A!",
                "name": "Test User",
            },
        )

        assert response.status_code == 201
        set_cookie = response.headers["set-cookie"]
        assert f"{ACCESS_TOKEN_COOKIE_NAME}=jwt-token-abc" in set_cookie
        assert "HttpOnly" in set_cookie

    def test_logout_clears_session_cookie(self, client):
        response = client.post("/auth/logout")

        # No auth required to log out.
        assert response.status_code == 200
        assert response.json() == {"message": "Sesión cerrada"}

        set_cookie = response.headers["set-cookie"]
        # Deletion uses the same attributes so every browser matches it.
        assert f"{ACCESS_TOKEN_COOKIE_NAME}=" in set_cookie
        assert "HttpOnly" in set_cookie
        assert "Secure" in set_cookie
        assert "SameSite=none" in set_cookie
        assert "Max-Age=0" in set_cookie


class TestDualTransportAuthentication:
    """GET /auth/me accepts the token from either transport."""

    def test_me_accepts_session_cookie(self, client):
        # Real signed JWT: decoded by the same secret the dependency uses.
        token = create_access_token({"sub": "42"})
        client.cookies.set(ACCESS_TOKEN_COOKIE_NAME, token)

        response = client.get("/auth/me")

        assert response.status_code == 200
        assert response.json()["email"] == FAKE_USER.email
        assert response.json()["id"] == 42

    def test_me_still_accepts_bearer_header(self, client):
        token = create_access_token({"sub": "42"})

        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["id"] == 42

    def test_bearer_header_takes_precedence_over_cookie(self):
        """Unit check of the resolution order: header first, cookie fallback."""
        request = SimpleNamespace(
            cookies={ACCESS_TOKEN_COOKIE_NAME: "cookie-token"}
        )
        header_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="header-token"
        )

        assert _resolve_token(request, header_credentials) == "header-token"
        assert _resolve_token(request, None) == "cookie-token"
        assert _resolve_token(SimpleNamespace(cookies={}), None) is None

    def test_missing_token_rejected_with_401(self, client):
        response = client.get("/auth/me")

        # Uniform 401 (the old HTTPBearer(auto_error=True) path answered 403).
        assert response.status_code == 401

    def test_invalid_cookie_rejected_with_401(self, client):
        client.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "not-a-jwt")

        response = client.get("/auth/me")

        assert response.status_code == 401
