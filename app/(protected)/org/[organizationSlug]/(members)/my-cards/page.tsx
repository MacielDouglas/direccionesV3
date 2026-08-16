import { MyCardsScreen } from "@/features/cards/ui/screens/MyCardsScreen";
import { getServerDictionary } from "@/lib/i18n/server";
import { getOrganizationBySlug } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.cards.title };
}

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function MyCardsPage({ params }: Props) {
  const { organizationSlug } = await params;

  const [data, org, t] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(organizationSlug),
    getServerDictionary(),
  ]);

  if (!data) redirect("/login");
  if (!org) redirect("/organizations");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 md:py-10">
      <header className="mb-6 flex items-start gap-3">
        <Link
          href={`/org/${organizationSlug}/addresses`}
          aria-label={t.common.back}
          className="mt-1 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {t.cards.title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.cards.summary}</p>
        </div>
      </header>

      <MyCardsScreen
        organizationId={org.id}
        organizationSlug={organizationSlug}
        personId={data.person.id}
      />
    </main>
  );
}
