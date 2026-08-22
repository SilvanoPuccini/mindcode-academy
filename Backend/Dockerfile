# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install uv for dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files and source (setuptools' package discovery needs
# app/ to exist before "uv sync" builds/installs the local project)
COPY pyproject.toml ./
COPY ./app ./app
COPY ./specs ./specs

# Install dependencies including dev dependencies
ENV UV_PROJECT_ENVIRONMENT="/usr/local/"
RUN uv sync --extra dev

# Expose port 8000
EXPOSE 8000

# Command to run uvicorn with hot reload
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
