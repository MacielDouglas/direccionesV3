"use client";

import type { NavigationItem as Item } from "@/features/navigation/constants/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { NavLink } from "../ui/NavLink";

type Props = {
  item: Item;
  orgSlug: string;
  onSelect: () => void;
};

export default function MenuItem({ item, orgSlug, onSelect }: Props) {
  const { t } = useI18n();
  const pathname = usePathname();
  const Icon = item.icon;
  const label = item.label ? t.navigation[item.label] : item.name;

  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const orgBase = `/org/${orgSlug}`;
  const active =
    item.href === "/"
      ? cleanPath === "/" || cleanPath === orgBase
      : cleanPath === `${orgBase}${item.href}` || cleanPath.startsWith(`${orgBase}${item.href}/`);
  // Reuniões acende no azul do módulo (igual à tab bar); o resto no laranja.
  const meeting = item.accent === "meeting";

  return (
    <NavLink
      href={item.href === "/" && !orgSlug ? "/" : `${orgBase}${item.href}`}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        active
          ? meeting
            ? "bg-meeting/10 font-semibold"
            : "bg-brand/10 font-semibold"
          : "hover:bg-accent",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
          active
            ? meeting
              ? "bg-meeting text-white"
              : "bg-brand text-brand-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-base">{label}</span>
    </NavLink>
  );
}
