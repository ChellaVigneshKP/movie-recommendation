import { NextRequest } from 'next/server';
import { getInstance } from '@/utils/axios';
import { parse } from '@/utils/apiResolvers';
import { MediaType } from '@/types';

export async function GET(request: NextRequest) {
    const axios = getInstance();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    if (!query) {
        return Response.json({ type: 'Error', data: 'Missing search query' }, { status: 400 });
    }

    try {
        const token = request.headers.get("authorization");
        const response = await axios.get(`/search/${query}`, {
            headers: {
                Authorization: token ?? "",
            },
        });
        const data = parse(response.data.data, MediaType.MOVIE);
        return Response.json({ type: 'Success', data }, { status: 200 });

    } catch (err) {
        console.error('Search error:', err);
        return Response.json({ type: 'Error', data: 'Search failed' }, { status: 500 });
    }
}