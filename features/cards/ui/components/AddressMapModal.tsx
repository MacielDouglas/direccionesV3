"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
}

export function AddressMapModal({ open, onClose, latitude, longitude }: Props) {
  const { t } = useI18n();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-[90dvh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-b-3xl border-b border-border p-0",
          "translate-x-0! translate-y-0!",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t.cards.seeMap}</DialogTitle>
          <DialogDescription>{t.admin.addressMapDescription}</DialogDescription>
        </DialogHeader>

        {/* Botão secundário por cima do mapa */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" aria-hidden />
        </button>

        {/* Mapa ocupa o restante da tela */}
        <div className="relative min-h-0 flex-1">
          <AddressViewMap
            latitude={latitude}
            longitude={longitude}
            className="h-full"
            mapClassName="flex-1"
          />
        </div>

        {/* Botão fechar tela abaixo do mapa */}
        <div className="shrink-0 border-t border-border bg-card/95 p-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
            {t.common.closeScreen}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
