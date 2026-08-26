"""Widen users.avatar_url to TEXT

The Pydantic schema (UserUpdateRequest.avatar_url) already accepts up to
10MB to hold base64 data URLs, but the actual column was left at
VARCHAR(512) by the migration that created it. Any real photo upload
exceeds 512 chars and fails at the DB layer with a
"value too long for type character varying(512)" error, so avatar
uploads have never actually persisted.

Revision ID: f2a7c9d1b384
Revises: a1b2c3d4e5f6
Create Date: 2026-08-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2a7c9d1b384'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'users',
        'avatar_url',
        existing_type=sa.String(length=512),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        'users',
        'avatar_url',
        existing_type=sa.Text(),
        type_=sa.String(length=512),
        existing_nullable=True,
    )
