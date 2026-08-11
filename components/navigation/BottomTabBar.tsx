"use client";

import { useHaptic } from "@/app/hooks/useHaptic";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CalendarDays, CreditCard, Home, MapPin, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomTabBarProps {
  orgSlug: string;
}

export function BottomTabBar({ orgSlug }: BottomTabBarProps) {
  const pathname = usePathname();
  const { vibrate } = useHaptic();
  const { t } = useI18n();

  const tabs = [
    { id: "home", href: "/", label: t.navigation.homeLabel, Icon: Home },
    {
      id: "my-cards",
      href: "/my-cards",
      label: t.navigation.myCardsLabel,
      Icon: CreditCard,
    },
    {
      id: "addresses",
      href: "/addresses",
      label: t.navigation.addressesLabel,
      Icon: MapPin,
    },
    { id: "agenda", href: "/agenda", label: t.navigation.agendaLabel, Icon: CalendarDays },
    { id: "user", href: "/user", label: t.navigation.profileLabel, Icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === `/org/${orgSlug}`;
    return pathname.startsWith(`/org/${orgSlug}${href}`);
  };

  return (
    <nav
      aria-label={t.header.mainMenu}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {tabs.map(({ id, href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={id} className="flex-1">
              <Link
                href={`/org/${orgSlug}${href === "/" ? "" : href}`}
                onClick={() => vibrate("light")}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  active ? "text-brand" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("size-5 transition-transform", active && "scale-110")}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
