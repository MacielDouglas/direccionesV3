export async function uploadFile(
  file: File,
  _organizationSlug: string,
  onProgress: (p: number) => void,
): Promise<{ key: string; publicUrl: string }> {
  // ✅ Key é gerada no servidor (app/api/upload-url) — o cliente nunca escolhe o caminho
  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, maxSize: file.size }),
  });

  if (!res.ok) throw new Error(`Error al obtener URL firmada: ${res.status}`);
  const { url, key } = await res.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject());
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
    return;
  }

  // ✅ PROTEÇÃO — só deleta pasta organizations
  if (!imageKey.startsWith("organizations/")) {
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
