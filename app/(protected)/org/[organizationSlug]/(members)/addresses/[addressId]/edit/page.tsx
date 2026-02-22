import AddressEditScreen from "@/features/addresses/ui/screens/AddressEditScreen";

type PageProps = {
  params: {
    organizationSlug: string;
    addressId: string;
  };
};

export default function UpdateAddressPage({ params }: PageProps) {
  return (
    <AddressEditScreen
      organizationSlug={params.organizationSlug}
      addressId={params.addressId}
    />
  );
}
