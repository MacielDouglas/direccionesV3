"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateAgendaEventAction } from "../application/agenda.action";
import type { AgendaEventItem, AgendaMember } from "../types/agenda.types";
import { eventTime } from "../utils/agenda-time";
import { formatDateInput } from "../utils/calendar-locale";

const editSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  time: z.string().min(1, "La hora es obligatoria."),
  conductorId: z.string().nullable().optional(),
  info: z.string().max(500, "Máximo 500 caracteres.").optional(),
});

type EditInput = z.infer<typeof editSchema>;

interface Props {
  event: AgendaEventItem | null;
  open: boolean;
  onClose: () => void;
  organizationSlug: string;
  members: AgendaMember[];
}

export function EditAgendaEventModal({ event, open, onClose, organizationSlug, members }: Props) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditInput>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (!event) return;
    reset({
      date: formatDateInput(event.date),
      time: eventTime(event),
      conductorId: event.conductor?.id ?? null,
      info: event.info ?? "",
    });
  }, [event, reset]);

  const onSubmit = (data: EditInput) => {
    if (!event) return;
    startTransition(async () => {
      const result = await updateAgendaEventAction(event.id, organizationSlug, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.agenda.updatedSuccess);
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{t.agenda.editEvent}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-date">{t.agenda.date}</Label>
              <Input
                id="edit-date"
                type="date"
                {...register("date")}
                aria-describedby={errors.date ? "edit-date-error" : undefined}
              />
              {errors.date && (
                <p id="edit-date-error" role="alert" className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-time">{t.agenda.time}</Label>
              <Input
                id="edit-time"
                type="time"
                {...register("time")}
                aria-describedby={errors.time ? "edit-time-error" : undefined}
              />
              {errors.time && (
                <p id="edit-time-error" role="alert" className="text-xs text-destructive">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-conductor">
              {t.agenda.conductor}{" "}
              <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
            </Label>
            <Select
              defaultValue={event?.conductor?.id ?? "none"}
              onValueChange={(val) => setValue("conductorId", val === "none" ? null : val)}
            >
              <SelectTrigger id="edit-conductor">
                <SelectValue placeholder={t.agenda.selectConductor} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.agenda.none}</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-info">
              {t.agenda.infoField}{" "}
              <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
            </Label>
            <Textarea
              id="edit-info"
              rows={3}
              placeholder={t.agenda.infoPlaceholder}
              {...register("info")}
              aria-describedby={errors.info ? "edit-info-error" : undefined}
            />
            {errors.info && (
              <p id="edit-info-error" role="alert" className="text-xs text-destructive">
                {errors.info.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" className="w-full" disabled={isPending} aria-busy={isPending}>
              {isPending ? t.agenda.saving : t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
