"use client";
/* eslint-disable @next/next/no-img-element */
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  banner: string;
  genre: string;
}

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

export default function SearchResults() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/search?q=${encodeURIComponent(title)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        setResults(json.data || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [title]);

  return (
    <div className="bg-zinc-900 min-h-screen text-white">
      <Navbar isScrolled={isScrolled} />
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Recommendations for{" "}
          <span className="text-red-500">&ldquo;{title}&rdquo;</span>
          </h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400">No results found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((movie) => (
              <Link href={`/movie/${movie.id}`} key={movie.id}>
                <div className="bg-zinc-800 rounded-xl overflow-hidden hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer">
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster}`}
                    alt={movie.title}
                    className="w-full h-[360px] object-cover rounded-t-xl"
                  />
                  <div className="p-3">
                    <h2 className="text-lg font-semibold truncate">{movie.title}</h2>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-3">
                      {movie.overview}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
