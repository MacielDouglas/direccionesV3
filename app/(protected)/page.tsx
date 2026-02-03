import { getCurrentUser } from "@/server/users";

export default async function Home() {
  const { user, memberRole } = await getCurrentUser();

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light">
            Bienvenido, <span className="font-medium">{user.name}</span>
          </h1>
          <p className="text-xl text-slate-700">
            para empezar, elige una opción.
          </p>
        </div>
      </div>
    </div>
  );
}
