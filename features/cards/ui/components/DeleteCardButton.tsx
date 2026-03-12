"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCardAction } from "../../application/card.actions";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  cardId: string;
  cardNumber: number;
  organizationSlug: string;
}

export function DeleteCardButton({
  cardId,
  cardNumber,
  organizationSlug,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCardAction(cardId, organizationSlug);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Tarjeta #${String(cardNumber).padStart(2, "0")} borrada.`);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          aria-label={`Borrar tarjeta #${String(cardNumber).padStart(2, "0")}`}
        >
          <Trash2 className="size-4 mr-1.5" aria-hidden />
          Borrar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            ¿Borrar Tarjeta #{String(cardNumber).padStart(2, "0")}?
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Las direcciones vinculadas
            quedarán disponibles nuevamente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              "Sí, borrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
