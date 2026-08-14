"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Role } from "@/domains/member/types/role.types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { leaveOrganizationAction } from "@/server/organization/leave-organization.action";
import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LeaveOrganizationButton({
  organizationId,
  organizationName,
  role,
}: {
  organizationId: string;
  organizationName: string;
  role: Role;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  if (role === "owner") return null;

  async function handleLeave() {
    try {
      setIsLoading(true);
      await leaveOrganizationAction(organizationId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.user.leaveError);
      setIsLoading(false);
    }
  }

  const description =
    role === "member" ? t.user.leaveOrgMemberDescription : t.user.leaveOrgAdminDescription;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <LogOut className="size-4" aria-hidden />
          {t.user.leaveOrg}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t.user.leaveOrgTitle.replace("{orgName}", organizationName)}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p>{description}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90 gap-2"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4" aria-hidden />
            )}
            {t.user.leaveOrgConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
