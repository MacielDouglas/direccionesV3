import { MapPinPlus } from "lucide-react";
import AddressForm from "../_components/address-form/AddressForm";
import { getCurrentUser } from "@/server/users";

export default async function NewAddress() {
  const data = await getCurrentUser();

  console.log(data);

  return (
    <div className="w-full h-full space-y-4 bg-white max-w-5xl mx-auto">
      <div className="space-y-6 border-b p-5 md:p-10">
        <div className="flex items-center gap-4">
          <MapPinPlus className="w-10 h-10 text-orange-500 " />
          <h1 className="text-3xl font-semibold">Nueva Dirección</h1>
        </div>
        <div className="mt-2 text-lg text-neutral-600 dark:text-neutral-400 ">
          <p>En esta página puede enviar una nueva dirección.</p>
          <p>
            Debes elegir el tipo de dirección, información básica, datos GPS y
            una foto.
          </p>
        </div>
      </div>
      <AddressForm userId={data?.user.id} />
    </div>
  );
}
