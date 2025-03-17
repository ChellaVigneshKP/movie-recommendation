import { NextRequest } from "next/server";
import getInstance from "@/utils/axios";
import { MovieVideosResponse, MovieVideo, Video } from "@/types";

const apiKey = process.env.TMDB_KEY;

export async function GET(request: NextRequest) {
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get("movieId");

  if (!movieId) {
    return Response.json(
      { type: "Error", data: "Missing movieId" },
      { status: 400 }
    );
  }

  try {
    const result = await axios.get<MovieVideosResponse>(`/movie/${movieId}/videos`, {
      params: { api_key: apiKey },
    });

    const videos: Video[] = result.data.results.map((video: MovieVideo) => ({
      id: video.id,
      name: video.name,
      type: video.type,
      site: video.site,
      url: video.site === "YouTube"
        ? `https://www.youtube.com/embed/${video.key}`
        : video.site === "Vimeo"
        ? `https://player.vimeo.com/video/${video.key}`
        : null,
      published_at: video.published_at,
    }));

    if (videos.length > 0) {
      return Response.json({ type: "Success", videos }, { status: 200 });
    } else {
      return Response.json({ type: "Error", data: "No videos found" }, { status: 404 });
    }
  }
  /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
  catch (_error) {
    return Response.json(
      { type: "Error", data: "Internal Server Error" },
      { status: 500 }
    );
  }
}