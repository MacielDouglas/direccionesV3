import {
  getNextCardNumber,
  getAvailableAddresses,
} from "../../application/card.service";
import { CardCreateClient } from "../components/CardCreateClient";

interface Props {
  organizationId: string;
  organizationSlug: string;
}

export async function CardCreateScreen({
  organizationId,
  organizationSlug,
}: Props) {
  const [nextNumber, availableAddresses] = await Promise.all([
    getNextCardNumber(organizationId),
    getAvailableAddresses(organizationId),
  ]);

  return (
    <CardCreateClient
      organizationId={organizationId}
      organizationSlug={organizationSlug}
      nextNumber={nextNumber}
      availableAddresses={availableAddresses}
    />
  );
}
