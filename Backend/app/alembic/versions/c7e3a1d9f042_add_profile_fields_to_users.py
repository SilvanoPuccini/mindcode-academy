"""Add profile fields to users table

Revision ID: c7e3a1d9f042
Revises: b4e9d1c72a58
Create Date: 2026-08-26
"""

from alembic import op
import sqlalchemy as sa

revision = 'c7e3a1d9f042'
down_revision = 'b4e9d1c72a58'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('role', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'role')
    op.drop_column('users', 'bio')
