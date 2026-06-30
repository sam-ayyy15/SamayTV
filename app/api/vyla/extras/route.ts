import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.VYLA_BASE_URL;
  const apiKey = process.env.VYLA_API_KEY;
  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Vyla API is not configured" },
      { status: 500 },
    );
  }

  const kind = req.nextUrl.searchParams.get("kind"); // "subtitles" | "downloads"
  const type = req.nextUrl.searchParams.get("type"); // "movie" | "tv"
  const id = req.nextUrl.searchParams.get("id");
  const season = req.nextUrl.searchParams.get("season");
  const episode = req.nextUrl.searchParams.get("episode");

  if (!kind || !type || !id || (kind !== "subtitles" && kind !== "downloads")) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  let path: string;
  if (type === "movie") {
    path = `/api/${kind}/movie/${id}`;
  } else {
    if (!season || !episode) {
      return NextResponse.json(
        { error: "season and episode are required for tv" },
        { status: 400 },
      );
    }
    path = `/api/${kind}/tv/${id}/${season}/${episode}`;
  }

  const upstream = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
