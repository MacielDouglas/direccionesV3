import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/server/users";

export default async function UserPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col p-10 items-center gap-5">
      <h1 className="text-2xl font-semibold">Perfil del Usuário</h1>
      <Avatar className="size-32 shrink-0">
        <AvatarImage src={user?.session.user.image ?? undefined} />
        <AvatarFallback>
          {user?.session.user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="uppercase text-2xl font-medium">
        {user?.session.user.name}
      </p>
    </div>
  );
}
