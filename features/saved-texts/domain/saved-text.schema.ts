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

export const renameSavedTextSchema = z
  .object({
    field: z.enum(SAVED_TEXT_FIELDS),
    from: textValue,
    to: textValue,
  })
  .refine((data) => data.from !== data.to, { message: "Os textos são iguais." });

export const mergeSavedTextsSchema = z
  .object({
    field: z.enum(SAVED_TEXT_FIELDS),
    froms: z.array(textValue).min(2).max(50),
    to: textValue,
  })
  .refine((data) => new Set(data.froms).size === data.froms.length, {
    message: "Há textos repetidos na seleção.",
  });

export type RenameSavedTextInput = z.infer<typeof renameSavedTextSchema>;
export type MergeSavedTextsInput = z.infer<typeof mergeSavedTextsSchema>;
