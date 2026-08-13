"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import type { IconType } from "react-icons";
import { SiApple, SiGooglemaps, SiWaze } from "react-icons/si";

interface Props {
  latitude: number;
  longitude: number;
}

type NavApp = {
  id: "googleMaps" | "waze" | "appleMaps";
  label: string;
  href: string;
  bg: string;
  color: string;
  Icon: IconType;
};

function buildLinks(lat: number, lng: number): NavApp[] {
  const dest = `${lat},${lng}`;
  return [
    {
      id: "googleMaps",
      label: "Google Maps",
      href: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      bg: "#ffffff",
      color: "#1a2028",
      Icon: SiGooglemaps,
    },
    {
      id: "waze",
      label: "Waze",
      href: `https://waze.com/ul?ll=${dest}&navigate=yes`,
      bg: "#14c6f7",
      color: "#ffffff",
      Icon: SiWaze,
    },
    {
      id: "appleMaps",
      label: "Apple Maps",
      href: `http://maps.apple.com/?daddr=${dest}`,
      bg: "#1a2028",
      color: "#ffffff",
      Icon: SiApple,
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
        {buildLinks(latitude, longitude).map(({ id, label, href, bg, color, Icon }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.common.navigate}: ${label}`}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/5 px-2 py-3 shadow-xs transition-transform hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: bg, color }}
          >
            <Icon size={20} aria-hidden />
            <span className="text-center text-xs font-bold leading-tight">{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
