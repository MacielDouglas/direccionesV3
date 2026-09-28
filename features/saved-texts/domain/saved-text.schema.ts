import { z } from "zod";

export const SAVED_TEXT_FIELDS = [
  "street",
  "neighborhood",
  "city",
  "saida",
  "tipo",
  "territorio",
] as const;

export type SavedTextField = (typeof SAVED_TEXT_FIELDS)[number];

const textValue = z.string().trim().min(1).max(200);

const AGENDA_FIELDS: SavedTextField[] = ["saida", "tipo", "territorio"];

// Campos da agenda têm limite 100 no servidor (agenda.schema) —
export function savedTextMaxFor(field: SavedTextField): number {
  return AGENDA_FIELDS.includes(field) ? 100 : 200;
}

function checkAgendaMax(field: SavedTextField, values: string[], ctx: z.RefinementCtx): void {
  const max = savedTextMaxFor(field);
  if (values.some((v) => v.length > max)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Máximo de ${max} caracteres para este campo.`,
    });
  }
}

export const renameSavedTextSchema = z
  .object({
    field: z.enum(SAVED_TEXT_FIELDS),
    from: textValue,
    to: textValue,
  })
  .refine((data) => data.from !== data.to, { message: "Os textos são iguais." })
  .superRefine((data, ctx) => checkAgendaMax(data.field, [data.from, data.to], ctx));

export const mergeSavedTextsSchema = z
  .object({
    field: z.enum(SAVED_TEXT_FIELDS),
    froms: z.array(textValue).min(2).max(50),
    to: textValue,
  })
  .refine((data) => new Set(data.froms).size === data.froms.length, {
    message: "Há textos repetidos na seleção.",
  })
  .superRefine((data, ctx) => checkAgendaMax(data.field, [...data.froms, data.to], ctx));

export type RenameSavedTextInput = z.infer<typeof renameSavedTextSchema>;
export type MergeSavedTextsInput = z.infer<typeof mergeSavedTextsSchema>;
