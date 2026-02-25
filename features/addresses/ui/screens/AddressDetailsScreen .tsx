import { Address } from "@prisma/client";
import Image from "next/image";

type AddressDetailsScreenProps = {
  address: Address;
};

export default function AddressDetailsScreen({
  address,
}: AddressDetailsScreenProps) {
  return (
    <div>
      <h1>{address.businessName ?? address.street}</h1>
      <p>
        Calle:{address.street}, {address.number}
      </p>
      <p>Barrio: {address.neighborhood}</p>
      <p>Ciudad: {address.city}</p>
      <div className="w-72 h-72 relative">
        {address.image && (
          <Image
            src={address.image}
            alt="Imagem do endereço"
            fill
            className="object-cover rounded-md"
          />
        )}
      </div>

      {address.info && (
        <p>
          <strong>Informações:</strong> {address.info}
        </p>
      )}
    </div>
  );
}
