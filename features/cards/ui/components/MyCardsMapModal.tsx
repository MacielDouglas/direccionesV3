"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardViewMap } from "@/features/map/components/CardViewMap";
import type { CardAddress } from "@/features/map/layers/CardAddressesLayer";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  addresses: CardAddress[];
  onMarkerClick?: (id: string) => void;
}

export function MyCardsMapModal({ open, onClose, addresses, onMarkerClick }: Props) {
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
          "fixed inset-0 z-50 h-dvh w-full max-w-full gap-0 overflow-hidden rounded-none border-0 p-0",
          "left-0! right-0! top-0! bottom-0! translate-x-0! translate-y-0!",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t.cards.mine}</DialogTitle>
          <DialogDescription>{t.cards.seeMap}</DialogDescription>
        </DialogHeader>

        {addresses.length > 0 ? (
          <CardViewMap
            addresses={addresses}
            onMarkerClick={onMarkerClick}
            className="relative h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Sin coordenadas disponibles
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" aria-hidden />
        </button>
      </DialogContent>
    </Dialog>
  );
}
