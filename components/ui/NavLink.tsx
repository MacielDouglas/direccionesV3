"use client";

import { useHaptic } from "@/app/hooks/useHaptic";
import { cn } from "@/lib/utils";
import Link from "next/link";

// components/ui/NavLink.tsx
interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  label?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className, label, onClick }: Props) {
  const { vibrate } = useHaptic();

  function handleClick() {
    vibrate("light");
    onClick?.();
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-label={label}
      className={cn("relative transition-colors active:scale-95 duration-75", className)}
    >
      {children}
    </Link>
  );
}
