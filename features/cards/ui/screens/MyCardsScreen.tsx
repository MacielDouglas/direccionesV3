import { listMyCards } from "../../application/card.service";
import { MyCardsClient } from "../components/MyCardsClient";

interface Props {
  organizationId: string;
  organizationSlug: string;
  personId: string;
}

export async function MyCardsScreen({ organizationId, organizationSlug, personId }: Props) {
  const cards = await listMyCards(organizationId, personId);
  const totalAddresses = cards.reduce((total, card) => total + card.addresses.length, 0);

  return (
    <MyCardsClient
      cards={cards}
      organizationSlug={organizationSlug}
      totalAddresses={totalAddresses}
    />
  );
}
