import { listMyCards } from "../../application/card.service";
import { MyCardsClient } from "../components/MyCardsClient";

interface Props {
  organizationId: string;
  organizationSlug: string;
  userId: string;
}

export async function MyCardsScreen({
  organizationId,
  organizationSlug,
  userId,
}: Props) {
  const cards = await listMyCards(organizationId, userId);

  return <MyCardsClient cards={cards} organizationSlug={organizationSlug} />;
}
