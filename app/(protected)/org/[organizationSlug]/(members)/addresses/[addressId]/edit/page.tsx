import AddressEditScreen from "@/features/addresses/ui/screens/AddressEditScreen";

type PageProps = {
  params: {
    organizationSlug: string;
    addressId: string;
  };
};

export default async function UpdateAddressPage({ params }: PageProps) {
  const address = await params;
  return (
    <AddressEditScreen
      organizationSlug={address.organizationSlug}
      addressId={address.addressId}
    />
  );
}
