"use client";

import {
  getNavigationByRole,
  navigationMenu,
} from "@/features/navigation/constants/navigation";
import { useEffect, useRef } from "react";
import { useState } from "react";
import LogoutButton from "../LogoutButton";
import AnimatedMenuIcon from "./AnimatedMenuIcon";
import MenuItem from "../menu/MenuItem";
import type { Role } from "@/domains/member/types/role.types";
import Link from "next/link";
import { Home } from "lucide-react";

interface MenuMobileProps {
  role?: Role | null;
  orgSlug: string;
}

export default function MobileHeader({ role, orgSlug }: MenuMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Fecha com Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) closeMenu();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      <AnimatedMenuIcon
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen((p) => !p)}
        ref={closeButtonRef}
      />

      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        aria-label="Menú de navegación"
        aria-modal="true"
        role="dialog"
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm
          bg-[#0c232a] font-extralight text-slate-200
          shadow-xl
          transition-transform duration-300 ease-out
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="px-6 pb-4 pt-10">
          <p className="text-sm text-neutral-500">Menú</p>
          <h2 className="mt-1 text-2xl font-semibold">Navegación</h2>
        </div>

        <nav aria-label="Menú principal">
          <ul className="flex flex-col gap-1 px-3">
            <li>
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 border-b p-5 text-2xl transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Home className="h-7 w-7" aria-hidden="true" />
                <span className="font-medium">Inicio</span>
              </Link>
            </li>
            {navigation.map((item) => (
              <li key={item.id}>
                <MenuItem
                  item={item}
                  orgSlug={orgSlug}
                  onSelect={closeMenu}
                  className="gap-5 border-b p-5 text-2xl"
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-6 pb-8 pt-6">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
