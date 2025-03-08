import { NextResponse } from "next/server";

export async function GET(request) {
  const token = request.cookies.get("authToken");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ message: "Access granted!" });
}