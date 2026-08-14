import LogoutButton from "@/components/LogoutButton";
import { getOwnerOnboardingTokensAction } from "@/features/invitations/applications/inviteToken.action";
import { getSuperUserPanelData } from "@/features/superuser/applications/superuser.action";
import { getServerDictionary } from "@/lib/i18n/server";
import { OwnerTokenGenerator } from "./OwnerTokenGenerator";
import { SuperUserOrganizations } from "./SuperUserOrganizations";
import { SuperUserUsers } from "./SuperUserUsers";

export default async function SuperUserPanel({ email }: { email: string }) {
  const [t, tokens, data] = await Promise.all([
    getServerDictionary(),
    getOwnerOnboardingTokensAction(),
    getSuperUserPanelData(),
  ]);

  const organizations = data.organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    createdAt: org.createdAt.toISOString(),
    personCount: org._count.persons,
  }));

  return (
    <main className="w-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">{t.superuser.panelTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{email}</p>
        </header>

        <SuperUserOrganizations organizations={organizations} />

        <SuperUserUsers
          users={data.usersWithoutOrg.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt.toISOString(),
          }))}
          organizations={organizations}
        />

        <OwnerTokenGenerator initialTokens={tokens} />

        <div className="pt-2">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
