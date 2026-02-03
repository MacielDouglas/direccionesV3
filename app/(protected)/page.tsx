import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/server/users";

export default async function Home() {
  const data = await getCurrentUser();
  const member = data?.session.session.activeOrganizationId;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light">
            Bienvenido,{" "}
            <span className="font-medium">{data?.session.user.name}</span>
          </h1>
          {member ? (
            <p className="text-xl text-slate-700">
              para empezar, elige una opción.
            </p>
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
