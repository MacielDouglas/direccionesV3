import { generateUploadUrl } from "@/infrastructure/storage/r2.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  if (
    !body ||
    typeof body.key !== "string" ||
    typeof body.contentType !== "string"
  ) {
    return NextResponse.json(
      { error: "Campos requeridos: key, contentType." },
      { status: 400 },
    );
  }

  try {
    const url = await generateUploadUrl(body.key, body.contentType);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[POST /api/upload-url]", err);
    return NextResponse.json(
      { error: "Error al generar la URL de carga." },
      { status: 500 },
    );
  }
}
