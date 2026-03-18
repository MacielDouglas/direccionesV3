"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgendaEventItem } from "../types/agenda.types";
import { updateAgendaEventAction } from "../application/agenda.action";

// ─── Schema ───────────────────────────────────────────────────────────────────

const editSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  time: z.string().min(1, "La hora es obligatoria."),
  conductorId: z.string().nullable().optional(),
  info: z.string().max(500, "Máximo 500 caracteres.").optional(),
});

type EditInput = z.infer<typeof editSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInputValue(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function toTimeInputValue(date: Date): string {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  user: { id: string; name: string; image: string | null };
}

interface Props {
  event: AgendaEventItem | null;
  open: boolean;
  onClose: () => void;
  organizationSlug: string;
  members: Member[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditAgendaEventModal({
  event,
  open,
  onClose,
  organizationSlug,
  members,
}: Props) {
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

  // ✅ Preenche form ao abrir com dados do evento
  useEffect(() => {
    if (!event) return;
    const date = new Date(event.date);
    reset({
      date: toDateInputValue(date),
      time: toTimeInputValue(date),
      conductorId: event.conductor?.id ?? null,
      info: event.info ?? "",
    });
  }, [event, reset]);

  const onSubmit = (data: EditInput) => {
    if (!event) return;
    startTransition(async () => {
      const result = await updateAgendaEventAction(
        event.id,
        organizationSlug,
        data,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Evento actualizado correctamente.");
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Editar evento</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4 mt-2"
        >
          {/* Fecha + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-date">Fecha</Label>
              <Input
                id="edit-date"
                type="date"
                {...register("date")}
                aria-describedby={errors.date ? "edit-date-error" : undefined}
              />
              {errors.date && (
                <p
                  id="edit-date-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-time">Hora</Label>
              <Input
                id="edit-time"
                type="time"
                {...register("time")}
                aria-describedby={errors.time ? "edit-time-error" : undefined}
              />
              {errors.time && (
                <p
                  id="edit-time-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Conductor */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-conductor">
              Conductor{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Select
              defaultValue={event?.conductor?.id ?? "none"}
              onValueChange={(val) =>
                setValue("conductorId", val === "none" ? null : val)
              }
            >
              <SelectTrigger id="edit-conductor">
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

          {/* Info */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-info">
              Información{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="edit-info"
              rows={3}
              placeholder="Agrega cualquier información relevante..."
              {...register("info")}
              aria-describedby={errors.info ? "edit-info-error" : undefined}
            />
            {errors.info && (
              <p
                id="edit-info-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.info.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
