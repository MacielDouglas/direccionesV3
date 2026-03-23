"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { assignCardAction } from "../../application/card.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  user: { id: string; name: string; email: string; image: string | null };
}

interface Props {
  cardId: string;
  cardNumber: number;
  members: Member[];
  organizationSlug: string;
  open: boolean;
  onClose: () => void;
}

export function AssignCardModal({
  cardId,
  cardNumber,
  members,
  organizationSlug,
  open,
  onClose,
}: Props) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAssign = () => {
    if (!selectedUserId) return;
    startTransition(async () => {
      const result = await assignCardAction(
        cardId,
        selectedUserId,
        organizationSlug,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `¡Tarjeta #${String(cardNumber).padStart(2, "0")} asignada exitosamente!`,
      );
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>
            Atribuir Card #{String(cardNumber).padStart(2, "0")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2 max-h-64 overflow-y-auto">
          {members.map(({ user }) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${
                  selectedUserId === user.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
            >
              <Avatar className="size-6 shrink-0">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* <UserCircle
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              /> */}
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              </span>
            </button>
          ))}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUserId || isPending}
            aria-busy={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Atribuindo..." : "Atribuir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
