import { dictionaries } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/users";
import { MapPinPlus } from "lucide-react";
import { getExistingLocations } from "../../application/address.service";
import AddressForm from "../components/AddressForm";

export default async function AddressCreateScreen() {
  const [session, locale] = await Promise.all([getCurrentUser(), getServerLocale()]);
  const organizationId = session?.person?.organizationId ?? "";

  const { neighborhoods, cities } = organizationId
    ? await getExistingLocations(organizationId)
    : { neighborhoods: [], cities: [] };

  const t = dictionaries[locale];

  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10"
      aria-labelledby="address-create-heading"
    >
      {/* Hero — nova direção */}
      <div className="rounded-2xl bg-black p-6 text-white shadow-md shadow-black/20 sm:p-8">
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-400">
          <MapPinPlus className="size-4" aria-hidden="true" />
          {t.navigation.newAddress}
        </span>
        <h1
          id="address-create-heading"
          className="mt-3 max-w-md text-lg font-semibold leading-snug sm:text-xl"
        >
          {t.addresses.createTitle}
        </h1>
        <p className="mt-2 max-w-md text-sm text-neutral-400">{t.addresses.createDescription}</p>
        <p className="mt-1 max-w-md text-xs text-neutral-500">{t.addresses.createHint}</p>
      </div>

      <div className="mt-8">
        <AddressForm existingNeighborhoods={neighborhoods} existingCities={cities} />
      </div>
    </main>
  );
}
