import { MapPinPlus } from "lucide-react";
import AddressForm from "../components/AddressForm";
import { getCurrentUser } from "@/server/users";
import { getExistingLocations } from "../../application/address.service";

export default async function AddressCreateScreen() {
  const session = await getCurrentUser();
  const organizationId = session?.activeMember?.organizationId ?? "";

  const { neighborhoods, cities } = organizationId
    ? await getExistingLocations(organizationId)
    : { neighborhoods: [], cities: [] };

  return (
    <div className="mx-auto h-full w-full max-w-5xl space-y-4">
      <div className="space-y-6 border-b p-5 md:p-10">
        <div className="flex items-center gap-4">
          <MapPinPlus className="h-10 w-10 text-brand" aria-hidden="true" />
          <h1 className="text-3xl font-semibold">Nueva Dirección</h1>
        </div>
        <div className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
          <p>En esta página puede enviar una nueva dirección.</p>
          <p>
            Debes elegir el tipo de dirección, información básica, datos GPS y
            una foto.
          </p>
        </div>
      </div>

      {/* ✅ passa listas para o form */}
      <AddressForm
        existingNeighborhoods={neighborhoods}
        existingCities={cities}
      />
    </div>
  );
}
