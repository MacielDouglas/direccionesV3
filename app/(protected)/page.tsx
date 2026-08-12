import MainAppMenu from "@/components/menu/MainAppMenu";
import { PendingDeletionBadge } from "@/features/addresses/ui/components/PendingDeletionBadge";
import { WelcomeScreen } from "@/features/invitations/ui/screens/WelcomeScreen";
import SuperUserPanel from "@/features/superuser/ui/SuperUserPanel";
import { getServerDictionary } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Página Home",
};

export default async function Home() {
  const data = await getCurrentUser();
  const t = await getServerDictionary();

  if (!data) {
    redirect("/login");
  }

  if (data.isSuperUser) {
    return <SuperUserPanel email={data.user.email} />;
  }

  const { session, activeOrganization: organization, memberRole } = data;

  return (
    <main className="w-full overflow-y-auto">
      <div className="mx-auto max-w-md px-4 py-10 text-center md:py-14">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t.home.welcome} <span className="text-brand">{session.user.name}</span>
        </h1>

        {organization ? (
          <div className="space-y-6">
            <p className="text-muted-foreground">{t.home.chooseOption}</p>
            <MainAppMenu role={memberRole?.role ?? null} orgSlug={organization?.slug ?? ""} />
            {organization && ["admin", "owner"].includes(memberRole?.role ?? "") && (
              <PendingDeletionBadge
                organizationId={organization?.id ?? ""}
                orgSlug={organization?.slug ?? ""}
              />
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground">{t.home.notInGroup}</p>
            <WelcomeScreen userEmail={session.user.email} />
          </div>
        )}
      </div>
    </main>
  );
}
