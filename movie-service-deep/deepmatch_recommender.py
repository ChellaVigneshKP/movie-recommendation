import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
import pandas as pd
import json
import os
import numpy as np
from typing import Dict, List, Tuple
from sklearn.preprocessing import normalize
import pickle

class DeepMatchNetMM(nn.Module):
    def __init__(self, text_model_name="bert-base-uncased", num_cat_features=2, 
                 num_num_features=5, embedding_sizes=None):
        super().__init__()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # Text components
        self.text_encoder = AutoModel.from_pretrained(text_model_name)
        self.text_tokenizer = AutoTokenizer.from_pretrained(text_model_name)
        self.text_proj = nn.Linear(self.text_encoder.config.hidden_size * 3, 256)
        # Categorical embeddings
        self.cat_embeds = nn.ModuleList([
            nn.Embedding(num_categories, embed_dim)
            for num_categories, embed_dim in embedding_sizes
        ])
        self.cat_proj = nn.Linear(sum([e.embedding_dim for e in self.cat_embeds]), 128)
        # Numerical projection
        self.num_proj = nn.Sequential(
            nn.Linear(num_num_features, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64)
        )
        # Final predictor
        self.predictor = nn.Sequential(
            nn.Linear(256 + 128 + 64, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
        self.to(self.device)

    def encode_text(self, text_inputs: List[Dict]) -> torch.Tensor:
        """Optimized text encoding with combined processing"""
        text_features = []
        for text_input in text_inputs:
            features = self.text_encoder(**text_input).pooler_output
            text_features.append(features)
        return torch.cat(text_features, dim=-1)

    def forward(self, text_inputs: List[Dict], cat_inputs: torch.Tensor, 
               num_inputs: torch.Tensor) -> torch.Tensor:
        """Optimized forward pass"""
        # Process text
        text_out = self.text_proj(self.encode_text(text_inputs))
        # Process categorical
        cat_outs = [embed(cat_inputs[:, i]) for i, embed in enumerate(self.cat_embeds)]
        cat_out = self.cat_proj(torch.cat(cat_outs, dim=-1))
        # Process numerical
        num_out = self.num_proj(num_inputs)
        # Final prediction
        return self.predictor(torch.cat([text_out, cat_out, num_out], dim=-1)) * 100

class MovieRecommender:
    def __init__(self, model_dir: str, batch_size: int = 64, use_cache: bool = True):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.batch_size = batch_size
        self.use_cache = use_cache
        self.cache_file = os.path.join(model_dir, "movie_embeddings_cache.pkl")
        # Load configuration and data
        self._load_config_and_data(model_dir)
        # Initialize model
        self.model = DeepMatchNetMM(
            text_model_name=self.config["text_model_name"],
            num_cat_features=len(self.config["embedding_sizes"]),
            num_num_features=self.config["num_num_features"],
            embedding_sizes=self.config["embedding_sizes"]
        )
        # Load model weights
        state_dict = torch.load(os.path.join(model_dir, "deep_match_model.pt"), 
                              map_location=self.device)
        self.model.load_state_dict(state_dict, strict=False)
        self.model.eval()
        # Initialize cache
        self.movie_embeddings = None
        self.movie_titles = None
        self._preprocess_non_text_features()
        self._initialize_cache()

    def _load_config_and_data(self, model_dir: str):
        """Load configuration and data files"""
        with open(os.path.join(model_dir, "deep_match_config.json")) as f:
            self.config = json.load(f)
        with open(os.path.join(model_dir, "cat_vocab.json")) as f:
            self.cat_vocab = json.load(f)
            self.cat_vocab = {k: {str(inner_k): v for inner_k, v in inner.items()} 
                             for k, inner in self.cat_vocab.items()}
        self.movie_df = pd.read_pickle(os.path.join(model_dir, "movie_metadata.pkl"))
        self.text_cols = ['title', 'overview', 'tagline']
        self.cat_cols = ['original_language', 'status']
        self.num_cols = ['runtime', 'vote_average', 'vote_count', 'popularity']

    def _initialize_cache(self):
        """Initialize or load cached embeddings"""
        if self.use_cache and os.path.exists(self.cache_file):
            with open(self.cache_file, 'rb') as f:
                cache_data = pickle.load(f)
                self.movie_embeddings = cache_data['embeddings']
                self.movie_titles = cache_data['titles']
                self.movie_ids = cache_data.get('ids', [None]*len(self.movie_titles))
        else:
            self._precompute_embeddings()
            if self.use_cache:
                self._save_cache()

    def _save_cache(self):
        """Save computed embeddings to cache file"""
        with open(self.cache_file, 'wb') as f:
            pickle.dump({
                'embeddings': self.movie_embeddings,
                'titles': self.movie_titles,
                'ids': self.movie_ids
            }, f)

    def _precompute_embeddings(self):
        """Precompute and cache all movie embeddings"""
        # Preprocess categorical and numerical features
        self._preprocess_non_text_features()
        # Process text features in batches
        num_movies = len(self.movie_df)
        all_embeddings = []
        self.movie_titles = []
        self.movie_ids = []
        for i in range(0, num_movies, self.batch_size):
            batch = self.movie_df.iloc[i:i+self.batch_size]
            text_inputs = self._process_text_batch(batch)
            with torch.no_grad():
                # Get intermediate embeddings
                text_out = self.model.text_proj(self.model.encode_text(text_inputs))
                cat_out = self._get_categorical_embeddings(i, batch)
                num_out = self.model.num_proj(self.all_num[i:i+self.batch_size])
                # Combine features
                embeddings = torch.cat([text_out, cat_out, num_out], dim=-1)
                all_embeddings.append(embeddings.cpu().numpy())
                self.movie_titles.extend(batch['title'].tolist())
                self.movie_ids.extend(batch['movieId'].tolist())
        # Normalize embeddings for efficient similarity search
        self.movie_embeddings = normalize(np.concatenate(all_embeddings), axis=1)

    def _preprocess_non_text_features(self):
        """Preprocess categorical and numerical features"""
        self.all_cat = torch.stack([
            torch.tensor([
                self.cat_vocab[col].get(str(movie.get(col, 'unknown')), 0)
                for col in self.cat_cols
            ], dtype=torch.long)
            for _, movie in self.movie_df.iterrows()
        ]).to(self.device)
        self.all_num = torch.stack([
            torch.tensor([
                movie.get(col, 0) for col in self.num_cols
            ], dtype=torch.float)
            for _, movie in self.movie_df.iterrows()
        ]).to(self.device)

    def _process_text_batch(self, batch: pd.DataFrame) -> List[Dict]:
        """Process text batch with optimized tokenization"""
        titles = batch['title'].fillna('').tolist()
        overviews = batch['overview'].fillna('').tolist()
        taglines = batch['tagline'].fillna('').tolist()
        # Tokenize all fields in parallel
        title_inputs = self.model.text_tokenizer(
            titles, return_tensors="pt", padding=True,
            truncation=True, max_length=64).to(self.device)
        overview_inputs = self.model.text_tokenizer(
            overviews, return_tensors="pt", padding=True,
            truncation=True, max_length=128).to(self.device)
        tagline_inputs = self.model.text_tokenizer(
            taglines, return_tensors="pt", padding=True,
            truncation=True, max_length=32).to(self.device)
        return [title_inputs, overview_inputs, tagline_inputs]

    def _get_categorical_embeddings(self, batch_idx: int, batch: pd.DataFrame) -> torch.Tensor:
        """Get categorical embeddings for a batch"""
        cat_outs = [embed(self.all_cat[batch_idx:batch_idx+len(batch)][:, i]) 
                   for i, embed in enumerate(self.model.cat_embeds)]
        return self.model.cat_proj(torch.cat(cat_outs, dim=-1))

    def _get_query_embedding(self, movie: Dict) -> np.ndarray:
        """Get embedding for a single query movie"""
        text_inputs = self._process_text_batch(pd.DataFrame([movie]))
        cat_inputs = torch.tensor([
            [self.cat_vocab[col].get(str(movie.get(col, 'unknown')), 0)
             for col in self.cat_cols]
        ], dtype=torch.long).to(self.device)
        num_inputs = torch.tensor([
            [movie.get(col, 0) for col in self.num_cols]
        ], dtype=torch.float).to(self.device)
        with torch.no_grad():
            text_out = self.model.text_proj(self.model.encode_text(text_inputs))
            cat_out = self._get_categorical_embeddings(0, pd.DataFrame([movie]))
            num_out = self.model.num_proj(num_inputs)
            query_embedding = torch.cat([text_out, cat_out, num_out], dim=-1)
            return normalize(query_embedding.cpu().numpy(), axis=1)

    def recommend_movies(self, query_movie: Dict, top_k: int = 5) -> List[Tuple[str,int, float]]:
        """Get recommendations using cached embeddings and cosine similarity"""
        # Get query embedding
        query_embedding = self._get_query_embedding(query_movie)
        # Calculate cosine similarity (fast matrix operation)
        scores = np.dot(self.movie_embeddings, query_embedding.T).flatten()
        # Get top k recommendations
        top_indices = np.argsort(scores)[-top_k:][::-1]
        return [
            (
            self.movie_df.iloc[idx]['title'],
            int(self.movie_df.iloc[idx]['movieId']),
            float(scores[idx] * 100))
            for idx in top_indices
        ]

    def refresh_cache(self):
        """Force refresh of cached embeddings"""
        self._precompute_embeddings()
        if self.use_cache:
            self._save_cache()
