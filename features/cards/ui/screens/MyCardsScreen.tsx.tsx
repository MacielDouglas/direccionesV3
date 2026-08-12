import { listMyCards } from "../../application/card.service";
import { MyCardsClient } from "../components/MyCardsClient";

interface Props {
  organizationId: string;
  organizationSlug: string;
  userId: string;
}

export async function MyCardsScreen({ organizationId, organizationSlug, userId }: Props) {
  const cards = await listMyCards(organizationId, userId);
  const totalAddresses = cards.reduce((total, card) => total + card.addresses.length, 0);

  return (
    <MyCardsClient
      cards={cards}
      organizationSlug={organizationSlug}
      totalAddresses={totalAddresses}
    />
  );
}
