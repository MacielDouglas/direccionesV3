import { deleteR2Object } from "@/infrastructure/storage/r2.service";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await getCurrentUser();
  if (!data) {
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

    // ✅ Escopo por organização — só deleta imagens da org ativa do usuário
    const organizationId = data.person?.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "Sin organización activa." }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { slug: true },
    });
    if (!organization || !key.startsWith(`organizations/${organization.slug}/`)) {
      return NextResponse.json(
        { error: "Sin permiso para eliminar esta imagen." },
        { status: 403 },
      );
    }

    await deleteR2Object(key);

    return NextResponse.json({ success: true, deleted: key });
  } catch {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
