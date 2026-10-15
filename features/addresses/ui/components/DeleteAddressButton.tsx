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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { requestAddressDeletionAction } from "../../application/address.actions";

export default function DeleteAddressButton({
  addressId,
  isPendingDeletion,
}: {
  addressId: string;
  isPendingDeletion?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();
  const { t } = useI18n();

  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length >= 3;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setReason("");
  }

  if (isPendingDeletion) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t.addresses.pendingDeletionNotice}
      </div>
    );
  }

  function handleConfirm() {
    if (isPending || !isReasonValid) return;
    startTransition(async () => {
      const result = await requestAddressDeletionAction(addressId, trimmedReason);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.addresses.deletionRequested);
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="min-h-11 w-full gap-2">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t.addresses.deleteAddress}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.addresses.deleteAddressTitle}</DialogTitle>
          <DialogDescription>{t.addresses.deleteAddressDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deletion-reason">{t.addresses.deletionReasonLabel}</Label>
          <Textarea
            id="deletion-reason"
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t.addresses.deletionReasonPlaceholder}
            aria-invalid={reason.length > 0 && !isReasonValid}
            aria-describedby={
              reason.length > 0 && !isReasonValid ? "deletion-reason-hint" : undefined
            }
          />
          {reason.length > 0 && !isReasonValid ? (
            <p id="deletion-reason-hint" role="alert" className="text-xs text-destructive">
              {t.addresses.deletionReasonInvalid}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              {t.common.cancel}
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            disabled={isPending || !isReasonValid}
            onClick={handleConfirm}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              t.addresses.requestDeletion
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
