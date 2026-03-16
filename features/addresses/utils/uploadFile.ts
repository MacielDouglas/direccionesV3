export async function uploadFile(
  file: File,
  organizationSlug: string,
  onProgress: (p: number) => void,
): Promise<{ key: string; publicUrl: string }> {
  const key = `organizations/${organizationSlug}/addresses/${file.name}`;

  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, contentType: file.type }),
  });

  if (!res.ok) throw new Error(`Error al obtener URL firmada: ${res.status}`);
  const { url } = await res.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject();
    xhr.onerror = reject;
    xhr.send(file);
  });

  return {
    key,
    publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`,
  };
}

export async function deleteFile(imageKey: string): Promise<void> {
  // ✅ PROTEÇÃO — nunca deleta pasta security
  if (imageKey.startsWith("security/")) {
    console.warn("🔒 DELETE BLOQUEADO — imagem protegida:", imageKey);
    return;
  }

  // ✅ PROTEÇÃO — só deleta pasta organizations
  if (!imageKey.startsWith("organizations/")) {
    console.warn("🔒 DELETE BLOQUEADO — key fora de organizations:", imageKey);
    return;
  }

  const res = await fetch("/api/delete-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: imageKey }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete ${imageKey}: ${res.status} ${error}`);
  }
}
