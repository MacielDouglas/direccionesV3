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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAgendaEventAction } from "../../application/agenda.action";

interface Props {
  eventId: string;
  organizationSlug: string;
}

export function DeleteAgendaEventButton({ eventId, organizationSlug }: Props) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAgendaEventAction(eventId, organizationSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.agenda.deletedSuccess);
    });
  };

  return (
    <AlertDialog>
      <>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={t.agenda.deleteTitle}
            disabled={isPending}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.agenda.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.agenda.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </>
    </AlertDialog>
  );
}
