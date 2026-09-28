import { getServerDictionary } from "@/lib/i18n/server";

const SESSION_MESSAGES = new Set(["No autenticado.", "Não autorizado.", "No autorizado."]);

// Sanitiza erros de Server Actions: nada técnico vaza para o toast.
// Mensagens humanas curtas (já localizadas) passam; resto vira genérica.
export async function resolveServerActionError(err: unknown): Promise<string> {
  const t = await getServerDictionary();
  if (err instanceof Error) {
    if (SESSION_MESSAGES.has(err.message)) return t.errors.sessionExpired;
    const code = (err as { code?: string }).code;
    if (code?.startsWith("P")) return t.errors.generic;
    if (err.name === "ZodError") {
      const issues = (err as { issues?: { message?: string }[] }).issues;
      const first = issues?.[0]?.message;
      if (first && first.length <= 200) return first;
      return t.errors.generic;
    }
    if (err.message && err.message.length <= 200 && !/[{["]/.test(err.message)) {
      return err.message;
    }
  }
  return t.errors.generic;
}
