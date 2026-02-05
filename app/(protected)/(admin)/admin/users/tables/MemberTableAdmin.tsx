"use client";

import { Button } from "@/components/ui/button";
import { memberUpdateRole } from "@/server/member";
import { Loader2, ShieldOff, ShieldUser } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MemberTableAdmin({
  organizationId,
  userId,
  memberRole,
}: {
  organizationId: string;
  userId: string;
  memberRole: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const router = useRouter();
  const [userRole, setUserRole] = useState("admin");

  useEffect(() => {
    if (memberRole === "admin") setUserRole("member");
  }, [memberRole]);

  const handleAddMember = async (userId: string) => {
    try {
      setIsLoading(true);
      setLoadingUserId(userId);
      await memberUpdateRole(organizationId, userId, userRole);
      toast.success(`Membro alterado para: ${userRole}!`);
      router.refresh();
    } catch (error) {
      toast.error(`${error}`);
      // toast.error(`Erro ao adicionar membro:, ${error}`);
    } finally {
      setLoadingUserId(null);
      setIsLoading(false);
    }
  };
  return (
    <Button
      size="icon"
      variant={memberRole === "admin" ? "destructive" : "default"}
      className="shrink-0"
      disabled={isLoading}
      onClick={() => handleAddMember(userId)}
    >
      {loadingUserId ? (
        <Loader2 className="size-4 animate-spin" />
      ) : memberRole === "admin" ? (
        <ShieldOff className="size-4" />
      ) : (
        <ShieldUser className="size-4" />
      )}
    </Button>
  );
}
