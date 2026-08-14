import LogoutButton from "@/components/LogoutButton";
import { getOwnerOnboardingTokensAction } from "@/features/invitations/applications/inviteToken.action";
import { getServerDictionary } from "@/lib/i18n/server";
import { OwnerTokenGenerator } from "./OwnerTokenGenerator";

export default async function SuperUserPanel({ email }: { email: string }) {
  const [t, tokens] = await Promise.all([getServerDictionary(), getOwnerOnboardingTokensAction()]);

  return (
    <main className="w-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t.superuser.panelTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{email}</p>

        <OwnerTokenGenerator initialTokens={tokens} />

        <div className="pt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
