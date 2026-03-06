"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCardAction } from "../../application/card.actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `¿Borrar Tarjeta #${String(cardNumber).padStart(2, "0")}? Esta acción no se puede deshacer..`,
      )
    )
      return;

    startTransition(async () => {
      const result = await deleteCardAction(cardId, organizationSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Tarteja #${String(cardNumber).padStart(2, "0")} borrada.`);
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={`Borrar tarjeta #${String(cardNumber).padStart(2, "0")}`}
    >
      <Trash2 className="size-4 mr-1.5" aria-hidden />
      {isPending ? "Borrando..." : "Borrar"}
    </Button>
  );
}
