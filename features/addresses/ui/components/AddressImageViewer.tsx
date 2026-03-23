"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

type Props = { src: string; alt: string };

export function AddressImageViewer({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <figure className="relative h-40 w-full sm:h-80 md:h-96">
        <DialogTrigger asChild>
          <Image
            src={src}
            alt={alt}
            fill
            priority
            className="cursor-pointer rounded-xl object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </DialogTrigger>
      </figure>

      <DialogContent
        showCloseButton={false}
        className="h-dvh max-w-none rounded-none border-none bg-black p-0 w-screen overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Visualización de imagen</DialogTitle>
          <DialogDescription>
            Vista ampliada de la imagen de la dirección.
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Container relativo — botão e imagem dentro do mesmo contexto */}
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />

          {/* ✅ absolute dentro do container, não fixed */}
          <Button
            size="icon"
            variant="ghost"
            aria-label="Cerrar imagen"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 z-50 rounded-full
              bg-black/60 text-white hover:bg-black/80
              backdrop-blur-sm shadow-lg
              size-10 shrink-0"
            style={{
              // ✅ Respeita notch do iOS
              top: "max(0.75rem, env(safe-area-inset-top, 0.75rem))",
              right: "max(0.75rem, env(safe-area-inset-right, 0.75rem))",
            }}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
