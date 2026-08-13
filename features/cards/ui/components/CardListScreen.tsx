import { getOrgPersons, listCards } from "../../application/card.service";
import { CardListClient } from "../components/CardListClient";

interface Props {
  organizationId: string;
  organizationSlug: string;
}

export async function CardListScreen({ organizationId, organizationSlug }: Props) {
  const [cards, persons] = await Promise.all([
    listCards(organizationId),
    getOrgPersons(organizationId),
  ]);

  return (
    <CardListClient
      cards={cards.map((card) => ({
        ...card,
        events: card.events.map((e) => ({
          date: e.date,
          person: e.person,
        })),
      }))}
      persons={persons}
      organizationSlug={organizationSlug}
    />
  );
}
