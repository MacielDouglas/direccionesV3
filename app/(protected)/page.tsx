import LogoutButton from "@/components/LogoutButton";
import MainAppMenu from "@/components/menu/MainAppMenu";
import { PendingDeletionBadge } from "@/features/addresses/ui/components/PendingDeletionBadge";
import { getCurrentUser } from "@/server/users";
import { DeleteAccountButton } from "./org/[organizationSlug]/(members)/user/_components/DeleteAccountButton";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Página Home",
};

export default async function Home() {
  const data = await getCurrentUser();

    if (!data) {
    redirect("/login");
  }

  const { session, activeOrganization: organization, memberRole } = data!;

  return (
    <main className="h-full w-full">
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="text-3xl font-light">
          Bienvenido, <span className="font-medium">{session.user.name}</span>
        </h1>

        {organization ? (
          <div className="space-y-6">
            <p className="text-lg">Para empezar, elige una opción.</p>
            <MainAppMenu
              role={memberRole?.role ?? null}
              orgSlug={organization?.slug ?? ""}
            />
            {organization &&
              ["admin", "owner"].includes(memberRole?.role ?? "") && (
                <PendingDeletionBadge
                  organizationId={organization?.id ?? ""}
                  orgSlug={organization?.slug ?? ""}
                />
              )}
          </div>
        ) : (
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>¡Gracias por conectarte!</p>
            <p>Todavía no formas parte de ningún grupo.</p>
            <p>Habla con un administrador para unirte a uno.</p>
            <LogoutButton />
            <DeleteAccountButton userEmail={session.user.email} />
          </div>
        )}
      </div>
    </main>
  );
}
