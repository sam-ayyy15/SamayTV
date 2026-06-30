import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const { path } = await params;
  const search = req.nextUrl.searchParams;
  const isBearer = apiKey.startsWith("eyJ");

  const upstreamParams = new URLSearchParams(search);
  if (!isBearer) upstreamParams.set("api_key", apiKey);

  const url = `${TMDB_BASE}/${path.join("/")}?${upstreamParams.toString()}`;

  const res = await fetch(url, {
    headers: isBearer ? { Authorization: `Bearer ${apiKey}` } : undefined,
    next: { revalidate: 300 },
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
