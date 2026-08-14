import AddressFormFields from "./AddressFormFields";
import AddressGpsFields from "./AddressGpsFields";
import AddressImageField from "./AddressImageFields";
import AddressTypeSelector from "./AddressTypeSelector";

interface Props {
  existingNeighborhoods: string[];
  existingCities: string[];
}

export default function AddressFields({ existingNeighborhoods, existingCities }: Props) {
  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <AddressTypeSelector />
          <AddressFormFields
            existingNeighborhoods={existingNeighborhoods}
            existingCities={existingCities}
          />
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-xs">
          <AddressGpsFields />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <AddressImageField />
        </div>
      </div>
    </>
  );
}
