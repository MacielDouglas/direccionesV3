"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { returnCardAction } from "../../application/card.actions";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

interface Props {
  cardId: string;
  cardNumber: number;
  organizationSlug: string;
  variant?: "default" | "outline" | "destructive";
}

export function ReturnCardButton({
  cardId,
  cardNumber,
  organizationSlug,
  variant = "outline",
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleReturn = () => {
    startTransition(async () => {
      const result = await returnCardAction(cardId, organizationSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `Tarjeta #${String(cardNumber).padStart(2, "0")} devolvido.`,
      );
    });
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleReturn}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={`Retornar tarjeta #${String(cardNumber).padStart(2, "0")}`}
    >
      <Undo2 className="size-4 mr-1.5" aria-hidden />
      {isPending ? "Retornando..." : "Retornar"}
    </Button>
  );
}
