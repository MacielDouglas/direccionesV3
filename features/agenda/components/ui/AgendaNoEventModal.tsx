"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CalendarX } from "lucide-react";

interface Props {
  open: boolean;
  dateLabel: string;
  onClose: () => void;
}

export function AgendaNoEventModal({ open, dateLabel, onClose }: Props) {
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
          <DialogTitle>Sin eventos</DialogTitle>
          <DialogDescription>
            No hay actividades programadas para el{" "}
            <span className="font-medium text-foreground">{dateLabel}</span>.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
