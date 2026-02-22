export async function uploadAddressImage(
  file: File,
  params: { organizationId: string },
) {
  const key = `organizations/${params.organizationId}/addresses/${crypto.randomUUID()}.jpg`;

  const res = await fetch("/api/upload-url", {
    method: "POST",
    body: JSON.stringify({
      key,
      contentType: file.type,
    }),
  });

  const { url } = await res.json();

  await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

  console.log(publicUrl);

  return {
    key,
    publicUrl,
  };
}

export async function deleteImage(key: string) {
  await fetch("/api/delete-image", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}
