"""
Tests for certificates system.
Tests certificate creation on course completion, endpoints, and duplicate prevention.
"""
import uuid
import pytest
from unittest.mock import Mock, MagicMock, patch, PropertyMock
from datetime import datetime
from app.services.progress_service import ProgressService
from app.models.certificate import Certificate
from app.models.user_course_progress import UserCourseProgress
from app.models.user import User
from app.models.course import Course


@pytest.fixture
def mock_db_session():
    """Create mock database session."""
    return Mock()


@pytest.fixture
def progress_service(mock_db_session):
    """Create ProgressService with mocked database."""
    return ProgressService(db=mock_db_session)


@pytest.fixture
def sample_course():
    """Create sample course for testing."""
    return Course(
        id=1,
        name="Curso de Python",
        description="Aprende Python desde cero",
        thumbnail="https://example.com/thumb.jpg",
        slug="curso-de-python",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        deleted_at=None,
    )


@pytest.fixture
def sample_user():
    """Create sample user for testing."""
    return User(
        id=42,
        email="test@example.com",
        password_hash="hashed",
        name="Test User",
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def completed_progress():
    """Create completed progress record."""
    return UserCourseProgress(
        id=1,
        user_id=42,
        course_id=1,
        completed_lessons=10,
        total_lessons=10,
        progress_percentage=100.0,
        is_completed=1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


class TestCertificateCreationOnCompletion:
    """Tests for automatic certificate creation when course reaches 100%."""

    def test_certificate_created_on_completion(
        self, progress_service, mock_db_session, completed_progress, sample_course
    ):
        """Test that a certificate is created when progress reaches 100%."""
        # Arrange
        # The update_progress method calls:
        # 1. db.query(Course).filter(...).first() -> sample_course
        # 2. db.query(func.count(Lesson.id)).filter(...).scalar() -> 10 (int)
        # 3. db.query(UserCourseProgress).filter(...).first() -> completed_progress
        # 4. db.query(Certificate).filter(...).first() -> None (no existing cert)
        mock_db_session.query.return_value.filter.return_value.scalar.return_value = 10
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            sample_course,  # Course lookup
            completed_progress,  # Existing progress lookup
            None,  # No existing certificate
        ]

        # Act
        result = progress_service.update_progress(
            user_id=42, course_id=1, completed_lessons=10
        )

        # Assert
        assert result.progress_percentage == 100.0
        # Verify certificate was added
        mock_db_session.add.assert_called_once()
        added_cert = mock_db_session.add.call_args[0][0]
        assert isinstance(added_cert, Certificate)
        assert added_cert.user_id == 42
        assert added_cert.course_id == 1
        assert added_cert.status == "active"
        assert added_cert.verification_code is not None
        # Verify it's a valid UUID
        uuid.UUID(added_cert.verification_code)

    def test_no_certificate_below_100_percent(
        self, progress_service, mock_db_session, sample_course
    ):
        """Test that no certificate is created when progress is below 100%."""
        # Arrange
        partial_progress = UserCourseProgress(
            id=1,
            user_id=42,
            course_id=1,
            completed_lessons=5,
            total_lessons=10,
            progress_percentage=50.0,
            is_completed=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_db_session.query.return_value.filter.return_value.scalar.return_value = 10
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            sample_course,
            partial_progress,
        ]

        # Act
        progress_service.update_progress(user_id=42, course_id=1, completed_lessons=5)

        # Assert
        mock_db_session.add.assert_not_called()

    def test_duplicate_certificate_not_created(
        self, progress_service, mock_db_session, completed_progress, sample_course
    ):
        """Test that a duplicate certificate is not created if one already exists."""
        # Arrange
        existing_cert = Certificate(
            id=1,
            user_id=42,
            course_id=1,
            issued_at=datetime.utcnow(),
            verification_code=str(uuid.uuid4()),
            status="active",
        )
        mock_db_session.query.return_value.filter.return_value.scalar.return_value = 10
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            sample_course,
            completed_progress,
            existing_cert,  # Certificate already exists
        ]

        # Act
        progress_service.update_progress(user_id=42, course_id=1, completed_lessons=10)

        # Assert
        mock_db_session.add.assert_not_called()


class TestGetMyCertificatesEndpoint:
    """Tests for GET /certificates/me endpoint."""

    def test_get_my_certificates(self):
        """Test that the endpoint returns user's certificates with course name."""
        from fastapi.testclient import TestClient
        from app.main import app
        from app.core.dependencies import get_current_user
        from app.db.base import get_db

        mock_user = User(
            id=42,
            email="test@example.com",
            name="Test User",
            is_active=True,
            is_verified=True,
        )

        mock_course = Course(
            id=1,
            name="Curso de Python",
            description="Test",
            thumbnail="https://example.com/thumb.jpg",
            slug="curso-de-python",
        )

        mock_cert = Certificate(
            id=1,
            user_id=42,
            course_id=1,
            issued_at=datetime.utcnow(),
            verification_code=str(uuid.uuid4()),
            status="active",
        )

        mock_db = Mock()

        # Mock the certificate query chain: query.filter(order_by).all()
        cert_query = Mock()
        cert_query.filter.return_value.order_by.return_value.all.return_value = [mock_cert]

        # Mock the course query: query.filter.first()
        course_query = Mock()
        course_query.filter.return_value.first.return_value = mock_course

        def mock_query(model):
            if model == Certificate:
                return cert_query
            elif model == Course:
                return course_query
            return Mock()

        mock_db.query.side_effect = mock_query

        def override_get_db():
            yield mock_db

        def override_get_current_user():
            return mock_user

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_user] = override_get_current_user

        client = TestClient(app)
        response = client.get("/certificates/me")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["course_name"] == "Curso de Python"
        assert data[0]["user_id"] == 42

        app.dependency_overrides.clear()


class TestVerifyCertificateEndpoint:
    """Tests for GET /certificates/verify/{code} endpoint."""

    def test_verify_certificate_found(self):
        """Test verifying an existing certificate by code."""
        from fastapi.testclient import TestClient
        from app.main import app
        from app.db.base import get_db

        code = str(uuid.uuid4())

        mock_user = User(
            id=42,
            name="Test User",
            email="test@example.com",
        )
        mock_course = Course(
            id=1,
            name="Curso de Python",
            description="Test",
            thumbnail="https://example.com/thumb.jpg",
            slug="curso-de-python",
        )
        mock_cert = Certificate(
            id=1,
            user_id=42,
            course_id=1,
            issued_at=datetime.utcnow(),
            verification_code=code,
            status="active",
        )

        mock_db = Mock()

        # Mock the three sequential query calls in verify_certificate:
        # 1. Certificate lookup by verification_code
        # 2. Course lookup by id
        # 3. User lookup by id
        cert_query = Mock()
        cert_query.filter.return_value.first.return_value = mock_cert

        course_query = Mock()
        course_query.filter.return_value.first.return_value = mock_course

        user_query = Mock()
        user_query.filter.return_value.first.return_value = mock_user

        def mock_query(model):
            if model == Certificate:
                return cert_query
            elif model == Course:
                return course_query
            elif model == User:
                return user_query
            return Mock()

        mock_db.query.side_effect = mock_query

        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        client = TestClient(app)
        response = client.get(f"/certificates/verify/{code}")

        assert response.status_code == 200
        data = response.json()
        assert data["user_name"] == "Test User"
        assert data["course_name"] == "Curso de Python"
        assert data["verification_code"] == code
        assert data["status"] == "active"

        app.dependency_overrides.clear()

    def test_verify_certificate_not_found(self):
        """Test verifying a non-existent certificate returns 404."""
        from fastapi.testclient import TestClient
        from app.main import app
        from app.db.base import get_db

        mock_db = Mock()

        cert_query = Mock()
        cert_query.filter.return_value.first.return_value = None

        def mock_query(model):
            if model == Certificate:
                return cert_query
            return Mock()

        mock_db.query.side_effect = mock_query

        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        client = TestClient(app)
        response = client.get(f"/certificates/verify/{uuid.uuid4()}")

        assert response.status_code == 404
        assert response.json()["detail"] == "Certificate not found"

        app.dependency_overrides.clear()
