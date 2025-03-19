import { NextRequest } from 'next/server';
import getInstance from '@/utils/axios';
import { parse } from '@/utils/apiResolvers';
import { MediaType } from '@/types';

const apiKey = process.env.TMDB_KEY;

export async function GET(request: NextRequest) {
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const time = searchParams.get('time') ?? 'day'; // Default to "day" if not provided

  if (!type) {
    return Response.json({ type: 'Error', data: new Error('Missing type parameter') }, { status: 400 });
  }

  try {
    const result = await axios.get(`/trending/${type}/${time}`, {
      params: {
        api_key: apiKey,
        watch_region: 'US',
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
