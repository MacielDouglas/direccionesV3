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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { deleteAccountAction } from "@/server/organization/delete-account.action";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteAccountButton({ userEmail }: { userEmail: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const isConfirmed = confirmText === userEmail;

  async function handleDelete() {
    if (!isConfirmed) return;
    try {
      setIsLoading(true);
      await deleteAccountAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.user.deleteAccountError);
      setIsLoading(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="size-4" aria-hidden />
          {t.user.deleteAccount}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.user.deleteAccountTitle}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-3">
              <p>{t.user.deleteAccountIrreversible}</p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-email" className="text-sm">
                  {t.user.confirmEmailLabel}{" "}
                  <span className="font-mono text-foreground">{userEmail}</span>
                </Label>
                <Input
                  id="confirm-email"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={userEmail}
                  autoComplete="off"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={() => setConfirmText("")}>
            {t.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className="bg-destructive hover:bg-destructive/90 gap-2"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
            {t.user.deletePermanently}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
