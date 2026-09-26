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
import { ArrowLeft, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  addresses: CardAddress[];
  onMarkerClick?: (id: string) => void;
  title?: string;
  subtitle?: string;
}

export function MyCardsMapModal({
  open,
  onClose,
  addresses,
  onMarkerClick,
  title,
  subtitle,
}: Props) {
  const { t } = useI18n();
  const heading = title ?? t.cards.mine;
  const subheading = subtitle ?? t.cards.seeMap;

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
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{subheading}</DialogDescription>
        </DialogHeader>

        {addresses.length > 0 ? (
          <CardViewMap
            addresses={addresses}
            onMarkerClick={onMarkerClick}
            className="relative h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            {t.admin.noCoordinates}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.back}
          className="absolute top-4 left-4 z-10 flex max-w-[calc(100%-5.5rem)] items-center gap-2.5 rounded-2xl border border-border bg-background/90 py-2 pr-4 pl-3 text-left shadow-lg backdrop-blur transition-colors hover:bg-background active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
            <ArrowLeft className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">{heading}</span>
            <span className="block truncate text-xs text-muted-foreground">{subheading}</span>
          </span>
        </button>

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
