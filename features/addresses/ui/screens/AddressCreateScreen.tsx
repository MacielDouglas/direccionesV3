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
      className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10"
      aria-labelledby="address-create-heading"
    >
      <header className="mb-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
          <MapPinPlus className="size-4" aria-hidden="true" />
          {t.navigation.newAddress}
        </p>
        <h1
          id="address-create-heading"
          className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {t.addresses.createTitle}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          {t.addresses.createDescription}
        </p>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t.addresses.createHint}</p>
      </header>

      <AddressForm existingNeighborhoods={neighborhoods} existingCities={cities} />
    </main>
  );
}
