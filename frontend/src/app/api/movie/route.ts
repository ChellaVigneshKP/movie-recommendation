import { NextRequest } from "next/server";
import getInstance from "@/utils/axios";

const apiKey = process.env.TMDB_KEY;

export async function GET(request: NextRequest) {
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ type: "Error", data: "Missing movie ID" }, { status: 400 });
  }

  try {
    const result = await axios.get(`/movie/${id}`, {
      params: {
        api_key: apiKey,
        language: "en-US",
      },
    });

    return Response.json({ type: "Success", data: result.data }, { status: 200 });
  }
  /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
  catch (_error) {
    return Response.json({ type: "Error" }, { status: 500 });
  }
}
