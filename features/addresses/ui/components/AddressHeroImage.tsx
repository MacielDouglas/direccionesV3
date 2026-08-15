"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { MapPin, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { ReactNode } from "react";

type Props = {
  src: string;
  alt: string;
  name: string;
  street: string;
  typeLabel: string;
  typeIcon: ReactNode;
};

export function AddressHeroImage({ src, alt, name, street, typeLabel, typeIcon }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <figure className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
            aria-hidden="true"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {typeIcon}
            {typeLabel}
          </span>
          <figcaption className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-lg font-semibold text-white">{name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{street}</span>
            </p>
          </figcaption>
        </figure>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="h-dvh max-w-none rounded-none border-none bg-black p-0 w-screen overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t.addresses.imageViewerTitle}</DialogTitle>
          <DialogDescription>{t.addresses.imageViewerDescription}</DialogDescription>
        </DialogHeader>

        {/* ✅ Container relativo — botão e imagem dentro do mesmo contexto */}
        <div className="relative h-full w-full">
          <Image src={src} alt={alt} fill priority sizes="100vw" className="object-contain" />

          {/* ✅ absolute dentro do container, não fixed */}
          <Button
            size="icon"
            variant="ghost"
            aria-label={t.addresses.imageCloseAria}
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
