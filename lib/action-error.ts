import type { I18nDictionary } from "@/lib/i18n/types";

const AUTH_MESSAGES = new Set(["No autenticado.", "Não autorizado.", "No autorizado."]);

// Erros técnicos nunca chegam ao usuário — viram mensagem genérica.
// Mensagens curtas humanas (vindas localizadas do servidor) passam.
export function resolveActionError(err: unknown, t: I18nDictionary): string {
  const message = err instanceof Error ? err.message : "";
  if (AUTH_MESSAGES.has(message)) return t.errors.sessionExpired;
  if (!message || message.length > 200 || /[{["]|P20\d\d|Zod|Prisma|Error:/.test(message)) {
    return t.errors.generic;
  }
  return message;
}
