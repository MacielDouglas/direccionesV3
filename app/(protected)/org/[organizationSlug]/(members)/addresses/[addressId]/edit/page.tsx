import AddressEditScreen from "@/features/addresses/ui/screens/AddressEditScreen";

interface Props {
  params: Promise<{ organizationSlug: string; addressId: string }>;
}

export default async function UpdateAddressPage({ params }: Props) {
  const { organizationSlug, addressId } = await params;
  return (
    <AddressEditScreen
      organizationSlug={organizationSlug}
      addressId={addressId}
    />
  );
}
