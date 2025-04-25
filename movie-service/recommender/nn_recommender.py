import torch
import numpy as np
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer
from .nn_model import RecommenderNet
import __main__ as main
class MovieRecommenderNCF:
    def __init__(self, model_path, movies_path, ratings_path, device=None):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = model_path
        self.movies_path = movies_path
        self.ratings_path = ratings_path
        self.model = None
        self.movies = None
        self.ratings = None
        self.user_profiles = None
        self.movie_features = None
        self.genre_cols = None
        self._load_data()
        self._prepare_features()
        self._load_model()

    def _load_data(self):
        """Load and preprocess the raw data"""
        self.movies = pd.read_csv(self.movies_path)
        self.ratings = pd.read_csv(self.ratings_path)

    def _load_model(self):
        """Load the trained model"""
        main.RecommenderNet = RecommenderNet
        self.model = torch.load(self.model_path, map_location=self.device,weights_only=False).to(self.device)
        self.model.eval()

    def _prepare_features(self):
        """Preprocess the data and extract features"""
        # Extract year and genres
        self.movies['year'] = self.movies['title'].str.extract(r'\((\d{4})\)').fillna(1990).astype(int)
        self.movies['genres'] = self.movies['genres'].apply(lambda x: x.split('|'))

        # One-hot encode genres
        mlb = MultiLabelBinarizer()
        genre_encoded = mlb.fit_transform(self.movies['genres'])
        self.genre_cols = list(mlb.classes_)
        genre_df = pd.DataFrame(genre_encoded, columns=self.genre_cols)

        # Merge movie features
        self.movies = pd.concat([self.movies[['movieId', 'year']], genre_df], axis=1)

        # Compute average ratings
        movie_avg_rating = self.ratings.groupby('movieId')['rating'].mean().reset_index(name='avg_rating')
        self.movies = self.movies.merge(movie_avg_rating, on='movieId', how='left').fillna(3.0)

        # Normalize movie features
        self.movie_features = self.movies.set_index('movieId')
        self.movie_features['year'] = (self.movie_features['year'] - 1900) / 150  # Normalize year
        self.movie_features['avg_rating'] = self.movie_features['avg_rating'] / 5.0  # Normalize avg_rating

        # Create user profiles (average rating per genre)
        ratings_merged = self.ratings.merge(self.movie_features[self.genre_cols], on='movieId')
        self.user_profiles = ratings_merged.groupby('userId')[self.genre_cols].mean().reset_index()
        self.user_profiles = self.user_profiles.set_index('userId')

    def _get_user_features(self, user_id):
        """Return the user features as a tensor"""
        try:
            user_features = self.user_profiles.loc[user_id].values
            return torch.FloatTensor(user_features).unsqueeze(0).repeat(len(self.movie_features), 1).to(self.device)
        except KeyError:
            print(f"User {user_id} not found.")
            return None

    def _get_movie_features(self):
        """Return movie features as a tensor"""
        movie_ids = self.movie_features.index.values
        movie_feature_list = [self.movie_features.loc[mid].values for mid in movie_ids]
        return torch.FloatTensor(np.array(movie_feature_list)).to(self.device)

    def recommend_for_user(self, user_id, top_k=10):
        """Recommend top_k movies for the specified user"""
        user_tensor = self._get_user_features(user_id)
        if user_tensor is None:
            return []

        movie_tensor = self._get_movie_features()

        # Predict ratings
        with torch.no_grad():
            predictions = self.model(user_tensor, movie_tensor).cpu().numpy()

        # Get top K recommendations
        top_indices = np.argsort(predictions)[-top_k:][::-1]
        recommendations = []

        for idx in top_indices:
            movie_id = int(self.movie_features.index[idx])
            predicted_rating = float(predictions[idx])  # Scaling back to the original rating range
            recommendations.append((movie_id, predicted_rating))

        return recommendations