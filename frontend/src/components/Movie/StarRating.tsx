"use client";

import { useState, useEffect } from "react";
import { IoStar as Star} from "react-icons/io5";

interface StarRatingProps {
  readonly movieId: number;
}

export default function StarRating({ movieId }: StarRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const savedRating = localStorage.getItem(`movie-rating-${movieId}`);
    if (savedRating) {
      setRating(parseFloat(savedRating));
    }
  }, [movieId]);

  const handleRating = (value: number) => {
    setRating(value);
    localStorage.setItem(`movie-rating-${movieId}`, value.toString());
  };

  return (
    <div className="flex flex-col items-center text-white">
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
                (hover ?? rating) >= star ? "text-yellow-400" : "text-gray-500"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-300">
          {rating > 0 ? rating.toFixed(1) : "Rate"}
        </span>
      </div>

      {/* Precision Slider */}
      <div className="relative mt-3 w-full flex flex-col items-center">
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={rating}
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
