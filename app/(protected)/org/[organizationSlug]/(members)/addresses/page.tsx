import { searchAddressesService } from "@/features/addresses/application/address.service";
import AddressListScreen from "@/features/addresses/ui/screens/AddressListScreen";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { MapPinned } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Direcciones Page",
};

type AddressPageProps = {
  params: {
    organizationSlug: string;
  };
  searchParams: {
    q?: string;
  };
};

// Página para listar endereços e buscar endereços
export default async function AddressPage({ params, searchParams }: AddressPageProps) {
  const { organizationSlug } = await params;
  const { q } = await searchParams;

  if (!organizationSlug) notFound();

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (!organization) notFound();

  const addresses = await searchAddressesService({
    organizationId: organization.id,
    query: q,
  });

  const t = await getServerDictionary();

  return (
    <div className="w-full h-full space-y-6 max-w-5xl mx-auto pb-6">
      <div className="space-y-3 border-b border-border px-4 pt-6 pb-6 md:px-8 md:pt-10 md:pb-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10">
            <MapPinned className="h-6 w-6 text-brand" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t.addresses.allTitle}
          </h1>
        </div>
        <div className="text-muted-foreground">
          <p>{t.addresses.allDescription}</p>
          <p className="text-sm font-light">{t.addresses.searchHint}</p>
        </div>
      </div>
      <AddressListScreen
        addresses={addresses}
        organizationSlug={organizationSlug}
        // query={q}
      />
    </div>
  );
}
