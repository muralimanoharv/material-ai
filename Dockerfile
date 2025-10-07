
# Use an official Python runtime as a parent image
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory in the container
WORKDIR /app

RUN apt-get update && apt-get install -y make
RUN apt-get update && apt-get install -y curl gnupg
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and npm
RUN apt-get install -y nodejs

COPY ui/ ui/

COPY Makefile .

RUN make build-ui

# Install dependencies
# Comment --no-dev --no-editable for local development debugging
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev --no-editable --verbose

# Copy the content of the local src directory to the working directory
# Comment the below line for local development hot reloading to work
COPY src/ src/

COPY config.ini .

# Make port 8000 available to the world outside this container
EXPOSE 8080

ENV PYTHONPATH="src"
ENV GENERAL_DEBUG=false
ENV CONFIG_PATH=config.ini
# ENV SSO_CLIENT_ID=
# ENV SSO_CLIENT_SECRET=
# ENV SSO_REDIRECT_URI=
# ENV SSO_SESSION_SECRET_KEY=
# ENV CONFIG_PATH=
# ENV GOOGLE_GENAI_USE_VERTEXAI=
# ENV GOOGLE_API_KEY=
# ENV ADK_SESSION_DB_URL=

CMD ["make", "preview"]
