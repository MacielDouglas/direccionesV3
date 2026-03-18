"use client";

import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ComboboxField } from "./ui/ComboboxField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgendaFieldOptions, AgendaMember } from "../types/agenda.types";
import { createAgendaEventAction } from "../application/agenda.action";

// ─── Schema local do form ─────────────────────────────────────────────────────

const formSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  time: z.string().min(1, "La hora es obligatoria."),
  conductorId: z.string().nullable().optional(),
  saida: z.string().optional(),
  tipo: z.string().optional(),
  territorio: z.string().optional(),
  info: z.string().max(500).optional(),
  recurring: z.boolean(),
});

type FormInput = z.infer<typeof formSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSameWeekdayDates(dateStr: string): string[] {
  const base = new Date(dateStr + "T12:00:00");
  const weekday = base.getDay();
  const year = base.getFullYear();
  const month = base.getMonth();
  const dates: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === weekday) {
      dates.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-419", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const WEEK_DAYS_ES = [
  "domingos",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábados",
];

// ─── Props ────────────────────────────────────────────────────────────────────

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
  const [isPending, startTransition] = useTransition();
  const [conductorPerDate, setConductorPerDate] = useState<
    Record<string, string | null>
  >({});

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
    ? WEEK_DAYS_ES[new Date(selectedDate + "T12:00:00").getDay()]
    : null;
  const recurringDates =
    recurring && selectedDate ? getSameWeekdayDates(selectedDate) : [];

  const onSubmit = (data: FormInput) => {
    startTransition(async () => {
      const dates =
        data.recurring && data.date
          ? getSameWeekdayDates(data.date)
          : [data.date];

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
          ? `${dates.length} eventos creados para todos los ${weekdayLabel} del mes.`
          : "Evento creado correctamente.",
      );
      reset();
      setConductorPerDate({});
    });
  };

  return (
    <section
      aria-labelledby="admin-form-heading"
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      <h2
        id="admin-form-heading"
        className="flex items-center gap-2 text-base font-semibold mb-4"
      >
        <CalendarPlus className="size-5 text-primary" aria-hidden />
        Nuevo evento
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* Fecha + Hora */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-date">Fecha</Label>
            <Input id="event-date" type="date" {...register("date")} />
            {errors.date && (
              <p role="alert" className="text-xs text-destructive">
                {errors.date.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-time">Hora</Label>
            <Input id="event-time" type="time" {...register("time")} />
            {errors.time && (
              <p role="alert" className="text-xs text-destructive">
                {errors.time.message}
              </p>
            )}
          </div>
        </div>

        {/* Switch recorrência */}
        {selectedDate && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="event-recurring" className="cursor-pointer">
                Repetir todos los {weekdayLabel}
              </Label>
              <p className="text-xs text-muted-foreground">
                Crea un evento para cada {weekdayLabel} de este mes
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

        {/* Conductor */}
        {!recurring ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-conductor">
              Conductor{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Select
              onValueChange={(val) =>
                setValue("conductorId", val === "none" ? null : val)
              }
              defaultValue="none"
            >
              <SelectTrigger id="event-conductor">
                <SelectValue placeholder="Seleccionar conductor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Ninguno —</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label>
              Conductor por fecha{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
              {recurringDates.map((dateStr) => (
                <div key={dateStr} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0 tabular-nums">
                    {formatDateLabel(dateStr)}
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
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="— Ninguno —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Ninguno —</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id}>
                          {m.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saída */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-saida">
            Salida{" "}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
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
                placeholder="Ej: Centro"
              />
            )}
          />
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-tipo">
            Tipo{" "}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
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
                placeholder="Ej: Predicación"
              />
            )}
          />
        </div>

        {/* Território */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-territorio">
            Territorio{" "}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
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
                placeholder="Ej: Zona Norte"
              />
            )}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-info">
            Información{" "}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
          </Label>
          <Textarea
            id="event-info"
            rows={3}
            placeholder="Agrega cualquier información relevante..."
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
            ? "Guardando..."
            : recurring && weekdayLabel
              ? `Crear eventos — todos los ${weekdayLabel}`
              : "Guardar evento"}
        </Button>
      </form>
    </section>
  );
}
