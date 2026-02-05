"use client";

import { getNavigationByRole, navigationMenu } from "@/constants/navigation";
import { useEffect, useState } from "react";
import MobileMenuItem from "./MobileMenuItem";
import LogoutButton from "../LogoutButton";
import AnimatedMenuIcon from "./AnimatedMenuIcon";

interface MenuMobileProps {
  role?: "member" | "admin" | "owner" | null;
  orgSlug: string;
}

export default function MobileHeader({ role, orgSlug }: MenuMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  return (
    <>
      <AnimatedMenuIcon
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen((p) => !p)}
      />

      {/* Overlay */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isMenuOpen
            ? "bg-[#0c232a]/50 opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Menu */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm
        bg-[#0c232a] text-slate-200 font-extralight
        shadow-xl
        transform transition-transform duration-300 ease-out
        ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Top spacing (One UI feeling) */}
        <div className="pt-10 pb-4 px-6">
          <p className="text-sm text-neutral-500">Menu</p>
          <h2 className="text-2xl font-semibold mt-1">Navegação</h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3">
          {navigation.map((item) => (
            <MobileMenuItem
              key={item.id}
              item={item}
              orgSlug={orgSlug}
              onSelect={closeMenu}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-6 pb-8 pt-6">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
