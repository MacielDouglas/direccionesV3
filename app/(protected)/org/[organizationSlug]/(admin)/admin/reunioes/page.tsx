import { BackLink } from "@/components/ui/BackLink";
import { getMeetingConnectionStatus } from "@/features/meetings/application/meeting.service";
import { readDefaultBaseUrl } from "@/features/meetings/infrastructure/meeting-config";
import { MeetingConnectionForm } from "@/features/meetings/ui/MeetingConnectionForm";
import { getServerDictionary } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.meetings.title };
}

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function AdminReunioesPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [session, t] = await Promise.all([getCurrentUser(), getServerDictionary()]);
  if (!session) redirect("/login");

  // Só owner (superuser equivale): a conexão guarda o token que decifra a semana.
  const role = session.memberRole?.role;
  if (!session.isSuperUser && role !== "owner") {
    redirect(`/org/${organizationSlug}/admin`);
  }

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  const status = await getMeetingConnectionStatus(organization.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <BackLink href={`/org/${organizationSlug}/admin`} className="mb-4" />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.meetings.title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.meetings.adminDescription}</p>
      </header>

      <MeetingConnectionForm
        organizationId={organization.id}
        organizationSlug={organizationSlug}
        initial={status}
        defaultBaseUrl={readDefaultBaseUrl() ?? ""}
        texts={t.meetings}
      />
    </main>
  );
}
