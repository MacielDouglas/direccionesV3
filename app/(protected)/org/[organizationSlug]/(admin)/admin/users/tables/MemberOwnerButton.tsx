"use client";

import { Button } from "@/components/ui/button";
import { memberUpdateRole } from "@/server/member";
import { Crown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function MemberOwnerButton({
  organizationId,
  memberId,
  isOwner,
}: {
  organizationId: string;
  memberId: string;
  isOwner: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const targetRole: "owner" | "admin" = isOwner ? "admin" : "owner";

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      await memberUpdateRole(organizationId, memberId, targetRole);
      toast.success(
        targetRole === "owner"
          ? "Usuario promovido a owner."
          : "Usuario degradado a administrador.",
      );
      router.refresh();
    } catch {
      toast.error("Error al cambiar el rol. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant={isOwner ? "outline" : "default"}
      className="shrink-0"
      disabled={isLoading}
      aria-label={isOwner ? "Quitar owner" : "Hacer owner"}
      onClick={handleToggle}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Crown className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
