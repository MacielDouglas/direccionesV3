import AddressEditScreen from "@/features/addresses/ui/screens/AddressEditScreen";

export default function UpdateAddressPage({ params }) {
  return <AddressEditScreen addressId={params.addressId} />;
}
