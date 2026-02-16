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

  const handleRemover = async () => {
    try {
      setIsLoading(true);
      await removeMemberManually(organizationId, memberIdOrEmail);
      toast.success("Membro removido com sucesso!");
      router.refresh();
    } catch {
      toast.error("Erro ao remover membro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="destructive"
      className="shrink-0"
      disabled={isLoading}
      onClick={handleRemover}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}
