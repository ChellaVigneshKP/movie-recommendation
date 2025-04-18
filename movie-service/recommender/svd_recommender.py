import pickle
import heapq

with open("D:/M.Tech DE/Project/svd_best_model.pkl", "rb") as f:
    model = pickle.load(f)
def get_top_100_recommendations(user_id, all_movie_ids):
    predictions = model.test([(user_id, movie_id, 0) for movie_id in all_movie_ids])
    top_100 = heapq.nlargest(100, predictions, key=lambda x: x.est)
    return [
        {
            "movieId": pred.iid,
            "predicted_rating": round(pred.est, 2),
            "rank": rank
        }
        for rank, pred in enumerate(top_100, 1)
    ]


def get_predicted_rating(user_id: int, movie_id: int) -> dict:
    try:
        prediction = model.predict(user_id, movie_id)
        return round(prediction.est, 2)
    except Exception as e:
        raise RuntimeError(f"Prediction failed: {str(e)}")
