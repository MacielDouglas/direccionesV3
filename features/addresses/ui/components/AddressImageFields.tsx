"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Camera } from "lucide-react";
import { AddressFormData } from "../../domain/address.schema";
import { getDefaultAddressImage } from "../../utils/getDefaultAddressImage";

export default function AddressImageField() {
  const { control, watch, setValue } = useFormContext<AddressFormData>();

  const addressType = watch("addressType");
  const isCustomImage = watch("image.isCustomImage");

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const preview = watch("image.imageUrl");

  /**
   * ✅ Atualiza imagem padrão quando muda o tipo
   */
  useEffect(() => {
    if (isCustomImage) return;

    const defaultImage = getDefaultAddressImage(addressType);

    if (defaultImage) {
      // setPreview(defaultImage);
      setValue("image.imageUrl", defaultImage);
    }
  }, [addressType, isCustomImage, setValue]);

  /**
   * Upload imagem
   */
  const handleFile = async (file?: File) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setValue("image.imageFile", file);
    setValue("image.imageUrl", previewUrl);
    setValue("image.isCustomImage", true);
  };

  /**
   * Remover imagem custom
   */
  const handleRemove = () => {
    const defaultImage = getDefaultAddressImage(addressType);

    setValue("image.imageFile", undefined);
    setValue("image.imageUrl", defaultImage ?? undefined);
    setValue("image.isCustomImage", false);
  };

  return (
    <section className="space-y-4 border-b p-5 pb-5">
      <header>
        <h2 className="text-xl font-semibold inline-flex gap-1 items-center">
          <Camera className="text-orange-500 w-7 h-7" /> Imagen del lugar
        </h2>
        <p className="text-sm text-muted-foreground">
          Puedes tomar una foto o subir una desde tu galería.
        </p>
      </header>

      <FormField
        control={control}
        name="image.imageUrl"
        render={() => (
          <FormItem className="space-y-3">
            {preview && (
              <div className="relative w-full h-96">
                <Image
                  src={preview}
                  alt="Imagen del lugar"
                  fill
                  className="object-cover rounded-xl"
                />

                {isCustomImage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={handleRemove}
                  >
                    Remover
                  </Button>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button type="button" onClick={() => cameraRef.current?.click()}>
                📷 Foto
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                🖼️ Galería
              </Button>
            </div>

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </FormItem>
        )}
      />
    </section>
  );
}
