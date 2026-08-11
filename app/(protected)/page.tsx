import LogoutButton from "@/components/LogoutButton";
import MainAppMenu from "@/components/menu/MainAppMenu";
import { PendingDeletionBadge } from "@/features/addresses/ui/components/PendingDeletionBadge";
import { getServerDictionary } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeleteAccountButton } from "./org/[organizationSlug]/(members)/user/_components/DeleteAccountButton";

export const metadata: Metadata = {
  title: "Página Home",
};

export default async function Home() {
  const data = await getCurrentUser();
  const t = await getServerDictionary();

  if (!data) {
    redirect("/login");
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
          <div className="space-y-4 text-muted-foreground">
            <p>{t.home.thanks}</p>
            <p>{t.home.notInGroup}</p>
            <p>{t.home.talkToAdmin}</p>
            <LogoutButton />
            <DeleteAccountButton userEmail={session.user.email} />
          </div>
        )}
      </div>
    </main>
  );
}
