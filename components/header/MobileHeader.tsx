"use client";

import { useHaptic } from "@/app/hooks/useHaptic";
import type { Role } from "@/domains/member/types/role.types";
import { getNavigationByRole, navigationMenu } from "@/features/navigation/constants/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Home, Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LanguageSelector } from "../LanguageSelector";
import LogoutButton from "../LogoutButton";
import MenuItem from "../menu/MenuItem";
import { Button } from "../ui/button";

interface MenuMobileProps {
  role?: Role | null;
  orgSlug?: string;
}

export default function MobileHeader({ role, orgSlug }: MenuMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const { t } = useI18n();
  const { vibrate } = useHaptic();

  const navigation = orgSlug && role ? getNavigationByRole(navigationMenu, role) : [];
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((p) => !p), []);

  // Garante renderização só no cliente (portal depende de document.body)
  useEffect(() => setMounted(true), []);

  // inert via DOM
  useEffect(() => {
    if (!drawerRef.current) return;
    if (isMenuOpen) {
      drawerRef.current.removeAttribute("inert");
    } else {
      drawerRef.current.setAttribute("inert", "");
    }
  }, [isMenuOpen]);

  // Scroll lock (sem saltar a página) + ESC + focus trap
  useEffect(() => {
    if (!isMenuOpen) return;

    const root = document.documentElement;
    const body = document.body;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

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
      root.style.overflow = "";
      body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  return (
    <>
      {/* Botão abrir — no Header */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={() => {
          vibrate("light");
          toggleMenu();
        }}
        aria-label={t.header.menu}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        className="h-11 w-11 rounded-xl text-foreground hover:bg-accent active:scale-95"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      {mounted &&
        createPortal(
          <>
            {/* Overlay — fora do header para blur/stacking corretos */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={closeMenu}
              className={`
                fixed inset-0 z-50
                bg-black/60 backdrop-blur-sm
                transition-opacity duration-300
                ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}
              `}
            />

            {/* Drawer — <aside> em vez de <dialog>: top layer do Safari iOS
                não pinta itens intermediários (bug conhecido WebKit) */}
            <aside
              ref={drawerRef}
              id="mobile-menu"
              // biome-ignore lint/a11y/useSemanticElements: <dialog> no top layer não pinta itens no Safari iOS (WebKit 276727/296925); <aside role="dialog"> é o workaround
              role="dialog"
              aria-modal="true"
              aria-label={t.header.navigation}
              className={`
                fixed inset-y-0 right-0 left-auto z-60
                flex flex-col
                w-[min(100vw,22rem)]
                border-l border-border bg-background p-0 text-foreground
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
                  <p className="text-xs font-light uppercase tracking-widest text-muted-foreground">
                    {t.header.menu}
                  </p>
                  <h2 className="mt-0.5 text-xl font-semibold">{t.header.navigation}</h2>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    closeMenu();
                    triggerRef.current?.focus();
                  }}
                  aria-label={t.header.closeMenu}
                  className="h-11 w-11 rounded-xl text-foreground hover:bg-accent active:scale-95"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>

              <div className="mx-5 h-px bg-border" aria-hidden="true" />

              {/* Nav */}
              <nav
                aria-label={t.header.mainMenu}
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
                        hover:bg-accent
                        active:scale-[0.98] active:bg-accent
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                      "
                    >
                      <Home className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                      {t.navigation.homeLabel}
                    </Link>
                  </li>

                  {navigation.length > 0 && (
                    <li aria-hidden="true" className="mx-1 my-1 h-px bg-border" />
                  )}

                  {navigation.map((item) => (
                    <li key={item.id}>
                      <MenuItem
                        item={item}
                        orgSlug={orgSlug ?? ""}
                        onSelect={closeMenu}
                        className="
                          flex items-center gap-4
                          rounded-xl px-4 py-3.5
                          text-base font-medium
                          transition-all
                          hover:bg-accent
                          active:scale-[0.98] active:bg-accent
                          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                        "
                      />
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mx-5 h-px bg-border" aria-hidden="true" />
              <div className="flex flex-col gap-4 px-5 py-4">
                <LanguageSelector />
                <LogoutButton />
              </div>
            </aside>
          </>,
          document.body,
        )}
    </>
  );
}
