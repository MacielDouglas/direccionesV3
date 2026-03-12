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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [loading, onCancel]);

  return (
    /* Overlay — fixed cobre a tela inteira, flex centra o card */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 dark:text-white">
        <h2
          id="modal-title"
          className="mb-2 text-lg font-bold text-gray-900 dark:text-white"
        >
          {isSuggested
            ? "Enviar sugerencias de marcación"
            : "Confirmar marcación"}
        </h2>

        <p
          id="modal-description"
          className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-zinc-400"
        >
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
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
