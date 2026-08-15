"use client";

import { useHaptic } from "@/app/hooks/useHaptic";
import type { Role } from "@/domains/member/types/role.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CalendarDays, CreditCard, Home, MapPin, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface BottomTabBarProps {
  orgSlug: string;
  role?: Role | null;
}

export function BottomTabBar({ orgSlug, role }: BottomTabBarProps) {
  const pathname = usePathname();
  const { vibrate } = useHaptic();
  const { t } = useI18n();
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  const isAdminRole = role === "admin" || role === "owner";

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
    isAdminRole
      ? { id: "admin", href: "/admin", label: t.navigation.administration, Icon: ShieldCheck }
      : { id: "user", href: "/user", label: t.navigation.profileLabel, Icon: User },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (delta > 8 && currentScrollY > 0) {
        setIsHidden(true);
      } else if (delta < -8) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === `/org/${orgSlug}`;
    return pathname.startsWith(`/org/${orgSlug}${href}`);
  };

  return (
    <nav
      aria-label={t.header.mainMenu}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md text-foreground transition-transform duration-500 ease-in-out md:hidden",
        isHidden && "translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {tabs.map(({ id, href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={id} className="flex-1">
              <Link
                href={href === "/" ? "/" : `/org/${orgSlug}${href}`}
                onClick={() => vibrate("light")}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  active ? "text-brand" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 transition-transform",
                    active && "scale-110 text-brand stroke-[2.5]",
                  )}
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
