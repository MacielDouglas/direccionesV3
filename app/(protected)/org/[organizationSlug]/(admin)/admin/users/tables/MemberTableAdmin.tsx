"use client";

import { Button } from "@/components/ui/button";
import { memberUpdateRole } from "@/server/member";
import { Loader2, ShieldOff, ShieldUser } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "@/domains/member/types/role.types";

export default function MemberTableAdmin({
  organizationId,
  memberId,
  memberRole,
}: {
  organizationId: string;
  memberId: string;
  memberRole: Exclude<Role, "owner">;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Se já é admin → rebaixar para member; se é member → promover para admin
  const targetRole: Exclude<Role, "owner"> =
    memberRole === "admin" ? "member" : "admin";

  const handleToggleRole = async () => {
    try {
      setIsLoading(true);
      await memberUpdateRole(organizationId, memberId, targetRole);
      toast.success(
        targetRole === "admin"
          ? "Usuario promovido a administrador."
          : "Permisos de administrador removidos.",
      );
      router.refresh();
    } catch (error) {
      console.error("[MemberTableAdmin]", error);
      toast.error("Error al cambiar el rol. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant={memberRole === "admin" ? "destructive" : "default"}
      className="shrink-0"
      disabled={isLoading}
      aria-label={memberRole === "admin" ? "Quitar admin" : "Hacer admin"}
      onClick={handleToggleRole}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : memberRole === "admin" ? (
        <ShieldOff className="size-4" aria-hidden="true" />
      ) : (
        <ShieldUser className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
