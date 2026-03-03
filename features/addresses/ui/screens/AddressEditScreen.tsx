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
    <article className="w-full max-w-2xl mx-auto flex flex-col gap-2">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link
          href={`/org/${organizationSlug}/addresses/${addressId}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Editar endereço</h1>
          <p className="text-xs text-muted-foreground">
            {address.businessName ?? address.street}
          </p>
        </div>
      </header>

      {/* Formulário client */}
      <AddressEditForm address={address} />
    </article>
  );
}
