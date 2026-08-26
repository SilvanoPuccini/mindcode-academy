#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/app && uv run alembic -c alembic.ini upgrade head

# Idempotent content updates (safe to re-run every deploy — they only
# UPDATE existing rows, never create/duplicate courses or lessons).
# Never add app/db/seed.py here: it INSERTs the 15 courses and is only
# meant to populate an empty database once.
echo "Applying curated video content..."
cd /app && uv run python -m app.db.update_all_videos || echo "WARNING: update_all_videos failed, continuing startup"

echo "Applying instructor roster..."
cd /app && uv run python -m app.db.update_teachers || echo "WARNING: update_teachers failed, continuing startup"

echo "Starting server..."
cd /app && exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
