import { Control } from "react-hook-form";
import { AddressFormData } from "../../domain/address.schema";
import AddressTypeSelector from "./AddressTypeSelector";
import AddressFormFields from "./AddressFormFields";
import AddressGpsFields from "./AddressGpsFields";
import AddressImageField from "./AddressImageFields";

type Props = {
  control: Control<AddressFormData>;
};

export default function AddressFields({ control }: Props) {
  return (
    <>
      <div className="px-5 pt-5">
        <AddressTypeSelector control={control} />
        <AddressFormFields />
      </div>
      <div className="bg-stone-50 w-full border-t">
        <AddressGpsFields />
      </div>
      <AddressImageField />
    </>
  );
}
