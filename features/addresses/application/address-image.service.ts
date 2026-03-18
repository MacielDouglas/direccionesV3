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
