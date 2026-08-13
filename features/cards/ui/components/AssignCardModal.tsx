"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { assignCardAction } from "../../application/card.actions";

interface Person {
  id: string;
  name: string;
  role: string | null;
  organizationId: string | null;
  user: { id: string; name: string; email: string; image: string | null } | null;
}

interface Props {
  cardId: string;
  cardNumber: number;
  persons: Person[];
  organizationSlug: string;
  open: boolean;
  onClose: () => void;
}

export function AssignCardModal({
  cardId,
  cardNumber,
  persons,
  organizationSlug,
  open,
  onClose,
}: Props) {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleAssign = () => {
    if (!selectedPersonId) return;
    startTransition(async () => {
      const result = await assignCardAction(cardId, selectedPersonId, organizationSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.cards.assignSuccess);
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>
            {t.admin.assignTitle.replace("{number}", String(cardNumber).padStart(2, "0"))}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2 max-h-64 overflow-y-auto">
          {persons.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setSelectedPersonId(person.id)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${
                  selectedPersonId === person.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
            >
              <Avatar className="size-6 shrink-0">
                <AvatarImage src={person.user?.image ?? undefined} />
                <AvatarFallback>{person.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{person.name}</span>
                {person.user?.email && (
                  <span className="text-xs text-muted-foreground truncate">
                    {person.user.email}
                  </span>
                )}
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
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedPersonId || isPending}
            aria-busy={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? t.admin.assigning : t.admin.assignVerb}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
