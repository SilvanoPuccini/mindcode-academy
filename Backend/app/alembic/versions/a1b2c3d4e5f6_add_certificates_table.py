"""Add certificates table

Revision ID: a1b2c3d4e5f6
Revises: 8778af5b71e3
Create Date: 2026-08-26 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '8778af5b71e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the certificates table."""
    op.create_table(
        'certificates',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('issued_at', sa.DateTime(), nullable=False),
        sa.Column('verification_code', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('verification_code', name='uq_certificates_verification_code'),
    )
    op.create_index(op.f('ix_certificates_id'), 'certificates', ['id'], unique=False)
    op.create_index(op.f('ix_certificates_user_id'), 'certificates', ['user_id'], unique=False)
    op.create_index(op.f('ix_certificates_course_id'), 'certificates', ['course_id'], unique=False)
    op.create_index(op.f('ix_certificates_verification_code'), 'certificates', ['verification_code'], unique=True)
    op.create_unique_constraint(
        'uq_certificates_user_course',
        'certificates',
        ['user_id', 'course_id'],
    )


def downgrade() -> None:
    """Drop the certificates table."""
    op.drop_constraint('uq_certificates_user_course', 'certificates', type_='unique')
    op.drop_index(op.f('ix_certificates_verification_code'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_course_id'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_user_id'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_id'), table_name='certificates')
    op.drop_table('certificates')
