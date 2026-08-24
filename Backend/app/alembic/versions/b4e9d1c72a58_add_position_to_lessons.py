"""add position to lessons for login gate ordering

Revision ID: b4e9d1c72a58
Revises: 8778af5b71e3
Create Date: 2026-08-24 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4e9d1c72a58'
down_revision: Union[str, None] = '8778af5b71e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the ordering column with a neutral default so existing rows pass NOT NULL.
    op.add_column('lessons', sa.Column('position', sa.Integer(), server_default='0', nullable=False))

    # Backfill: assign a stable 1-based order per course (ordered by id).
    # The first lesson of each course gets position = 1, which becomes the
    # free preview lesson enforced by the /classes/{class_id} login gate.
    op.execute(
        """
        UPDATE lessons
        SET position = r.rn
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY id) AS rn
            FROM lessons
        ) AS r
        WHERE lessons.id = r.id
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('lessons', 'position')
