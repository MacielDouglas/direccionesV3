import { PendingDeletionBadge } from "@/features/addresses/ui/components/PendingDeletionBadge";
import { getAgendaEventsByDay } from "@/features/agenda/application/agenda.service";
import { eventTime, todayInBrasiliaDateOnly } from "@/features/agenda/utils/agenda-time";
import { countMyCards, countMyTotalAddresses } from "@/features/cards/application/card.service";
import { getServerDictionary } from "@/lib/i18n/server";
import { CalendarDays, ChevronRight, CreditCard, Plus, Shield } from "lucide-react";
import Link from "next/link";

interface HomeDashboardProps {
  organizationId: string;
  organizationSlug: string;
  personId: string;
  userName: string;
  isAdminOrOwner: boolean;
}

export async function HomeDashboard({
  organizationId,
  organizationSlug,
  personId,
  userName,
  isAdminOrOwner,
}: HomeDashboardProps) {
  const [t, cardCount, totalAddresses, todayEvents] = await Promise.all([
    getServerDictionary(),
    countMyCards(organizationId, personId),
    countMyTotalAddresses(organizationId, personId),
    getAgendaEventsByDay(organizationId, todayInBrasiliaDateOnly()),
  ]);

  const hasEvents = todayEvents.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 md:py-10">
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {t.home.welcome} <span className="text-foreground">{userName}</span>
      </h1>

      <div className="mt-6 space-y-6">
        {/* Hero — Saldo de Cards */}
        <Link
          href={`/org/${organizationSlug}/my-cards`}
          className="group flex items-center justify-between gap-4 rounded-xl bg-black p-6 text-white shadow-md shadow-black/20 transition-transform active:scale-[0.99]"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-400">
              <CreditCard className="size-4" aria-hidden="true" />
              {t.home.cardsTitle}
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-bold leading-none tabular-nums">{cardCount}</span>
              <span className="text-sm font-medium text-neutral-300">
                {cardCount === 1 ? t.home.cardsUnitSingular : t.home.cardsUnit}
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {t.home.addressesBadge.replace("{count}", String(totalAddresses))}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-medium text-neutral-300">{t.home.goToCards}</span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-0.5">
              <ChevronRight className="size-5" aria-hidden="true" />
            </span>
          </span>
        </Link>

        {/* Administração */}
        {isAdminOrOwner && (
          <Link
            href={`/org/${organizationSlug}/admin`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Shield className="size-4 text-brand" aria-hidden="true" />
            {t.navigation.administration}
          </Link>
        )}

        {/* Enviar novo endereço */}
        <Link
          href={`/org/${organizationSlug}/addresses/new`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-3.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand/90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t.addresses.sendNew}
        </Link>

        {/* Programação de hoje */}
        <section aria-labelledby="today-agenda">
          <div className="flex items-center justify-between">
            <h2
              id="today-agenda"
              className="flex items-center gap-2 text-base font-semibold text-foreground"
            >
              <CalendarDays className="size-4 text-brand" aria-hidden="true" />
              {t.home.todayAgenda}
            </h2>
            <Link
              href={`/org/${organizationSlug}/agenda`}
              className="text-sm font-medium text-brand transition-colors hover:text-brand-muted"
            >
              {t.agenda.title}
            </Link>
          </div>

          {hasEvents ? (
            <ul className="mt-3 space-y-2">
              {todayEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/org/${organizationSlug}/agenda`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark"
                  >
                    <div className="flex h-9 min-w-9 flex-col items-center justify-center rounded-lg bg-black px-2 text-white">
                      <span className="text-[0.625rem] font-medium uppercase leading-none tracking-wide text-neutral-300">
                        {t.agenda.hour}
                      </span>
                      <span className="mt-0.5 text-xs font-semibold tabular-nums leading-none">
                        {eventTime(event)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {event.tipo ?? event.territorio ?? event.saida ?? t.agenda.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {[event.territorio, event.saida, event.conductor?.name]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">{t.home.noEventsToday}</p>
              <Link
                href={`/org/${organizationSlug}/agenda`}
                className="mt-1.5 inline-block text-sm font-medium text-brand transition-colors hover:text-brand-muted"
              >
                {t.home.viewAgenda}
              </Link>
            </div>
          )}
        </section>

        {isAdminOrOwner && (
          <PendingDeletionBadge organizationId={organizationId} orgSlug={organizationSlug} />
        )}
      </div>
    </div>
  );
}
