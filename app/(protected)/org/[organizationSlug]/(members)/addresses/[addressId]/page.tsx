import { getAddressByIdService } from "@/features/addresses/application/address.service";
import AddressDetailsScreen from "@/features/addresses/ui/screens/AddressDetailsScreen ";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Dirección",
};

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
    <>
      <div className="pt-2 px-3">
        <Link
          href={`/org/${organizationSlug}/addresses/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80"
        >
          <Plus size={16} /> Enviar nueva dirección
        </Link>
      </div>
      <AddressDetailsScreen
        address={address}
        organizationSlug={organizationSlug}
      />
    </>
  );
}
