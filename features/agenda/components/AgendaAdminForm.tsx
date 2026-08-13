"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createAgendaEventAction } from "../application/agenda.action";
import type { AgendaFieldOptions, AgendaMember } from "../types/agenda.types";
import { monthName, weekdayPlural } from "../utils/calendar-locale";
import { ComboboxField } from "./ui/ComboboxField";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// Interpreta a string YYYY-MM-DD como dia civil estável (12:00 UTC).
function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function getSameWeekdayDates(dateStr: string): string[] {
  const base = parseDateStr(dateStr);
  const weekday = base.getUTCDay();
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth();
  const dates: string[] = [];
  const d = new Date(Date.UTC(year, month, 1, 12, 0, 0));
  while (d.getUTCMonth() === month) {
    if (d.getUTCDay() === weekday) {
      dates.push(`${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`);
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

function formatDateLabel(locale: Locale, dateStr: string) {
  const d = parseDateStr(dateStr);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${monthName(locale, d.getUTCMonth())}`;
}

interface Props {
  organizationId: string;
  organizationSlug: string;
  members: AgendaMember[];
  fieldOptions: AgendaFieldOptions;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AgendaAdminForm({
  organizationId,
  organizationSlug,
  members,
  fieldOptions,
}: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [conductorPerDate, setConductorPerDate] = useState<Record<string, string | null>>({});

  const formSchema = z.object({
    date: z.string().min(1, t.agenda.date),
    time: z.string().min(1, t.agenda.time),
    conductorId: z.string().nullable().optional(),
    saida: z.string().optional(),
    tipo: z.string().optional(),
    territorio: z.string().optional(),
    info: z.string().max(500).optional(),
    recurring: z.boolean(),
  });

  type FormInput = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      time: "",
      conductorId: null,
      saida: "",
      tipo: "",
      territorio: "",
      info: "",
      recurring: false,
    },
  });

  const recurring = useWatch({ control, name: "recurring" });
  const selectedDate = useWatch({ control, name: "date" });
  const weekdayLabel = selectedDate
    ? weekdayPlural(locale, parseDateStr(selectedDate).getUTCDay())
    : null;
  const recurringDates = recurring && selectedDate ? getSameWeekdayDates(selectedDate) : [];

  const onSubmit = (data: FormInput) => {
    startTransition(async () => {
      const dates = data.recurring && data.date ? getSameWeekdayDates(data.date) : [data.date];

      const results = await Promise.all(
        dates.map((d) =>
          createAgendaEventAction(organizationId, organizationSlug, {
            date: d,
            time: data.time,
            conductorId: data.recurring
              ? conductorPerDate[d] !== undefined
                ? conductorPerDate[d]
                : data.conductorId
              : data.conductorId,
            saida: data.saida,
            tipo: data.tipo,
            territorio: data.territorio,
            info: data.info,
          }),
        ),
      );

      const errs = results.filter((r) => r.error);
      if (errs.length > 0) {
        toast.error(errs[0].error);
        return;
      }

      toast.success(
        data.recurring
          ? t.agenda.createdManySuccess
              .replace("{count}", String(dates.length))
              .replace("{weekday}", weekdayLabel ?? "")
          : t.agenda.createdSuccess,
      );
      reset();
      setConductorPerDate({});
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <>
        <DialogTrigger asChild>
          <Button className="w-full gap-2">
            <CalendarPlus className="size-4" aria-hidden />
            {t.agenda.createEvent}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[85vh] max-w-md gap-4 overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t.agenda.createEvent}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex-wrap gap-3 md:grid md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-date">{t.agenda.date}</Label>
                <Input id="event-date" type="date" {...register("date")} />
                {errors.date && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-time">{t.agenda.time}</Label>
                <Input id="event-time" type="time" {...register("time")} />
                {errors.time && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.time.message}
                  </p>
                )}
              </div>
            </div>

            {selectedDate && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="event-recurring" className="cursor-pointer">
                    {t.agenda.repeatAll.replace("{weekday}", weekdayLabel ?? "")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t.agenda.repeatDescription.replace("{weekday}", weekdayLabel ?? "")}
                  </p>
                </div>
                <Switch
                  id="event-recurring"
                  checked={recurring}
                  onCheckedChange={(val) => {
                    setValue("recurring", val);
                    setConductorPerDate({});
                  }}
                />
              </div>
            )}

            {!recurring ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-conductor">
                  {t.agenda.conductor}{" "}
                  <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
                </Label>
                <Select
                  onValueChange={(val) => setValue("conductorId", val === "none" ? null : val)}
                  defaultValue="none"
                >
                  <SelectTrigger id="event-conductor">
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
            ) : (
              <div className="flex flex-col gap-2">
                <Label>
                  {t.agenda.conductorByDate}{" "}
                  <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
                </Label>
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3">
                  {recurringDates.map((dateStr) => (
                    <div key={dateStr} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatDateLabel(locale, dateStr)}
                      </span>
                      <Select
                        onValueChange={(val) =>
                          setConductorPerDate((prev) => ({
                            ...prev,
                            [dateStr]: val === "none" ? null : val,
                          }))
                        }
                        defaultValue="none"
                      >
                        <SelectTrigger className="h-8 flex-1 text-xs">
                          <SelectValue placeholder={t.agenda.none} />
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
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-saida">
                {t.agenda.exit}{" "}
                <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
              </Label>
              <Controller
                control={control}
                name="saida"
                render={({ field }) => (
                  <ComboboxField
                    id="event-saida"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={fieldOptions.saida}
                    placeholder={t.agenda.saidaPlaceholder}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-tipo">
                {t.agenda.type}{" "}
                <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
              </Label>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <ComboboxField
                    id="event-tipo"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={fieldOptions.tipo}
                    placeholder={t.agenda.tipoPlaceholder}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-territorio">
                {t.agenda.territory}{" "}
                <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
              </Label>
              <Controller
                control={control}
                name="territorio"
                render={({ field }) => (
                  <ComboboxField
                    id="event-territorio"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={fieldOptions.territorio}
                    placeholder={t.agenda.territorioPlaceholder}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-info">
                {t.agenda.infoField}{" "}
                <span className="font-normal text-muted-foreground">{t.agenda.optional}</span>
              </Label>
              <Textarea
                id="event-info"
                rows={3}
                placeholder={t.agenda.infoPlaceholder}
                {...register("info")}
              />
              {errors.info && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.info.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending
                ? t.agenda.saving
                : recurring && weekdayLabel
                  ? t.agenda.createAllEvents.replace("{weekday}", weekdayLabel)
                  : t.agenda.saveEvent}
            </Button>
          </form>
        </DialogContent>
      </>
    </Dialog>
  );
}
