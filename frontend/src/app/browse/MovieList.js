"use client"
import PropTypes from "prop-types";
import Image from "next/image";
import { useState } from "react";

const MovieList = ({ movies }) => {
  const [hoveredMovie, setHoveredMovie] = useState(null);

  return (
    <section className="px-6 md:px-10 py-8 bg-black">
      <h3 className="text-xl font-semibold mb-4 text-white">Popular on Netflix</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide relative">
        {movies.slice(0, 10).map((movie) => (
          <div
            key={movie.id}
            className="relative group"
            onMouseEnter={() => setHoveredMovie(movie.id)}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            {/* Normal Movie Poster */}
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              width={140}
              height={210}
              alt={movie.title}
              className="rounded-md cursor-pointer transition-transform duration-300 ease-in-out"
            />

            {/* Expanded Movie Card on Hover */}
            {hoveredMovie === movie.id && (
              <div className="absolute top-[-100px] left-1/2 transform -translate-x-1/2 w-[280px] bg-black text-white p-4 rounded-lg shadow-2xl z-50 transition-all duration-300 scale-125">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  width={280}
                  height={160}
                  alt={movie.title}
                  className="rounded-md"
                />
                <h4 className="text-lg font-bold mt-2">{movie.title}</h4>
                <p className="text-sm opacity-80">{movie.overview?.slice(0, 80)}...</p>
                <div className="flex items-center gap-3 mt-3">
                  <button className="bg-white text-black px-4 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                    ▶ Play
                  </button>
                  <button className="bg-gray-700 px-3 py-1 rounded-md text-sm">More Info</button>
                  <button className="border border-gray-400 p-2 rounded-full">➕</button>
                </div>
                <div className="mt-2 text-xs text-gray-400">Season 6: Ep 8</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

MovieList.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      poster_path: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      overview: PropTypes.string,
    })
  ).isRequired,
};

export default MovieList;
