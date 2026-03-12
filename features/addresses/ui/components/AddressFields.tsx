import AddressTypeSelector from "./AddressTypeSelector";
import AddressFormFields from "./AddressFormFields";
import AddressGpsFields from "./AddressGpsFields";
import AddressImageField from "./AddressImageFields";

export default function AddressFields() {
  return (
    <>
      <div className="px-5 pt-5">
        <AddressTypeSelector />
        <AddressFormFields />
      </div>
      <div className="w-full border-t bg-muted/30">
        <AddressGpsFields />
      </div>
      <AddressImageField />
    </>
  );
}
