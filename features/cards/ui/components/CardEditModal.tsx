"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ADDRESS_TYPE_OPTIONS } from "@/features/addresses/domain/constants/address.constants";
import { LazyMapboxProvider } from "@/features/map/core/LazyMapboxProvider";
import { SelectableAddressesLayer } from "@/features/map/layers/SelectableAddressesLayer";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronDown, Lock, MapPin, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { updateCardAction } from "../../application/card.actions";
import { type EditCardInput, editCardSchema } from "../../domain/card.schema";
import { sortAddressesByProximity } from "../../utils/sortAddressesByProximity";

export type CardEditAddress = {
  id: string;
  type: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  businessName: string | null;
  active: boolean;
  latitude: number | null;
  longitude: number | null;
  cardId: string | null;
  card: { number: number } | null;
};

interface Props {
  cardId: string;
  cardNumber: number;
  organizationId: string;
  organizationSlug: string;
  linkedAddresses: CardEditAddress[];
  allAddresses: CardEditAddress[];
  onClose: () => void;
}

export function CardEditModal({
  cardId,
  cardNumber,
  organizationId,
  organizationSlug,
  linkedAddresses,
  allAddresses,
  onClose,
}: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditCardInput>({
    resolver: zodResolver(editCardSchema),
    defaultValues: { addressIds: linkedAddresses.map((a) => a.id) },
  });

  const selectedIds = useWatch({ control, name: "addressIds" });

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    setValue("addressIds", next, { shouldValidate: true });
  };

  const { availableAddresses, otherCardAddresses, mapAddresses, indexMap } = useMemo(() => {
    const availableAddresses = allAddresses.filter((a) => a.cardId === null);
    const otherCardAddresses = allAddresses.filter((a) => a.cardId !== null && a.cardId !== cardId);

    const sorted = sortAddressesByProximity([...linkedAddresses, ...availableAddresses]);
    const forMap = sorted
      .filter(
        (a): a is typeof a & { latitude: number; longitude: number } =>
          a.latitude != null && a.longitude != null,
      )
      .map((a, i) => ({
        id: a.id,
        label: a.businessName ?? `${a.street}, ${a.number}`,
        latitude: a.latitude,
        longitude: a.longitude,
        index: i + 1,
      }));

    return {
      availableAddresses,
      otherCardAddresses,
      mapAddresses: forMap,
      indexMap: new Map(forMap.map((a) => [a.id, a.index])),
    };
  }, [allAddresses, cardId, linkedAddresses]);

  const linkedSelectedCount = linkedAddresses.filter((a) => selectedIds.includes(a.id)).length;
  const availableSelectedCount = availableAddresses.filter((a) =>
    selectedIds.includes(a.id),
  ).length;

  const onSubmit = (data: EditCardInput) => {
    startTransition(async () => {
      const result = await updateCardAction(cardId, organizationId, organizationSlug, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.admin.cardUpdated.replace("{number}", String(cardNumber).padStart(2, "0")));
      router.refresh();
      onClose();
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed z-50 gap-0",
          "max-h-[92dvh] w-full max-w-full overflow-y-auto p-0",
          "left-0! right-0! bottom-0! top-auto! rounded-t-3xl! border-0!",
          "translate-x-0! translate-y-0!",
          "sm:left-1/2! sm:right-auto! sm:top-1/2! sm:bottom-auto! sm:-translate-x-1/2! sm:-translate-y-1/2!",
          "sm:max-w-2xl! sm:rounded-3xl! sm:border! sm:max-h-[90dvh]",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t.admin.editingCard}</DialogTitle>
          <DialogDescription>{t.admin.availableAddresses}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Header fixo */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/95 p-3 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand">
                <Pencil className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">{t.admin.editingCard}</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  #{String(cardNumber).padStart(2, "0")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          {/* Mapa */}
          <div className="h-52 w-full overflow-hidden border-b border-border">
            <LazyMapboxProvider className="h-52">
              <SelectableAddressesLayer
                addresses={mapAddresses}
                selectedIds={selectedIds}
                onToggle={toggle}
              />
            </LazyMapboxProvider>
          </div>

          {/* Conteúdo rolável */}
          <div className="flex flex-col gap-5 p-4 pb-8 sm:p-5">
            {/* Vinculados */}
            <section aria-label={t.admin.linkedAddresses}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                {t.admin.linkedAddresses}
                <span className="text-xs font-normal text-muted-foreground">
                  ({linkedSelectedCount} de {linkedAddresses.length})
                </span>
              </h2>
              {linkedAddresses.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">{t.admin.noLinkedAddresses}</p>
              ) : (
                <AddressRowList
                  addresses={linkedAddresses}
                  selectedIds={selectedIds}
                  indexMap={indexMap}
                  onToggle={toggle}
                />
              )}
            </section>

            {/* Disponíveis */}
            {availableAddresses.length > 0 && (
              <section aria-label={t.admin.availableAddresses}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  {t.admin.availableAddresses}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({availableSelectedCount} {t.admin.selectedCount})
                  </span>
                </h2>
                <AddressRowList
                  addresses={availableAddresses}
                  selectedIds={selectedIds}
                  indexMap={indexMap}
                  onToggle={toggle}
                />
              </section>
            )}

            {/* Ver todos os endereços gerais */}
            {otherCardAddresses.length > 0 && (
              <section aria-label={t.admin.showAllAddresses}>
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  aria-expanded={showAll}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span>{showAll ? t.admin.hideAllAddresses : t.admin.showAllAddresses}</span>
                  <ChevronDown
                    className={cn("size-4 shrink-0 transition-transform", showAll && "rotate-180")}
                    aria-hidden
                  />
                </button>

                {showAll && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {otherCardAddresses.map((addr) => (
                      <AddressRow
                        key={addr.id}
                        addr={addr}
                        index={indexMap.get(addr.id)}
                        selected={false}
                        disabled
                        otherCardNumber={
                          addr.card ? String(addr.card.number).padStart(2, "0") : null
                        }
                      />
                    ))}
                  </ul>
                )}
              </section>
            )}

            {errors.addressIds && (
              <p role="alert" className="text-sm text-destructive">
                {errors.addressIds.message}
              </p>
            )}

            {/* Ações */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isPending}
                onClick={onClose}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isPending || selectedIds.length === 0}
                aria-busy={isPending}
              >
                {isPending ? t.admin.savingCard : t.admin.saveCardChanges}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Linhas selecionáveis ─────────────────────────────────────────────────────

function AddressRowList({
  addresses,
  selectedIds,
  indexMap,
  onToggle,
}: {
  addresses: CardEditAddress[];
  selectedIds: string[];
  indexMap: Map<string, number>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {addresses.map((addr) => (
        <AddressRow
          key={addr.id}
          addr={addr}
          index={indexMap.get(addr.id)}
          selected={selectedIds.includes(addr.id)}
          onToggle={() => onToggle(addr.id)}
        />
      ))}
    </ul>
  );
}

function AddressRow({
  addr,
  index,
  selected,
  disabled,
  onToggle,
  otherCardNumber,
}: {
  addr: CardEditAddress;
  index?: number;
  selected: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  otherCardNumber?: string | null;
}) {
  const { t } = useI18n();
  const typeConfig = ADDRESS_TYPE_OPTIONS.find((opt) => opt.value === addr.type);
  const TypeIcon = typeConfig?.icon ?? MapPin;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-disabled={disabled}
        className={cn(
          "w-full rounded-xl border p-3 text-left transition-colors",
          "flex items-center gap-3",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          disabled
            ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-70"
            : selected
              ? "border-brand/40 bg-brand/5"
              : "border-border hover:bg-muted/50",
        )}
      >
        {index != null && (
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
              selected ? "bg-brand" : "bg-zinc-400",
            )}
            aria-hidden
          >
            {index}
          </span>
        )}

        <TypeIcon className={cn("size-4 shrink-0", typeConfig?.color)} aria-hidden />

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {addr.businessName && (
            <span className="truncate text-sm font-medium">{addr.businessName}</span>
          )}
          <span className="truncate text-sm text-muted-foreground">
            {addr.street}, {addr.number} — {addr.neighborhood}, {addr.city}
          </span>
          {disabled && otherCardNumber && (
            <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              <Lock className="size-3" aria-hidden />
              {t.admin.otherCardNumber.replace("{number}", otherCardNumber)} ·{" "}
              {t.admin.linkedToOtherCard}
            </span>
          )}
        </span>

        {!disabled && (
          <CheckCircle2
            className={cn(
              "ml-auto size-4 shrink-0 transition-colors",
              selected ? "text-brand" : "text-muted-foreground/20",
            )}
            aria-hidden
          />
        )}
      </button>
    </li>
  );
}
