type Props = {
  organizationSlug: string;
  addressId: string;
};

export default function AddressEditScreen({
  organizationSlug,
  addressId,
}: Props) {
  console.log("AddressEditScreen", organizationSlug, addressId);

  return <div>AddressEditScreen</div>;
}
