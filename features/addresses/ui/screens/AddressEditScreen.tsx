import { notFound } from "next/navigation";
import { getAddressByIdAction } from "../../application/address.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddressEditForm from "../components/AddressEditForm";

type Props = {
  organizationSlug: string;
  addressId: string;
};

export default async function AddressEditScreen({
  organizationSlug,
  addressId,
}: Props) {
  const address = await getAddressByIdAction(addressId);
  if (!address) notFound();

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      <header className="flex items-center gap-3 px-4 pb-2 pt-4">
        <Link
          href={`/org/${organizationSlug}/addresses/${addressId}`}
          className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Volver a los detalles de la dirección"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Editar dirección</h1>
          <p className="text-xs text-muted-foreground">
            {address.businessName ?? address.street}
          </p>
        </div>
      </header>

      <AddressEditForm address={address} />
    </article>
  );
}
