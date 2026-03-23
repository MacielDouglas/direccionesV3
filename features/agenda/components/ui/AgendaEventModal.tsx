"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Clock, User, Info } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AgendaEventItem } from "../../types/agenda.types";

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const WEEK_DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface Props {
  event: AgendaEventItem | null;
  onClose: () => void;
}

export function AgendaEventModal({ event, onClose }: Props) {
  if (!event) return null;

  const date = new Date(event.date);
  const isPast = date < new Date();

  const dayName = WEEK_DAYS_ES[date.getDay()];
  const dateStr = `${dayName}, ${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`;
  const timeStr = event.time
    ? event.time
    : date.toLocaleTimeString("es-419", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

  return (
    <Dialog
      open={!!event}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize text-base leading-snug">
            {dateStr}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-sm">
            <Clock className="size-3.5" aria-hidden />
            {timeStr}hs
            {isPast && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Pasado
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          {/* Conductor */}
          {event.conductor && (
            <div className="flex items-center gap-2.5">
              {event.conductor.image ? (
                <Image
                  src={event.conductor.image}
                  alt={event.conductor.name}
                  width={32}
                  height={32}
                  className={cn(
                    "rounded-full size-8 object-cover",
                    isPast && "grayscale",
                  )}
                />
              ) : (
                <span className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="size-4 text-muted-foreground" aria-hidden />
                </span>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Conductor</p>
                <p className="text-sm font-medium">{event.conductor.name}</p>
              </div>
            </div>
          )}

          {/* Badges */}
          {(event.saida || event.tipo || event.territorio) && (
            <div className="flex flex-wrap gap-2">
              {/* <p className="text-xs text-muted-foreground">Salida:</p> */}
              {event.saida && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  📍 Salida: {event.saida}
                </span>
              )}
              {event.tipo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  🏷️ Modalidad: {event.tipo}
                </span>
              )}
              {event.territorio && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  🗺️ Territorio: {event.territorio}
                </span>
              )}
            </div>
          )}

          {/* Info */}
          {event.info && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground rounded-lg bg-muted/50 p-3">
              <Info className="size-3.5 mt-0.5 shrink-0" aria-hidden />
              Información adicional:{event.info}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
