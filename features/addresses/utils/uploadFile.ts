export async function uploadFile(
  file: File,
  organizationId: string,
  onProgress: (p: number) => void,
): Promise<{ key: string; publicUrl: string }> {
  const key = `organizations/${organizationId}/addresses/${file.name}`;

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
