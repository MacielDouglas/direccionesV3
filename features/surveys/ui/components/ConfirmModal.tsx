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
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Loader2 } from "lucide-react";

interface Props {
  pinsCount: number;
  isSuggested: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  pinsCount,
  isSuggested,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useI18n();

  const title = isSuggested ? t.survey.confirmModalSuggestedTitle : t.survey.confirmModalTitle;
  const description = (
    isSuggested ? t.survey.confirmModalSuggestedDescription : t.survey.confirmModalDescription
  ).replace("{count}", String(pinsCount));

  return (
    <AlertDialog
      open
      onOpenChange={(next) => {
        if (!next && !loading) onCancel();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={onCancel}>
            {t.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {loading ? t.survey.confirmSaving : t.common.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
