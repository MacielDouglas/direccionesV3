"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  href: string;
  label?: string;
  className?: string;
}

export function BackLink({ href, label, className }: Props) {
  const { t } = useI18n();

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden />
      {label ?? t.common.back}
    </Link>
  );
}
