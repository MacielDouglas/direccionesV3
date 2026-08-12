import { HomeDashboard } from "@/features/home/ui/HomeDashboard";
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
    return (
      <main className="w-full overflow-y-auto">
        <SuperUserPanel email={data.user.email} />
      </main>
    );
  }

  const { session, activeOrganization: organization, memberRole } = data;

  return (
    <main className="w-full overflow-y-auto">
      {organization ? (
        <HomeDashboard
          organizationId={organization.id}
          organizationSlug={organization.slug}
          userId={session.user.id}
          userName={session.user.name}
          isAdminOrOwner={organization && ["admin", "owner"].includes(memberRole?.role ?? "")}
        />
      ) : (
        <div className="mx-auto max-w-md px-4 py-10 text-center md:py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t.home.welcome} <span className="text-brand">{session.user.name}</span>
          </h1>
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground">{t.home.notInGroup}</p>
            <WelcomeScreen userEmail={session.user.email} />
          </div>
        </div>
      )}
    </main>
  );
}
