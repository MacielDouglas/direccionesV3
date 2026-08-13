"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createInviteTokenAction } from "@/features/invitations/applications/inviteToken.action";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { removePersonFromOrganization } from "@/server/person";
import { Loader2, Mail, RefreshCw, Trash2, UserRound, UserRoundX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type AdminUserItem = {
  id: string | undefined;
  name: string | undefined;
  email: string | undefined;
  image: string | null | undefined;
  createdAt: string | undefined;
  person: { id: string; name: string; role: string | null } | null;
};

interface Props {
  usersWithPerson: AdminUserItem[];
  usersWithoutPerson: AdminUserItem[];
  organizationId: string;
  organizationSlug: string;
  currentRole: string | null;
  isSuperUser: boolean;
  currentUserId: string;
}

export function UsersScreen({
  usersWithPerson,
  usersWithoutPerson,
  organizationId,
  organizationSlug,
  currentRole,
  isSuperUser,
  currentUserId,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const canRemoveUser = (person: AdminUserItem) => {
    if (!person.person) return false;
    if (person.person.id === currentUserId) return false;
    if (isSuperUser) return true;
    if (currentRole === "admin" && person.person.role === "owner") return false;
    return currentRole === "admin" || currentRole === "owner";
  };

  const _copyInvite = async (token: string) => {
    const url = `${window.location.origin}/join/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.people.inviteCopied);
    } catch {
      toast.error(t.errors.generic);
    }
  };

  const regenerateInvite = async (personId: string) => {
    setBusyUserId(personId);
    try {
      const result = await createInviteTokenAction({ organizationId, orgSlug: organizationSlug });
      await navigator.clipboard.writeText(`${window.location.origin}/join/${result.token}`);
      toast.success(t.people.inviteCopied);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setBusyUserId(null);
    }
  };

  const removeUser = (person: AdminUserItem) => {
    if (!person.person) return;
    if (person.person.id === currentUserId) {
      toast.error(t.people.cannotDeleteSelf);
      return;
    }
    if (currentRole === "admin" && person.person.role === "owner") {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
    if (!window.confirm(t.people.removeFromOrgConfirm.replace("{name}", person.name ?? "usuário")))
      return;
    setBusyUserId(person.person.id);
    try {
      removePersonFromOrganization(organizationId, person.person.id);
      toast.success(t.people.removeFromOrgSuccess);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setBusyUserId(null);
    }
  };

  const roleLabel = (role: string) => {
    if (role === "owner") return t.people.roleOwner;
    if (role === "admin") return t.people.roleAdmin;
    return t.people.roleMember;
  };

  const badgeClasses = (hasPerson: boolean) =>
    cn(
      "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
      hasPerson
        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    );

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t.admin.users}</h1>
        <p className="mb-3 text-sm text-muted-foreground">{t.people.usersSubtitle}</p>
      </header>

      {/* Usuários COM pessoa vinculada */}
      <section aria-labelledby="users-linked-title">
        <h2
          id="users-linked-title"
          className="mb-1 flex items-center gap-2 text-base font-semibold"
        >
          <UserRound className="size-4 text-brand" aria-hidden />
          {t.people.usersSectionTitle}
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {usersWithPerson.length === 1
            ? t.people.countOne.replace("{count}", "1")
            : t.people.countMany.replace("{count}", String(usersWithPerson.length))}
        </p>

        {usersWithPerson.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            <UserRound className="size-6" aria-hidden />
            <p>{t.people.noUsers}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {usersWithPerson.map((user) => {
              const isBusy = busyUserId === user.person?.id;
              const isSelf = user.person?.id === currentUserId;
              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.name ?? "Usuário"}
                        {isSelf && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({t.people.youLabel})
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email ?? ""}</p>
                    </div>
                  </div>

                  <span className={badgeClasses(true)}>
                    {roleLabel(user.person?.role ?? "member")}
                  </span>

                  {canRemoveUser(user) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeUser(user)}
                      disabled={isBusy}
                      aria-busy={isBusy}
                    >
                      {isBusy ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="size-3.5" aria-hidden />
                      )}
                      {t.people.removeFromOrg}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Usuários SEM pessoa vinculada */}
      <section aria-labelledby="users-unlinked-title">
        <h2
          id="users-unlinked-title"
          className="mb-1 flex items-center gap-2 text-base font-semibold"
        >
          <UserRoundX className="size-4 text-brand" aria-hidden />
          {t.people.listTitle}
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {usersWithoutPerson.length === 1
            ? t.people.countOne.replace("{count}", "1")
            : t.people.countMany.replace("{count}", String(usersWithoutPerson.length))}
        </p>

        {usersWithoutPerson.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            <Mail className="size-6" aria-hidden />
            <p>{t.people.empty}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {usersWithoutPerson.map((user) => {
              const isBusy = busyUserId === user.person?.id;
              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name ?? "Usuário"}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email ?? ""}</p>
                    </div>
                  </div>

                  <span className={badgeClasses(false)}>
                    {roleLabel(user.person?.role ?? "member")}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateInvite(user.person?.id ?? "")}
                      disabled={isBusy}
                      aria-busy={isBusy}
                    >
                      {isBusy ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : (
                        <RefreshCw className="size-3.5" aria-hidden />
                      )}
                      {t.people.regenerate}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => user.person && removeUser(user)}
                      disabled={isBusy}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      {t.people.removeFromOrg}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
