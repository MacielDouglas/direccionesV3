"use client";

import { getNavigationByRole, navigationMenu } from "@/features/navigation/constants/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import LogoutButton from "../LogoutButton";
import MenuItem from "./MenuItem";

interface MainAppMenuProps {
  role?: "member" | "admin" | "owner" | null;
  orgSlug: string;
}

const NAV_LABELS = {
  "my-cards": "navigation.myCardsLabel",
  addresses: "navigation.addressesLabel",
  "addresses-new": "navigation.newAddress",
  "addresses-locate": "navigation.allAddresses",
  user: "navigation.profileLabel",
  busqueda: "navigation.surveyLabel",
  agenda: "navigation.agendaLabel",
  admin: "navigation.administration",
} as const;

type LabelKey = (typeof NAV_LABELS)[keyof typeof NAV_LABELS];

const baseItemStyle = cn(
  "group flex items-center justify-between gap-5",
  "rounded-2xl p-4 pl-6",
  "shadow-sm shadow-black/5 dark:shadow-black/20",
  "transition-all duration-150 ease-out",
  "active:scale-95 active:shadow-none select-none",
);

export default function MainAppMenu({ role, orgSlug }: MainAppMenuProps) {
  const { t } = useI18n();
  const navigation = role ? getNavigationByRole(navigationMenu, role) : [];
  const menu = navigation.filter((item) => item.id !== "home");

  const labelOf = (id: string): string => {
    const key = NAV_LABELS[id as keyof typeof NAV_LABELS] as LabelKey | undefined;
    if (!key) return id;
    const value = key.split(".").reduce<unknown>(
      (acc, part) => {
        if (acc && typeof acc === "object") {
          return (acc as Record<string, unknown>)[part];
        }
        return undefined;
      },
      t as unknown as Record<string, unknown>,
    );
    return typeof value === "string" ? value : id;
  };

  const handleHaptic = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-border pb-6">
        <nav aria-label={t.header.mainMenu}>
          <ul className="space-y-3 p-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const isAdmin = !!item.roles;
              const bgStyle = isAdmin
                ? "bg-brand text-brand-foreground"
                : "bg-card text-card-foreground";

              if (item.children) {
                return (
                  <li key={item.id}>
                    <details className="group">
                      <summary className={cn(baseItemStyle, bgStyle, "cursor-pointer list-none")}>
                        <span className="flex items-center gap-3">
                          <Icon className="h-7 w-7" aria-hidden="true" />
                          <span className="text-lg font-semibold">{labelOf(item.id)}</span>
                        </span>
                        <ChevronDown
                          className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>

                      <ul className="m-2 space-y-3 rounded-2xl bg-muted p-2 dark:bg-muted/60">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <MenuItem
                              item={{ ...child, label: labelOf(child.id) }}
                              onSelect={handleHaptic}
                              orgSlug={orgSlug}
                              className={cn(
                                baseItemStyle,
                                "bg-card hover:scale-[1.01]",
                                "dark:bg-surface-elevated-dark dark:text-foreground",
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
                    item={{ ...item, label: labelOf(item.id) }}
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
