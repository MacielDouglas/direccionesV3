"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/**
 * Bottom-sheet mobile dos modais de Reuniões.
 *
 * A altura máxima desconta a tab bar, o home indicator e a safe-area do topo
 * (notch/status bar): sem isso o topo do sheet sobe para fora da tela e o
 * cabeçalho fica atrás da status bar. Do `sm` para cima volta a ser um modal
 * centralizado.
 */
export const MEETING_SHEET_CLASSES = cn(
  "fixed z-50 flex flex-col gap-0 overflow-hidden p-0",
  "w-full max-w-full",
  "left-0! right-0! top-auto! rounded-t-3xl! border-0!",
  "bottom-[calc(4rem+env(safe-area-inset-bottom,0px))]!",
  "max-h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px)-env(safe-area-inset-top,0px)-0.5rem)]",
  "translate-x-0! translate-y-0!",
  "sm:top-1/2! sm:bottom-auto! sm:left-1/2! sm:right-auto!",
  "sm:max-h-[90dvh] sm:max-w-lg! sm:-translate-x-1/2! sm:-translate-y-1/2!",
  "sm:rounded-3xl! sm:border!",
);

/** Sheet das designações: flutua acima do nav-bottom (h-16 + safe-area). */
export const MEETING_SHEET_DESIGNATIONS_CLASSES = cn(MEETING_SHEET_CLASSES, "sm:max-w-md!");

interface MeetingSheetHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  /** Título principal do nav bar (uma linha, truncado). */
  title: string;
  /** Linha de apoio opcional (ex.: tipo de reunião · data). */
  subtitle?: string;
  /** Rótulo acessível do botão fechar. */
  closeLabel: string;
  onClose: () => void;
  /** Conteúdo extra abaixo do título (ex.: seletor de semana/tipo). */
  children?: ReactNode;
}

/**
 * Nav bar nativa do sheet: grabber, título centralizado, subtítulo e botão
 * fechar de 44px. O fundo azul do módulo preenche toda a largura do sheet.
 */
export function MeetingSheetHeader({
  title,
  subtitle,
  closeLabel,
  onClose,
  children,
  className,
  ...props
}: MeetingSheetHeaderProps) {
  return (
    <div className={cn("shrink-0 bg-meeting text-white", className)} {...props}>
      <div aria-hidden="true" className="flex justify-center pt-2">
        <span className="h-1 w-9 rounded-full bg-white/45" />
      </div>
      <div className="flex items-center gap-1 px-2 pt-1 pb-2">
        <span aria-hidden="true" className="size-11 shrink-0" />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-base font-semibold leading-tight tracking-tight">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs font-medium text-white/80">{subtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="grid size-11 shrink-0 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      {children ? <div className="px-4 pb-3">{children}</div> : null}
    </div>
  );
}

/** Área rolável do sheet (o nav bar permanece fixo no topo). */
export function MeetingSheetBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain",
        className,
      )}
      {...props}
    />
  );
}
