"use client";

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
          className="rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-white shadow-md"
        >
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
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 disabled:opacity-50"
            >
              ✅ Confirmar marcación
            </button>
            <button
              type="button"
              onClick={onClearLocalPins}
              disabled={loading}
              aria-label="Limpiar pins no guardados"
              className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 disabled:opacity-50"
            >
              ✕ Limpiar
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
                isAddingMode
                  ? "Desactivar modo sugerencia"
                  : "Activar modo envío de sugerencias"
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${
                isAddingMode
                  ? "bg-yellow-500 hover:bg-yellow-600 focus-visible:ring-yellow-500"
                  : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600"
              }`}
            >
              {isAddingMode
                ? "🟡 Modo sugerencia activo"
                : "📤 Enviar marcaciones"}
            </button>

            {isAddingMode && localPinsCount > 0 && (
              <button
                type="button"
                onClick={onOpenConfirmModal}
                disabled={loading}
                aria-label={`Enviar ${localPinsCount} sugerencias`}
                className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-yellow-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600 disabled:opacity-50"
              >
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
