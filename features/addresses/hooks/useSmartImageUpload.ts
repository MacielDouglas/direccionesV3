"use client";

import { useState } from "react";

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
  return new File([blob], `${crypto.randomUUID()}.jpg`, { type: "image/jpeg" });
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

async function resizeAndCompress(
  originalFile: File,
  onProgress: (p: number) => void,
): Promise<File> {
  if (!originalFile.type.startsWith("image/")) {
    throw new Error(`Tipo no soportado: ${originalFile.type || "desconocido"}`);
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
      onProgress,
    });

    if (compressed.size <= MAX_SIZE_MB * 1024 * 1024) break;
    quality -= 0.1;
    if (quality <= 0.4) break;
  }

  return new File([compressed], `${crypto.randomUUID()}.webp`, {
    type: "image/webp",
  });
}

export function useSmartImageUpload() {
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retorna o File processado — SEM fazer upload
  async function processImage(file: File): Promise<File | null> {
    setError(null);
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const heic = await normalizeHeic(file);
      const oriented = await fixOrientation(heic);
      const compressed = await resizeAndCompress(
        oriented,
        setProcessingProgress,
      );
      return compressed;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al procesar.";
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  return { processImage, processingProgress, isProcessing, error };
}
