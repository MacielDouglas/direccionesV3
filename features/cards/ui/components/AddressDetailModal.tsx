"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ADDRESS_TYPE_OPTIONS } from "@/features/addresses/domain/constants/address.constants";
import type { AddressWithUsers } from "@/features/addresses/types/address.types";
import { AddressImageViewer } from "@/features/addresses/ui/components/AddressImageViewer";
import DeleteAddressButton from "@/features/addresses/ui/components/DeleteAddressButton";
import { NavigateAddressButtons } from "@/features/addresses/ui/components/NavigateAddressButtons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  type AddressInviteDto,
  createAddressInviteAction,
  getAddressInvitesAction,
  setAddressFlagAction,
} from "@/server/address/address.action";
import {
  Check,
  CircleAlert,
  DoorClosed,
  Loader2,
  MailCheck,
  Map as MapIcon,
  MapPin,
  Pencil,
  UserRoundX,
  X,
} from "lucide-react";
import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { AddressMapModal } from "./AddressMapModal";

const TYPE_TILE: Record<string, string> = {
  House: "bg-emerald-500/10",
  Apartment: "bg-pink-500/10",
  Store: "bg-amber-500/10",
  Hotel: "bg-blue-500/10",
  Restaurant: "bg-brand/10",
};

function typeTileOf(type: string): string {
  return TYPE_TILE[type] ?? "bg-muted";
}

function formatDate(date: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-419", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

const SHEET_CLASSES = cn(
  "fixed z-50 gap-0",
  "max-h-[92dvh] w-full max-w-full overflow-y-auto p-0",
  "left-0! right-0! bottom-0! top-auto! rounded-t-3xl! border-0!",
  "translate-x-0! translate-y-0!",
  "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
  "sm:max-w-lg! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
);

const CENTERED_CLASSES = cn(
  "max-w-sm rounded-2xl! p-0 gap-0 border shadow-lg",
  "max-h-[85dvh] overflow-y-auto",
);

interface Props {
  promise: Promise<AddressWithUsers | null> | null;
  organizationSlug: string;
  onClose: () => void;
  myCards?: boolean;
}

export function AddressDetailModal({ promise, onClose, organizationSlug, myCards = false }: Props) {
  const { t } = useI18n();

  return (
    <Dialog
      open={!!promise}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {/* Sheet mobile / diálogo central desktop */}
      <DialogContent showCloseButton={false} className={cn(SHEET_CLASSES, "sm:max-w-2xl!")}>
        <DialogHeader className="sr-only">
          <DialogTitle>{t.admin.addressDetailTitle}</DialogTitle>
          <DialogDescription>{t.admin.addressDetailDescription}</DialogDescription>
        </DialogHeader>

        {promise && (
          <Suspense fallback={<AddressDetailSkeleton />}>
            <AddressContent
              promise={promise}
              organizationSlug={organizationSlug}
              onClose={onClose}
              myCards={myCards}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AddressDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/95 p-3 backdrop-blur">
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="size-11 rounded-full" />
      </div>
      <section className="flex flex-col gap-4 border-t border-border bg-card p-4 pb-8 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 rounded-xl border p-4">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </section>
    </div>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

type FlagKind = "personChanged" | "noVisits";

function AddressContent({
  promise,
  organizationSlug,
  onClose,
  myCards,
}: {
  promise: Promise<AddressWithUsers | null>;
  organizationSlug: string;
  onClose: () => void;
  myCards: boolean;
}) {
  const { t, locale } = useI18n();
  const address = use(promise);
  const [mapOpen, setMapOpen] = useState(false);
  const [personChanged, setPersonChanged] = useState(false);
  const [noVisits, setNoVisits] = useState(false);
  const [invites, setInvites] = useState<AddressInviteDto[]>([]);
  const [flagTarget, setFlagTarget] = useState<{ flag: FlagKind; revert: boolean } | null>(null);
  const [isSavingFlag, setIsSavingFlag] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!address) return;
    setPersonChanged(address.personChanged);
    setNoVisits(address.noVisits);
  }, [address]);

  useEffect(() => {
    if (!myCards || !address) return;
    let cancelled = false;
    getAddressInvitesAction(address.id)
      .then((data) => {
        if (!cancelled) setInvites(data);
      })
      .catch(() => {
        if (!cancelled) setInvites([]);
      });
    return () => {
      cancelled = true;
    };
  }, [myCards, address]);

  if (!address)
    return (
      <div className="flex items-center justify-center px-4 py-16 text-center text-sm text-destructive">
        {t.addresses.notFound}
      </div>
    );

  const typeConfig = ADDRESS_TYPE_OPTIONS.find((opt) => opt.value === address.type);
  const Icon = typeConfig?.icon;
  const fullAddress = `${address.street}, ${address.number} · ${address.neighborhood}, ${address.city}`;
  const hasCoordinates = address.latitude != null && address.longitude != null;
  const yearInvites = invites.filter((invite) => invite.year === currentYear);
  const isToned = myCards && (personChanged || noVisits);
  const toneClasses = isToned
    ? noVisits
      ? "bg-red-50 dark:bg-red-950/20"
      : "bg-zinc-100 dark:bg-zinc-950/40"
    : null;

  const handleFlagConfirm = async () => {
    if (!flagTarget) return;
    const { flag, revert } = flagTarget;
    setIsSavingFlag(true);
    try {
      await setAddressFlagAction(address.id, flag, !revert);
      if (flag === "personChanged") setPersonChanged(!revert);
      else setNoVisits(!revert);
      toast.success(t.addresses.flagSaved);
      setFlagTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setIsSavingFlag(false);
    }
  };

  return (
    <article className={cn("flex flex-col", toneClasses)}>
      {/* Topo fixo: avisos + ver mapa + navegação + fechar */}
      <div
        className={cn(
          "sticky top-0 z-20 border-b border-border/60 backdrop-blur",
          isToned
            ? noVisits
              ? "bg-red-50/95 dark:bg-red-950/20"
              : "bg-zinc-100/95 dark:bg-zinc-950/40"
            : "bg-card/95",
        )}
      >
        {myCards && (personChanged || noVisits) && (
          <div className="flex flex-col gap-1.5 px-3 pt-3">
            {personChanged && (
              <p className="inline-flex items-center gap-1.5 self-start rounded-lg bg-zinc-200/80 px-2.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-widest text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <UserRoundX className="size-3.5 shrink-0" aria-hidden />
                {t.addresses.personChangedBanner}
              </p>
            )}
            {noVisits && (
              <p className="inline-flex items-center gap-1.5 self-start rounded-lg bg-red-100 px-2.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-widest text-red-700 dark:bg-red-950/60 dark:text-red-300">
                <DoorClosed className="size-3.5 shrink-0" aria-hidden />
                {t.addresses.noVisitsBanner}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 p-3">
          {hasCoordinates ? (
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MapIcon className="size-4 text-brand" aria-hidden />
              {t.cards.seeMap}
            </button>
          ) : (
            <span aria-hidden />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {hasCoordinates && (
          <div className="px-3 pb-3">
            <NavigateAddressButtons
              latitude={Number(address.latitude)}
              longitude={Number(address.longitude)}
            />
          </div>
        )}
      </div>

      {/* Detalhes */}
      <section
        aria-label={t.admin.addressDetailTitle}
        className={cn(
          "flex flex-col gap-5 border-t border-border p-4 pb-8 sm:p-6",
          !isToned && "bg-card",
        )}
      >
        {/* Cabeçalho: ícone + endereço à esquerda, foto à direita */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && <Icon className={cn("size-5 shrink-0", typeConfig?.color)} aria-hidden />}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                {address.businessName ?? `${address.street}, ${address.number}`}
              </h2>
              {address.businessName && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {address.street}, {address.number}
                </p>
              )}
            </div>
          </div>
          {address.image ? (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border">
              <AddressImageViewer
                src={address.image}
                alt={address.businessName ?? t.addresses.streetField}
              />
            </div>
          ) : (
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-xl",
                typeTileOf(address.type),
              )}
              aria-hidden
            >
              {Icon && <Icon className={typeConfig?.color} size={22} />}
            </span>
          )}
        </header>

        {/* Estado */}
        <ul className="flex flex-wrap gap-2" aria-label={t.addresses.statusAria}>
          <li
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              address.confirmed
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
            )}
          >
            {address.confirmed ? `✓ ${t.addresses.confirmed}` : `✗ ${t.addresses.notConfirmed}`}
          </li>
          <li
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              address.active
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {address.active ? `✓ ${t.addresses.activeBadge}` : `✗ ${t.addresses.inactiveBadge}`}
          </li>
          {address.pendingDeletionAt && (
            <li className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
              {t.addresses.pendingDeletion}
            </li>
          )}
        </ul>

        {/* Informação de localização */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-border bg-muted/40 p-4">
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.streetField}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.street}, {address.number}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.neighborhoodField}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.neighborhood}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.cityField}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {address.city}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.type}
            </dt>
            <dd className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              {Icon && <Icon className={cn("size-4", typeConfig?.color)} aria-hidden />}
              {typeConfig?.label ?? address.type}
            </dd>
          </div>
          {address.businessName && (
            <div className="col-span-2">
              <dt className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
                {t.addresses.businessField}
              </dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
                {address.businessName}
              </dd>
            </div>
          )}
        </dl>

        <p className="flex items-start gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          <MapPin className="mt-px size-3.5 shrink-0 text-brand" aria-hidden />
          {fullAddress}
        </p>

        {!address.active && (
          <p className="inline-flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t.addresses.inactiveWarning}
          </p>
        )}

        {/* Informação adicional */}
        {address.info && (
          <section className="rounded-xl bg-muted p-4">
            <h3 className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.addresses.additionalInfo}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">{address.info}</p>
          </section>
        )}

        {/* Ações do My Cards: situação + convites */}
        {myCards && (
          <>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFlagTarget({ flag: "personChanged", revert: personChanged })}
                  className={cn(
                    "w-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40",
                    personChanged &&
                      "border-rose-300 bg-rose-500 text-white hover:bg-rose-600 dark:border-rose-500 dark:bg-rose-600/80 dark:text-white dark:hover:bg-rose-500",
                  )}
                >
                  <UserRoundX className="size-4 shrink-0" aria-hidden />
                  {t.addresses.personChangedButton}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFlagTarget({ flag: "noVisits", revert: noVisits })}
                  className={cn(
                    "w-full border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-900/40",
                    noVisits &&
                      "border-violet-300 bg-violet-500 text-white hover:bg-violet-600 dark:border-violet-500 dark:bg-violet-600/80 dark:text-white dark:hover:bg-violet-500",
                  )}
                >
                  <DoorClosed className="size-4 shrink-0" aria-hidden />
                  {t.addresses.noVisitsButton}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(true)}
                className="w-full border-0 bg-brand text-white hover:bg-brand/90 dark:bg-brand/90 dark:hover:bg-brand"
              >
                <MailCheck className="size-4 shrink-0" aria-hidden />
                {t.addresses.inviteButton}
              </Button>
            </div>

            <section className="rounded-xl bg-muted p-4">
              <h3 className="mb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
                {t.addresses.inviteStatusTitle.replace("{year}", String(currentYear))}
              </h3>
              {yearInvites.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.addresses.inviteNotDelivered}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {yearInvites.map((invite) => (
                    <li key={invite.id} className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">
                        {inviteLabel(invite, t)}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {t.addresses.inviteDeliveredOn.replace(
                          "{date}",
                          formatDate(invite.createdAt, locale),
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* Auditoria */}
        <footer className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <p>
            {t.addresses.sentBy}{" "}
            <span className="font-medium text-foreground">
              {address.createdUser?.name ?? t.addresses.unknownUser}
            </span>
          </p>
          <p>
            {t.addresses.updatedAtLabel}{" "}
            <time dateTime={new Date(address.updatedAt).toISOString()}>
              {formatDate(address.updatedAt, locale)}
            </time>
            {address.updatedUser && (
              <>
                {" "}
                por <span className="font-medium text-foreground">{address.updatedUser.name}</span>
              </>
            )}
          </p>
        </footer>

        {/* Ações */}
        <div className="flex flex-col gap-2">
          <Link href={`/org/${organizationSlug}/addresses/${address.id}/edit`} className="w-full">
            <Button className="w-full" variant="outline">
              <Pencil className="size-4" aria-hidden />
              {t.addresses.editAddress}
            </Button>
          </Link>
          <DeleteAddressButton
            addressId={address.id}
            isPendingDeletion={!!address.pendingDeletionAt}
          />
        </div>
      </section>

      {hasCoordinates && (
        <AddressMapModal
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          latitude={Number(address.latitude)}
          longitude={Number(address.longitude)}
        />
      )}

      {/* Modal de confirmação de flag (centralizado) */}
      <Dialog
        open={flagTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isSavingFlag) setFlagTarget(null);
        }}
      >
        <DialogContent showCloseButton={false} className={CENTERED_CLASSES}>
          <DialogHeader className="sr-only">
            <DialogTitle>
              {flagTarget?.flag === "personChanged"
                ? t.addresses.personChangedButton
                : t.addresses.noVisitsButton}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-6 text-center">
            <span
              className={cn(
                "grid size-14 place-items-center rounded-full",
                flagTarget?.flag === "personChanged"
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                  : "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
              )}
            >
              {flagTarget?.flag === "personChanged" ? (
                <UserRoundX className="size-6" aria-hidden />
              ) : (
                <DoorClosed className="size-6" aria-hidden />
              )}
            </span>
            <h3 className="text-base font-semibold text-foreground">
              {flagTarget?.flag === "personChanged"
                ? t.addresses.personChangedButton
                : t.addresses.noVisitsButton}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {flagTarget?.flag === "personChanged"
                ? flagTarget.revert
                  ? t.addresses.personChangedRevertQuestion
                  : t.addresses.personChangedQuestion
                : flagTarget?.revert
                  ? t.addresses.noVisitsRevertQuestion
                  : t.addresses.noVisitsQuestion}
            </p>
            <div className="mt-3 flex w-full flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFlagTarget(null)}
                disabled={isSavingFlag}
                className="w-full sm:flex-1"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                onClick={handleFlagConfirm}
                disabled={isSavingFlag}
                className={cn(
                  "w-full gap-2 sm:flex-1",
                  flagTarget?.flag === "personChanged"
                    ? "bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-500"
                    : "bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600/90 dark:hover:bg-violet-500",
                )}
              >
                {isSavingFlag ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Check className="size-4" aria-hidden />
                )}
                {flagTarget?.revert ? t.addresses.flagRevert : t.addresses.flagConfirm}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de entrega de convite (centralizado) */}
      <Dialog open={inviteOpen} onOpenChange={(nextOpen) => !nextOpen && setInviteOpen(false)}>
        <DialogContent showCloseButton={false} className={cn(CENTERED_CLASSES, "max-w-md")}>
          <DialogHeader className="sr-only">
            <DialogTitle>{t.addresses.inviteButton}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <InviteDialogContent
            addressId={address.id}
            invites={invites}
            onClose={() => setInviteOpen(false)}
            onInviteCreated={(invite) => {
              setInvites((prev) => [invite, ...prev]);
              toast.success(t.addresses.inviteSaved);
              setInviteOpen(false);
            }}
            t={t}
            locale={locale}
          />
        </DialogContent>
      </Dialog>
    </article>
  );
}

function inviteLabel(invite: AddressInviteDto, t: ReturnType<typeof useI18n>["t"]): string {
  const base =
    invite.type === "CELEBRATION"
      ? t.addresses.inviteTypeCelebration
      : invite.type === "CONVENTION"
        ? t.addresses.inviteTypeConvention
        : t.addresses.inviteTypeOther;
  return invite.otherLabel ? `${base} · ${invite.otherLabel}` : base;
}

function InviteDialogContent({
  addressId,
  invites,
  onClose,
  onInviteCreated,
  t,
  locale,
}: {
  addressId: string;
  invites: AddressInviteDto[];
  onClose: () => void;
  onInviteCreated: (invite: AddressInviteDto) => void;
  t: ReturnType<typeof useI18n>["t"];
  locale: string;
}) {
  const [type, setType] = useState<"CELEBRATION" | "CONVENTION" | "OTHER">("CELEBRATION");
  const [otherLabel, setOtherLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const other = otherLabel.trim();
    if (type === "OTHER" && !other) {
      setError(t.addresses.inviteErrorOtherRequired);
      return;
    }
    setError(null);
    setSaving(true);
    createAddressInviteAction(addressId, type, type === "OTHER" ? other : null)
      .then((result) => {
        if (result.success) onInviteCreated(result.invite);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      })
      .finally(() => setSaving(false));
  };

  const options: { value: "CELEBRATION" | "CONVENTION" | "OTHER"; label: string }[] = [
    { value: "CELEBRATION", label: t.addresses.inviteTypeCelebration },
    { value: "CONVENTION", label: t.addresses.inviteTypeConvention },
    { value: "OTHER", label: t.addresses.inviteTypeOther },
  ];

  return (
    <div className="flex flex-col gap-4 p-5 pb-6 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t.addresses.inviteButton}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.addresses.inviteDialogHint}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={type === option.value}
            onClick={() => setType(option.value)}
            className={cn(
              "rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors",
              type === option.value
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {type === "OTHER" && (
        <div>
          <Label
            htmlFor="invite-other"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            {t.addresses.inviteOtherLabel}
          </Label>
          <Input
            id="invite-other"
            value={otherLabel}
            onChange={(e) => setOtherLabel(e.target.value)}
            placeholder={t.addresses.inviteOtherPlaceholder}
            maxLength={120}
            autoComplete="off"
          />
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
      )}

      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full gap-2 sm:w-auto sm:self-end"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <MailCheck className="size-4" aria-hidden />
        )}
        {saving ? t.addresses.inviteSaving : t.addresses.inviteSave}
      </Button>

      {invites.length > 0 && (
        <section aria-label={t.addresses.inviteListTitle}>
          <h4 className="mb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
            {t.addresses.inviteListTitle}
          </h4>
          <ul className="flex flex-col gap-2">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {inviteLabel(invite, t)}
                  </span>
                  {invite.deliveredBy && (
                    <span className="block text-xs text-muted-foreground">
                      {invite.deliveredBy.name}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {invite.year} · {formatDate(invite.createdAt, locale)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
