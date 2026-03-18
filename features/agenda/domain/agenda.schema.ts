import { z } from "zod";

export const agendaEventSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  time: z.string().min(1, "La hora es obligatoria."),
  conductorId: z.string().nullable().optional(),
  saida: z.string().max(100).nullable().optional(),
  tipo: z.string().max(100).nullable().optional(),
  territorio: z.string().max(100).nullable().optional(),
  info: z.string().max(500, "Máximo 500 caracteres.").optional(),
});

export type AgendaEventInput = z.infer<typeof agendaEventSchema>;
