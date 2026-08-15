import { randomUUID } from "node:crypto";
import { generateUploadUrl } from "@/infrastructure/storage/r2.service";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const data = await getCurrentUser();
  if (!data) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  if (!body || typeof body.contentType !== "string" || typeof body.maxSize !== "number") {
    return NextResponse.json(
      { error: "Campos requeridos: contentType, maxSize." },
      { status: 400 },
    );
  }

  const { contentType, maxSize } = body;

  // ✅ Valida MIME — apenas imagens permitidas (allowlist server-side)
  const extension = ALLOWED_IMAGE_TYPES[contentType];
  if (!extension) {
    return NextResponse.json({ error: "Tipo de archivo no permitido." }, { status: 400 });
  }

  // ✅ Valida tamanho máximo no servidor (o cliente não decide o limite)
  if (!Number.isFinite(maxSize) || maxSize <= 0 || maxSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande." }, { status: 400 });
  }

  const organizationId = data.person?.organizationId;
  if (!organizationId) {
    return NextResponse.json({ error: "Sin organización activa." }, { status: 403 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { slug: true },
  });
  if (!organization) {
    return NextResponse.json({ error: "Sin permiso para esta organización." }, { status: 403 });
  }

  // ✅ Key montada 100% no servidor — o cliente nunca escolhe o caminho
  const key = `organizations/${organization.slug}/addresses/${randomUUID()}.${extension}`;

  try {
    const url = await generateUploadUrl(key, contentType);
    return NextResponse.json({ url, key });
  } catch {
    return NextResponse.json({ error: "Error al generar la URL de carga." }, { status: 500 });
  }
}
