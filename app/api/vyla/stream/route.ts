import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.VYLA_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Vyla API is not configured" },
      { status: 500 },
    );
  }

  const token = req.headers.get("X-Session-Token");
  if (!token) {
    return NextResponse.json({ error: "Missing session token" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");
  if (!type || !id || (type !== "movie" && type !== "tv")) {
    return NextResponse.json({ error: "Invalid type or id" }, { status: 400 });
  }

  let upstreamUrl: string;
  if (type === "movie") {
    upstreamUrl = `${baseUrl}/movie?id=${encodeURIComponent(id)}`;
  } else {
    const season = req.nextUrl.searchParams.get("season");
    const episode = req.nextUrl.searchParams.get("episode");
    if (!season || !episode) {
      return NextResponse.json(
        { error: "season and episode are required for tv" },
        { status: 400 },
      );
    }
    upstreamUrl = `${baseUrl}/tv?id=${encodeURIComponent(id)}&season=${encodeURIComponent(season)}&episode=${encodeURIComponent(episode)}`;
  }

  const upstream = await fetch(upstreamUrl, {
    headers: { "X-Session-Token": token },
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Upstream stream failed" },
      { status: upstream.status || 502 },
    );
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
