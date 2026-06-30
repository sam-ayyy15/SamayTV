import { NextRequest, NextResponse } from "next/server";

const IPTV_BASE = "https://iptv-org.github.io/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const endpoint = path.join("/");

  const res = await fetch(`${IPTV_BASE}/${endpoint}`, {
    next: { revalidate: 3600 }, // cache 1 hour — static JSON files
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `IPTV API error: ${res.status}` },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
  });
}
