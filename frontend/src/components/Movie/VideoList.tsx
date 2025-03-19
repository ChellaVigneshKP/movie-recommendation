"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Video } from "@/types";
import { MdOutlineMovie, MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

interface VideoListProps {
  movieId: number;
}

export default function VideoList({ movieId }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchVideos() {
      try {
        const res = await fetch(`/api/videos?movieId=${movieId}`, { signal });
        const data = await res.json();

        setLoading(false);
        if (data.type === "Success" && data.videos.length > 0) {
          setVideos(data.videos);
          setError(null);
        } else {
          setVideos([]);
          setError("No official trailers or clips available for this movie.");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching videos:", err.message);
          setError("Failed to load videos. Please try again.");
        }
      }
    }

    fetchVideos();

    return () => controller.abort();
  }, [movieId]);


  const stopAllVideos = useCallback(() => {
    videoRefs.current.forEach((iframe, index) => {
      if (iframe && index !== activeVideoIndex) {
        try {
          iframe.contentWindow?.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            "https://www.youtube.com"
          );
        } catch (error) {
          console.warn("Failed to pause video:", error);
        }
      }
    });
  }, [activeVideoIndex]);
  

  const scrollLeft = useCallback(() => {
    stopAllVideos();
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: "smooth" });
  }, [stopAllVideos]);
  
  const scrollRight = useCallback(() => {
    stopAllVideos();
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: "smooth" });
  }, [stopAllVideos]);
  const handlePlay = useCallback((index: number) => {
    setActiveVideoIndex((prevIndex) => {
      if (prevIndex !== index) {
        stopAllVideos();
        return index;
      }
      return prevIndex;
    });
  }, [stopAllVideos]);  

  useEffect(() => {
    videoRefs.current = videos.map(() => null);
  }, [videos]);  

  return (
    <section role="region" aria-labelledby="video-section-title" className="max-w-full mx-auto px-4 sm:px-6 md:px-12 mt-12 text-white relative">
      {/* Video Section Title */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-2">
        <MdOutlineMovie className="text-3xl text-red-500" />
        <h2 id="video-section-title" className="text-3xl font-bold">Official Movie Trailers & Clips</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-300 animate-pulse">Loading videos...</p>
      ) : error ? (
        <div className="flex flex-col items-center text-center text-gray-400 mt-6">
          <MdOutlineMovie className="text-6xl text-gray-500 mb-2" />
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <button
            aria-label="Scroll left"
            onClick={scrollLeft}
            className="absolute left-2 sm:left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-75 
             p-2 sm:p-3 md:p-4 rounded-full shadow-md hover:bg-gray-700 focus:outline-none z-10"
          >
            <MdArrowBackIos className="text-xl sm:text-2xl md:text-3xl text-white" />
          </button>
          <div
            ref={scrollRef}
            className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth w-full"
          >
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="flex-shrink-0 snap-center w-screen max-w-[100vw] videotrailer-container"
              >
                {video.url ? (
                  <div className="videotrailer-wrapper">
                    <iframe
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[videos.findIndex((v) => v.id === video.id)] = el;
                        }
                      }}
                      src={`${video.url}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0&origin=${window.location.origin}`}
                      title={video.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="videotrailer-iframe"
                      onFocus={() => handlePlay(index)}
                    ></iframe>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center">Video not available</p>
                )}
                <p className="mt-3 text-lg font-semibold text-gray-200 text-center">
                  {video.name}
                </p>
              </div>
            ))}
          </div>
          <button
            aria-label="Scroll right"
            onClick={scrollRight}
            className="absolute right-2 sm:right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-75 
             p-2 sm:p-3 md:p-4 rounded-full shadow-md hover:bg-gray-700 focus:outline-none z-10"
          >
            <MdArrowForwardIos className="text-xl sm:text-2xl md:text-3xl text-white" />
          </button>
        </div>
      )}
    </section>
  );
}
