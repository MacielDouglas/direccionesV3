export async function uploadAddressImage(
  file: File,
  params: { organizationId: string },
) {
  const key = `organizations/${params.organizationId}/addresses/${crypto.randomUUID()}.jpg`;

  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, contentType: file.type }),
  });

  if (!res.ok) {
    throw new Error(
      `[uploadAddressImage] Error al obtener URL firmada: ${res.status}`,
    );
  }

  const { url } = await res.json();

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadRes.ok) {
    throw new Error(
      `[uploadAddressImage] Error al subir imagen: ${uploadRes.status}`,
    );
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

  return { key, publicUrl };
}

export async function deleteImage(key: string): Promise<void> {
  const res = await fetch("/api/delete-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  if (!res.ok) {
    console.error(`[deleteImage] Error al eliminar imagen: ${res.status}`);
  }
}
