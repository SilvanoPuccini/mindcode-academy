# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install uv for dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files and source
COPY pyproject.toml ./
COPY ./app ./app
COPY ./specs ./specs

# Install dependencies including dev dependencies
ENV UV_PROJECT_ENVIRONMENT="/usr/local/"
RUN uv sync --extra dev

# Make start script executable
COPY start.sh ./
RUN chmod +x start.sh

# Expose port 8000
EXPOSE 8000

# Run migrations then start server
CMD ["./start.sh"]
