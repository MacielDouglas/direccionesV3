import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SurveyScreen from "@/features/surveys/ui/screens/SurveyScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Relevamiento" };

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function SurveysPage({ params }: Props) {
  const { organizationSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const org = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });
  if (!org) redirect("/");

  const member = await prisma.member.findFirst({
    where: { organizationId: org.id, userId: session.user.id },
  });
  if (!member) redirect("/");

  const pins = await prisma.surveyPin.findMany({
    where: { survey: { organizationId: org.id } },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SurveyScreen
      organizationId={org.id}
      userId={session.user.id}
      userRole={member.role}
      initialPins={pins}
    />
  );
}
