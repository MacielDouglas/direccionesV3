// features/invitations/ui/screens/InvitationsScreen.tsx
import { Link2 } from "lucide-react";
import { InviteTokenGenerator } from "../components/InviteTokenGenerator";
import { InviteTokenList } from "../components/InviteTokenList";
import { getOrgInviteTokensAction } from "../../applications/inviteToken.action";

interface Props {
  organizationId: string;
  orgSlug: string;
}

export async function InvitationsScreen({ organizationId, orgSlug }: Props) {
  const tokens = await getOrgInviteTokensAction(organizationId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link2 className="h-8 w-8 text-brand" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold">Invitaciones</h1>
          <p className="text-sm text-muted-foreground">
            Genera un enlace y compártelo — válido 24 horas, un solo uso.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="generate-title"
        className="rounded-xl border p-5"
      >
        <h2 id="generate-title" className="mb-4 text-base font-semibold">
          Generar enlace de invitación
        </h2>
        <InviteTokenGenerator
          organizationId={organizationId}
          orgSlug={orgSlug}
        />
      </section>

      <section aria-labelledby="history-title">
        <h2 id="history-title" className="mb-3 text-base font-semibold">
          Historial
        </h2>
        <InviteTokenList tokens={tokens} />
      </section>
    </main>
  );
}
