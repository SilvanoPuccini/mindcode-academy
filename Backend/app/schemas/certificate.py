from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CertificateResponse(BaseModel):
    """Schema for certificate response."""
    id: int
    user_id: int
    course_id: int
    issued_at: Optional[datetime] = None
    verification_code: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CertificateWithCourseResponse(BaseModel):
    """Schema for certificate response including course name."""
    id: int
    user_id: int
    course_id: int
    course_name: str
    issued_at: Optional[datetime] = None
    verification_code: str
    status: str

    class Config:
        from_attributes = True


class CertificateVerifyResponse(BaseModel):
    """Schema for public certificate verification."""
    id: int
    user_name: str
    course_name: str
    issued_at: Optional[datetime] = None
    verification_code: str
    status: str
