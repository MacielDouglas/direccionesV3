import { redirect } from "next/navigation";
import {
  getCardWithAddresses,
  getAvailableAddresses,
} from "../../application/card.service";
import { CardEditClient } from "../components/CardEditClient";

interface Props {
  cardId: string;
  organizationId: string;
  organizationSlug: string;
}

export async function CardEditScreen({
  cardId,
  organizationId,
  organizationSlug,
}: Props) {
  const [card, available] = await Promise.all([
    getCardWithAddresses(cardId, organizationId),
    getAvailableAddresses(organizationId),
  ]);

  if (!card) redirect(`/org/${organizationSlug}/admin/cards`);

  return (
    <CardEditClient
      cardId={card.id}
      cardNumber={card.number}
      organizationId={organizationId}
      organizationSlug={organizationSlug}
      linkedAddresses={card.addresses}
      availableAddresses={available}
    />
  );
}
