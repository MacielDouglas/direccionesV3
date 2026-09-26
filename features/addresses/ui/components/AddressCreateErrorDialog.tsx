"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CircleAlert, ImagePlus, ListChecks, MapPinOff } from "lucide-react";

export type AddressCreateErrorKind = "missing-info" | "gps" | "image" | "save";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: AddressCreateErrorKind;
  detail?: string | null;
  onRetry?: () => void;
}

const KIND_ICON = {
  "missing-info": ListChecks,
  gps: MapPinOff,
  image: ImagePlus,
  save: CircleAlert,
} as const;

export default function AddressCreateErrorDialog({
  open,
  onOpenChange,
  kind,
  detail,
  onRetry,
}: Props) {
  const { t } = useI18n();
  const Icon = KIND_ICON[kind] ?? CircleAlert;

  const content = {
    "missing-info": {
      title: t.addresses.createErrorMissingInfoTitle,
      description: t.addresses.createErrorMissingInfoDescription,
    },
    gps: {
      title: t.addresses.createErrorGpsTitle,
      description: t.addresses.createErrorGpsDescription,
    },
    image: {
      title: t.addresses.createErrorImageTitle,
      description: t.addresses.createErrorImageDescription,
    },
    save: {
      title: t.addresses.createErrorSaveTitle,
      description: t.addresses.createErrorSaveDescription,
    },
  }[kind];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="inline-flex items-center gap-2 text-destructive">
            <CircleAlert className="size-5" aria-hidden="true" />
            {t.addresses.createErrorTitle}
          </DialogTitle>
          <DialogDescription>{t.addresses.createErrorDescription}</DialogDescription>
        </DialogHeader>

        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-3 py-2.5"
        >
          <Icon className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{content.title}</p>
            <p className="mt-0.5 text-sm text-destructive">{content.description}</p>
            {detail ? (
              <p className="mt-1 break-words text-xs text-muted-foreground">{detail}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {t.addresses.createErrorClose}
          </Button>
          {onRetry ? (
            <Button type="button" onClick={onRetry} className="w-full sm:w-auto">
              {t.addresses.createErrorRetry}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
