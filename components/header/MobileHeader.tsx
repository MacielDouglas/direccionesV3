"use client";

import {
  getNavigationByRole,
  navigationMenu,
} from "@/features/navigation/constants/navigation";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "../LogoutButton";
import MenuItem from "../menu/MenuItem";
import type { Role } from "@/domains/member/types/role.types";
import Link from "next/link";
import { Home, Menu, X } from "lucide-react";
import { Button } from "../ui/button";

interface MenuMobileProps {
  role?: Role | null;
  orgSlug: string;
}

export default function MobileHeader({ role, orgSlug }: MenuMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];
  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((p) => !p);

  // inert via DOM
  useEffect(() => {
    if (!drawerRef.current) return;
    if (isMenuOpen) {
      drawerRef.current.removeAttribute("inert");
    } else {
      drawerRef.current.setAttribute("inert", "");
    }
  }, [isMenuOpen]);

  // Scroll lock + ESC + focus trap
  useEffect(() => {
    if (!isMenuOpen) return;

    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
        return;
      }

      if (e.key !== "Tab") return;
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Botão abrir — no Header */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        aria-label="Abrir menú"
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        className="h-11 w-11 rounded-xl text-slate-200 hover:bg-white/10 active:scale-95"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`
          fixed inset-0 z-40
          bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`
          fixed inset-y-0 right-0 z-50
          flex flex-col
          w-[min(100vw,22rem)]
          bg-[#0c232a] text-slate-100
          shadow-2xl
          transition-transform duration-300 ease-out
          will-change-transform
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <div>
            <p className="text-xs font-light uppercase tracking-widest text-slate-400">
              Menú
            </p>
            <h2 className="mt-0.5 text-xl font-semibold">Navegación</h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              closeMenu();
              triggerRef.current?.focus();
            }}
            aria-label="Cerrar menú"
            className="h-11 w-11 rounded-xl text-slate-200 hover:bg-white/10 active:scale-95"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="mx-5 h-px bg-white/10" aria-hidden="true" />

        {/* Nav */}
        <nav
          aria-label="Menú principal"
          className="flex-1 overflow-y-auto overscroll-contain py-2"
        >
          <ul className="flex flex-col gap-1 px-3">
            <li>
              <Link
                href="/"
                onClick={closeMenu}
                className="
                  flex items-center gap-4
                  rounded-xl px-4 py-3.5
                  text-base font-medium
                  transition-all
                  hover:bg-white/8
                  active:scale-[0.98] active:bg-white/12
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                "
              >
                <Home className="h-5 w-5 shrink-0" aria-hidden="true" />
                Inicio
              </Link>
            </li>

            {navigation.length > 0 && (
              <li aria-hidden="true" className="mx-1 my-1 h-px bg-white/10" />
            )}

            {navigation.map((item) => (
              <li key={item.id}>
                <MenuItem
                  item={item}
                  orgSlug={orgSlug}
                  onSelect={closeMenu}
                  className="
                    flex items-center gap-4
                    rounded-xl px-4 py-3.5
                    text-base font-medium
                    transition-all
                    hover:bg-white/8
                    active:scale-[0.98] active:bg-white/12
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                  "
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mx-5 h-px bg-white/10" aria-hidden="true" />
        <div className="px-5 py-4">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
