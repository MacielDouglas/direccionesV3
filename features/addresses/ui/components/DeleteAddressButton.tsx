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
  const router = useRouter();
  const { t } = useI18n();

  if (isPendingDeletion) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t.addresses.pendingDeletionNotice}
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
      toast.success(t.addresses.deletionRequested);
      setOpen(false);
      router.back();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full gap-2">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t.addresses.deleteAddress}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.addresses.deleteAddressTitle}</DialogTitle>
          <DialogDescription>{t.addresses.deleteAddressDescription}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              {t.common.cancel}
            </Button>
          </DialogClose>

          <Button variant="destructive" disabled={isPending} onClick={handleConfirm}>
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
