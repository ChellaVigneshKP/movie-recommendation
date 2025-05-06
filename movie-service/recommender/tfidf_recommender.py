import numpy as np
from pyspark.ml.feature import HashingTF, IDF, RegexTokenizer, StopWordsRemover
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lower, udf, when
from pyspark.sql.types import DoubleType

# Initialize Spark
spark = SparkSession.builder \
    .appName("TFIDF-Movie-Recommender") \
    .config("spark.driver.memory", "8192m") \
    .config("spark.executor.memory", "8192m") \
    .config("spark.driver.extraJavaOptions", "-XX:+UseG1GC") \
    .config("spark.executor.extraJavaOptions", "-XX:+UseG1GC") \
    .config("spark.eventLog.gcMetrics.youngGenerationGarbageCollectors", "G1 Young Generation") \
    .config("spark.eventLog.gcMetrics.oldGenerationGarbageCollectors", "G1 Old Generation") \
    .getOrCreate()


def build_tfidf_matrix(bigquery_client, project_id, dataset_id, table_id):
    query = f"SELECT movieId, title, original_title FROM `{project_id}.{dataset_id}.{table_id}`"
    movies_df = bigquery_client.query(query).to_dataframe()
    movies_sdf = spark.createDataFrame(movies_df)

    movies_sdf = movies_sdf.withColumn(
        "title",
        when(movies_sdf.title.isNull() | (movies_sdf.title == ""), movies_sdf.original_title).otherwise(movies_sdf.title)
    )

    tokenizer = RegexTokenizer(inputCol="title", outputCol="words", pattern="\\W")
    remover = StopWordsRemover(inputCol="words", outputCol="filtered")
    hashingTF = HashingTF(inputCol="filtered", outputCol="rawFeatures", numFeatures=10000)
    idf = IDF(inputCol="rawFeatures", outputCol="features")

    tokenized = tokenizer.transform(movies_sdf)
    filtered = remover.transform(tokenized)
    featurized = hashingTF.transform(filtered)
    idf_model = idf.fit(featurized)
    rescaled = idf_model.transform(featurized)
    tfidf_matrix = rescaled.select("movieId", "title", "features").cache()

    return tfidf_matrix, tokenizer, remover, hashingTF, idf_model


def recommend_similar_movies(tfidf_matrix, tokenizer, remover, hashingTF, idf_model, search_text, top_n=20):
    query_df = spark.createDataFrame([(search_text,)], ["title"])
    q_tok = tokenizer.transform(query_df)
    q_filtered = remover.transform(q_tok)
    q_feat = hashingTF.transform(q_filtered)
    q_vec_sparse = idf_model.transform(q_feat).first()["features"]

    if not q_vec_sparse or q_vec_sparse.numNonzeros() == 0:
        return []

    # Broadcast query vector for efficiency
    q_vec_broadcast = spark.sparkContext.broadcast(q_vec_sparse.toArray())

    def cosine_similarity_broadcasted(v2):
        v1 = q_vec_broadcast.value
        v2_arr = v2.toArray()
        num = float(np.dot(v1, v2_arr))
        denom = float(np.linalg.norm(v1) * np.linalg.norm(v2_arr))
        return float(num / denom) if denom != 0 else 0.0

    cosine_udf = udf(cosine_similarity_broadcasted, DoubleType())

    # Compute cosine similarity
    scored = tfidf_matrix.withColumn("score", cosine_udf(col("features")))
    top_matches = scored.orderBy(col("score").desc())

    # Handle exact match boost
    exact_match = top_matches.filter(lower(col("title")) == search_text.lower()).limit(1)

    if exact_match.count() > 0:
        rest = top_matches.filter(lower(col("title")) != search_text.lower()).limit(top_n - 1)
        final = exact_match.union(rest)
    else:
        final = top_matches.limit(top_n)

    return final.select("movieId", "title", "score").collect()


def build_tfidf(bigquery_client, project_id, dataset_id, table_id):
    try:
        return build_tfidf_matrix(bigquery_client, project_id, dataset_id, table_id)
    except Exception as e:
        raise Exception(f"Failed to build TF-IDF matrix: {e}")