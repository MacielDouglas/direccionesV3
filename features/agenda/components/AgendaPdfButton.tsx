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

interface Props {
  events: AgendaEventItem[];
  monthLabel: string;
  month: number;
  year: number;
}

// 🔥 NOVO: constrói matriz semana x dia
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
      // const cellH = (pageH - startY - margin) / 7;

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

      // dias ativos
      const activeWeekdays = Array.from(
        new Set(events.map((e) => new Date(e.date).getDay())),
      ).sort((a, b) => a - b);

      const cellH = (pageH - startY - margin) / activeWeekdays.length;

      // grid
      for (let row = 0; row < activeWeekdays.length; row++) {
        const wd = activeWeekdays[row];

        for (let w = 0; w < totalWeeks; w++) {
          const x = margin + w * cellW;
          const y = startY + 7 + row * cellH;

          const bg = DAY_COLORS[wd] ?? [240, 240, 240];
          const header = DAY_HEADER_COLORS[wd] ?? [100, 100, 100];

          doc.setFillColor(...bg);
          doc.rect(x, y, cellW, cellH, "F");

          doc.setFillColor(...header);
          doc.rect(x, y, cellW, 6, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text(WEEK_DAYS_ES[wd], x + 2, y + 4);

          const dayEvents = weeks[w]?.[wd] || [];

          let lineY = y + 8;

          for (const event of dayEvents) {
            const date = new Date(event.date);

            doc.setFontSize(6.2);
            doc.setTextColor(30, 30, 30);

            doc.text(
              `${date.getDate()}${event.time ? ` ${event.time}` : ""}`,
              x + 2,
              lineY,
            );

            lineY += 3.5;

            if (event.saida) {
              doc.setTextColor(80, 80, 80);
              doc.text(`S: ${event.saida}`, x + 2, lineY);
              lineY += 3.5;
            }

            if (event.conductor?.name) {
              doc.setTextColor(60, 60, 120);
              doc.setFont("helvetica", "italic");
              doc.text(event.conductor.name, x + 2, lineY);
              doc.setFont("helvetica", "normal");
              lineY += 3.5;
            }

            if (lineY > y + cellH - 3) break;
          }
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
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileDown className="size-4" />
      )}
      Crear PDF
    </Button>
  );
}
