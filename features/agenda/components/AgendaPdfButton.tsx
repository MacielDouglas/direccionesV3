"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgendaEventItem } from "../types/agenda.types";

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

const DAY_COLORS: Record<number, [number, number, number]> = {
  0: [255, 220, 210],
  1: [210, 230, 255],
  2: [210, 255, 220],
  3: [255, 245, 200],
  4: [230, 210, 255],
  5: [255, 225, 180],
  6: [200, 245, 245],
};

const DAY_HEADER_COLORS: Record<number, [number, number, number]> = {
  0: [220, 100, 80],
  1: [70, 130, 200],
  2: [70, 180, 100],
  3: [200, 170, 50],
  4: [130, 80, 200],
  5: [220, 140, 50],
  6: [50, 180, 180],
};

// Fonte e espaçamento por número de eventos na célula
const FONT_SCALE: Record<
  number,
  { fontSize: number; lineH: number; sepH: number }
> = {
  1: { fontSize: 6.2, lineH: 3.5, sepH: 4.5 },
  2: { fontSize: 5.6, lineH: 3.0, sepH: 3.0 },
  3: { fontSize: 5.0, lineH: 2.7, sepH: 2.5 },
  4: { fontSize: 4.5, lineH: 2.4, sepH: 2.0 },
};

function getFontScale(count: number) {
  const key = Math.min(count, 4) as keyof typeof FONT_SCALE;
  return FONT_SCALE[key];
}

interface Props {
  events: AgendaEventItem[];
  monthLabel: string;
  month: number;
  year: number;
}

function buildCalendarMatrix(
  events: AgendaEventItem[],
  month: number,
  year: number,
) {
  const lastDay = new Date(year, month + 1, 0);
  const weeks: Record<number, Record<number, AgendaEventItem[]>> = {};
  let currentWeek = 0;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const weekday = date.getDay();

    if (weekday === 0 && d !== 1) currentWeek++;

    if (!weeks[currentWeek]) weeks[currentWeek] = {};
    if (!weeks[currentWeek][weekday]) weeks[currentWeek][weekday] = [];

    const dayEvents = events.filter(
      (e) => new Date(e.date).toDateString() === date.toDateString(),
    );
    weeks[currentWeek][weekday].push(...dayEvents);
  }

  return weeks;
}

function formatDateShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const monthNum = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${monthNum}`;
}

// Conta quantas linhas um evento vai ocupar
function countEventLines(event: AgendaEventItem): number {
  let lines = 1; // Fecha + Hora — sempre presente
  if (event.saida) lines++;
  if (event.conductor?.name) lines++;
  if (event.territorio) lines++;
  if (event.tipo) lines++;
  return lines;
}

export function AgendaPdfButton({ events, monthLabel, month, year }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleGeneratePdf() {
    setLoading(true);

    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = 210;
      const pageH = 297;
      const margin = 12;
      const cellPadding = 2.5;

      // ── Título ─────────────────────────────
      doc.setFillColor(50, 50, 80);
      doc.rect(0, 0, pageW, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`Salidas para Predicación — ${monthLabel}`, pageW / 2, 13, {
        align: "center",
      });

      // ── Matriz calendário ─────────────────
      const weeks = buildCalendarMatrix(events, month, year);
      const totalWeeks = Object.keys(weeks).length;

      const startY = 24;
      const cellW = (pageW - margin * 2) / totalWeeks;

      // ── Header semanas ────────────────────
      for (let w = 0; w < totalWeeks; w++) {
        const x = margin + w * cellW;

        doc.setFillColor(40, 40, 70);
        doc.rect(x, startY, cellW, 7, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`Semana ${w + 1}`, x + cellW / 2, startY + 4.5, {
          align: "center",
        });
      }

      // ── Dias ativos ────────────────────────
      const activeWeekdays = Array.from(
        new Set(events.map((e) => new Date(e.date).getDay())),
      ).sort((a, b) => a - b);

      const cellH = (pageH - startY - margin) / activeWeekdays.length;

      // ── Grid de células ────────────────────
      for (let row = 0; row < activeWeekdays.length; row++) {
        const wd = activeWeekdays[row];

        for (let w = 0; w < totalWeeks; w++) {
          const x = margin + w * cellW;
          const y = startY + 7 + row * cellH;

          const bg = DAY_COLORS[wd] ?? [240, 240, 240];
          const header = DAY_HEADER_COLORS[wd] ?? [100, 100, 100];

          // Fundo + header
          doc.setFillColor(...bg);
          doc.rect(x, y, cellW, cellH, "F");
          doc.setFillColor(...header);
          doc.rect(x, y, cellW, 6, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text(WEEK_DAYS_ES[wd], x + 2, y + 4);

          const contentStartY = y + 6 + cellPadding;
          const contentEndY = y + cellH - cellPadding;
          const availableH = contentEndY - contentStartY;

          const dayEvents = weeks[w]?.[wd] ?? [];
          if (dayEvents.length === 0) continue;

          // ── Calcula escala dinâmica ─────────────────────────────────
          // Total de linhas de texto que precisam caber
          const totalLines = dayEvents.reduce(
            (acc, e) => acc + countEventLines(e),
            0,
          );
          // Separadores entre eventos
          const totalSeps = dayEvents.length - 1;

          // Começa pela escala do número de eventos, e reduz até caber
          let scale = getFontScale(dayEvents.length);
          let requiredH = totalLines * scale.lineH + totalSeps * scale.sepH;

          // Reduz gradualmente até caber (mínimo fontSize 4)
          while (requiredH > availableH && scale.fontSize > 4) {
            scale = {
              fontSize: scale.fontSize - 0.2,
              lineH: scale.lineH - 0.15,
              sepH: Math.max(scale.sepH - 0.2, 1.5),
            };
            requiredH = totalLines * scale.lineH + totalSeps * scale.sepH;
          }

          // ── Renderiza eventos com escala calculada ──────────────────
          let lineY = contentStartY;

          dayEvents.forEach((event, eventIndex) => {
            const date = new Date(event.date);
            const dateStr = formatDateShort(date);
            const timeStr = event.time ? ` ${event.time}` : "";

            // Fecha + Hora
            doc.setFontSize(scale.fontSize);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 30);
            doc.text(`Fecha: ${dateStr}, Hora:${timeStr}`, x + 2, lineY);
            lineY += scale.lineH;

            // Salida
            if (event.saida) {
              doc.setFont("helvetica", "normal");
              doc.setTextColor(80, 80, 80);
              doc.text(`Salida: ${event.saida}`, x + 2, lineY);
              lineY += scale.lineH;
            }

            // Conductor
            if (event.conductor?.name) {
              doc.setFont("helvetica", "italic");
              doc.setTextColor(60, 60, 120);
              doc.text(event.conductor.name, x + 2, lineY);
              lineY += scale.lineH;
            }

            // Territorio
            if (event.territorio) {
              doc.setFont("helvetica", "normal");
              doc.setTextColor(30, 30, 30);
              doc.text(`Territorio: ${event.territorio}`, x + 2, lineY);
              lineY += scale.lineH;
            }

            // Modalidad
            if (event.tipo) {
              doc.setFont("helvetica", "normal");
              doc.setTextColor(30, 30, 30);
              doc.text(`Modalidad: ${event.tipo}`, x + 2, lineY);
              lineY += scale.lineH;
            }

            // Separador entre eventos
            if (eventIndex < dayEvents.length - 1) {
              lineY += scale.sepH * 0.4;
              doc.setDrawColor(180, 180, 180);
              doc.setLineWidth(0.2);
              doc.line(x + 2, lineY, x + cellW - 2, lineY);
              lineY += scale.sepH * 0.6;
            }
          });
        }
      }

      // ── Rodapé ────────────────────────────
      const totalPages = doc.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Predicación ${monthLabel} — Página ${i} de ${totalPages}`,
          pageW / 2,
          pageH - 5,
          { align: "center" },
        );
      }

      doc.save(`Predicacion_${MONTHS_ES[month]}_${year}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGeneratePdf}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <FileDown className="size-4" aria-hidden />
      )}
      Crear PDF
    </Button>
  );
}
