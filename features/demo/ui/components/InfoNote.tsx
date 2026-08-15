import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

export function InfoNote({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
