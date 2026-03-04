"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { addMember } from "@/server/member";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface AllUsersProps {
  users: UserItem[];
  organizationId: string;
  slug: string;
}

export default function AllUsers({
  users,
  organizationId,
  slug,
}: AllUsersProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const router = useRouter();

  const handleAddMember = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      await addMember(organizationId, userId, slug, "member");
      toast.success("Miembro agregado correctamente.");
      router.refresh();
    } catch (error) {
      console.error("[AllUsers]", error);
      toast.error("Error al agregar el miembro. Intente nuevamente.");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <section className="mx-auto mt-5 w-full max-w-3xl border-t pt-10">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Usuarios sin asignar</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} usuario{users.length !== 1 && "s"}
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>

            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="shrink-0"
              aria-label={`Agregar ${user.name ?? user.email} como miembro`}
              onClick={() => handleAddMember(user.id)}
              disabled={loadingUserId === user.id}
            >
              {loadingUserId === user.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="size-4" aria-hidden="true" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
