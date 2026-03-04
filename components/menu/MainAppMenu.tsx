"use client";

import {
  getNavigationByRole,
  navigationMenu,
} from "@/features/navigation/constants/navigation";
import LogoutButton from "../LogoutButton";
import MenuItem from "./MenuItem";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainAppMenuProps {
  role?: "member" | "admin" | "owner" | null;
  orgSlug: string;
}

const baseItemStyle = cn(
  "group flex items-center justify-between gap-5",
  "rounded-xl p-4 pl-8",
  "shadow-md shadow-black/10 dark:shadow-black/30",
  "transition-all duration-150 ease-out",
  "active:scale-95 active:shadow-sm select-none",
);

export default function MainAppMenu({ role, orgSlug }: MainAppMenuProps) {
  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];
  const menu = navigation.filter((item) => item.id !== "home");

  const handleHaptic = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-black/10 pb-8 dark:border-white/10">
        <nav aria-label="Menú principal">
          <ul className="space-y-4 p-3">
            {menu.map((item) => {
              const Icon = item.icon;
              const isAdmin = !!item.roles;
              const bgStyle = isAdmin
                ? "bg-brand text-white"
                : "bg-white dark:bg-surface-subtle-dark";

              if (item.children) {
                return (
                  <li key={item.id}>
                    <details className="group">
                      <summary
                        className={cn(
                          baseItemStyle,
                          bgStyle,
                          "cursor-pointer list-none",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-7 w-7" aria-hidden="true" />
                          <span className="text-lg font-medium">
                            {item.name}
                          </span>
                        </span>
                        <ChevronDown
                          className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>

                      <ul className="m-2 space-y-4 rounded-xl bg-stone-100 p-2 dark:bg-stone-700/80">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <MenuItem
                              item={child}
                              onSelect={handleHaptic}
                              orgSlug={orgSlug}
                              className={cn(
                                baseItemStyle,
                                "bg-stone-50 hover:scale-[1.01]",
                                "dark:bg-surface-elevated-dark dark:text-surface-elevated-light",
                              )}
                            />
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <MenuItem
                    item={item}
                    onSelect={handleHaptic}
                    orgSlug={orgSlug}
                    className={cn(baseItemStyle, bgStyle)}
                  />
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="pt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
