import AddressTypeSelector from "./AddressTypeSelector";
import AddressFormFields from "./AddressFormFields";
import AddressGpsFields from "./AddressGpsFields";
import AddressImageField from "./AddressImageFields";

interface Props {
  existingNeighborhoods: string[];
  existingCities: string[];
}

export default function AddressFields({
  existingNeighborhoods,
  existingCities,
}: Props) {
  return (
    <>
      <div className="px-5 pt-5">
        <AddressTypeSelector />
        <AddressFormFields
          existingNeighborhoods={existingNeighborhoods}
          existingCities={existingCities}
        />
      </div>
      <div className="w-full border-t bg-muted/30">
        <AddressGpsFields />
      </div>
      <AddressImageField />
    </>
  );
}
