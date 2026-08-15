"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
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

function buildLinks(lat: number, lng: number, isIOS: boolean): NavApp[] {
  const dest = `${lat},${lng}`;
  const links: NavApp[] = [
    {
      id: "googleMaps",
      label: "Google Maps",
      href: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      bg: "#ffffff",
      color: "#1a2028", // impeccable-disable-line design-system-color -- cor da marca Google Maps
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
  ];

  if (isIOS) {
    links.push({
      id: "appleMaps",
      label: "Apple Maps",
      href: `http://maps.apple.com/?daddr=${dest}`,
      bg: "#1a2028",
      color: "#ffffff",
      Icon: SiApple,
    });
  }

  return links;
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function NavigateAddressButtons({ latitude, longitude }: Props) {
  const { t } = useI18n();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(detectIOS());
  }, []);

  const links = buildLinks(latitude, longitude, isIOS);

  return (
    <section aria-label={t.common.navigate} className="flex flex-col gap-2">
      <h3 className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
        {t.common.navigate}
      </h3>
      <div className={cn("grid gap-2", links.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {links.map(({ id, label, href, bg, color, Icon }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.common.navigate}: ${label}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-black/5 px-2 py-2 shadow-xs transition-transform hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: bg, color }}
          >
            <Icon size={16} aria-hidden />
            <span className="truncate text-xs font-bold leading-tight">{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
