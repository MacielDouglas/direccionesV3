import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { KeyRound } from "lucide-react";
import { getOrgInviteTokensAction } from "../../applications/inviteToken.action";
import { InviteTokenGenerator } from "../components/InviteTokenGenerator";
import { InviteTokenList } from "../components/InviteTokenList";

interface Props {
  organizationId: string;
  orgSlug: string;
}

export async function InvitationsScreen({ organizationId, orgSlug }: Props) {
  const [tokens, t, locale] = await Promise.all([
    getOrgInviteTokensAction(organizationId),
    getServerDictionary(),
    getServerLocale(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
      <header className="flex items-center gap-3">
        <KeyRound className="h-8 w-8 text-brand" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold">{t.admin.invitationsTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.admin.invitationsSubtitle}</p>
        </div>
      </header>

      <section aria-labelledby="generate-title" className="rounded-xl border p-5">
        <h2 id="generate-title" className="mb-4 text-base font-semibold">
          {t.admin.generateTitle}
        </h2>
        <InviteTokenGenerator organizationId={organizationId} orgSlug={orgSlug} />
      </section>

      <section aria-labelledby="history-title">
        <h2 id="history-title" className="mb-3 text-base font-semibold">
          {t.admin.historyTitle}
        </h2>
        <InviteTokenList tokens={tokens} locale={locale} />
      </section>
    </main>
  );
}
