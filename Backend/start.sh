#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/app && uv run alembic -c alembic.ini upgrade head

echo "Starting server..."
cd /app && exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
