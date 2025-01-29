FROM ghcr.io/astral-sh/uv:0.5.25-python3.13-bookworm-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1

ENV UV_LINK_MODE=copy

COPY . /app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

ADD . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

EXPOSE 8080

ENV PATH="/app/.venv/bin:$PATH"

ENTRYPOINT []

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]