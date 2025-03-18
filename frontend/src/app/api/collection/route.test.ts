import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/collection/route";

describe("GET /collection", () => {
  it("should return 400 if no collection ID is provided", async () => {
    const request = new NextRequest("http://localhost/api/collection");
    const response = await GET(request);
    const jsonResponse = await response.json();

    expect(response.status).toBe(400);
    expect(jsonResponse.type).toBe("Error");
  });
});
