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
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateAgendaEventAction } from "../application/agenda.action";
import type { AgendaEventItem, AgendaFieldOptions, AgendaMember } from "../types/agenda.types";
import { eventTime } from "../utils/agenda-time";
import { formatDateInput } from "../utils/calendar-locale";
import { ComboboxField } from "./ui/ComboboxField";

interface Props {
  event: AgendaEventItem | null;
  open: boolean;
  onClose: () => void;
  organizationSlug: string;
  members: AgendaMember[];
  fieldOptions?: AgendaFieldOptions | null;
}

export function EditAgendaEventModal({
  event,
  open,
  onClose,
  organizationSlug,
  members,
  fieldOptions,
}: Props) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const editSchema = z.object({
    date: z.string().min(1, t.agenda.date),
    time: z.string().min(1, t.agenda.time),
    conductorId: z.string().nullable().optional(),
    saida: z.string().optional(),
    tipo: z.string().optional(),
    territorio: z.string().optional(),
    info: z.string().max(500, t.agenda.infoField).optional(),
  });

  type EditInput = z.infer<typeof editSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
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
      saida: event.saida ?? "",
      tipo: event.tipo ?? "",
      territorio: event.territorio ?? "",
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
      <DialogContent className="max-h-[85vh] w-full max-w-md gap-4 overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t.agenda.editEvent}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex-wrap gap-3 md:grid md:grid-cols-2">
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
            <Label htmlFor="edit-saida">
              {t.agenda.exit}{" "}
              <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
            </Label>
            <Controller
              control={control}
              name="saida"
              render={({ field }) => (
                <ComboboxField
                  id="edit-saida"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={fieldOptions?.saida ?? []}
                  placeholder={t.agenda.saidaPlaceholder}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-tipo">
              {t.agenda.type}{" "}
              <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
            </Label>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <ComboboxField
                  id="edit-tipo"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={fieldOptions?.tipo ?? []}
                  placeholder={t.agenda.tipoPlaceholder}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-territorio">
              {t.agenda.territory}{" "}
              <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
            </Label>
            <Controller
              control={control}
              name="territorio"
              render={({ field }) => (
                <ComboboxField
                  id="edit-territorio"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={fieldOptions?.territorio ?? []}
                  placeholder={t.agenda.territorioPlaceholder}
                />
              )}
            />
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
