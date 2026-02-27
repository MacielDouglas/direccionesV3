import { Address } from "@prisma/client";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { getUsers } from "@/server/users";
import { AddressImageViewer } from "../components/AddressImageViewer";

type AddressDetailsScreenProps = {
  address: Address;
};

export default async function AddressDetailsScreen({
  address,
}: AddressDetailsScreenProps) {
  const createdUser = await getUsers(address.createdUserId);
  const updatedUser = await getUsers(address.updatedUserId!);

  console.log(new Date(updatedUser[0].updatedAt));

  // Log para verificar os dados do usuário atualizado

  const typeConfig = ADDRESS_TYPE_OPTIONS.find(
    (type) => type.value === address.type,
  );

  const Icon = typeConfig?.icon;

  // console.log(typeof address.latitude);

  const colorOptions =
    address.type === "House"
      ? "green-500"
      : address.type === "Apartment"
        ? "blue-500"
        : address.type === "Hotel"
          ? "white"
          : address.type === "Store"
            ? "yellow-300"
            : "orange-500";

  return (
    <article className="w-full max-w-5xl mx-auto flex flex-col">
      {/* IMAGE SECTION */}
      {address.image && (
        <AddressImageViewer
          src={address.image}
          alt={`Imagem do endereço ${address.businessName ?? "Residencial"}`}
        >
          {Icon && (
            <div className="absolute top-4 left-4 bg-black/80 p-2 rounded-xl">
              <Icon className={typeConfig?.color} size={28} />
            </div>
          )}
        </AddressImageViewer>
      )}

      {/* CONTENT */}
      <section className="flex flex-col gap-6 p-4 sm:p-6">
        {/* HEADER */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ">
          <div className="flex items-start">
            <div className={`w-6 h-6 rounded-sm  bg-${colorOptions}`} />

            <div className="-ml-4 w-full ">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-wide flex gap-20 justify-between">
                {address.businessName ?? "Casa"}
              </h1>
              <div className="flex justify-between">
                <p className="text-sm text-gray-400">
                  Enviado por: {createdUser[0].name ?? "Usuário desconhecido"}
                </p>
                <div className="text-sm text-gray-400 text-end">
                  <p className="text-sm text-gray-400">
                    Actualizado por:{" "}
                    {updatedUser[0].name ?? "Usuário desconhecido"}
                  </p>
                  <p>
                    En:{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    }).format(new Date(updatedUser[0].updatedAt))}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="inline-flex gap-5 mx-auto">
            <span
              className={`text-sm font-semibold ${
                address.confirmed ? "text-blue-600" : "text-red-500"
              }`}
            >
              {address.confirmed ? "Confirmado" : "No confirmado"}
            </span>
            <span
              className={`text-sm font-semibold ${
                address.active ? "text-blue-600" : "text-red-500"
              }`}
            >
              {address.active ? "Tarjeta activa" : "Tarjeta desactivada"}
            </span>
          </div>
        </header>

        {/* ADDRESS INFO */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-wide text-gray-400">
              Calle
            </h2>
            <p className="text-base font-medium">
              {address.street}, {address.number}
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wide text-gray-400">
              Barrio
            </h2>
            <p className="text-base font-medium">{address.neighborhood}</p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wide text-gray-400">
              Ciudad
            </h2>
            <p className="text-base font-medium">{address.city}</p>
          </div>
        </section>

        {/* EXTRA INFO */}
        {address.info && (
          <section className="bg-gray-100 ">
            <h2 className="text-sm font-semibold mb-2">
              Informações adicionais
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              {address.info}
            </p>
          </section>
        )}
      </section>
    </article>
  );
}
