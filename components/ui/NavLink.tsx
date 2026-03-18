"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigation } from "../NavigationProvider";
import { useHaptic } from "@/app/hooks/useHaptic";

// components/ui/NavLink.tsx
interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  label?: string;
  onClick?: () => void; // ✅ adicione
}

export function NavLink({ href, children, className, label, onClick }: Props) {
  const { startNavigation } = useNavigation();
  const { vibrate } = useHaptic();
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    setClicked(true);
    vibrate("light");
    startNavigation();
    onClick?.(); // ✅ chama o onClick externo se existir
    setTimeout(() => setClicked(false), 3000);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-label={label}
      aria-busy={clicked}
      className={cn(
        "relative transition-opacity active:scale-95 duration-75",
        clicked && "opacity-70",
        className,
      )}
    >
      {children}
    </Link>
  );
}
