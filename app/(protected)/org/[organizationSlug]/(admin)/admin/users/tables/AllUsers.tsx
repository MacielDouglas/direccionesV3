"use client";

import { User } from "@/app/generated/prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { addMember } from "@/server/member";
import { Loader2, UserPlus } from "lucide-react";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AllUsersProps {
  users: User[];
  organizationId: string;
  slug: string;
}

export default function AllUsers({
  users,
  organizationId,
  slug,
}: AllUsersProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const handleAddMember = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      await addMember(organizationId, userId, slug, "member");
      toast.success("Membro adicionado com sucesso!");
      // router.refresh();
    } catch (error) {
      toast.error(`Erro ao adicionar membro:, ${error}`);
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto mt-5 border-t pt-10">
      {/* Header */}
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Usuarios no añadidos</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} usuario{users.length > 1 && "s"}
        </p>
      </header>

      {/* List */}
      <ul className="flex flex-col gap-3">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            {/* Avatar */}
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>

            {/* Action */}
            <Button
              size="icon"
              variant="secondary"
              className="shrink-0"
              onClick={() => handleAddMember(user.id)}
              disabled={loadingUserId === user.id}
            >
              {loadingUserId === user.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
