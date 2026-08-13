"use client";

import { Button } from "@/components/ui/button";
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
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCardAction } from "../../application/card.actions";

interface Props {
  cardId: string;
  cardNumber: number;
  organizationSlug: string;
}

export function DeleteCardButton({ cardId, cardNumber, organizationSlug }: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCardAction(cardId, organizationSlug);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.admin.cardDeleted.replace("{number}", String(cardNumber).padStart(2, "0")));
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          aria-label={`${t.admin.deleteCard} #${String(cardNumber).padStart(2, "0")}`}
        >
          <Trash2 className="size-4 mr-1.5" aria-hidden />
          {t.admin.deleteCard}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t.admin.deleteCardTitle.replace("{number}", String(cardNumber).padStart(2, "0"))}
          </DialogTitle>
          <DialogDescription>{t.admin.deleteCardDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              {t.common.cancel}
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              t.admin.confirmDelete
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
