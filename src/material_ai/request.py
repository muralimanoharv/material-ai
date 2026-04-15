from pydantic import BaseModel


class FeedbackRequest(BaseModel):
    """Pydantic model for the feedback request body."""

    feedback_category: str
    feedback_text: str
    id: str


class Microfrontend(BaseModel):
    """Pydantic model for the microfrontend configuration"""

    agents_page: str
