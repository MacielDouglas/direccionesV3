"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getCardRegistryAction } from "@/features/cards/application/card.actions";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CalendarCheck, CalendarX, History, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type RegistryEvent = {
  id: string;
  action: "ASSIGNED" | "RETURNED" | "TRANSFERRED";
  date: string;
  person: { id: string; name: string; user: { image: string | null } | null } | null;
};

type RegistrySession = {
  id: string;
  person: NonNullable<RegistryEvent["person"]>;
  assignedAt: string;
  returnedAt: string | null;
};

function buildSessions(events: RegistryEvent[]): RegistrySession[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const sessions: RegistrySession[] = [];

  for (const event of sorted) {
    if (event.action === "ASSIGNED" && event.person) {
      sessions.push({
        id: event.id,
        person: event.person,
        assignedAt: event.date,
        returnedAt: null,
      });
      continue;
    }

    if (event.action === "RETURNED") {
      const open = [...sessions]
        .reverse()
        .find(
          (session) =>
            !session.returnedAt && (!event.person || session.person.id === event.person.id),
        );
      if (open) open.returnedAt = event.date;
    }
  }

  return sessions;
}

function formatDate(date: string, locale: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-419", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

type RegistryResult =
  | Awaited<ReturnType<typeof getCardRegistryAction>>
  | { success: false; error?: string };

interface Props {
  cardId: string;
  cardNumber: number;
  color: string;
  open: boolean;
  onClose: () => void;
}

export function CardRegistryModal({ cardId, cardNumber, color, open, onClose }: Props) {
  const { t } = useI18n();
  const [result, setResult] = useState<RegistryResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setResult(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setResult(null);

    getCardRegistryAction(cardId)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setResult({ success: false, error: t.admin.registryError });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, cardId, t]);

  const sessions = useMemo(() => (result?.success ? buildSessions(result.events) : []), [result]);
  const currentPerson = result?.success ? result.current : null;
  const currentSession = sessions.find((session) => !session.returnedAt) ?? null;
  const hasRecords = sessions.length > 0 || currentPerson !== null;
  const pastSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.returnedAt)
        .slice(-6)
        .reverse(),
    [sessions],
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed z-50 gap-0",
          "max-h-[92dvh] w-full max-w-full overflow-y-auto p-0",
          "left-0! right-0! bottom-0! top-auto! rounded-t-3xl! border-0!",
          "translate-x-0! translate-y-0!",
          "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
          "sm:max-w-lg! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t.admin.registryTitle.replace("{number}", String(cardNumber))}</DialogTitle>
          <DialogDescription>{t.admin.registryDescription}</DialogDescription>
        </DialogHeader>

        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 bg-card/95 p-3 backdrop-blur">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <History className="size-4 text-brand" aria-hidden />
            {t.admin.registryTitle.replace("{number}", String(cardNumber))}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 border-t border-border bg-card p-4 pb-8 sm:p-6">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
              >
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : result && !result.success ? (
          <div className="border-t border-border bg-card p-4 pb-8 sm:p-6">
            <p className="py-6 text-center text-sm text-destructive">
              {result.error ?? t.admin.registryError}
            </p>
          </div>
        ) : !hasRecords ? (
          <div className="flex flex-col items-center gap-2 border-t border-border bg-card py-10 text-center text-sm text-muted-foreground sm:p-6">
            <UserRound className="size-6" aria-hidden />
            <p>{t.admin.registryEmpty}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 border-t border-border bg-card p-4 pb-8 sm:p-6">
            <section
              aria-label={t.admin.registryCurrent}
              className="rounded-xl border-2 border-brand/30 bg-brand/5 p-3"
            >
              <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-brand">
                {t.admin.registryCurrent}
              </p>
              {currentPerson ? (
                <SessionRow
                  session={{
                    id: currentPerson.id,
                    person: currentPerson,
                    assignedAt: currentSession?.assignedAt ?? "",
                    returnedAt: null,
                  }}
                  color={color}
                  current
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-border bg-muted/40 text-muted-foreground"
                    aria-hidden="true"
                  >
                    <UserRound className="size-5" />
                  </span>
                  <p className="text-sm text-muted-foreground">{t.admin.registryNoUsers}</p>
                </div>
              )}
            </section>

            {pastSessions.length > 0 && (
              <section aria-label={t.admin.historyTitle}>
                <h3 className="mb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t.admin.historyTitle}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {pastSessions.map((session) => (
                    <li key={session.id}>
                      <SessionRow session={session} color={color} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SessionRow({
  session,
  color,
  current = false,
}: {
  session: RegistrySession;
  color: string;
  current?: boolean;
}) {
  const { t, locale } = useI18n();
  const image = session.person.user?.image ?? null;
  const initial = session.person.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-3">
      {image ? (
        <Image
          src={image}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
          aria-hidden="true"
        />
      ) : (
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        >
          {initial}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
          {session.person.name}
          {current && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[0.625rem] font-semibold text-brand">
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {t.admin.registryInUse}
            </span>
          )}
        </p>
        {session.assignedAt && (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="size-3.5 shrink-0 text-emerald-500" aria-hidden />
            {t.admin.registryDesignatedAt.replace("{date}", formatDate(session.assignedAt, locale))}
          </p>
        )}
        {session.returnedAt && (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarX className="size-3.5 shrink-0 text-amber-500" aria-hidden />
            {t.admin.registryReturnedAt.replace("{date}", formatDate(session.returnedAt, locale))}
          </p>
        )}
      </div>
    </div>
  );
}
