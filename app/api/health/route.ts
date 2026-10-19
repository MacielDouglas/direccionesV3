import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function noContent() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export function GET() {
  return noContent();
}

export function HEAD() {
  return noContent();
}
