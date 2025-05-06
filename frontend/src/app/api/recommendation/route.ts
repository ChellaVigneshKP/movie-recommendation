import { NextRequest } from 'next/server';
import { parse } from '@/utils/apiResolvers';
import { MediaType } from '@/types';
import { getInstance } from '@/utils/axios';

export async function GET(request: NextRequest) {
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const page = searchParams.get('page') ?? '1';

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return Response.json({ type: 'Error', data: 'Missing Authorization token' }, { status: 401 });
  }

  if (!type || !['als', 'svd', 'nlp','deepmatch','ncf'].includes(type)) {
    return Response.json({ type: 'Error', data: 'Invalid or missing type' }, { status: 400 });
  }

  try {
    const endpoint = `/recommendations/${type}`;
    const result = await axios.get(endpoint, {
      params: { page },
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    const data = parse(result.data.results, MediaType.MOVIE);
    return Response.json({ type: 'Success', data }, { status: 200 });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return Response.json({ type: 'Error', data: 'Failed to fetch recommendations' }, { status: 500 });
  }
}