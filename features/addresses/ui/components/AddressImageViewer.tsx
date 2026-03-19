"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = { src: string; alt: string };

export function AddressImageViewer({ src, alt }: Props) {
  return (
    <Dialog>
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

      <DialogContent className="h-screen max-w-none rounded-none border-none bg-black p-0 w-screen">
        <DialogHeader className="sr-only">
          <DialogTitle>Visualización de imagen</DialogTitle>
          <DialogDescription>
            Vista ampliada de la imagen de la dirección.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />

          <DialogClose asChild>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Cerrar imagen"
              className="absolute right-10 top-20 rounded-full opacity-80 hover:opacity-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
