"use client";

import { getNavigationByRole, navigationMenu } from "@/constants/navigation";
// import LogoutButton from "@/components/logout/LogoutButton";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

interface MainAppMenuProps {
  role?: "member" | "admin" | "owner" | null;
  orgSlug: string;
}

export default function MainAppMenu({ role, orgSlug }: MainAppMenuProps) {
  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];

  const menu = navigation.filter((item) => item.id !== "home");

  return (
    <div className="flex flex-col w-full h-full">
      <div className="border-b border-black/10">
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-6 uppercase p-10">
            {menu.map((item) => (
              <Link
                key={item.id}
                href={
                  item.name === "Usuarios"
                    ? `${item.href}${orgSlug}`
                    : item.href
                }
                className="flex justify-center items-center gap-6 border p-3 bg-linear-to-b from-slate-100 to-slate-300 rounded-xl border-slate-300 shadow"
              >
                <span className="font-light text-2xl truncate">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <div className="px-4 pb-6 pt-3 border-t border-white/5">
        <LogoutButton />
      </div>
    </div>
  );
}
