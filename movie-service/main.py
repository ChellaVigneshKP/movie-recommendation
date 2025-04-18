import logging
import os
from math import ceil

import hvac
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from google.auth import exceptions as google_exceptions
from google.cloud import bigquery
from hvac.exceptions import VaultError
from fastapi.security import OAuth2PasswordBearer
from jose import jwt,JWTError

from auth import authenticate_user, create_access_token
from starlette.status import HTTP_401_UNAUTHORIZED

from recommender import build_tfidf_matrix, recommend_similar_movies
from recommender import get_top_100_recommendations, get_predicted_rating
from util import parse_genre_ids, parse_json_fields
import multipart
# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(message)s",
)

logger = logging.getLogger(__name__)

# Vault credentials
VAULT_URL = os.getenv("VAULT_URL")
VAULT_ROLE_ID = os.getenv("VAULT_ROLE_ID")
VAULT_SECRET_ID = os.getenv("VAULT_SECRET_ID")

# Initialize Vault client
try:
    logger.info("Authenticating with Vault...")
    vault_client = hvac.Client(url=VAULT_URL)
    auth_response = vault_client.auth.approle.login(
        role_id=VAULT_ROLE_ID, secret_id=VAULT_SECRET_ID
    )
    if not auth_response.get("auth"):
        raise VaultError("Vault authentication failed!")
    logger.info("Vault authentication successful.")
except Exception as e:
    logger.error("Vault error: %s", str(e))
    raise

# Load BigQuery credentials from Vault
try:
    logger.info("Loading BigQuery secrets from Vault...")
    vault_data = vault_client.secrets.kv.v2.read_secret_version(path="bigquery")["data"]["data"]
    PROJECT_ID = vault_data["project_id"]
    DATASET_ID = vault_data["dataset_id"]
    SECRET_KEY = vault_data["secret_key"]
    ALGORITHM = vault_data["algorithm"]
    ACCESS_TOKEN_EXPIRE_MINUTES = vault_data["access_token_expire_minutes"]
    TABLE_ID = vault_data["table_metadata"]
    USER_TABLE = vault_data["user_table"]
    RATINGS_TABLE = vault_data["ratings_table"]
    logger.info("BigQuery secrets loaded successfully.")
except Exception as e:
    logger.error("Failed to read BigQuery secrets from Vault: %s", str(e))
    raise

# Initialize BigQuery client
try:
    bigquery_client = bigquery.Client(project=PROJECT_ID)
    logger.info("BigQuery client initialized.")
    query = """
    SELECT userId, movieId, rating
    FROM `virtualization-and-cloud.movies.ratings`
    """
    ratings_df = bigquery_client.query(query).to_dataframe()
except google_exceptions.DefaultCredentialsError as e:
    logger.error("BigQuery credential error: %s", str(e))
    raise HTTPException(status_code=500, detail=f"Error initializing BigQuery client: {str(e)}")

# Precompute TF-IDF matrix
try:
    logger.info("Building TF-IDF matrix...")
    tfidf_matrix, tokenizer, remover, hashingTF, idf_model = build_tfidf_matrix(
        bigquery_client, PROJECT_ID, DATASET_ID, TABLE_ID
    )
    logger.info("TF-IDF matrix built successfully.")
except Exception as e:
    logger.error("Failed to build TF-IDF matrix: %s", str(e))
    raise

all_movie_ids = ratings_df['movieId'].unique().tolist()

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password, bigquery_client, f"{PROJECT_ID}.{DATASET_ID}.{USER_TABLE}")
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token = create_access_token(
        {"sub": user["email"], "user_id": user["user_id"]},
        ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY,ALGORITHM
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user["user_id"]
    }

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception

@app.get("/movies/{movie_id}")
def get_movie(movie_id: int):
    """Fetch movie details by movieId from BigQuery"""
    query = f"SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` WHERE movieId = {movie_id}"

    try:
        query_job = bigquery_client.query(query)
        rows = [dict(row) for row in query_job.result()]
    except Exception as e:
        logger.error("Error querying movie by ID %s: %s", movie_id, str(e))
        raise HTTPException(status_code=500, detail=f"Error querying BigQuery: {str(e)}")

    if not rows:
        logger.warning("Movie with ID %s not found", movie_id)
        raise HTTPException(status_code=404, detail="Movie not found")

    return {"data": rows}


@app.get("/recommend/{title}")
def get_recommendations(title: str, top_n: int = 10):
    logger.info("Getting recommendations for: %s", title)
    try:
        results = recommend_similar_movies(tfidf_matrix, tokenizer, remover, hashingTF, idf_model, title, top_n)
        logger.info("Recommendations found for: '%s': %s", title, results)
    except Exception as e:
        logger.error("Recommendation failed for title '%s': %s", title, str(e))
        raise HTTPException(status_code=500, detail=str(e))

    if not results:
        logger.info("No recommendations found for: %s", title)
        return {"type": "Success", "data": []}

    ordered_movie_ids = [int(row["movieId"]) for row in results]
    movie_id_str = ", ".join(map(str, ordered_movie_ids))

    metadata_query = f"""
        SELECT id, title, overview, poster_path, backdrop_path, genres, movieId
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        WHERE movieId IN ({movie_id_str})
    """

    logger.info("Final Query: %s", metadata_query)

    try:
        metadata_job = bigquery_client.query(metadata_query)
        metadata_dict = {row["movieId"]: dict(row) for row in metadata_job.result()}
    except Exception as e:
        logger.error("Failed to query movie metadata: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to query movie metadata: {str(e)}")

    # Preserve recommendation order
    ordered_results = [metadata_dict[movie_id] for movie_id in ordered_movie_ids if movie_id in metadata_dict]
    for movie in ordered_results:
        genre_ids = parse_genre_ids(movie.pop("genres", []))
        movie["genre_ids"] = genre_ids

    logger.info("Returning %d recommendations for title: %s", len(ordered_results), title)
    return {
        "type": "Success",
        "data": ordered_results
    }


@app.get("/recommendations/als")
def get_user_recommendations(user_id: int = Depends(get_current_user), page: int = Query(1, ge=1), per_page: int = 20):
    offset = (page - 1) * per_page
    logger.info(f"Fetching actual and predicted ratings for user {user_id}, page {page}")

    # Query to count total recommendations for this user
    count_query = f"""
    SELECT COUNT(*) as total
    FROM `{PROJECT_ID}.{DATASET_ID}.recommendationsALS`
    WHERE userId = {user_id}
    """

    try:
        count_job = bigquery_client.query(count_query)
        total_results = list(count_job.result())[0]["total"]
        total_pages = ceil(total_results / per_page)
    except Exception as e:
        logger.error("Failed to fetch total recommendation count: %s", str(e))
        raise HTTPException(status_code=500, detail="Error fetching total count")

    # Query to fetch paginated results
    query = f"""
    WITH recs AS (
        SELECT movieId, predicted_rating
        FROM `{PROJECT_ID}.{DATASET_ID}.recommendationsALS`
        WHERE userId = {user_id}
    ),
    ratings AS (
        SELECT movieId,
        MAX(IF(userId = {user_id}, rating, NULL)) AS rating,
        COUNT(*) AS vote_count,
        AVG(rating) AS vote_average
        FROM `{PROJECT_ID}.{DATASET_ID}.ratings`
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
        query_job = bigquery_client.query(query)
        results = [dict(row) for row in query_job.result()]
    except Exception as e:
        logger.error("Failed to fetch recommendations: %s", str(e))
        raise HTTPException(status_code=500, detail="Error fetching recommendations")

    # Parse genres
    for movie in results:
        raw_rating = movie.get("predicted_rating", 0)
        movie["predicted_rating"] = max(0, min(5, round(raw_rating, 2)))
        genre_ids = parse_genre_ids(movie.pop("genres", []))
        movie["genre_ids"] = genre_ids

    return {
        "page": page,
        "results": results,
        "total_pages": total_pages,
        "total_results": total_results
    }


@app.get("/recommendations/svd")
def recommend_movies(user_id: int = Depends(get_current_user), page: int = Query(1, ge=1), per_page: int = 20):
    try:
        # Step 1: Get top 100 SVD predictions
        all_recommendations = get_top_100_recommendations(user_id, all_movie_ids)  # List[dict]
        total_results = len(all_recommendations)
        total_pages = ceil(total_results / per_page)
        offset = (page - 1) * per_page
        paginated_recs = all_recommendations[offset:offset + per_page]

        # Step 2: Extract movieIds from the recommendations
        movie_ids = [str(movie["movieId"]) for movie in paginated_recs]
        movie_ids_str = ",".join(movie_ids)

        # Step 3: Query BigQuery for metadata for these movies
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
        LEFT JOIN `{PROJECT_ID}.{DATASET_ID}.ratings` r
        ON m.movieId = r.movieId
        WHERE m.movieId IN ({movie_ids_str})
        GROUP BY 
            m.movieId, m.id, m.title, m.original_title, m.overview,
            m.poster_path, m.backdrop_path, m.genres, m.adult,
            m.video, m.original_language
        """

        try:
            query_job = bigquery_client.query(query)
            metadata_results = {row["movieId"]: dict(row) for row in query_job.result()}
        except Exception as e:
            logger.error("Failed to fetch metadata from BigQuery: %s", str(e))
            raise HTTPException(status_code=500, detail="Error fetching movie metadata")

        # Step 4: Merge predictions with metadata
        results = []
        for idx, rec in enumerate(paginated_recs):
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

        return {
            "page": page,
            "results": results,
            "total_pages": total_pages,
            "total_results": total_results
        }

    except Exception as e:
        logger.error("Error fetching SVD recommendations for user %s: %s", user_id, str(e))
        raise HTTPException(status_code=500, detail="Error fetching recommendations")


@app.get("/predict-rating/")
def predict_rating(user_id: int, movie_id: int):
    """
    API endpoint to get the predicted rating for a user-movie pair.
    """
    try:
        result = get_predicted_rating(user_id, movie_id)
        return {
            "type": "Success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/movie/svd/{id}")
async def recommend(id: int, user_id: int = Depends(get_current_user)):
    query = f"""
        SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        WHERE id = {id}
        LIMIT 1
    """
    results = list(bigquery_client.query(query).result())
    if not results:
        raise HTTPException(status_code=404, detail=f"No movie found with id = {id}")

    row = results[0]
    movie_data = parse_json_fields(row)

    if "movieId" not in movie_data:
        raise HTTPException(status_code=500, detail="movieId missing in BigQuery row")

    movie_id = int(movie_data["movieId"])
    predicted_rating = get_predicted_rating(user_id, movie_id)
    movie_data["predicted_rating"] = predicted_rating
    rating_query = f"""
            SELECT
                AVG(rating) AS vote_average,
                COUNT(*) AS vote_count,
                MAX(IF(userId = {user_id}, rating, NULL)) AS rating
            FROM `{PROJECT_ID}.{DATASET_ID}.ratings`
            WHERE movieId = {movie_id}
        """
    rating_result = list(bigquery_client.query(rating_query).result())[0]

    movie_data["vote_average"] = round(rating_result.vote_average,
                                       2) if rating_result.vote_average is not None else None
    movie_data["vote_count"] = int(rating_result.vote_count) if rating_result.vote_count is not None else 0
    movie_data["rating"] = float(rating_result.rating) if rating_result.rating is not None else None

    return movie_data
