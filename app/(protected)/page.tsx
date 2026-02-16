import LogoutButton from "@/components/LogoutButton";
import MainAppMenu from "@/components/menu/MainAppMenu";
import { getActiveOrganization } from "@/server/organization/organization.queries";
import { getCurrentUser } from "@/server/users";

export default async function Home() {
  const data = await getCurrentUser();
  const member = data?.session.session.activeOrganizationId;

  const organization = await getActiveOrganization(data?.user.id ?? "");

  return (
    <main className="h-full w-full">
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="text-3xl font-light">
          Bienvenido,{" "}
          <span className="font-medium">{data?.session.user.name}</span>
        </h1>

        {member ? (
          <div className="space-y-6">
            <p className="text-lg">Para empezar, elige una opción</p>

            <MainAppMenu
              role={data.memberRole?.role}
              orgSlug={organization?.slug ?? ""}
            />
          </div>
        ) : (
          <div className="space-y-4 text-lg">
            <p>Obrigado por se conectar!!</p>
            <p>Você ainda não faz parte de um grupo</p>
            <p>Fale com um administrador para pertencer a um grupo.</p>

            <LogoutButton />
          </div>
        )}
      </div>
    </main>
  );
}
