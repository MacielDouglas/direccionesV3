"use client";

import { Check, Eraser, MapPin, Plus, Send, TriangleAlert } from "lucide-react";

interface Props {
  localPinsCount: number;
  isAdminOrOwner: boolean;
  isAddingMode: boolean;
  loading: boolean;
  onToggleAddingMode: () => void;
  onOpenConfirmModal: () => void;
  onClearLocalPins: () => void;
}

export default function PinControls({
  localPinsCount,
  isAdminOrOwner,
  isAddingMode,
  loading,
  onToggleAddingMode,
  onOpenConfirmModal,
  onClearLocalPins,
}: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Controles de marcación"
      className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      {/* Badge contador */}
      {localPinsCount > 0 && (
        <output
          aria-live="polite"
          aria-label={`${localPinsCount} pins marcados`}
          className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground shadow-md"
        >
          <MapPin className="size-3.5" aria-hidden />
          {localPinsCount} pin{localPinsCount > 1 ? "s" : ""} marcado
          {localPinsCount > 1 ? "s" : ""}
        </output>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {/* Botões de usuário comum — só quando não está em modo admin */}
        {!isAddingMode && localPinsCount > 0 && (
          <>
            <button
              type="button"
              onClick={onOpenConfirmModal}
              disabled={loading}
              aria-label="Confirmar marcaciones realizadas"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <Check className="size-4" aria-hidden />
              Confirmar marcación
            </button>
            <button
              type="button"
              onClick={onClearLocalPins}
              disabled={loading}
              aria-label="Limpiar pins no guardados"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/90 px-3 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <Eraser className="size-4" aria-hidden />
              Limpiar
            </button>
          </>
        )}

        {/* Botões exclusivos de admin/owner */}
        {isAdminOrOwner && (
          <>
            <button
              type="button"
              onClick={onToggleAddingMode}
              disabled={loading}
              aria-pressed={isAddingMode}
              aria-label={
                isAddingMode ? "Desactivar modo sugerencia" : "Activar modo envío de sugerencias"
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${
                isAddingMode
                  ? "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500"
                  : "bg-foreground hover:bg-foreground/90 focus-visible:ring-ring"
              }`}
            >
              {isAddingMode ? (
                <>
                  <TriangleAlert className="size-4" aria-hidden />
                  Modo sugerencia activo
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden />
                  Enviar marcaciones
                </>
              )}
            </button>

            {isAddingMode && localPinsCount > 0 && (
              <button
                type="button"
                onClick={onOpenConfirmModal}
                disabled={loading}
                aria-label={`Enviar ${localPinsCount} sugerencias`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 disabled:opacity-50"
              >
                <Plus className="size-4" aria-hidden />
                Enviar {localPinsCount} sugerencia
                {localPinsCount > 1 ? "s" : ""}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
