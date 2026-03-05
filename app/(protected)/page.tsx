import LogoutButton from "@/components/LogoutButton";
import MainAppMenu from "@/components/menu/MainAppMenu";
import { PendingDeletionBadge } from "@/features/addresses/ui/components/PendingDeletionBadge";
import { getCurrentUser } from "@/server/users";

export default async function Home() {
  const data = await getCurrentUser();

  const hasOrganization = !!data?.session.session.activeOrganizationId;

  // Usa activeOrganization já resolvida pelo getCurrentUser
  // em vez de fazer uma segunda query
  const organization = data?.activeOrganization;

  return (
    <main className="h-full w-full">
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="text-3xl font-light">
          Bienvenido,{" "}
          <span className="font-medium">{data?.session.user.name}</span>
        </h1>

        {hasOrganization ? (
          <div className="space-y-6">
            <p className="text-lg">Para empezar, elige una opción.</p>
            <MainAppMenu
              role={data?.memberRole?.role ?? null}
              orgSlug={organization?.slug ?? ""}
            />
            {hasOrganization &&
              ["admin", "owner"].includes(data?.memberRole?.role ?? "") && (
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
          </div>
        )}
      </div>
    </main>
  );
}
