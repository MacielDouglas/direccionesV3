import { MyCardsScreen } from "@/features/cards/ui/screens/MyCardsScreen";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mis Tarjetas",
};

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function MyCardsPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [data, org] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(organizationSlug),
  ]);

  if (!data) redirect("/login");
  if (!org) redirect("/organizations");

  return (
    <div className="flex w-full justify-center">
      <MyCardsScreen
        organizationId={org.id}
        organizationSlug={organizationSlug}
        personId={data.person.id}
      />
    </div>
  );
}
