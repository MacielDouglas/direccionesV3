import type { I18nDictionary } from "@/lib/i18n/types";

// Traduz os códigos internos de falha de upload (UPLOAD_*) em um detalhe
// legível para o modal de erro: etapa que falhou + status HTTP quando houver.
// Retorna null para erros desconhecidos (o chamador decide o fallback).
export function getUploadErrorDetail(err: unknown, t: I18nDictionary["addresses"]): string | null {
  if (!(err instanceof Error)) return null;
  const message = err.message.trim();

  const signedUrl = /^UPLOAD_SIGNED_URL_(\d+)$/.exec(message);
  if (signedUrl) return `${t.imageStagePrepare} (HTTP ${signedUrl[1]})`;
  if (message === "UPLOAD_SIGNED_URL_INVALID") return t.imageStagePrepare;

  const put = /^UPLOAD_PUT_(\d+)$/.exec(message);
  if (put) return `${t.imageStageSend} (HTTP ${put[1]})`;
  if (message === "UPLOAD_NETWORK") return t.imageStageNetwork;
  if (message === "UPLOAD_TIMEOUT") return t.imageStageTimeout;

  return null;
}
