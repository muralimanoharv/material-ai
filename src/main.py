from fastapi import FastAPI
import os
from google.adk.cli.fast_api import get_fast_api_app
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .request import FeedbackRequest

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join("material-ai-frontend", "dist")

APP_ENV = os.environ.get("FASTAPI_ENV", "dev")

IS_DEV = APP_ENV == "dev"

app: FastAPI = get_fast_api_app(
    agent_dir=AGENT_DIR,
    web=False,
    allow_origins=['*'] if IS_DEV else []
)

@app.get("/")
def root():
    return FileResponse(path=os.path.join(STATIC_DIR, "index.html"), media_type='text/html')

@app.post("/feedback")
def feedback(feedback: FeedbackRequest):
    print(feedback)
    return "ok"

app.mount("/", StaticFiles(directory=STATIC_DIR), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)