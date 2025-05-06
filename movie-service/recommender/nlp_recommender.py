import pickle

import pandas as pd


class MovieRecommender:
    def __init__(self, data_path, similarity_path=None):
        self.df = pd.read_pickle(data_path)
        self.similarity_matrix = None
        if similarity_path:
            with open(similarity_path, "rb") as f:
                self.similarity_matrix = pickle.load(f)

    def recommend(self, title: str, top_k: int = 5):
        try:
            idx = self.df[self.df['title'].str.lower() == title.lower()].index[0]
        except IndexError:
            return []

        scores = list(enumerate(self.similarity_matrix[idx]))
        sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)[1:top_k + 1]
        results = self.df.iloc[[i[0] for i in sorted_scores]][['movieId','title', 'overview', 'genre_text']]
        return results.to_dict(orient="records")
