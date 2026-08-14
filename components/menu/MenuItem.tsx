"use client";

import type { NavigationItem as Item } from "@/features/navigation/constants/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { NavLink } from "../ui/NavLink";

type Props = {
  item: Item;
  orgSlug: string;
  onSelect: () => void;
  className?: string;
};

export default function MenuItem({ item, orgSlug, onSelect, className }: Props) {
  const { t } = useI18n();
  const Icon = item.icon;
  const label = item.label ? t.navigation[item.label] : item.name;

  return (
    <NavLink
      href={`/org/${orgSlug}${item.href}`}
      onClick={onSelect}
      className={cn(
        "text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
    >
      <div className="inline-flex gap-3">
        <Icon className="h-7 w-7" aria-hidden="true" />
        <span className="font-medium">{label}</span>
      </div>
    </NavLink>
  );
}
