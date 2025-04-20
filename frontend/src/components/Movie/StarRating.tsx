"use client";

import { useState } from "react";
import { IoStar as Star } from "react-icons/io5";

interface StarRatingProps {
  readonly movieId: number;
  readonly rating?: number;
  readonly predicted_rating?: number;
}

export default function StarRating({
  movieId,
  rating = 0,
  predicted_rating = 0,
}: StarRatingProps) {
  const [userRating, setUserRating] = useState<number>(rating);
  const [hover, setHover] = useState<number | null>(null);
  console.debug("Movie ID:", movieId);
  const handleRating = (value: number) => {
    setUserRating(value);
  };

  return (
    <div className="flex flex-col items-center text-white">
      {/* Display the actual rating if it exists */}
      {rating > 0 && (
        <div className="text-sm text-gray-300 mb-2">
          <span>Actual Rating: </span>
          <span className="font-semibold">{rating.toFixed(1)}</span>
        </div>
      )}

      {/* Display the predicted rating if it exists */}
      {predicted_rating > 0 && (
        <div className="text-sm text-gray-300 mb-2">
          <span>Predicted Rating: </span>
          <span className="font-semibold">{predicted_rating.toFixed(1)}</span>
        </div>
      )}

      {/* Star Rating Display */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="transition-transform transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={32}
              className={`transition-colors duration-300 ${
                (hover ?? userRating) >= star ? "text-yellow-400" : "text-gray-500"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-300">
          {userRating > 0 ? userRating.toFixed(1) : "Rate"}
        </span>
      </div>

      {/* Precision Slider */}
      <div className="relative mt-3 w-full flex flex-col items-center">
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={userRating}
          onChange={(e) => handleRating(parseFloat(e.target.value))}
          className="w-44 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400 transition-all focus:outline-none"
        />
        <div className="mt-2 flex justify-between w-44 text-xs text-gray-400">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );
}