from fastapi import FastAPI
import os
from google.adk.cli.fast_api import get_fast_api_app


AGENT_DIR = os.path.dirname(os.path.abspath(__file__))


app: FastAPI = get_fast_api_app(
    agent_dir=AGENT_DIR,
    web=True,
    allow_origins=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello, World! I am running with FastAPI."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)