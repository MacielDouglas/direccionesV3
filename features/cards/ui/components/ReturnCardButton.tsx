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
  const router = useRouter();

  const handleReturn = () => {
    startTransition(async () => {
      const result = await returnCardAction(cardId, organizationSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.admin.cardReturned.replace("{number}", String(cardNumber).padStart(2, "0")));
      router.refresh();
    });
  };

  const cardLabel = `#${String(cardNumber).padStart(2, "0")}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          disabled={isPending}
          aria-busy={isPending}
          aria-label={`${t.admin.returnCard} ${cardLabel}`}
        >
          <Undo2 className="size-4 mr-1.5" aria-hidden />
          {isPending ? t.admin.returningCard : t.admin.returnCard}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t.admin.returnConfirmTitle.replace("{number}", cardLabel)}
          </AlertDialogTitle>
          <AlertDialogDescription>{t.admin.returnConfirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReturn}
            disabled={isPending}
            aria-busy={isPending}
            className="gap-2"
          >
            <Undo2 className="size-4" aria-hidden />
            {isPending ? t.admin.returningCard : t.admin.confirmReturn}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
