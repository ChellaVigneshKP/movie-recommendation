import ast
import logging
import json
logger = logging.getLogger(__name__)


def parse_genre_id(genres):
    """
    Parses the genres field and returns a list of genre dicts.
    """
    if isinstance(genres, list):
        return [g for g in genres if isinstance(g, dict)]

    elif isinstance(genres, str):
        try:
            genre_list = ast.literal_eval(genres)
            return [g for g in genre_list if isinstance(g, dict)]
        except Exception as e:
            logger.warning(f"Failed to parse genres: {genres} ({str(e)})")
            return []

    else:
        return []


def parse_genre_ids(genres):
    """
    Parses the genres field and returns a list of genre IDs.
    """

    if isinstance(genres, list):
        return [g["id"] for g in genres if isinstance(g, dict) and "id" in g]

    elif isinstance(genres, str):
        try:
            genre_list = ast.literal_eval(genres)
            return [g["id"] for g in genre_list if isinstance(g, dict) and "id" in g]
        except Exception as e:
            logger.warning(f"Failed to parse genres: {genres} ({str(e)})")
            return []

    else:
        return []


def parse_json_fields(row):
    parsed = {}
    for key, value in dict(row).items():
        # Attempt to convert string representations of dicts/lists
        if isinstance(value, str) and (
            value.startswith("{") or value.startswith("[")
        ):
            try:
                parsed[key] = ast.literal_eval(value)
            except (ValueError, SyntaxError):
                print(f"AST decode error for key {key}: {value}")
                parsed[key] = None
        # Handle booleans stored as strings
        elif value == 'false':
            parsed[key] = False
        elif value == 'true':
            parsed[key] = True
        # Convert numeric strings to appropriate types
        elif key in ["budget", "revenue", "runtime", "vote_count"]:
            try:
                parsed[key] = int(float(value)) if value else 0
            except ValueError:
                parsed[key] = 0
        elif key in ["popularity", "vote_average"]:
            try:
                parsed[key] = float(value) if value else 0.0
            except ValueError:
                parsed[key] = 0.0
        else:
            parsed[key] = value
    return parsed