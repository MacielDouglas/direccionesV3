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

type Props = {
  src: string;
  alt: string;
  // children?: React.ReactNode;
};

export function AddressImageViewer({ src, alt }: Props) {
  return (
    <Dialog>
      <figure className="relative w-full h-40 sm:h-80 md:h-96">
        <DialogTrigger asChild>
          <Image
            src={src}
            alt={alt}
            fill
            priority
            className="object-cover cursor-pointer rounded-xl"
            sizes="100vw"
          />
        </DialogTrigger>
        {/* {children} */}

        <DialogTrigger asChild>
          {/* <Button
            size="sm"
            className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white"
          >
            Ver imagen
          </Button> */}
        </DialogTrigger>
      </figure>

      <DialogContent
        className="
          p-0
          border-none
          bg-black
          max-w-none
          w-screen
          h-screen
          rounded-none
        "
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Visualização da imagem</DialogTitle>
          <DialogDescription>
            Visualização ampliada da imagem do endereço.
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />

          {/* <DialogTitle className="">{alt}</DialogTitle> */}
          <DialogClose asChild>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-40 right-6 border-2"
            >
              Cerrar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
