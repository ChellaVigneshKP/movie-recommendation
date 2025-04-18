import { NextRequest } from 'next/server';
import {getImdbInstance} from '@/utils/axios';

const apiKey = process.env.TMDB_KEY;

interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers';
}

export async function GET(request: NextRequest) {
  const axios = getImdbInstance();
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId');

  if (!movieId) {
    return Response.json({ type: 'Error', data: 'Missing movieId' }, { status: 400 });
  }

  try {
    const result = await axios.get(`/movie/${movieId}/videos`, {
      params: { api_key: apiKey },
    });

    const videos: Video[] = result.data.results;

    const trailer = videos.find((video) => video.type === 'Trailer');
    const teaser = videos.find((video) => video.type === 'Teaser');
    const clip = videos.find((video) => video.type === 'Clip');

    const selectedVideo = trailer || teaser || clip;

    if (selectedVideo) {
      return Response.json(
        {
          type: 'Success',
          videoType: selectedVideo.type,
          videoUrl: `https://www.youtube.com/watch?v=${selectedVideo.key}`,
        },
        { status: 200 }
      );
    } else {
      return Response.json({ type: 'Error', data: 'No trailer, teaser, or clip found' }, { status: 404 });
    }
  }
  /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
  catch (_error) {
    return Response.json(
      { type: 'Error', data: 'Internal Server Error' },
      { status: 500 }
    );
  }
}