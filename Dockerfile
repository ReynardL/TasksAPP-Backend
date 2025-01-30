FROM ghcr.io/astral-sh/uv:0.5.25-python3.13-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y wget
RUN wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
RUN chmod +x cloud_sql_proxy

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

CMD /app/cloud_sql_proxy -instances=${CLOUD_SQL_CONNECTION_NAME}=tcp:5432 & uvicorn main:app --host 0.0.0.0 --port 8080