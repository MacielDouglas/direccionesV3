"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccountAction } from "@/server/organization/delete-account.action";
// import { deleteAccountAction } from "@/server/delete-account.action";

export function DeleteAccountButton({ userEmail }: { userEmail: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const isConfirmed = confirmText === userEmail;

  async function handleDelete() {
    if (!isConfirmed) return;
    try {
      setIsLoading(true);
      await deleteAccountAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir.");
      setIsLoading(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="size-4" aria-hidden />
          Eliminar mi cuenta
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar la cuenta permanentemente?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-3">
              <p>
                Esta acción es <strong>irreversible</strong>. Tus datos de
                inicio de sesión, memberships y historial serán eliminados. Las
                direcciones y tarjetas que hayas creado se conservarán.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-email" className="text-sm">
                  Introduce tu correo electrónico para confirmar:{" "}
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
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => setConfirmText("")}
          >
            Cancelar
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
            Eliminar permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
