"""
Certificate endpoints for viewing, downloading, and verifying certificates.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.core.dependencies import get_current_user
from app.models import User, Certificate, Course
from app.schemas.certificate import (
    CertificateWithCourseResponse,
    CertificateVerifyResponse,
)

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get("/me", response_model=List[CertificateWithCourseResponse])
def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all certificates for the authenticated user.
    Returns certificates with course name.

    Single LEFT JOIN instead of one Course lookup per certificate (N+1).
    """
    rows = (
        db.query(Certificate, Course.name)
        .outerjoin(Course, Course.id == Certificate.course_id)
        .filter(Certificate.user_id == current_user.id)
        .order_by(Certificate.issued_at.desc())
        .all()
    )

    return [
        CertificateWithCourseResponse(
            id=cert.id,
            user_id=cert.user_id,
            course_id=cert.course_id,
            course_name=course_name if course_name else "Unknown Course",
            issued_at=cert.issued_at,
            verification_code=cert.verification_code,
            status=cert.status,
        )
        for cert, course_name in rows
    ]


@router.get("/{cert_id}/download", response_class=HTMLResponse)
def download_certificate(
    cert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Download a certificate as a styled HTML page.
    Only the certificate owner can download it.
    """
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )

    if cert.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only download your own certificates",
        )

    course = db.query(Course).filter(Course.id == cert.course_id).first()
    course_name = course.name if course else "Unknown Course"
    user_name = current_user.name
    issued_date = cert.issued_at.strftime("%d de %B de %Y") if cert.issued_at else "N/A"

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado - {course_name}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Georgia', serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem; }}
        .certificate {{
            background: white;
            width: 800px;
            padding: 3rem;
            border: 3px solid #1a1a2e;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }}
        .header {{ margin-bottom: 2rem; }}
        .logo {{ font-size: 1.8rem; font-weight: bold; color: #1a1a2e; letter-spacing: 2px; text-transform: uppercase; }}
        .subtitle {{ color: #666; font-size: 0.9rem; margin-top: 0.3rem; }}
        .divider {{ width: 60px; height: 3px; background: #e94560; margin: 1.5rem auto; }}
        .title {{ font-size: 2rem; color: #1a1a2e; margin-bottom: 1rem; }}
        .recipient {{ font-size: 1.5rem; color: #333; font-style: italic; margin: 1rem 0; }}
        .course-name {{ font-size: 1.3rem; color: #e94560; font-weight: bold; margin: 1rem 0; }}
        .details {{ color: #666; font-size: 0.95rem; margin: 0.5rem 0; }}
        .verification {{ margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.8rem; color: #999; }}
        .verification code {{ background: #f0f0f0; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem; }}
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">MindCode Academy</div>
            <div class="subtitle">Donde el código y el aprendizaje se encuentran</div>
        </div>
        <div class="divider"></div>
        <h1 class="title">Certificado de Completación</h1>
        <p class="details">Se certifica que</p>
        <p class="recipient">{user_name}</p>
        <p class="details">ha completado exitosamente el curso</p>
        <p class="course-name">{course_name}</p>
        <p class="details">emitido el {issued_date}</p>
        <div class="verification">
            <p>Código de verificación: <code>{cert.verification_code}</code></p>
            <p>Verifica este certificado en /certificates/verify/{cert.verification_code}</p>
        </div>
    </div>
</body>
</html>"""

    return HTMLResponse(content=html)


@router.get("/verify/{code}", response_model=CertificateVerifyResponse)
def verify_certificate(
    code: str,
    db: Session = Depends(get_db),
):
    """
    Verify a certificate by its verification code.
    This endpoint is public — no authentication required.
    """
    cert = (
        db.query(Certificate)
        .filter(Certificate.verification_code == code)
        .first()
    )

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )

    course = db.query(Course).filter(Course.id == cert.course_id).first()
    user = db.query(User).filter(User.id == cert.user_id).first()

    return CertificateVerifyResponse(
        id=cert.id,
        user_name=user.name if user else "Unknown User",
        course_name=course.name if course else "Unknown Course",
        issued_at=cert.issued_at,
        verification_code=cert.verification_code,
        status=cert.status,
    )
