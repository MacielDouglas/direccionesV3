import { getAddressByIdService } from "@/features/addresses/application/address.service";
import AddressDetailsScreen from "@/features/addresses/ui/screens/AddressDetailsScreen ";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type AddressPageProps = {
  params: {
    organizationSlug: string;
    addressId: string;
  };
};

export default async function AddressPage({ params }: AddressPageProps) {
  const { organizationSlug, addressId } = await params;

  if (!organizationSlug || !addressId) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (!organization) {
    notFound();
  }

  const address = await getAddressByIdService({
    addressId,
    organizationId: organization.id,
  });

  if (!address) {
    notFound();
  }

  return (
    <>
      <div className="p-2">
        <h1 className="text-2xl font-bold">Detalle de la dirección</h1>
      </div>

      <AddressDetailsScreen
        address={address}
        organizationSlug={organizationSlug}
      />
    </>
  );
}
