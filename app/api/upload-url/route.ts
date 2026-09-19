import { randomUUID } from "node:crypto";
import { generateUploadUrl } from "@/infrastructure/storage/r2.service";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/server/users";
import { NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const uploadUrlSchema = z
  .object({
    contentType: z.enum([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
      "image/heif",
    ]),
    maxSize: z.number().int().positive().max(MAX_FILE_SIZE),
  })
  .strict();

export async function POST(req: Request) {
  const data = await getCurrentUser();
  if (!data) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!checkRateLimit(`upload-url:${data.user.id}`, { max: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = uploadUrlSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Campos requeridos: contentType, maxSize." },
      { status: 400 },
    );
  }

  const { contentType } = parsed.data;
  const extension = ALLOWED_IMAGE_TYPES[contentType];

  const organizationId = data.person?.organizationId;
  if (!organizationId) {
    return NextResponse.json({ error: "Sin organización activa." }, { status: 403 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { slug: true },
  });
  if (!organization || !/^[a-z0-9-]+$/.test(organization.slug)) {
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
