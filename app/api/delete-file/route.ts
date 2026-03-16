import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { deleteR2Object } from "@/infrastructure/storage/r2.service";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { key } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Key required" }, { status: 400 });
    }

    // ✅ PROTEÇÃO SERVER-SIDE — dupla camada de segurança
    if (key.startsWith("security/")) {
      return NextResponse.json(
        { error: "Imagen protegida. No se puede eliminar." },
        { status: 403 },
      );
    }

    if (!key.startsWith("organizations/")) {
      return NextResponse.json(
        { error: "Solo se pueden eliminar imágenes de organizations." },
        { status: 403 },
      );
    }

    await deleteR2Object(key);

    return NextResponse.json({ success: true, deleted: key });
  } catch (error) {
    console.error("❌ API DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
