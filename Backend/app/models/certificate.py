import uuid
from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel


class Certificate(BaseModel):
    """
    Certificate model for course completion certificates.

    Business Rules:
    - One certificate per user per course
    - verification_code is a UUID4, unique, used for public verification
    - status: 'active' or 'revoked'
    """
    __tablename__ = 'certificates'

    user_id = Column(
        Integer,
        ForeignKey('users.id'),
        nullable=False,
        index=True
    )
    course_id = Column(
        Integer,
        ForeignKey('courses.id'),
        nullable=False,
        index=True
    )
    issued_at = Column(DateTime, nullable=False)
    verification_code = Column(String(36), unique=True, nullable=False, index=True)
    status = Column(String(20), nullable=False, default='active')

    # Relationships
    user = relationship("User", back_populates="certificates")
    course = relationship("Course")

    def __repr__(self):
        return (
            f"<Certificate("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"course_id={self.course_id}, "
            f"verification_code='{self.verification_code}'"
            f")>"
        )

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "issued_at": self.issued_at.isoformat() if self.issued_at else None,
            "verification_code": self.verification_code,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
