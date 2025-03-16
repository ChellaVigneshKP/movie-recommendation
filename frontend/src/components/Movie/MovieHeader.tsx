/* eslint-disable @next/next/no-img-element */
"use client";

import { Play, Star, Heart, Bookmark } from "lucide-react";
import { Genre, MediaFull } from "@/types";
import StarRating from "./StarRating";

interface MovieHeaderProps {
    movie: MediaFull;
}

export default function MovieHeader({ movie }: MovieHeaderProps) {
    return (
        <div className="relative w-full text-white">
            <div
                className="w-full min-h-screen bg-cover bg-center relative flex items-center"
                style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                }}
            >
                <div className="absolute inset-0 bg-black/70"></div>

                <div className="relative mx-auto px-4 sm:px-6 md:px-12 flex flex-wrap gap-6 items-center pt-20 lg:pt-28 pb-12 max-w-full overflow-hidden">
                    <div className="w-32 sm:w-40 md:w-52 lg:w-64 shrink-0 max-w-full">
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 max-w-full break-words">
                        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                            {movie.title}{" "}
                            <span className="text-gray-400 text-sm sm:text-base md:text-lg">
                                ({new Date(movie.release_date).getFullYear()})
                            </span>
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base md:text-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-green-600 text-white font-bold">
                                    {Math.round(movie.vote_average * 10)}%
                                </div>
                                <span className="text-gray-400">User Score</span>
                            </div>
                            <span className="text-gray-300">{renderGenre(movie.genres)}</span>
                            <span className="text-gray-300">{formatRuntime(movie.runtime)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
                                <Star size={20} className="text-yellow-400" />
                            </button>
                            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
                                <Heart size={20} className="text-red-500" />
                            </button>
                            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
                                <Bookmark size={20} className="text-blue-400" />
                            </button>

                            <div className="w-full sm:w-auto">
                                <button
                                    onClick={() => alert("Trailer Clicked!")}
                                    className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-medium bg-white text-black rounded-md shadow-md hover:bg-gray-200 transition w-full sm:w-auto justify-center"
                                >
                                    <Play size={18} />
                                    <span>Play Trailer</span>
                                </button>
                            </div>
                        </div>
                        <div className="w-full flex justify-start">
                            <StarRating movieId={movie.id} />
                        </div>
                        <div className="max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%]">
                            <p className="text-gray-400 italic text-sm sm:text-base">{movie.tagline}</p>
                            <h2 className="text-base sm:text-lg font-semibold mt-2">Overview</h2>
                            <p className="text-gray-300 text-sm sm:text-base break-words overflow-hidden text-ellipsis">
                                {movie.overview}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderGenre(genres: Genre[]) {
    return genres.map((g) => g.name).join(", ");
}

function formatRuntime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}
