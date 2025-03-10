import { NextResponse } from 'next/server';
import getInstance from '@/utils/axios';
import { MediaType } from '@/types';
import { parse } from '@/utils/apiResolvers';

const apiKey = process.env.TMDB_KEY;

export async function GET(request: Request) {
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ type: 'Error', data: 'Type is required' }, { status: 400 });
  }

  try {
    const result = await axios.get(`/${type}/popular`, {
      params: {
        api_key: apiKey,
        watch_region: 'US',
        language: 'en-US',
      }
    });

    const data = parse(result.data.results, type as MediaType);
    return NextResponse.json({ type: 'Success', data });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ type: 'Error', data: error.message }, { status: 500 });
    } else {
      console.error('Unexpected error', error);
      return NextResponse.json({ type: 'Error', data: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}