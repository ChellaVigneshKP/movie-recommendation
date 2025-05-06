import json
import logging
import os
import urllib.parse
from datetime import datetime, timezone
from math import ceil
from random import shuffle
from typing import List

import httpx
import hvac
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordRequestForm
from google.auth import exceptions as google_exceptions
from google.cloud import bigquery
from hvac.exceptions import VaultError
from jose import jwt, JWTError
from redis.asyncio import Redis
from redis.exceptions import ConnectionError
from starlette.status import HTTP_401_UNAUTHORIZED

from auth import authenticate_user, create_access_token
from model import RecommendationResponse, MovieQuery
from recommender import build_tfidf_matrix, recommend_similar_movies
from recommender import get_top_100_recommendations, get_predicted_rating, MovieRecommender, MovieRecommenderNCF
from util import parse_genre_ids, parse_json_fields

# Load environment variables
load_dotenv()

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(module)s:%(lineno)d] - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log")
    ]
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Vault credentials
VAULT_URL = os.getenv("VAULT_URL")
VAULT_ROLE_ID = os.getenv("VAULT_ROLE_ID")
VAULT_SECRET_ID = os.getenv("VAULT_SECRET_ID")

# Redis credentials
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
REDIS_USERNAME = os.getenv("REDIS_USERNAME")

# Initialize Vault client
logger.info("Initializing Vault client with URL: %s", VAULT_URL)
try:
    vault_client = hvac.Client(url=VAULT_URL)
    logger.debug("Attempting Vault authentication with AppRole")
    auth_response = vault_client.auth.approle.login(
        role_id=VAULT_ROLE_ID,
        secret_id=VAULT_SECRET_ID
    )

    if not auth_response.get("auth"):
        logger.error("Vault authentication failed - no auth data in response")
        raise VaultError("Vault authentication failed!")

    logger.info("Vault authentication successful. Token expires in %s seconds",
                auth_response['auth']['lease_duration'])
except VaultError as ve:
    logger.critical("Vault authentication error: %s", str(ve), exc_info=True)
    raise
except Exception as e:
    logger.critical("Unexpected error during Vault initialization: %s", str(e), exc_info=True)
    raise

# Load BigQuery credentials from Vault
logger.info("Retrieving BigQuery secrets from Vault")
try:
    secret_response = vault_client.secrets.kv.v2.read_secret_version(path="bigquery")
    vault_data = secret_response["data"]["data"]

    # Extract configuration
    PROJECT_ID = vault_data["project_id"]
    DATASET_ID = vault_data["dataset_id"]
    SECRET_KEY = vault_data["secret_key"]
    ALGORITHM = vault_data["algorithm"]
    ACCESS_TOKEN_EXPIRE_MINUTES = int(vault_data["access_token_expire_minutes"])
    TABLE_ID = vault_data["table_metadata"]
    USER_TABLE = vault_data["user_table"]
    RATINGS_TABLE = vault_data["ratings_table"]
    DEEP_API = vault_data["deep_api"]
    ALS_TABLE = vault_data["als_table"]

    logger.info("Successfully loaded BigQuery configuration: Project=%s, Dataset=%s",
                PROJECT_ID, DATASET_ID)
    logger.debug("Security configuration: Algorithm=%s, TokenExpiry=%s minutes",
                 ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES)
except KeyError as ke:
    logger.error("Missing required configuration key in Vault: %s", str(ke))
    raise
except Exception as e:
    logger.error("Failed to retrieve BigQuery secrets from Vault: %s", str(e), exc_info=True)
    raise

# Initialize BigQuery client
logger.info("Starting BigQuery client initialization for project: %s", PROJECT_ID)

try:
    # Step 1: Initialize client
    logger.debug("Attempting to create BigQuery client...")
    bigquery_client = bigquery.Client(project=PROJECT_ID)
    logger.info("BigQuery client initialized successfully.")

    # Step 2: Load ratings
    logger.debug("Querying ratings from table: %s.%s.%s", PROJECT_ID, DATASET_ID, RATINGS_TABLE)
    ratings_query = f"""
        SELECT userId, movieId, rating
        FROM `{PROJECT_ID}.{DATASET_ID}.{RATINGS_TABLE}`
    """
    ratings_df = bigquery_client.query(ratings_query).to_dataframe()
    logger.info("Loaded %d ratings covering %d unique movies",
                len(ratings_df), ratings_df['movieId'].nunique())
    all_movie_ids = ratings_df['movieId'].unique().tolist()
    # Step 3: Load movies
    logger.debug("Querying movie metadata from table: %s.%s.movies", PROJECT_ID, DATASET_ID)
    movies_query = f"SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.movies`"
    movies_raw_df = bigquery_client.query(movies_query).to_dataframe()
    logger.info("Loaded metadata for %d movies", len(movies_raw_df))

except google_exceptions.DefaultCredentialsError as e:
    logger.critical("BigQuery authentication error: %s", str(e))
    raise HTTPException(status_code=500, detail=f"Error initializing BigQuery client: {str(e)}")

except Exception as e:
    logger.critical("Unexpected error while initializing BigQuery client or loading data: %s", str(e), exc_info=True)
    raise HTTPException(status_code=500, detail=f"Error initializing BigQuery client: {str(e)}")

# Precompute TF-IDF matrix
logger.info("Initializing TF-IDF matrix for content-based recommendations")
try:
    tfidf_matrix, tokenizer, remover, hashingTF, idf_model = build_tfidf_matrix(
        bigquery_client, PROJECT_ID, DATASET_ID, TABLE_ID
    )
    logger.info("TF-IDF matrix initialized successfully")
except Exception as e:
    logger.critical("Failed to initialize TF-IDF matrix: %s", str(e), exc_info=True)
    raise

# Initialize NLP recommender
logger.info("Initializing NLP-based recommender system")
try:
    nlp_recommender = MovieRecommender(
        "D:/M.Tech DE/Project/movies_nlp_df.pkl",
        "D:/M.Tech DE/Project/nlp_similarity_matrix.pkl"
    )
    logger.info("NLP recommender initialized successfully")
except Exception as e:
    logger.critical("Failed to initialize NLP recommender: %s", str(e), exc_info=True)
    raise

logger.info("Initializing NCF-based recommender system")
try:
    model_path = "D:/M.Tech DE/SEMESTER 1/Machine Learning with Big Data/Assignment 3/entire_model.pt"
    ncf_recommender = MovieRecommenderNCF(model_path, movies_raw_df, ratings_df)
    logger.info("NCF-based recommender initialized successfully")
except Exception as e:
    logger.critical("Failed to initialize NCF recommender: %s", str(e), exc_info=True)
    raise

# Initialize Redis client
try:
    redis_client = Redis(
        host=REDIS_HOST,
        port=19665,
        decode_responses=True,
        username=REDIS_USERNAME,
        password=REDIS_PASSWORD,
    )
    logger.info("Redis client initialized successfully")
except ConnectionError as e:
    logger.critical("Redis connection error: %s", str(e), exc_info=True)
    raise HTTPException(status_code=500, detail=f"Error initializing Redis client: {str(e)}")
# Initialize FastAPI app
app = FastAPI(title="Movie Recommendation API",
              description="API for personalized movie recommendations",
              version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication endpoints
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return JWT token"""
    logger.info("Login attempt for user: %s", form_data.username)

    user = authenticate_user(
        form_data.username,
        form_data.password,
        bigquery_client,
        f"{PROJECT_ID}.{DATASET_ID}.{USER_TABLE}"
    )

    if not user:
        logger.warning("Failed login attempt for user: %s", form_data.username)
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    logger.info("User authenticated successfully: %s", user["email"])

    token = create_access_token(
        {"sub": user["email"], "user_id": user["user_id"]},
        ACCESS_TOKEN_EXPIRE_MINUTES,
        SECRET_KEY,
        ALGORITHM
    )

    logger.debug("JWT token generated for user_id: %s", user["user_id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user["user_id"]
    }


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate JWT token and return user_id"""
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        logger.debug("Validating JWT token")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")

        if user_id is None:
            logger.warning("Invalid token - missing user_id")
            raise credentials_exception

        logger.debug("Token validated successfully for user_id: %s", user_id)
        return user_id
    except JWTError as je:
        logger.warning("JWT validation failed: %s", str(je))
        raise credentials_exception


# Movie endpoints
@app.get("/movies/{movie_id}")
def get_movie(movie_id: int):
    """Fetch movie details by movieId from BigQuery"""
    logger.info("Fetching movie details for movie_id: %s", movie_id)

    query = f"SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` WHERE movieId = {movie_id}"

    try:
        logger.debug("Executing BigQuery: %s", query)
        query_job = bigquery_client.query(query)
        rows = [dict(row) for row in query_job.result()]

        if not rows:
            logger.warning("Movie not found with ID: %s", movie_id)
            raise HTTPException(status_code=404, detail="Movie not found")

        logger.info("Successfully retrieved movie details for ID: %s", movie_id)
        return {"data": rows}

    except Exception as e:
        logger.error("Error querying movie by ID %s: %s", movie_id, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error querying BigQuery: {str(e)}")


@app.get("/search/{title}")
async def get_recommendations_tfidf(title: str, top_n: int = 10, user_id: int = Depends(get_current_user)):
    """Get content-based recommendations for a movie title"""
    logger.info("Getting content-based recommendations for title: '%s'", title)

    try:
        search_data = {
            "user_id": user_id,
            "search_keyword": title,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        encoded_title = urllib.parse.quote(title)
        redis_key = f"search:{user_id}:{encoded_title}"
        await redis_client.setex(redis_key, 172800, json.dumps(search_data))
        logger.info("Search results saved to Redis key: %s", redis_key)
        results = recommend_similar_movies(
            tfidf_matrix,
            tokenizer,
            remover,
            hashingTF,
            idf_model,
            title,
            top_n
        )

        if not results:
            logger.info("No recommendations found for title: '%s'", title)
            return {"type": "Success", "data": []}

        logger.debug("Found %d preliminary recommendations for '%s'", len(results), title)

        ordered_movie_ids = [int(row["movieId"]) for row in results]
        movie_id_str = ", ".join(map(str, ordered_movie_ids))

        metadata_query = f"""
            SELECT id, title, overview, poster_path, backdrop_path, genres, movieId
            FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
            WHERE movieId IN ({movie_id_str})
        """

        logger.debug("Executing metadata query: %s", metadata_query)
        metadata_job = bigquery_client.query(metadata_query)
        metadata_dict = {row["movieId"]: dict(row) for row in metadata_job.result()}

        # Preserve recommendation order and process genres
        ordered_results = []
        for movie_id in ordered_movie_ids:
            if movie_id in metadata_dict:
                movie_data = metadata_dict[movie_id]
                genre_ids = parse_genre_ids(movie_data.pop("genres", []))
                movie_data["genre_ids"] = genre_ids
                ordered_results.append(movie_data)

        logger.info("Returning %d recommendations for title: '%s'", len(ordered_results), title)
        return {
            "type": "Success",
            "data": ordered_results
        }

    except Exception as e:
        logger.error("Recommendation failed for title '%s': %s", title, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/als")
def get_recommendations_als(
        user_id: int = Depends(get_current_user),
        page: int = Query(1, ge=1),
        per_page: int = 20
):
    """Get ALS-based recommendations for authenticated user with pagination"""
    logger.info("Fetching ALS recommendations for user_id: %s, page: %s", user_id, page)

    offset = (page - 1) * per_page

    # Count total recommendations
    count_query = f"""
    SELECT COUNT(*) as total
    FROM `{PROJECT_ID}.{DATASET_ID}.{ALS_TABLE}`
    WHERE userId = {user_id}
    """

    try:
        logger.debug("Executing count query: %s", count_query)
        count_job = bigquery_client.query(count_query)
        total_results = list(count_job.result())[0]["total"]
        total_pages = ceil(total_results / per_page)

        logger.debug("Found %d total recommendations (%d pages)", total_results, total_pages)
    except Exception as e:
        logger.error("Failed to fetch total recommendation count: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Error fetching total count")

    # Fetch paginated results
    query = f"""
    WITH recs AS (
        SELECT movieId, predicted_rating
        FROM `{PROJECT_ID}.{DATASET_ID}.{ALS_TABLE}`
        WHERE userId = {user_id}
    ),
    ratings AS (
        SELECT movieId,
        MAX(IF(userId = {user_id}, rating, NULL)) AS rating,
        COUNT(*) AS vote_count,
        AVG(rating) AS vote_average
        FROM `{PROJECT_ID}.{DATASET_ID}.{RATINGS_TABLE}`
        GROUP BY movieId
    ),
    combined AS (
        SELECT
            recs.movieId,
            recs.predicted_rating,
            ratings.rating,
            ratings.vote_count,
            ratings.vote_average
        FROM recs
        LEFT JOIN ratings
        ON recs.movieId = ratings.movieId
    )
    SELECT
        m.adult,
        m.original_language,
        m.id,
        m.title,
        m.original_title,
        c.predicted_rating,
        m.video,
        c.rating,
        m.overview,
        m.poster_path,
        m.backdrop_path,
        m.genres,
        c.vote_average,
        c.vote_count
    FROM combined c
    JOIN `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` m
    ON c.movieId = m.movieId
    ORDER BY c.predicted_rating DESC
    LIMIT {per_page} OFFSET {offset}
    """

    try:
        logger.debug("Executing recommendation query: %s", query)
        query_job = bigquery_client.query(query)
        results = [dict(row) for row in query_job.result()]

        # Process results
        for movie in results:
            raw_rating = movie.get("predicted_rating", 0)
            movie["predicted_rating"] = max(0, min(5, round(raw_rating, 2)))
            genre_ids = parse_genre_ids(movie.pop("genres", []))
            movie["genre_ids"] = genre_ids

        logger.info("Returning %d ALS recommendations for user_id: %s", len(results), user_id)
        return {
            "page": page,
            "results": results,
            "total_pages": total_pages,
            "total_results": total_results
        }
    except Exception as e:
        logger.error("Failed to fetch recommendations: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Error fetching recommendations")


@app.get("/recommendations/svd")
def recommend_movies_svd(
        user_id: int = Depends(get_current_user),
        page: int = Query(1, ge=1),
        per_page: int = 20
):
    """Get SVD-based recommendations for authenticated user with pagination"""
    logger.info("Fetching SVD recommendations for user_id: %s, page: %s", user_id, page)

    try:
        # Get top recommendations
        logger.debug("Getting top 100 SVD predictions for user_id: %s", user_id)
        all_recommendations = get_top_100_recommendations(user_id, all_movie_ids)
        total_results = len(all_recommendations)
        total_pages = ceil(total_results / per_page)
        offset = (page - 1) * per_page
        paginated_recs = all_recommendations[offset:offset + per_page]

        logger.debug("Processing page %d/%d with %d items", page, total_pages, len(paginated_recs))

        # Get movie IDs for metadata query
        movie_ids = [str(movie["movieId"]) for movie in paginated_recs]
        movie_ids_str = ",".join(movie_ids)

        # Query metadata
        query = f"""
        SELECT 
            m.movieId,
            m.id,
            m.title,
            m.original_title,
            m.overview,
            m.poster_path,
            m.backdrop_path,
            m.genres,
            m.adult,
            m.video,
            m.original_language,
            COUNT(r.rating) AS vote_count,
            AVG(r.rating) AS vote_average
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` m
        LEFT JOIN `{PROJECT_ID}.{DATASET_ID}.{RATINGS_TABLE}` r
        ON m.movieId = r.movieId
        WHERE m.movieId IN ({movie_ids_str})
        GROUP BY 
            m.movieId, m.id, m.title, m.original_title, m.overview,
            m.poster_path, m.backdrop_path, m.genres, m.adult,
            m.video, m.original_language
        """

        try:
            logger.debug("Executing metadata query for %d movies", len(movie_ids))
            query_job = bigquery_client.query(query)
            metadata_results = {row["movieId"]: dict(row) for row in query_job.result()}
        except Exception as e:
            logger.error("Failed to fetch metadata from BigQuery: %s", str(e), exc_info=True)
            raise HTTPException(status_code=500, detail="Error fetching movie metadata")

        # Merge results
        results = []
        for rec in paginated_recs:
            movie_id = rec["movieId"]
            predicted_rating = round(rec.get("predicted_rating", 0), 2)
            metadata = metadata_results.get(movie_id, {})

            genre_ids = parse_genre_ids(metadata.pop("genres", [])) if "genres" in metadata else []

            results.append({
                "predicted_rating": predicted_rating,
                "rating": rec.get("rating", None),
                "vote_average": metadata.get("vote_average"),
                "vote_count": metadata.get("vote_count"),
                "genre_ids": genre_ids,
                **metadata
            })

        logger.info("Returning %d SVD recommendations for user_id: %s", len(results), user_id)
        return {
            "page": page,
            "results": results,
            "total_pages": total_pages,
            "total_results": total_results
        }

    except Exception as e:
        logger.error("Error fetching SVD recommendations for user %s: %s", user_id, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Error fetching recommendations")


@app.get("/movie/svd/{id}")
async def recommend(id: int, user_id: int = Depends(get_current_user)):
    """Get SVD-based recommendation for a specific movie"""
    logger.info("Fetching SVD recommendation for movie_id: %s, user_id: %s", id, user_id)

    query = f"""
        SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        WHERE id = {id}
        LIMIT 1
    """

    try:
        logger.debug("Executing movie query: %s", query)
        results = list(bigquery_client.query(query).result())

        if not results:
            logger.warning("Movie not found with id: %s", id)
            raise HTTPException(status_code=404, detail=f"No movie found with id = {id}")

        row = results[0]
        movie_data = parse_json_fields(row)

        if "movieId" not in movie_data:
            logger.error("movieId missing in BigQuery row for id: %s", id)
            raise HTTPException(status_code=500, detail="movieId missing in BigQuery row")

        # Get predicted rating
        movie_id = int(movie_data["movieId"])
        predicted_rating = get_predicted_rating(user_id, movie_id)
        movie_data["predicted_rating"] = predicted_rating

        # Get rating stats
        rating_query = f"""
            SELECT
                AVG(rating) AS vote_average,
                COUNT(*) AS vote_count,
                MAX(IF(userId = {user_id}, rating, NULL)) AS rating
            FROM `{PROJECT_ID}.{DATASET_ID}.{RATINGS_TABLE}`
            WHERE movieId = {movie_id}
        """

        logger.debug("Executing rating query: %s", rating_query)
        rating_result = list(bigquery_client.query(rating_query).result())[0]

        movie_data["vote_average"] = round(rating_result.vote_average,
                                           2) if rating_result.vote_average is not None else None
        movie_data["vote_count"] = int(rating_result.vote_count) if rating_result.vote_count is not None else 0
        movie_data["rating"] = float(rating_result.rating) if rating_result.rating is not None else None

        logger.info("Successfully retrieved movie details for id: %s", id)
        return movie_data

    except Exception as e:
        logger.error("Error fetching movie details for id %s: %s", id, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching movie details: {str(e)}")


@app.get("/recommend/nlp/{title}", response_model=List[RecommendationResponse])
def get_recommendations(title: str, top_k: int = 5):
    """Get NLP-based recommendations for a movie title"""
    logger.info("Getting NLP recommendations for title: '%s'", title)

    try:
        results = nlp_recommender.recommend(title, top_k)

        if not results:
            logger.warning("No NLP recommendations found for title: '%s'", title)
            raise HTTPException(status_code=404, detail=f"No recommendations found for '{title}'")

        logger.info("Returning %d NLP recommendations for title: '%s'", len(results), title)
        return results
    except Exception as e:
        logger.error("NLP recommendation failed for title '%s': %s", title, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.get("/recommendations/nlp")
async def get_user_search_recommendations(
        user_id: int = Depends(get_current_user),
        page: int = Query(1, ge=1),
        per_page: int = 20
):
    """Get NLP-based recommendations based on user's search history from Redis"""
    logger.info(f"Fetching NLP recommendations for user_id: {user_id}, page: {page}")

    pattern = f"search:{user_id}:*"
    try:
        matching_keys = await redis_client.keys(pattern)
        if not matching_keys:
            logger.info(f"No search history found for user_id: {user_id}")
            return {"page": page, "results": [], "total_pages": 0, "total_results": 0}

        all_movie_ids = set()

        for key in matching_keys:
            try:
                search_data = json.loads(await redis_client.get(key))
                keyword = urllib.parse.unquote(search_data.get("search_keyword"))
                if keyword:
                    logger.debug(f"Processing keyword: {keyword}")
                    recs = nlp_recommender.recommend(keyword, top_k=10)
                    all_movie_ids.update([r["movieId"] for r in recs])
            except Exception as e:
                logger.warning(f"Error with Redis key {key}: {e}")
                continue

        movie_ids = list(all_movie_ids)
        shuffle(movie_ids)

        total_results = len(movie_ids)
        total_pages = ceil(total_results / per_page)
        offset = (page - 1) * per_page
        paginated_ids = movie_ids[offset:offset + per_page]

        if not paginated_ids:
            return {"page": page, "results": [], "total_pages": total_pages, "total_results": total_results}

        movie_ids_str = ",".join(map(str, paginated_ids))

        query = f"""
        SELECT 
            m.movieId,
            m.id,
            m.title,
            m.original_title,
            m.overview,
            m.poster_path,
            m.backdrop_path,
            m.genres,
            m.adult,
            m.video,
            m.original_language,
            COUNT(r.rating) AS vote_count,
            AVG(r.rating) AS vote_average
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` m
        LEFT JOIN `{PROJECT_ID}.{DATASET_ID}.{RATINGS_TABLE}` r
        ON m.movieId = r.movieId
        WHERE m.movieId IN ({movie_ids_str})
        GROUP BY 
            m.movieId, m.id, m.title, m.original_title, m.overview,
            m.poster_path, m.backdrop_path, m.genres, m.adult,
            m.video, m.original_language
        """

        query_job = bigquery_client.query(query)
        metadata_results = {row["movieId"]: dict(row) for row in query_job.result()}

        results = []
        for movie_id in paginated_ids:
            metadata = metadata_results.get(movie_id, {})
            genre_ids = parse_genre_ids(metadata.pop("genres", [])) if "genres" in metadata else []
            results.append({
                "predicted_rating": None,
                "rating": None,
                "vote_average": metadata.get("vote_average"),
                "vote_count": metadata.get("vote_count"),
                "genre_ids": genre_ids,
                **metadata
            })

        logger.info("Returning %d NLP recommendations for user_id: %s", len(results), user_id)
        return {
            "page": page,
            "results": results,
            "total_pages": total_pages,
            "total_results": total_results
        }

    except Exception as e:
        logger.error(f"Error fetching NLP recommendations for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error processing search-based recommendations")


@app.get("/recommendations/deepmatch")
async def proxy_deepmatch_recommend2(
        user_id: int = Depends(get_current_user),
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1),
):
    logger.info(f"[START] Deepmatch recommendation process | user_id={user_id}, page={page}, per_page={per_page}")

    logger.debug("Filtering top-rated movies for user from ratings DataFrame")
    user_ratings = ratings_df[ratings_df["userId"] == user_id]
    if user_ratings.empty:
        logger.warning(f"[NO_RATINGS] No ratings found for user_id={user_id} in ratings_df")
        raise HTTPException(status_code=404, detail="No ratings found for user")

    top_rated = user_ratings.sort_values(by="rating", ascending=False).head(10)
    movie_ids = top_rated["movieId"].tolist()
    logger.info(f"[TOP_RATED] Retrieved top {len(movie_ids)} rated movies for user_id={user_id}")

    logger.debug(f"[BQ_QUERY] Fetching metadata for top-rated movies: {movie_ids}")
    movie_query = f"""
    SELECT *
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
    WHERE movieId IN UNNEST(@movie_ids)
    """
    movie_job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ArrayQueryParameter("movie_ids", "INT64", movie_ids)]
    )
    movies_df = bigquery_client.query(movie_query, job_config=movie_job_config).to_dataframe()

    if movies_df.empty:
        logger.warning(f"[NO_METADATA] Metadata query returned no results for top-rated movies: {movie_ids}")
        raise HTTPException(status_code=404, detail="No metadata found for top-rated movies")

    logger.debug(f"[MERGE] Merging ratings with metadata for {len(movies_df)} movies")
    merged_df = pd.merge(top_rated, movies_df, on="movieId", how="inner")

    logger.info(f"[DEEPMATCH_REQUESTS] Sending Deepmatch requests for {len(merged_df)} movies")
    recommended_ids = set()

    async with httpx.AsyncClient() as client:
        for _, row in merged_df.iterrows():
            movie_title = row.get("title", "")
            try:
                movie_payload = MovieQuery(
                    title=movie_title,
                    overview=row.get("overview", ""),
                    tagline=row.get("tagline", ""),
                    original_language=row.get("original_language", "en"),
                    status=row.get("status", "Released"),
                    runtime=row.get("runtime", 90.0),
                    vote_average=row.get("vote_average", 0.0),
                    vote_count=row.get("vote_count", 0.0),
                    popularity=row.get("popularity", 0.0),
                    top_k=11
                )

                logger.debug(f"[DEEPMATCH_CALL] Requesting similar movies for: '{movie_title}'")
                response = await client.post(
                    DEEP_API,
                    json=movie_payload.model_dump()
                )
                response.raise_for_status()

                recs = response.json()["recommendations"]
                added = 0
                for rec in recs:
                    if rec["title"].strip().lower() != movie_title.strip().lower():
                        recommended_ids.add(rec["movieId"])
                        added += 1
                logger.info(f"[DEEPMATCH_SUCCESS] Received {len(recs)} recs, {added} new added for '{movie_title}'")

            except Exception as e:
                logger.error(f"[DEEPMATCH_FAIL] Deepmatch failed for '{movie_title}': {str(e)}")
                continue

    if not recommended_ids:
        logger.info(f"[NO_RECOMMENDATIONS] No recommendations returned from Deepmatch for user_id={user_id}")
        return {"page": page, "results": [], "total_pages": 0, "total_results": 0}

    movie_ids_list = list(recommended_ids)
    total_results = len(movie_ids_list)
    total_pages = ceil(total_results / per_page)
    offset = (page - 1) * per_page
    paginated_ids = movie_ids_list[offset:offset + per_page]
    if not paginated_ids:
        logger.warning(f"[PAGINATION] Page {page} exceeds available data. Total pages: {total_pages}")
        return {
            "page": page,
            "results": [],
            "total_pages": total_pages,
            "total_results": total_results
        }

    logger.info(f"[PAGINATION] Total={total_results}, Pages={total_pages}, Returning={len(paginated_ids)}")

    movie_ids_str = ",".join(map(str, paginated_ids))
    logger.debug(f"[BQ_QUERY] Fetching metadata for paginated recommended movie IDs: {movie_ids_str}")

    query = f"""
    SELECT
        m.movieId,
        m.id,
        m.title,
        m.original_title,
        m.overview,
        m.poster_path,
        m.backdrop_path,
        m.genres,
        m.adult,
        m.video,
        m.original_language,
        COUNT(r.rating) AS vote_count,
        AVG(r.rating) AS vote_average
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` m
    LEFT JOIN `{PROJECT_ID}.{DATASET_ID}.{RATINGS_TABLE}` r
    ON m.movieId = r.movieId
    WHERE m.movieId IN ({movie_ids_str})
    GROUP BY
        m.movieId, m.id, m.title, m.original_title, m.overview,
        m.poster_path, m.backdrop_path, m.genres, m.adult,
        m.video, m.original_language
    """
    query_job = bigquery_client.query(query)
    metadata_results = {row["movieId"]: dict(row) for row in query_job.result()}
    logger.debug(f"[BQ_RESULT] Retrieved metadata for {len(metadata_results)} recommended movies")

    results = []
    for movie_id in paginated_ids:
        metadata = metadata_results.get(movie_id, {})
        genre_ids = parse_genre_ids(metadata.pop("genres", [])) if "genres" in metadata else []
        results.append({
            "predicted_rating": None,
            "rating": None,
            "vote_average": metadata.get("vote_average"),
            "vote_count": metadata.get("vote_count"),
            "genre_ids": genre_ids,
            **metadata
        })

    logger.info(f"[COMPLETE] Returning {len(results)} recommendations for user_id={user_id}")
    return {
        "page": page,
        "results": results,
        "total_pages": total_pages,
        "total_results": total_results
    }


@app.get("/recommendations/ncf")
async def ncf_recommend(
        user_id: int = Depends(get_current_user),
        page: int = Query(1, ge=1),
        per_page: int = Query(10, ge=1)
):
    logger.info(f"[MODEL_RECOMMEND] Fetching recommendations for user_id={user_id}")
    try:
        recommendations = ncf_recommender.recommend_for_user(user_id=user_id, top_k=10)
    except Exception as e:
        logger.error(f"[MODEL_ERROR] Error fetching recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching recommendations")
    if not recommendations:
        logger.warning(f"[NO_RECS] No recommendations for user_id={user_id}")
        return {"page": page, "results": [], "total_pages": 0, "total_results": 0}
    movie_ids = [int(rec[0]) for rec in recommendations]
    ratings_dict = {int(rec[0]): float(rec[1]) for rec in recommendations}
    total_results = len(movie_ids)
    total_pages = ceil(total_results / per_page)
    offset = (page - 1) * per_page
    paginated_ids = movie_ids[offset:offset + per_page]

    if not paginated_ids:
        return {
            "page": page,
            "results": [],
            "total_pages": total_pages,
            "total_results": total_results
        }

    # Fetch metadata from BigQuery
    bq_client = bigquery.Client()
    movie_ids_str = ",".join(map(str, paginated_ids))

    query = f"""
        SELECT
            m.movieId,
            m.id,
            m.title,
            m.original_title,
            m.overview,
            m.poster_path,
            m.backdrop_path,
            m.genres,
            m.adult,
            m.video,
            m.original_language,
            COUNT(r.rating) AS vote_count,
            AVG(r.rating) AS vote_average
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` m
        LEFT JOIN `{PROJECT_ID}.{DATASET_ID}.{RATINGS_TABLE}` r
        ON m.movieId = r.movieId
        WHERE m.movieId IN ({movie_ids_str})
        GROUP BY
            m.movieId, m.id, m.title, m.original_title, m.overview,
            m.poster_path, m.backdrop_path, m.genres, m.adult,
            m.video, m.original_language
        """
    query_job = bq_client.query(query)
    metadata_results = {row["movieId"]: dict(row) for row in query_job.result()}

    results = []
    for movie_id in paginated_ids:
        metadata = metadata_results.get(movie_id, {})
        if not metadata:
            continue
        genre_ids = parse_genre_ids(metadata.pop("genres", [])) if "genres" in metadata else []
        results.append({
            "predicted_rating": round(ratings_dict.get(movie_id, 0), 2),
            "rating": None,
            "vote_average": metadata.get("vote_average"),
            "vote_count": metadata.get("vote_count"),
            "genre_ids": genre_ids,
            **metadata
        })

    return {
        "page": page,
        "results": results,
        "total_pages": total_pages,
        "total_results": total_results
    }
