/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { CollectionDetails } from "@/types";
import { ImageOff, Star, Globe, TrendingUp, Film } from "lucide-react"; // Lucide Icons

export default function CollectionPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState<CollectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await fetch(`/api/collection?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch collection");
        const data = await res.json();
        if (data.type === "Success") {
          setCollection(data.data);
        } else {
          throw new Error("Failed to load collection details");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCollection();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading) return <Loading />;
  if (!collection) return <p className="text-center text-white">Collection not found</p>;

  // Calculate average rating
  const totalMovies = collection.parts.length;
  const avgRating =
    totalMovies > 0
      ? (collection.parts.reduce((acc, movie) => acc + movie.vote_average, 0) / totalMovies).toFixed(1)
      : "N/A";

  return (
    <div className="relative text-white">
      <Navbar isScrolled={isScrolled} />
      <div
        className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: collection.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${collection.backdrop_path})`
            : "none",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <h1 className="text-4xl font-bold relative z-10">{collection.name}</h1>
      </div>

      {/* Collection Info */}
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          {collection.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${collection.poster_path}`}
              alt={collection.name}
              className="w-64 h-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-64 h-96 flex items-center justify-center bg-gray-800 rounded-lg">
              <ImageOff className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Description & Metadata */}
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold">{collection.name}</h2>
            <p className="text-gray-300">{collection.overview || "No overview available."}</p>

            {/* Additional Metadata */}
            <div className="grid grid-cols-2 gap-4 text-gray-400 text-sm">
              <p className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-300" />
                Language: {collection.parts[0]?.original_language.toUpperCase()}
              </p>
              <p className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-300" />
                Popularity: {collection.parts[0]?.popularity.toFixed(1)}
              </p>
              <p className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Avg. Rating: {avgRating}
              </p>
              <p className="flex items-center gap-2">
                <Film className="w-5 h-5 text-gray-300" />
                Total Movies: {totalMovies}
              </p>
            </div>
          </div>
        </div>

        {/* Movies List */}
        <h3 className="text-2xl font-semibold mt-12 mb-4">Movies in this Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collection.parts.map((movie) => (
            <a key={movie.id} href={`/movie/${movie.id}`} className="group block relative">
              {/* Movie Poster */}
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-auto rounded-lg transition-transform transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-[280px] flex items-center justify-center bg-gray-800 rounded-lg">
                  <ImageOff className="w-10 h-10 text-gray-400" />
                </div>
              )}

              {/* Movie Details */}
              <div className="mt-2">
                <p className="text-lg font-medium">{movie.title}</p>
                <p className="text-sm text-gray-400">{movie.release_date}</p>
                <p className="text-yellow-400 font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {movie.vote_average.toFixed(1)} / 10
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
