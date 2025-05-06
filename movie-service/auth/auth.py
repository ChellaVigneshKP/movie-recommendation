import hashlib

from fastapi.security import OAuth2PasswordBearer
from google.cloud import bigquery
from jose import jwt,JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED


pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# 🔐 Password utilities
def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


# 🎫 Create token
def create_access_token(data: dict, expires_min : int, secret_key: str, algorithm: str):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_min)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm=algorithm)


# 🔎 Authenticate user from BigQuery
def authenticate_user(email: str, password: str, client: bigquery.Client, user_table: str):
    query = f"""
        SELECT userId, email, password_hash
        FROM `{user_table}`
        WHERE email = @email
        LIMIT 1
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("email", "STRING", email)
        ]
    )
    results = client.query(query, job_config=job_config).result()
    row = next(iter(results), None)
    if row is None or not verify_password(password, row.password_hash):
        return None

    return {"user_id": row.userId, "email": row.email}
