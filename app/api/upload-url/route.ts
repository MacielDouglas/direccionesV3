import { generateUploadUrl } from "@/infrastructure/storage/r2.service";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  if (
    !body ||
    typeof body.key !== "string" ||
    typeof body.contentType !== "string" ||
    typeof body.maxSize !== "number"
  ) {
    return NextResponse.json(
      { error: "Campos requeridos: key, contentType, maxSize." },
      { status: 400 },
    );
  }

  const { key, contentType } = body;

  // ✅ Valida MIME — apenas imagens permitidas
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido." }, { status: 400 });
  }

  // ✅ Valida tamanho máximo antes de assinar a URL
  if (body.maxSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande." }, { status: 400 });
  }

  // ✅ Escopo por organização — key DEVE pertencer à org ativa do usuário logado
  if (!key.startsWith("organizations/")) {
    return NextResponse.json({ error: "Ruta inválida." }, { status: 403 });
  }

  const activeMember = await auth.api.getActiveMember({ headers: reqHeaders });
  if (!activeMember?.organizationId) {
    return NextResponse.json({ error: "Sin organización activa." }, { status: 403 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: activeMember.organizationId },
    select: { slug: true },
  });
  if (!organization || !key.startsWith(`organizations/${organization.slug}/`)) {
    return NextResponse.json({ error: "Sin permiso para esta organización." }, { status: 403 });
  }

  try {
    const url = await generateUploadUrl(key, contentType);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Error al generar la URL de carga." }, { status: 500 });
  }
}
