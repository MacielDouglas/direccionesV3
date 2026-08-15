export async function deleteImage(key: string): Promise<void> {
  const res = await fetch("/api/delete-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  if (!res.ok) {
    throw new Error(`[deleteImage] Error al eliminar imagen: ${res.status}`);
  }
}
