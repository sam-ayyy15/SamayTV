import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.VYLA_API_KEY;
  const baseUrl = process.env.VYLA_BASE_URL;
  if (!apiKey || !baseUrl) {
    return NextResponse.json(
      { error: "Vyla API is not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(`${baseUrl}/api/auth`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to mint session token" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
