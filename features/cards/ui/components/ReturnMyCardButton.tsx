"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { returnMyCardAction } from "../../application/card.actions";

interface Props {
  cardId: string;
  cardNumber: number;
  organizationSlug: string;
  className?: string;
}

export function ReturnMyCardButton({ cardId, cardNumber, organizationSlug, className }: Props) {
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();
  const router = useRouter();

  const handleReturn = () => {
    startTransition(async () => {
      const result = await returnMyCardAction(cardId, organizationSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.cards.cardReturned.replace("{number}", String(cardNumber).padStart(2, "0")));
      router.refresh();
    });
  };

  const cardLabel = `#${String(cardNumber).padStart(2, "0")}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className={`h-auto min-h-11 w-full whitespace-normal py-2.5 text-center leading-snug ${className ?? ""}`}
          disabled={isPending}
          aria-busy={isPending}
          aria-label={`${t.cards.returnCard} ${cardLabel}`}
        >
          <Undo2 className="size-4" aria-hidden />
          <span>{isPending ? t.cards.returningCard : t.cards.returnCard}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t.cards.returnConfirmTitle.replace("{number}", cardLabel)}
          </AlertDialogTitle>
          <AlertDialogDescription>{t.cards.returnConfirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReturn}
            disabled={isPending}
            aria-busy={isPending}
            className="h-auto min-h-11 gap-2 whitespace-normal py-2.5 text-center leading-snug"
          >
            <Undo2 className="size-4" aria-hidden />
            <span>{isPending ? t.cards.returningCard : t.cards.confirmReturn}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
