from pydantic import BaseModel
from typing import Optional


class FeedbackRequest(BaseModel):
    """Pydantic model for the feedback request body."""

    feedback_category: str
    feedback_text: str
    id: str


class UIBug(BaseModel):
    """Pydantic model for the feedback request body."""

    app_name: str
    session_id: str
    stack_trace: Optional[str] | None = None
    code: str
    id: str


class Microfrontend(BaseModel):
    """Pydantic model for the microfrontend configuration"""

    agents_page: str
