import LogoutButton from "@/components/LogoutButton";
import MainAppMenu from "@/components/menu/MainAppMenu";
import { getActiveOrganization } from "@/server/organizations";
import { getCurrentUser } from "@/server/users";

export default async function Home() {
  const data = await getCurrentUser();
  const member = data?.session.session.activeOrganizationId;

  const organization = await getActiveOrganization(data?.user.id ?? "");

  return (
    <div>
      <div className="w-full h-full space-y-8 bg-linear-to-r from-slate-50 via-slate-100 to-slate-200">
        <div className="max-w-md mx-auto text-center space-y-2 ">
          <div className="pt-10">
            <h1 className="text-3xl font-light">
              Bienvenido,{" "}
              <span className="font-medium">{data?.session.user.name}</span>
            </h1>
          </div>
          {member ? (
            <div>
              <p className="text-xl text-slate-700 ">
                para empezar, elige una opción.
              </p>
              <MainAppMenu
                role={data.memberRole?.role}
                orgSlug={organization?.slug ?? ""}
              />
            </div>
          ) : (
            <div className="space-y-4 text-xl mt-5">
              <p>Obrigado por se conectar!!</p>
              <p>Você ainda não faz parte de um grupo</p>
              <p>Fale com um administrdor para pertencer a um grupo.</p>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
