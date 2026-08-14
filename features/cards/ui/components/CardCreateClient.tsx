"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddressType } from "@/features/addresses/types/address.types";
import { LazyMapboxProvider } from "@/features/map/core/LazyMapboxProvider";
import { SelectableAddressesLayer } from "@/features/map/layers/SelectableAddressesLayer";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { createCardAction } from "../../application/card.actions";
import { type CreateCardInput, createCardSchema } from "../../domain/card.schema";
import type { AvailableAddress } from "../../types/card.types";
import { sortAddressesByProximity } from "../../utils/sortAddressesByProximity";
import { AddressFilterBar, type AddressFilters } from "./AddressFilterBar";
import { AddressSelector } from "./AddressSelector";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "");
}

interface Props {
  organizationId: string;
  organizationSlug: string;
  nextNumber: number;
  availableAddresses: AvailableAddress[];
}

export function CardCreateClient({
  organizationId,
  organizationSlug,
  nextNumber,
  availableAddresses,
}: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  // ✅ Padrão: só ativos, todos os tipos
  const [filters, setFilters] = useState<AddressFilters>({
    active: true,
    types: [],
  });

  const [query, setQuery] = useState("");

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: { addressIds: [] },
  });

  const selectedIds = useWatch({ control, name: "addressIds" });

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    setValue("addressIds", next, { shouldValidate: true });
  };

  const { sortedAddresses, selectableAddresses } = useMemo(() => {
    const q = normalize(query.trim());

    // ✅ Filtra client-side — sem roundtrip
    const filtered = availableAddresses.filter((a) => {
      if (filters.active !== undefined && a.active !== filters.active) return false;
      if (
        filters.types?.length &&
        !filters.types.includes(a.type as AddressType) // ✅ cast aqui
      )
        return false;
      if (q) {
        const haystack = normalize(
          [a.businessName, a.street, a.number, a.neighborhood, a.city].filter(Boolean).join(" "),
        );
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = sortAddressesByProximity(filtered);
    const withCoords = sorted.filter(
      (a): a is typeof a & { latitude: number; longitude: number } =>
        a.latitude != null && a.longitude != null,
    );

    return {
      sortedAddresses: sorted,
      selectableAddresses: withCoords.map((a, i) => ({
        id: a.id,
        label: a.businessName ?? `${a.street}, ${a.number}`,
        latitude: a.latitude,
        longitude: a.longitude,
        index: i + 1,
      })),
    };
  }, [availableAddresses, filters, query]);

  const onSubmit = (data: CreateCardInput) => {
    startTransition(async () => {
      const result = await createCardAction(organizationId, organizationSlug, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        t.admin.cardCreated.replace("{number}", String(result.cardNumber).padStart(2, "0")),
      );
      router.push(`/org/${organizationSlug}/admin/cards`);
    });
  };

  return (
    <div className="w-full flex flex-1 flex-col overflow-hidden max-w-3xl mx-auto">
      <div className="w-full h-96">
        <LazyMapboxProvider className="h-96 w-full shrink-0">
          <SelectableAddressesLayer
            addresses={selectableAddresses}
            selectedIds={selectedIds}
            onToggle={toggle}
          />
        </LazyMapboxProvider>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label={t.admin.newCard}
          className="flex flex-col gap-4 px-4 py-4"
        >
          {/* Número */}
          <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.admin.createCardNumber}</span>
            <span className="text-2xl font-bold tabular-nums">
              #{String(nextNumber).padStart(2, "0")}
            </span>
          </div>
          {/* {selectedIds.length > 0 && ( */}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isPending || selectedIds.length === 0}
            aria-busy={isPending}
          >
            {isPending
              ? t.admin.creatingCard
              : t.admin.createCardButton.replace("{number}", String(nextNumber).padStart(2, "0"))}
          </Button>
          {/* )} */}
          {/* ✅ Busca por nome/estabelecimento, rua, bairro ou cidade */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.addresses.searchPlaceholder}
              aria-label={t.addresses.searchPlaceholder}
              className="pl-9"
            />
          </div>

          {/* ✅ Filtros */}
          <AddressFilterBar
            filters={filters}
            onChange={setFilters}
            total={sortedAddresses.length}
          />

          {/* Lista */}
          <AddressSelector
            addresses={sortedAddresses}
            selected={selectedIds}
            onChange={(ids) => setValue("addressIds", ids, { shouldValidate: true })}
            error={errors.addressIds?.message}
          />

          {/* Ações */}
          <div
            className="flex flex-col-reverse gap-3 pt-2 sm:flex-row"
            style={{
              paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={() => router.back()}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isPending || selectedIds.length === 0}
              aria-busy={isPending}
            >
              {isPending
                ? t.admin.creatingCard
                : t.admin.createCardButton.replace("{number}", String(nextNumber).padStart(2, "0"))}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
