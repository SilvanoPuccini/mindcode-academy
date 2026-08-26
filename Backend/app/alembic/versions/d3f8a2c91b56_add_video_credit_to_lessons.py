"""add video_credit to lessons for YouTube channel attribution

Revision ID: d3f8a2c91b56
Revises: f2a7c9d1b384
Create Date: 2026-08-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3f8a2c91b56'
down_revision: Union[str, None] = 'f2a7c9d1b384'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Nullable: attribution is only known for lessons whose video comes from
    # a curated third-party YouTube channel (see app/db/update_all_videos.py).
    op.add_column('lessons', sa.Column('video_credit', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('lessons', 'video_credit')
