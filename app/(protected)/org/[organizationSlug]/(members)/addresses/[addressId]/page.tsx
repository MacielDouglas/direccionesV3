import { getAddressByIdService } from "@/features/addresses/application/address.service";
import AddressDetailsScreen from "@/features/addresses/ui/screens/AddressDetailsScreen";
import { getServerDictionary } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { MapPinCheck, Pin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.addresses.detailTitle };
}

type AddressPageProps = {
  params: {
    organizationSlug: string;
    addressId: string;
  };
};

export default async function AddressPage({ params }: AddressPageProps) {
  const { organizationSlug, addressId } = await params;
  const t = await getServerDictionary();

  const org = await getOrganizationBySlug(organizationSlug);
  if (!org) notFound();

  const address = await getAddressByIdService({
    addressId,
    organizationId: org.id,
  });
  if (!address) notFound();

  return (
    <>
      <div className="pt-2 px-3 flex justify-between w-full mx-auto max-w-3xl">
        <Link
          href={`/org/${organizationSlug}/addresses/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80"
        >
          <MapPinCheck size={16} /> {t.addresses.sendNew}
        </Link>
        <Link
          href={`/org/${organizationSlug}/addresses`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80"
        >
          <Pin size={16} /> {t.navigation.allAddresses}
        </Link>
      </div>
      <AddressDetailsScreen address={address} organizationSlug={organizationSlug} />
    </>
  );
}
