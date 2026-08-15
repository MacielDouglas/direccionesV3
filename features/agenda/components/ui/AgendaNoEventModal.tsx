"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CalendarX } from "lucide-react";

interface Props {
  open: boolean;
  dateLabel: string;
  onClose: () => void;
}

export function AgendaNoEventModal({ open, dateLabel, onClose }: Props) {
  const { t } = useI18n();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-xs rounded-2xl text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <CalendarX className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <DialogTitle className="tracking-tight">{t.agenda.noEventTitle}</DialogTitle>
          <DialogDescription>
            {t.agenda.noEventDescription.replace("{date}", dateLabel)}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
