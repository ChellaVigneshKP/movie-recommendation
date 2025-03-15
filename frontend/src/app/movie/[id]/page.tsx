/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MediaFull, CastMember } from "@/types";
import Loading from "@/components/Loading";
import CastList from "@/components/Movie/CastList";
import MovieHeader from "@/components/Movie/MovieInfo";
import Footer from "@/components/Footer";
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

export default function MovieDetails() {
  const params = useParams();
  const id = params.id as string;
  const [movie, setMovie] = useState<MediaFull | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        if (!id) return;
        const response = await fetch(`/api/movie?id=${id}`);
        const result = await response.json();
        if (result.type === "Success") {
          setMovie(result.data);
        } else {
          throw new Error("Failed to fetch movie data");
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    const fetchCastData = async () => {
      try {
        if (!id) return;
        const response = await fetch(`/api/movie-credits?id=${id}`);
        const result = await response.json();
        if (result.type === "Success") {
          setCast(result.data);
        } else {
          throw new Error("Failed to fetch cast data");
        }
      } catch (error) {
        console.error("Error fetching cast data:", error);
      }
    };

    fetchMovieData();
    fetchCastData();
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

  if (!movie) {
    return <Loading />;
  }

  return (
    <div className="relative w-full text-white">
      <Navbar isScrolled={isScrolled} />
      <MovieHeader movie={movie} />
      <div className='h-2 w-full bg-[#232323]' aria-hidden='true' />
      <CastList cast={cast} />
      <div className='h-2 w-full bg-[#232323]' aria-hidden='true' />
      <Footer />
    </div>
  );
}
