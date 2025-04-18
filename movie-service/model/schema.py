from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    title: str
    overview: str
    genre_text: str