import torch.nn as nn
import torch

class RecommenderNet(nn.Module):
    def __init__(self):
        super(RecommenderNet, self).__init__()

        self.user_branch = nn.Sequential(
            nn.Linear(20, 32),
            nn.ReLU(),
            nn.Linear(32, 16)
        )

        self.movie_branch = nn.Sequential(
            nn.Linear(22, 32),
            nn.ReLU(),
            nn.Linear(32, 16)
        )

        self.predict_layer = nn.Sequential(
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1)
        )

    def forward(self, user_input, movie_input):
        user_vector = self.user_branch(user_input)
        movie_vector = self.movie_branch(movie_input)
        combined = torch.cat([user_vector, movie_vector], dim=-1)
        output = self.predict_layer(combined)
        return output.squeeze()