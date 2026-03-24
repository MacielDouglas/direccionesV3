import { searchAddressesService } from "@/features/addresses/application/address.service";
import AddressListScreen from "@/features/addresses/ui/screens/AddressListScreen";
import { prisma } from "@/lib/prisma";
import { MapPinned } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
export default async function AddressPage({
  params,
  searchParams,
}: AddressPageProps) {
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

  return (
    <div className="w-full h-full space-y-4  max-w-5xl mx-auto">
      <div className="space-y-6 border-b p-5 md:p-10">
        <div className="flex items-center gap-4">
          <MapPinned className="w-10 h-10 text-orange-500 " />
          <h1 className="text-3xl font-semibold">Todas las direcciones</h1>
        </div>
        <div className="mt-2 text-lg text-neutral-600 dark:text-neutral-400 ">
          <p>En esta página puede ver todas las direcciones registradas.</p>
          <p className="text-sm font-light text-slate-500">
            Puedes buscar una dirección específica utilizando el campo de
            búsqueda. Simplemente ingresa el nombre de la calle, número, barrio
            o ciudad para encontrar la dirección que estás buscando.
          </p>
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
