"use client";

import { useRef, useState } from "react";

const MAX_SIZE_MB = 5;
const MAX_DIMENSION = 1920;

async function getImageCompression() {
  const mod = await import("browser-image-compression");
  return mod.default;
}

async function getHeic2Any() {
  const mod = await import("heic2any");
  return mod.default;
}

async function getExif() {
  return import("exifr");
}

export function useSmartImageUpload() {
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const uploadedKey = useRef<string | null>(null);

  async function normalizeHeic(file: File): Promise<File> {
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.(heic|heif)$/i.test(file.name);

    if (!isHeic) return file;

    const heic2any = await getHeic2Any();
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.95,
    });
    const blob = Array.isArray(converted) ? converted[0] : (converted as Blob);

    return new File([blob], `${crypto.randomUUID()}.jpg`, {
      type: "image/jpeg",
    });
  }

  async function fixOrientation(file: File): Promise<File> {
    const [imageCompression, exifr] = await Promise.all([
      getImageCompression(),
      getExif(),
    ]);

    try {
      const orientation = await exifr.orientation(file);
      if (!orientation || orientation === 1) return file;

      return imageCompression(file, {
        maxSizeMB: 50,
        useWebWorker: true,
        exifOrientation: orientation,
      });
    } catch {
      return file;
    }
  }

  async function resizeAndCompress(originalFile: File): Promise<File> {
    if (!originalFile) throw new Error("Archivo inválido.");
    if (!originalFile.type.startsWith("image/")) {
      throw new Error(
        `Tipo de archivo no soportado: ${originalFile.type || "desconocido"}`,
      );
    }

    const imageCompression = await getImageCompression();
    let quality = 0.9;
    let compressed = originalFile;

    while (true) {
      compressed = await imageCompression(compressed, {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_DIMENSION,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: quality,
        onProgress: (p) => setProcessingProgress(p),
      });

      if (compressed.size <= MAX_SIZE_MB * 1024 * 1024) break;

      quality -= 0.1;
      if (quality <= 0.4) break;
    }

    return new File([compressed], `${crypto.randomUUID()}.webp`, {
      type: "image/webp",
    });
  }

  async function uploadFile(file: File, key: string) {
    setIsUploading(true);
    abortController.current = new AbortController();

    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, contentType: file.type }),
    });

    if (!res.ok) throw new Error(`Error al generar URL firmada: ${res.status}`);

    const { url } = await res.json();

    await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
      signal: abortController.current.signal,
    });

    setUploadProgress(100);
    setIsUploading(false);
  }

  async function retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise((r) => setTimeout(r, 1000));
      return retry(fn, retries - 1);
    }
  }

  async function processAndUpload(
    file: File,
    organizationId: string,
  ): Promise<string | null> {
    setError(null);
    setIsProcessing(true);

    try {
      const heic = await normalizeHeic(file);
      const oriented = await fixOrientation(heic);
      const compressed = await resizeAndCompress(oriented);

      setIsProcessing(false);

      const key = `organizations/${organizationId}/addresses/${compressed.name}`;
      uploadedKey.current = key;

      await retry(() => uploadFile(compressed, key));

      return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
    } catch (err) {
      setIsProcessing(false);
      setIsUploading(false);
      const message =
        err instanceof Error ? err.message : "Error al procesar la imagen.";
      setError(message);
      return null;
    }
  }

  async function cancelUpload() {
    abortController.current?.abort();

    if (uploadedKey.current) {
      await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: uploadedKey.current }),
      });
      uploadedKey.current = null;
    }

    setUploadProgress(0);
    setProcessingProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
  }

  return {
    processAndUpload,
    cancelUpload,
    processingProgress,
    uploadProgress,
    isProcessing,
    isUploading,
    error,
  };
}
