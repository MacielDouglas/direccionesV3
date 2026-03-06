import { MyCardsScreen } from "@/features/cards/ui/screens/MyCardsScreen.tsx";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { requireSession } from "@/server/users";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function MyCardsPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [session, org] = await Promise.all([
    requireSession(),
    getOrganizationBySlug(organizationSlug),
  ]);

  if (!org) redirect("/organizations");

  return (
    <MyCardsScreen
      organizationId={org.id}
      organizationSlug={organizationSlug}
      userId={session.user.id}
    />
  );
}
