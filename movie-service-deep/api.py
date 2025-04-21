import logging
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Dict, List
from deepmatch_recommender import MovieRecommender
import uvicorn

# Setup basic logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI()

logger.info("Initializing MovieRecommender...")

recommender = MovieRecommender(
    model_dir="/mnt/d/M.Tech DE/Project/DeepMatchModel",
    batch_size=128,
    use_cache=True
)

logger.info("MovieRecommender initialized successfully.")

# Define input schema
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

@app.post("/api/deep")
def recommend_movies(query: MovieQuery):
    logger.info("Received recommendation request.")

    query_dict = query.dict()
    top_k = query_dict.pop("top_k", 5)

    logger.info(f"Input to recommender: {query_dict}, top_k={top_k}")
    results = recommender.recommend_movies(query_dict, top_k=top_k)

    logger.info(f"Recommender returned {len(results)} results.")

    response = {
        "recommendations": [
            {"movieId": movie_id, "title": title, "score": round(score, 2)}
            for title, movie_id, score in results
        ]
    }

    logger.info(f"Response: {response}")
    return response
