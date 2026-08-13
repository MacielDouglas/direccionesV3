"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Undo2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { returnCardAction } from "../../application/card.actions";

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
  const { t } = useI18n();

  const handleReturn = () => {
    startTransition(async () => {
      const result = await returnCardAction(cardId, organizationSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.admin.cardReturned.replace("{number}", String(cardNumber).padStart(2, "0")));
    });
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleReturn}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={`${t.admin.returnCard} #${String(cardNumber).padStart(2, "0")}`}
    >
      <Undo2 className="size-4 mr-1.5" aria-hidden />
      {isPending ? t.admin.returningCard : t.admin.returnCard}
    </Button>
  );
}
