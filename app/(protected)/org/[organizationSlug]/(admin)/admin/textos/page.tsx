import { BackLink } from "@/components/ui/BackLink";
import { getSavedTexts } from "@/features/saved-texts/application/saved-text.service";
import SavedTextsManager from "@/features/saved-texts/ui/components/SavedTextsManager";
import { getServerDictionary } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.savedTexts.title };
}

export default async function AdminSavedTextsPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [session, t] = await Promise.all([getCurrentUser(), getServerDictionary()]);
  if (!session) redirect("/login");

  const role = session.memberRole?.role;
  if (!session.isSuperUser && (!role || !["admin", "owner"].includes(role))) {
    redirect(`/org/${organizationSlug}`);
  }

  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) redirect("/");

  const data = await getSavedTexts(organization.id);

  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10"
      aria-labelledby="saved-texts-heading"
    >
      <BackLink href={`/org/${organizationSlug}/admin`} className="mb-4" />
      <header className="mb-6">
        <h1
          id="saved-texts-heading"
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          {t.savedTexts.title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.savedTexts.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">{t.savedTexts.hint}</p>
      </header>

      <SavedTextsManager
        initialData={data}
        organizationId={organization.id}
        organizationSlug={organizationSlug}
      />
    </main>
  );
}
