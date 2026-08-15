import { searchAddressesService } from "@/features/addresses/application/address.service";
import AddressListScreen from "@/features/addresses/ui/screens/AddressListScreen";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.addresses.allTitle };
}

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
    <main className="mx-auto w-full max-w-3xl px-4 py-7 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.addresses.allTitle}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.addresses.allDescription}</p>
        <p className="mt-0.5 text-xs font-light text-muted-foreground">{t.addresses.searchHint}</p>
      </header>
      <AddressListScreen addresses={addresses} organizationSlug={organizationSlug} />
    </main>
  );
}
