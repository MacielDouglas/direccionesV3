"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { requestAddressDeletionAction } from "../../application/address.actions";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteAddressButton({
  addressId,
  isPendingDeletion,
}: {
  addressId: string;
  isPendingDeletion?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (isPendingDeletion) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        Eliminación pendiente de aprobación por un administrador.
      </div>
    );
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await requestAddressDeletionAction(addressId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Solicitud de eliminación enviada.");
      setOpen(false);
      router.back();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full gap-2">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar dirección
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar esta dirección?</DialogTitle>
          <DialogDescription>
            Esta acción enviará una solicitud de eliminación a los
            administradores. La dirección quedará inactiva hasta que sea
            confirmada o cancelada.
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
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              "Sí, solicitar eliminación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
