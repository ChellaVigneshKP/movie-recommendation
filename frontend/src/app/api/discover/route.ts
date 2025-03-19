import { NextRequest } from 'next/server';
import { parse } from '@/utils/apiResolvers';
import { MediaType } from '@/types';
import getInstance from '@/utils/axios';

const apiKey = process.env.TMDB_KEY;

export async function GET(request: NextRequest) {
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const genre = searchParams.get('genre');
  const page = searchParams.get('page');

  if (!type) {
    return Response.json({ type: 'Error', data: new Error('Missing type') }, { status: 400 });
  }

  try {
    const result = await axios.get(`/discover/${type}`, {
      params: {
        api_key: apiKey,
        with_genres: genre,
        watch_region: 'US',
        with_networks: '213',
        page: page || 1,
      },
    });
    const data = parse(result.data.results, type as MediaType);

    return Response.json({ type: 'Success', data }, { status: 200 });
  }
  /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
  catch (_error) {
    return Response.json({ type: 'Error', data: 'error' }, { status: 500 });
  }
}
