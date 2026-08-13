import SurveyScreen from "@/features/surveys/ui/screens/SurveyScreen";
import { prisma } from "@/lib/prisma";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Relevamiento" };

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function SurveysPage({ params }: Props) {
  const { organizationSlug } = await params;

  const [data, org] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(organizationSlug),
  ]);
  if (!data) redirect("/login");
  if (!org) redirect("/");

  const person = data.person;
  if (person.organizationId !== org.id) redirect("/");

  const pins = await prisma.surveyPin.findMany({
    where: { survey: { organizationId: org.id } },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SurveyScreen
      organizationId={org.id}
      personId={person.id}
      userRole={person.role ?? "member"}
      initialPins={pins}
    />
  );
}
