import { NextRequest } from 'next/server';
import getInstance from '@/utils/axios';

const apiKey = process.env.TMDB_KEY;

export async function GET(request: NextRequest) {
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId');

  if (!movieId) {
    return Response.json({ type: 'Error', data: 'Missing movieId' }, { status: 400 });
  }

  try {
    // Fetch videos for the movie
    const result = await axios.get(`/movie/${movieId}/videos`, {
      params: { api_key: apiKey },
    });

    const videos = result.data.results;

    const trailer = videos.find((video: any) => video.type === 'Trailer');
    const teaser = videos.find((video: any) => video.type === 'Teaser');
    const clip = videos.find((video: any) => video.type === 'Clip');

    let selectedVideo = trailer || teaser || clip;

    if (selectedVideo) {
      return Response.json(
        {
          type: 'Success',
          videoType: selectedVideo.type,
          videoUrl: `https://www.youtube.com/watch?v=${selectedVideo.key}`
        },
        { status: 200 }
      );
    } else {
      return Response.json({ type: 'Error', data: 'No trailer, teaser, or clip found' }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ type: 'Error', data: error }, { status: 500 });
  }
}