import { NextRequest } from "next/server";
import {getImdbInstance} from "@/utils/axios";

const apiKey = process.env.TMDB_KEY;

export async function GET(request: NextRequest) {
  const axios = getImdbInstance();
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("id");

  if (!collectionId) {
    return Response.json({ type: "Error", data: "Missing collection ID" }, { status: 400 });
  }

  try {
    const result = await axios.get(`/collection/${collectionId}`, {
      params: {
        api_key: apiKey,
        language: "en-US",
      },
    });

    return Response.json({ type: "Success", data: result.data }, { status: 200 });
  }
  /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
  catch (_error) {
    return Response.json({ type: "Error", data: 'error' }, { status: 500 });
  }
}
