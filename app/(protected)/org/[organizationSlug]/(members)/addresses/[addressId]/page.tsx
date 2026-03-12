import { getAddressByIdService } from "@/features/addresses/application/address.service";
import AddressDetailsScreen from "@/features/addresses/ui/screens/AddressDetailsScreen ";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { notFound } from "next/navigation";

type AddressPageProps = {
  params: {
    organizationSlug: string;
    addressId: string;
  };
};

export default async function AddressPage({ params }: AddressPageProps) {
  const { organizationSlug, addressId } = await params;

  const org = await getOrganizationBySlug(organizationSlug);
  if (!org) notFound();

  const address = await getAddressByIdService({
    addressId,
    organizationId: org.id,
  });
  if (!address) notFound();

  return (
    <AddressDetailsScreen
      address={address}
      organizationSlug={organizationSlug}
    />
  );
}
