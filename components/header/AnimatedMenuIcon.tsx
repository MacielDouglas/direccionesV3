"use client";

import { forwardRef } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface AnimatedMenuIconProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const AnimatedMenuIcon = forwardRef<HTMLButtonElement, AnimatedMenuIconProps>(
  ({ isOpen, onToggle, className }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className={cn(
          "relative h-11 w-11 rounded-xl text-slate-200 hover:bg-white/10 active:scale-95",
          className,
        )}
      >
        <span className="relative block h-5 w-5" aria-hidden="true">
          <span
            className={cn(
              "absolute left-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300",
              isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0.5",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300",
              isOpen ? "opacity-0 translate-x-2" : "bottom-1 opacity-100",
            )}
          />
        </span>
      </Button>
    );
  },
);

AnimatedMenuIcon.displayName = "AnimatedMenuIcon";

export default AnimatedMenuIcon;
