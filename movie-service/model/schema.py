from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    title: str
    overview: str
    genre_text: str

class MovieQuery(BaseModel):
    title: str
    overview: str
    tagline: str
    original_language: str
    status: str
    runtime: float
    vote_average: float
    vote_count: float
    popularity: float
    top_k: int = 5