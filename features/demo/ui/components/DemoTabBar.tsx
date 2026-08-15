"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CreditCard, Info, MapPin } from "lucide-react";

export type DemoTab = "cards" | "addresses" | "about";

const TABS: { id: DemoTab; labelKey: "cards" | "addresses" | "about"; Icon: typeof CreditCard }[] =
  [
    { id: "cards", labelKey: "cards", Icon: CreditCard },
    { id: "addresses", labelKey: "addresses", Icon: MapPin },
    { id: "about", labelKey: "about", Icon: Info },
  ];

export function DemoTabBar({ tab, onChange }: { tab: DemoTab; onChange: (tab: DemoTab) => void }) {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t.demo.tabs.about}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-md">
        {TABS.map(({ id, labelKey, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={active}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand",
                active ? "text-brand" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-[0.625rem] font-semibold uppercase tracking-widest">
                {t.demo.tabs[labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
