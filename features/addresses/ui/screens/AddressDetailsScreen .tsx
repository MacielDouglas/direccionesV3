import { Address } from "@prisma/client";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { getUsers } from "@/server/users";
import { AddressImageViewer } from "../components/AddressImageViewer";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";

type AddressDetailsScreenProps = {
  address: Address;
};

const ADDRESS_COLOR_MAP: Record<string, string> = {
  House: "bg-green-500",
  Apartment: "bg-blue-500",
  Hotel: "bg-white border border-gray-300",
  Store: "bg-yellow-300",
};

function getAddressColor(type: string): string {
  return ADDRESS_COLOR_MAP[type] ?? "bg-orange-500";
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AddressDetailsScreen({
  address,
}: AddressDetailsScreenProps) {
  const [createdUser, updatedUser] = await Promise.all([
    getUsers(address.createdUserId),
    getUsers(address.updatedUserId!),
  ]);

  const typeConfig = ADDRESS_TYPE_OPTIONS.find(
    (type) => type.value === address.type,
  );

  const Icon = typeConfig?.icon;
  const colorClass = getAddressColor(address.type);

  return (
    <article className="w-full max-w-5xl mx-auto flex flex-col gap-2 px-3 py-4 sm:px-4 sm:py-6">
      {/* MAP SECTION */}
      {address.latitude && address.longitude && (
        <section
          aria-label="Mapa do endereço"
          className="w-full rounded-2xl overflow-hidden"
        >
          <AddressViewMap
            latitude={Number(address.latitude)}
            longitude={Number(address.longitude)}
          />
        </section>
      )}

      {/* MAIN CARD */}
      <section
        aria-label="Detalhes do endereço"
        className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col gap-4"
      >
        {/* HEADER: Nome + Ícone */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center  gap-3 min-w-0">
            <span
              className={`shrink-0 w-8 h-8 rounded-sm border ${colorClass}`}
              aria-hidden="true"
            />
            <h1 className="-ml-8 text-lg  sm:text-2xl font-semibold tracking-wide uppercase truncate">
              {address.businessName ?? "Casa"}
            </h1>
          </div>

          {Icon && (
            <div
              className="shrink-0 bg-black/80 p-2 rounded"
              aria-label={`Tipo: ${typeConfig?.value}`}
            >
              <Icon className={typeConfig?.color} size={28} />
            </div>
          )}
        </header>

        {/* STATUS BADGES */}
        <div
          className="flex flex-wrap gap-3"
          role="status"
          aria-label="Status do endereço"
        >
          <span
            className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
              address.confirmed
                ? "text-blue-700 bg-blue-100"
                : "text-red-600 bg-red-100"
            }`}
          >
            {address.confirmed ? "✓ Confirmado" : "✗ Não confirmado"}
          </span>
          <span
            className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
              address.active
                ? "text-blue-700 bg-blue-100"
                : "text-red-600 bg-red-100"
            }`}
          >
            {address.active ? "✓ Cartão ativo" : "✗ Cartão desativado"}
          </span>
        </div>

        {/* IMAGE */}
        {address.image && (
          <figure className="w-full rounded-xl overflow-hidden">
            <AddressImageViewer
              src={address.image}
              alt={`Imagem do endereço ${address.businessName ?? "Residencial"}`}
            />
          </figure>
        )}

        {/* ADDRESS INFO */}
        <section aria-labelledby="address-info-title">
          <h2 id="address-info-title" className="sr-only">
            Informações de localização
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Rua
              </dt>
              <dd className="text-sm sm:text-base font-medium text-gray-800 mt-0.5">
                {address.street}, {address.number}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Bairro
              </dt>
              <dd className="text-sm sm:text-base font-medium text-gray-800 mt-0.5">
                {address.neighborhood}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Cidade
              </dt>
              <dd className="text-sm sm:text-base font-medium text-gray-800 mt-0.5">
                {address.city}
              </dd>
            </div>
          </dl>
        </section>

        {/* EXTRA INFO */}
        {address.info && (
          <section
            aria-labelledby="extra-info-title"
            className="bg-gray-100 rounded-xl p-3 sm:p-4"
          >
            <h2
              id="extra-info-title"
              className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
            >
              Informações adicionais
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              {address.info}
            </p>
          </section>
        )}

        {/* FOOTER: Auditoria */}
        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Enviado por:{" "}
            <span className="font-medium text-gray-600">
              {createdUser[0].name ?? "Usuário desconhecido"}
            </span>
          </p>
          <div className="text-xs text-gray-400 sm:text-end flex gap-1">
            <p>Atualizado en: </p>
            <time dateTime={new Date(updatedUser[0].updatedAt).toISOString()}>
              {formatDate(updatedUser[0].updatedAt)},
            </time>
            <p>
              por:{" "}
              <span className="font-medium text-gray-600">
                {updatedUser[0].name ?? "Usuário desconhecido"}
              </span>
            </p>
          </div>
        </footer>
      </section>
    </article>
  );
}

// import { Address } from "@prisma/client";
// import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
// import { getUsers } from "@/server/users";
// import { AddressImageViewer } from "../components/AddressImageViewer";
// import { AddressViewMap } from "@/features/map/components/AddressViewMap";

// type AddressDetailsScreenProps = {
//   address: Address;
// };

// export default async function AddressDetailsScreen({
//   address,
// }: AddressDetailsScreenProps) {
//   const createdUser = await getUsers(address.createdUserId);
//   const updatedUser = await getUsers(address.updatedUserId!);

//   console.log(new Date(updatedUser[0].updatedAt));

//   // Log para verificar os dados do usuário atualizado

//   const typeConfig = ADDRESS_TYPE_OPTIONS.find(
//     (type) => type.value === address.type,
//   );

//   const Icon = typeConfig?.icon;

//   // console.log(typeof address.latitude);

//   const colorOptions =
//     address.type === "House"
//       ? "bg-green-500"
//       : address.type === "Apartment"
//         ? "bg-blue-500"
//         : address.type === "Hotel"
//           ? "bg-white"
//           : address.type === "Store"
//             ? "bg-yellow-300"
//             : "bg-orange-500";

//   return (
//     <article className="w-full max-w-5xl mx-auto flex flex-col">
//       {address.latitude && address.longitude && (
//         <section className="w-full">
//           <AddressViewMap
//             latitude={Number(address.latitude)}
//             longitude={Number(address.longitude)}
//           />
//         </section>
//       )}

//       <section className="bg-white rounded-2xl p-3 mt-2">
//         <div className="flex items-center justify-between p-2">
//           <header className="flex items-center py-4">
//             <div className={`w-8 h-8 rounded-sm border  ${colorOptions}`} />
//             <h1 className="-ml-4 uppercase text-2xl font-semibold tracking-wide flex gap-20 justify-between">
//               {address.businessName ?? "Casa"}
//             </h1>
//           </header>
//           {Icon && (
//             <div className=" bg-black/80 p-2 px-3 rounded">
//               <Icon className={typeConfig?.color} size={28} />
//             </div>
//           )}
//         </div>

//         {address.image && (
//           <AddressImageViewer
//             src={address.image}
//             alt={`Imagem do endereço ${address.businessName ?? "Residencial"}`}
//           />
//         )}

//         <div></div>

//         <div className="flex justify-between mt-2">
//           <p className="text-sm text-gray-400">
//             Enviado por: {createdUser[0].name ?? "Usuário desconhecido"}
//           </p>
//           <div className="text-sm text-gray-400 text-end">
//             <p className="text-sm text-gray-400">
//               Actualizado por: {updatedUser[0].name ?? "Usuário desconhecido"}
//             </p>
//             <p>
//               En:{" "}
//               {new Intl.DateTimeFormat("pt-BR", {
//                 timeZone: "America/Sao_Paulo",
//               }).format(new Date(updatedUser[0].updatedAt))}
//             </p>
//           </div>
//         </div>

//         <div className="inline-flex gap-5 mx-auto">
//           <span
//             className={`text-sm font-semibold ${
//               address.confirmed ? "text-blue-600" : "text-red-500"
//             }`}
//           >
//             {address.confirmed ? "Confirmado" : "No confirmado"}
//           </span>
//           <span
//             className={`text-sm font-semibold ${
//               address.active ? "text-blue-600" : "text-red-500"
//             }`}
//           >
//             {address.active ? "Tarjeta activa" : "Tarjeta desactivada"}
//           </span>
//         </div>

//         {/* ADDRESS INFO */}
//         <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <h2 className="text-xs uppercase tracking-wide text-gray-400">
//               Calle
//             </h2>
//             <p className="text-base font-medium">
//               {address.street}, {address.number}
//             </p>
//           </div>

//           <div>
//             <h2 className="text-xs uppercase tracking-wide text-gray-400">
//               Barrio
//             </h2>
//             <p className="text-base font-medium">{address.neighborhood}</p>
//           </div>

//           <div>
//             <h2 className="text-xs uppercase tracking-wide text-gray-400">
//               Ciudad
//             </h2>
//             <p className="text-base font-medium">{address.city}</p>
//           </div>
//         </section>

//         {/* EXTRA INFO */}
//         {address.info && (
//           <section className="bg-gray-100 ">
//             <h2 className="text-sm font-semibold mb-2">
//               Informações adicionais
//             </h2>
//             <p className="text-sm leading-relaxed text-gray-700">
//               {address.info}
//             </p>
//           </section>
//         )}
//       </section>
//     </article>
//   );
// }
