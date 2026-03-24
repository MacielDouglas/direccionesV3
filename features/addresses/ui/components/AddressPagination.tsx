import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}

export function AddressPagination({ page, total, pageSize, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between gap-2 pt-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Anterior
      </Button>

      <span className="text-xs text-muted-foreground tabular-nums">
        Página {page} de {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Próxima página"
        className="gap-1"
      >
        Siguiente
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  );
}
