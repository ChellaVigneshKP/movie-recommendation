import { NextResponse } from 'next/server';
import {getInstance} from '@/utils/axios';
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
  }
  catch (_error) {
    if (_error instanceof Error) {
      return NextResponse.json({ type: 'Error', data: 'An error occurred' }, { status: 500 });
    } else {
      return NextResponse.json({ type: 'Error', data: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}