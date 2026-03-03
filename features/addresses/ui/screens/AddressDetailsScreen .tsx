import { Address } from "@prisma/client";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";
import { getUniqueUser } from "@/server/users";
import { AddressImageViewer } from "../components/AddressImageViewer";
import { AddressViewMap } from "@/features/map/components/AddressViewMap";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type AddressDetailsScreenProps = {
  address: Address;
  organizationSlug: string;
};

const ADDRESS_COLOR_MAP: Record<string, string> = {
  House: "bg-green-500",
  Apartment: "bg-pink-500",
  Hotel: "bg-blue-500",
  Store: "bg-yellow-300",
  Restaurant: "bg-orange-500",
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
  organizationSlug,
}: AddressDetailsScreenProps) {
  const [createdUser, updatedUser] = await Promise.all([
    getUniqueUser(address.createdUserId),
    getUniqueUser(address.updatedUserId!),
  ]);

  const typeConfig = ADDRESS_TYPE_OPTIONS.find(
    (type) => type.value === address.type,
  );

  const Icon = typeConfig?.icon;
  const colorClass = getAddressColor(address.type);

  return (
    <article className="w-full max-w-5xl mx-auto flex flex-col gap-2 px-3 py-4 sm:px-4 sm:py-6 ">
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
        className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col gap-4 dark:bg-second-drk"
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
              <dd className="text-sm sm:text-base font-medium text-gray-800 mt-0.5 dark:text-second-lgt">
                {address.street}, {address.number}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Bairro
              </dt>
              <dd className="text-sm sm:text-base font-medium text-gray-800 mt-0.5  dark:text-second-lgt">
                {address.neighborhood}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Cidade
              </dt>
              <dd className="text-sm sm:text-base font-medium text-gray-800 mt-0.5  dark:text-second-lgt">
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
            <span className="font-medium text-gray-600  dark:text-second-lgt">
              {createdUser?.name ?? "Usuário desconhecido"}
            </span>
          </p>
          <div className="text-xs text-gray-400 sm:text-end flex gap-1">
            <p>Atualizado en: </p>
            <time dateTime={new Date(address.updatedAt).toISOString()}>
              {formatDate(address.updatedAt)},
            </time>
            <p>
              por:{" "}
              <span className="font-medium text-gray-600  dark:text-second-lgt">
                {updatedUser?.name ?? "Usuário desconhecido"}
              </span>
            </p>
          </div>
          <div className="flex gap-3 border-t border-gray-100 py-3">
            <Link
              href={`/org/${organizationSlug}/addresses/${address.id}/edit`}
              className="block"
            >
              <Button> Editar Dirección</Button>
            </Link>
          </div>
        </footer>
      </section>
    </article>
  );
}
