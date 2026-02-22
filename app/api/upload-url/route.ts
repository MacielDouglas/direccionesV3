import { generateUploadUrl } from "@/infrastructure/storage/r2.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { key, contentType } = await req.json();

  const url = await generateUploadUrl(key, contentType);

  return NextResponse.json({ url });
}
