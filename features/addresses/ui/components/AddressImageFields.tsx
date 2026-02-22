"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { Camera, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import { AddressFormData } from "../../domain/address.schema";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";
import { useSmartImageUpload } from "../../hooks/useSmartImageUpload";

interface Props {
  organizationId: string;
}

export default function AddressImageField({ organizationId }: Props) {
  const { watch, setValue, control } = useFormContext<AddressFormData>();

  const addressType = watch("addressType");
  const preview = watch("image.imageUrl");
  const isCustomImage = watch("image.isCustomImage");

  const inputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);

  const {
    processAndUpload,
    cancelUpload,
    processingProgress,
    uploadProgress,
    isProcessing,
    isUploading,
  } = useSmartImageUpload();

  /* ------------------------------------------ */
  /* Default image por tipo                    */
  /* ------------------------------------------ */

  useEffect(() => {
    if (isCustomImage) return;

    const defaultImage = getDefaultAddressImage(addressType);
    if (defaultImage) {
      setValue("image.imageUrl", defaultImage);
    }
  }, [addressType, isCustomImage, setValue]);

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      const localUrl = URL.createObjectURL(file);
      setValue("image.imageUrl", localUrl);
      setValue("image.isCustomImage", true);

      const uploadedUrl = await processAndUpload(file, organizationId);

      if (uploadedUrl) {
        URL.revokeObjectURL(localUrl);
        setValue("image.imageUrl", uploadedUrl);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ------------------------------------------ */
  /* Remove image                              */
  /* ------------------------------------------ */

  function handleRemove() {
    cancelUpload();

    const defaultImage = getDefaultAddressImage(addressType);

    setValue("image.imageFile", undefined);
    setValue("image.imageUrl", defaultImage ?? undefined);
    setValue("image.isCustomImage", false);
  }

  /* ------------------------------------------ */
  /* Drag & Drop                               */
  /* ------------------------------------------ */

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  return (
    <section className="space-y-4 border-b p-4">
      <header>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="text-orange-500 w-6 h-6" />
          Imagen del lugar
        </h2>
        <p className="text-xs text-muted-foreground">
          Toca, arrastra o toma una foto.
        </p>
      </header>

      <FormField
        control={control}
        name="image.imageUrl"
        render={() => (
          <FormItem>
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              className={`relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center overflow-hidden
              ${
                dragActive ? "border-orange-500 bg-orange-50" : "border-muted"
              }`}
            >
              {/* ---------------- Preview ---------------- */}

              {preview && (
                <Image
                  src={preview}
                  alt="Imagen"
                  fill
                  className="object-cover"
                />
              )}

              {/* ---------------- Placeholder ------------- */}

              {!preview && !isProcessing && (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span className="text-sm">Subir imagen</span>
                </div>
              )}

              {/* ---------------- Skeleton --------------- */}

              {isProcessing && (
                <div className="absolute inset-0 animate-pulse bg-muted" />
              )}

              {/* ---------------- Overlay Progress -------- */}

              {(isProcessing || isUploading) && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-3 p-4">
                  <p className="text-sm font-medium">
                    {isProcessing
                      ? `Procesando ${processingProgress}%`
                      : `Enviando ${uploadProgress}%`}
                  </p>

                  <progress
                    value={isProcessing ? processingProgress : uploadProgress}
                    max={100}
                    className="w-full"
                  />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelUpload();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {/* ---------------- Remove Button ---------- */}

              {isCustomImage && !isUploading && (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                >
                  Remover
                </Button>
              )}
            </div>

            {/* Hidden Input */}

            <input
              ref={inputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </FormItem>
        )}
      />
    </section>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useFormContext } from "react-hook-form";
// import { FormField, FormItem } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { Camera } from "lucide-react";
// import imageCompression from "browser-image-compression";
// import heic2any from "heic2any";
// import { AddressFormData } from "../../domain/address.schema";
// import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";

// const MAX_SIZE_MB = 5;

// export default function AddressImageField() {
//   const { control, watch, setValue } = useFormContext<AddressFormData>();

//   const addressType = watch("addressType");
//   const isCustomImage = watch("image.isCustomImage");
//   const preview = watch("image.imageUrl");

//   const inputRef = useRef<HTMLInputElement>(null);
//   const cameraRef = useRef<HTMLInputElement>(null);

//   const [processingProgress, setProcessingProgress] = useState(0);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);

//   /**
//    * Atualiza imagem default
//    */
//   useEffect(() => {
//     if (isCustomImage) return;

//     const defaultImage = getDefaultAddressImage(addressType);
//     if (defaultImage) {
//       setValue("image.imageUrl", defaultImage);
//     }
//   }, [addressType, isCustomImage, setValue]);

//   /**
//    * Converte HEIC → JPEG
//    */
//   async function convertHeicIfNeeded(file: File): Promise<File> {
//     if (!file.type.includes("heic") && !file.name.endsWith(".heic")) {
//       return file;
//     }

//     const converted = await heic2any({
//       blob: file,
//       toType: "image/jpeg",
//       quality: 0.9,
//     });

//     return new File([converted as Blob], "converted.jpg", {
//       type: "image/jpeg",
//     });
//   }

//   /**
//    * Compress + converte para WebP
//    */
//   async function compressToWebp(file: File): Promise<File> {
//     const options = {
//       maxSizeMB: MAX_SIZE_MB,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//       fileType: "image/webp",
//       onProgress: (progress: number) => {
//         setProcessingProgress(progress);
//       },
//     };

//     const compressed = await imageCompression(file, options);

//     return new File([compressed], `${crypto.randomUUID()}.webp`, {
//       type: "image/webp",
//     });
//   }

//   /**
//    * Upload com progress real via XHR
//    */
//   async function uploadWithProgress(file: File) {
//     setIsUploading(true);

//     const key = `organizations/demo/addresses/${file.name}`;

//     const res = await fetch("/api/upload-url", {
//       method: "POST",
//       body: JSON.stringify({
//         key,
//         contentType: file.type,
//       }),
//     });

//     const { url } = await res.json();

//     await new Promise<void>((resolve, reject) => {
//       const xhr = new XMLHttpRequest();
//       xhr.open("PUT", url);

//       xhr.upload.onprogress = (event) => {
//         if (event.lengthComputable) {
//           const percent = Math.round((event.loaded / event.total) * 100);
//           setUploadProgress(percent);
//         }
//       };

//       xhr.onload = () => resolve();
//       xhr.onerror = () => reject();

//       xhr.setRequestHeader("Content-Type", file.type);
//       xhr.send(file);
//     });

//     setIsUploading(false);

//     const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

//     return publicUrl;
//   }

//   /**
//    * Pipeline completo
//    */
//   const handleFile = async (file?: File) => {
//     if (!file) return;

//     try {
//       setIsProcessing(true);
//       setProcessingProgress(0);

//       const heicConverted = await convertHeicIfNeeded(file);
//       const webpFile = await compressToWebp(heicConverted);

//       setIsProcessing(false);

//       const previewUrl = URL.createObjectURL(webpFile);
//       setValue("image.imageUrl", previewUrl);
//       setValue("image.isCustomImage", true);

//       const uploadedUrl = await uploadWithProgress(webpFile);
//       setValue("image.imageUrl", uploadedUrl);
//     } catch (err) {
//       console.error(err);
//       setIsProcessing(false);
//       setIsUploading(false);
//     }
//   };

//   const handleRemove = () => {
//     const defaultImage = getDefaultAddressImage(addressType);
//     setValue("image.imageUrl", defaultImage ?? undefined);
//     setValue("image.isCustomImage", false);
//   };

//   return (
//     <section className="space-y-4 border-b p-4">
//       <header>
//         <h2 className="text-lg font-semibold flex items-center gap-2">
//           <Camera className="text-orange-500 w-6 h-6" />
//           Imagen del lugar
//         </h2>
//         <p className="text-xs text-muted-foreground">
//           Toma una foto o sube una imagen.
//         </p>
//       </header>

//       <FormField
//         control={control}
//         name="image.imageUrl"
//         render={() => (
//           <FormItem className="space-y-4">
//             {preview && (
//               <div className="relative w-full aspect-square rounded-xl overflow-hidden">
//                 <Image
//                   src={preview}
//                   alt="Preview"
//                   fill
//                   className="object-cover"
//                 />

//                 {(isProcessing || isUploading) && (
//                   <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
//                     {isProcessing && (
//                       <>
//                         <p className="text-sm mb-2">
//                           Procesando {processingProgress}%
//                         </p>
//                         <progress
//                           value={processingProgress}
//                           max={100}
//                           className="w-2/3"
//                         />
//                       </>
//                     )}

//                     {isUploading && (
//                       <>
//                         <p className="text-sm mb-2">
//                           Enviando {uploadProgress}%
//                         </p>
//                         <progress
//                           value={uploadProgress}
//                           max={100}
//                           className="w-2/3"
//                         />
//                       </>
//                     )}
//                   </div>
//                 )}

//                 {isCustomImage && !isUploading && (
//                   <Button
//                     type="button"
//                     size="sm"
//                     variant="destructive"
//                     className="absolute top-2 right-2"
//                     onClick={handleRemove}
//                   >
//                     Remover
//                   </Button>
//                 )}
//               </div>
//             )}

//             <div className="grid grid-cols-2 gap-3">
//               <Button
//                 type="button"
//                 className="h-12 text-base"
//                 onClick={() => cameraRef.current?.click()}
//               >
//                 📷 Foto
//               </Button>

//               <Button
//                 type="button"
//                 variant="outline"
//                 className="h-12 text-base"
//                 onClick={() => inputRef.current?.click()}
//               >
//                 🖼️ Galería
//               </Button>
//             </div>

//             <input
//               ref={cameraRef}
//               type="file"
//               accept="image/*,.heic,.heif"
//               capture="environment"
//               className="hidden"
//               onChange={(e) => handleFile(e.target.files?.[0])}
//             />

//             <input
//               ref={inputRef}
//               type="file"
//               accept="image/*,.heic,.heif"
//               className="hidden"
//               onChange={(e) => handleFile(e.target.files?.[0])}
//             />
//           </FormItem>
//         )}
//       />
//     </section>
//   );
// }

// "use client";

// import { useEffect, useRef } from "react";
// import { useFormContext } from "react-hook-form";
// import { FormField, FormItem } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { Camera } from "lucide-react";
// import { AddressFormData } from "../../domain/address.schema";
// import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";

// export default function AddressImageField() {
//   const { control, watch, setValue } = useFormContext<AddressFormData>();

//   const addressType = watch("addressType");
//   const isCustomImage = watch("image.isCustomImage");

//   const inputRef = useRef<HTMLInputElement>(null);
//   const cameraRef = useRef<HTMLInputElement>(null);

//   const preview = watch("image.imageUrl");

//   /**
//    * ✅ Atualiza imagem padrão quando muda o tipo
//    */
//   useEffect(() => {
//     if (isCustomImage) return;

//     const defaultImage = getDefaultAddressImage(addressType);

//     if (defaultImage) {
//       // setPreview(defaultImage);
//       setValue("image.imageUrl", defaultImage);
//     }
//   }, [addressType, isCustomImage, setValue]);

//   /**
//    * Upload imagem
//    */
//   const handleFile = async (file?: File) => {
//     if (!file) return;

//     const previewUrl = URL.createObjectURL(file);

//     setValue("image.imageFile", file);
//     setValue("image.imageUrl", previewUrl);
//     setValue("image.isCustomImage", true);
//   };

//   /**
//    * Remover imagem custom
//    */
//   const handleRemove = () => {
//     const defaultImage = getDefaultAddressImage(addressType);

//     setValue("image.imageFile", undefined);
//     setValue("image.imageUrl", defaultImage ?? undefined);
//     setValue("image.isCustomImage", false);
//   };

//   return (
//     <section className="space-y-4 border-b p-5 pb-5">
//       <header>
//         <h2 className="text-xl font-semibold inline-flex gap-1 items-center">
//           <Camera className="text-orange-500 w-7 h-7" /> Imagen del lugar
//         </h2>
//         <p className="text-sm text-muted-foreground">
//           Puedes tomar una foto o subir una desde tu galería.
//         </p>
//       </header>

//       <FormField
//         control={control}
//         name="image.imageUrl"
//         render={() => (
//           <FormItem className="space-y-3">
//             {preview && (
//               <div className="relative w-full h-96">
//                 <Image
//                   src={preview}
//                   alt="Imagen del lugar"
//                   fill
//                   className="object-cover rounded-xl"
//                 />

//                 {isCustomImage && (
//                   <Button
//                     type="button"
//                     size="sm"
//                     variant="destructive"
//                     className="absolute top-2 right-2"
//                     onClick={handleRemove}
//                   >
//                     Remover
//                   </Button>
//                 )}
//               </div>
//             )}

//             <div className="flex gap-2 justify-center">
//               <Button type="button" onClick={() => cameraRef.current?.click()}>
//                 📷 Foto
//               </Button>

//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => inputRef.current?.click()}
//               >
//                 🖼️ Galería
//               </Button>
//             </div>

//             <input
//               ref={cameraRef}
//               type="file"
//               accept="image/*"
//               capture="environment"
//               className="hidden"
//               onChange={(e) => handleFile(e.target.files?.[0])}
//             />

//             <input
//               ref={inputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => handleFile(e.target.files?.[0])}
//             />
//           </FormItem>
//         )}
//       />
//     </section>
//   );
// }
