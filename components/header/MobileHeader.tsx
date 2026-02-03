"use client";

import { getNavigationByRole, navigationMenu } from "@/constants/navigation";
import { useState } from "react";
import MobileMenuItem from "./MobileMenuItem";
import LogoutButton from "../LogoutButton";
import AnimatedMenuIcon from "./AnimatedMenuIcon";

interface MenuMobileProps {
  role?: "member" | "admin" | "owner" | null;
}

export default function MobileHeader({ role }: MenuMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="relative">
      <AnimatedMenuIcon
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen((prev) => !prev)}
      />

      {isMenuOpen && (
        <div className="z-50 bg-[#0c232a] text-slate-100 absolute top-19  w-96 -right-5">
          <header className="h-20 flex items-center justify-center border-b border-white/10">
            <h2 className="text-2xl">Menu</h2>
          </header>

          <nav className="flex flex-col gap-6 p-6">
            {navigation.map((item) => (
              <MobileMenuItem key={item.id} item={item} onSelect={closeMenu} />
            ))}

            <LogoutButton />
          </nav>
        </div>
      )}
    </div>
  );
}
