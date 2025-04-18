import { NextRequest } from "next/server";
import {getImdbInstance, getInstance} from "@/utils/axios";
const apiKey = process.env.TMDB_KEY;
export async function GET(request: NextRequest) {
  const axiosImdb = getImdbInstance();
  const axios = getInstance();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id||!type) {
    return Response.json({ type: "Error", data: "Missing movie ID" }, { status: 400 });
  }

  try {
    if (type === "svd") {
      const token = request.headers.get("authorization");
      const result = await axios.get(`/movie/${type}/${id}`, {
        headers: {
          Authorization: token ?? "",
        },
      });      return Response.json({ type: "Success", data: result.data }, { status: 200 });
    } else {
      const result = await axiosImdb.get(`/movie/${id}`, {
        params: {
          api_key: apiKey,
          language: "en-US",
        },
      });
      return Response.json({ type: "Success", data: result.data }, { status: 200 });
    }
  }
  /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
  catch (_error) {
    return Response.json({ type: "Error" }, { status: 500 });
  }
}
