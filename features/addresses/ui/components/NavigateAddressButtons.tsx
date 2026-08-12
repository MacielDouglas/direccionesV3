"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { Apple, Map as MapIcon, Navigation } from "lucide-react";

interface Props {
  latitude: number;
  longitude: number;
}

type NavApp = {
  id: "googleMaps" | "waze" | "appleMaps";
  label: string;
  href: string;
  Icon: typeof MapIcon;
};

function buildLinks(lat: number, lng: number): NavApp[] {
  const dest = `${lat},${lng}`;
  return [
    {
      id: "googleMaps",
      label: "Google Maps",
      href: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      Icon: MapIcon,
    },
    {
      id: "waze",
      label: "Waze",
      href: `https://waze.com/ul?ll=${dest}&navigate=yes`,
      Icon: Navigation,
    },
    {
      id: "appleMaps",
      label: "Apple Maps",
      href: `http://maps.apple.com/?daddr=${dest}`,
      Icon: Apple,
    },
  ];
}

export function NavigateAddressButtons({ latitude, longitude }: Props) {
  const { t } = useI18n();

  return (
    <section aria-label={t.common.navigate} className="flex flex-col gap-2">
      <h3 className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
        {t.common.navigate}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {buildLinks(latitude, longitude).map(({ id, label, href, Icon }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.common.navigate}: ${label}`}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="size-5 text-brand" aria-hidden />
            <span className="text-center text-xs font-semibold leading-tight">{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
