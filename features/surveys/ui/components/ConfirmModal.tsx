"use client";

import { useEffect, useRef } from "react";

interface Props {
  pinsCount: number;
  isSuggested: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  pinsCount,
  isSuggested,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    /* Dialog nativo — captura Escape via onCancel e foca o primeiro botão */
    <dialog
      open
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      className="fixed inset-0 z-50 m-0 flex h-full w-full items-center justify-center bg-transparent p-4"
    >
      {/* Backdrop — botão invisível cobre a tela e fecha ao clicar fora */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => {
          if (!loading) onCancel();
        }}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
        <h2 id="modal-title" className="mb-2 text-lg font-semibold tracking-tight text-foreground">
          {isSuggested ? "Enviar sugerencias de marcación" : "Confirmar marcación"}
        </h2>

        <p id="modal-description" className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {isSuggested
            ? `¿Desea enviar ${pinsCount} pin${pinsCount > 1 ? "s" : ""} como sugerencia para que los miembros confirmen? Aparecerán en amarillo en el mapa.`
            : `¿Desea confirmar ${pinsCount} pin${pinsCount > 1 ? "s" : ""} marcado${pinsCount > 1 ? "s" : ""}? Se guardarán como marcaciones pendientes.`}
        </p>

        <div className="flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
