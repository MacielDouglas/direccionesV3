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
    <div>
      <h1>Página</h1>
      {/* <div className="w-full bg-orange-500 h-4" /> */}
      {/* <Link
        href={`/org/${organizationSlug}/addresses`}
        className="p-2 bg-slate-300  rounded-xl"
      >
        Voltar
      </Link> */}
      <AddressDetailsScreen address={address} />
    </div>
  );
}
