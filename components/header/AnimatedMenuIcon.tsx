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
        "relative h-8 w-8 rounded-lg hover:bg-[#0c232a]",
        className,
      )}
    >
      <div className="relative h-6 w-full">
        <span
          className={cn(
            "absolute left-0 top-0 h-px w-full bg-slate-50 transition-all",
            isOpen && "top-2.5 rotate-45",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-2.5 h-px w-full bg-slate-50 transition-all",
            isOpen && "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-5 h-px w-full bg-slate-50 transition-all",
            isOpen && "top-2.5 -rotate-45",
          )}
        />
      </div>
    </Button>
  );
}
