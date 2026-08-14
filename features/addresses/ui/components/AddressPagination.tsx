"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}

export function AddressPagination({ page, total, pageSize, onChange }: Props) {
  const { t } = useI18n();
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t.addresses.paginationAria}
      className="flex items-center justify-between gap-2 pt-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={t.addresses.previousPage}
        className="gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t.addresses.previousLabel}
      </Button>

      <span className="text-xs text-muted-foreground tabular-nums">
        {t.addresses.pageOf
          .replace("{page}", String(page))
          .replace("{totalPages}", String(totalPages))}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label={t.addresses.nextPage}
        className="gap-1"
      >
        {t.addresses.nextLabel}
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  );
}
