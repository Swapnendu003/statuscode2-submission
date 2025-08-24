# syntax=docker/dockerfile:1
ARG PYTHON_VERSION=3.11.6
FROM python:${PYTHON_VERSION}-slim

# cache-busting ref you can pass per build (e.g., git SHA)
ARG APP_REF=dev
ENV APP_REF=${APP_REF}

# no buffered logs
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# entrypoint source (informational)
ARG PROGRAM_MAIN="agent.py"

# non-root user
ARG UID=10001
RUN adduser --disabled-password --gecos "" --home "/home/appuser" --shell "/sbin/nologin" --uid "${UID}" appuser

# build deps
RUN apt-get update && \
    apt-get install -y gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

USER appuser
RUN mkdir -p /home/appuser/.cache && chown -R appuser /home/appuser/.cache
WORKDIR /home/appuser

# ---- deps layer (cached until requirements.txt changes)
COPY requirements.txt .
RUN python -m pip install --user --no-cache-dir -r requirements.txt

# ---- app source (recaches when files change or APP_REF changes)
COPY . .
RUN echo "Building ref: ${APP_REF}"

# ❌ Do NOT run your agent at build time (needs secrets)
# RUN python "$PROGRAM_MAIN" download-files

# (Optional) safe, secret-free prefetch step if you add download_assets.py
COPY download_assets.py .
RUN python download_assets.py || true

# healthcheck port
EXPOSE 8081

# runtime: LiveKit injects env vars here; initialize clients inside your code at runtime
CMD ["python", "agent.py", "start"]
