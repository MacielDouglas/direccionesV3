"use client";

import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface AnimatedMenuIconProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function AnimatedMenuIcon({
  isOpen,
  onToggle,
  className,
}: AnimatedMenuIconProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      className={cn(
        `
        relative h-11 w-11 rounded-xl
        active:scale-95
        hover:bg-black/5
        text-slate-200
        `,
        className,
      )}
    >
      <span className="relative block h-5 w-5">
        {/* barra superior */}
        <span className="absolute top-0.5 left-0 h-0.5 w-full bg-current rounded-full" />

        {/* barra inferior */}
        <span className="absolute bottom-1 left-0 h-0.5 w-full bg-current rounded-full" />
      </span>
    </Button>
  );
}
