"use client";

import { Button } from "@/components/ui/button";
import { removeMemberManually } from "@/server/member";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function MembersTableAction({
  organizationId,
  memberIdOrEmail,
}: {
  organizationId: string;
  memberIdOrEmail: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      await removeMemberManually(organizationId, memberIdOrEmail);
      toast.success("Miembro eliminado correctamente.");
      router.refresh();
    } catch (error) {
      console.error("[MembersTableAction]", error);
      toast.error("Error al eliminar el miembro. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="destructive"
      className="shrink-0"
      disabled={isLoading}
      aria-label="Eliminar miembro"
      onClick={handleRemove}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
