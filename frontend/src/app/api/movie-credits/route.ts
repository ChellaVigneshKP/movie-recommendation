import { NextRequest } from "next/server";
import {getImdbInstance} from "@/utils/axios";
import { CastMember, CastResponse } from "@/types";

const apiKey = process.env.TMDB_KEY;

export async function GET(request: NextRequest) {
    const axios = getImdbInstance();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ type: "Error", data: [] } as CastResponse, { status: 400 });
    }

    try {
        const result = await axios.get(`/movie/${id}/credits`, {
            params: {
                api_key: apiKey,
                language: "en-US",
            },
        });

        const cast: CastMember[] = result.data.cast.map((member: CastMember) => ({
            id: member.id,
            name: member.name,
            original_name: member.original_name,
            character: member.character,
            profile_path: member.profile_path ?? null,
            gender: member.gender,
            known_for_department: member.known_for_department,
            popularity: member.popularity,
            credit_id: member.credit_id,
            order: member.order,
        }));

        return Response.json({ type: "Success", data: cast } as CastResponse, { status: 200 });
    }
    /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
    catch (_error) {
        return Response.json({ type: "Error", data: [] } as CastResponse, { status: 500 });
    }
}