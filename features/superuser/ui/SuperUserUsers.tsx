"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  superuserDeleteUserAction,
  superuserSendUserToOrganizationAction,
} from "@/features/superuser/applications/superuser.action";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Loader2, Send, Trash2, UserRoundX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { SuperOrg } from "./SuperUserOrganizations";

export type SuperUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
};

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message.trim() ? err.message : fallback;
}

export function SuperUserUsers({
  users,
  organizations,
}: {
  users: SuperUserRow[];
  organizations: SuperOrg[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const sendToOrg = async (user: SuperUserRow) => {
    const organizationId = selectedOrgId[user.id];
    if (!organizationId) {
      toast.error(t.superuser.selectOrgToSend);
      return;
    }
    setBusyId(user.id);
    try {
      await superuserSendUserToOrganizationAction(user.id, organizationId);
      toast.success(t.superuser.userSent);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (user: SuperUserRow) => {
    if (!window.confirm(t.superuser.deleteUserConfirm.replace("{name}", user.name ?? "usuario"))) {
      return;
    }
    setBusyId(user.id);
    try {
      await superuserDeleteUserAction(user.id);
      toast.success(t.superuser.userDeleted);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section aria-labelledby="super-users-title" className="text-left">
      <h2
        id="super-users-title"
        className="mb-1 flex items-center gap-2 text-base font-semibold text-foreground"
      >
        <UserRoundX className="size-4 text-brand" aria-hidden />
        {t.superuser.panelUsersWithoutOrg}
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">{t.superuser.panelUsersHint}</p>

      {users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          <UserRoundX className="size-6" aria-hidden />
          <p>{t.superuser.emptyUsersWithoutOrg}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {users.map((user) => {
            const isBusy = busyId === user.id;
            return (
              <li
                key={user.id}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user.image ?? undefined} alt="" />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name ?? "Usuário"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email ?? ""}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={selectedOrgId[user.id] ?? ""}
                    onValueChange={(value) =>
                      setSelectedOrgId((prev) => ({ ...prev, [user.id]: value }))
                    }
                  >
                    <SelectTrigger className="w-44" aria-label={t.superuser.selectOrgToSend}>
                      <SelectValue placeholder={t.superuser.selectOrgPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => sendToOrg(user)}
                    disabled={isBusy || !selectedOrgId[user.id]}
                    aria-busy={isBusy}
                    className="gap-1.5"
                  >
                    {isBusy ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Send className="size-3.5" aria-hidden />
                    )}
                    {t.superuser.sendToOrg}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteUser(user)}
                    disabled={isBusy}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    {t.superuser.deleteUser}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
