import { deleteR2Object } from "@/infrastructure/storage/r2.service";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/server/users";
import { NextResponse } from "next/server";
import { z } from "zod";

const deleteFileSchema = z
  .object({
    key: z.string().min(1).max(500),
  })
  .strict();

export async function POST(req: Request) {
  const data = await getCurrentUser();
  if (!data) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!checkRateLimit(`delete-file:${data.user.id}`, { max: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  try {
    const raw = await req.json().catch(() => null);
    const parsed = deleteFileSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Key required" }, { status: 400 });
    }
    const { key } = parsed.data;

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

    // ✅ Bloqueia path traversal (ex.: organizations/acme/../../security/x)
    if (key.split("/").includes("..") || key.includes("//") || key.endsWith("/")) {
      return NextResponse.json({ error: "Ruta inválida." }, { status: 403 });
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
