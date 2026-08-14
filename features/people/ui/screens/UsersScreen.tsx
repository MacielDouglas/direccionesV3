"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  getPersonCardsManageData,
  regeneratePersonInviteAction,
  removePersonFromOrganization,
  updatePersonName,
  updatePersonRole,
} from "@/server/person";
import {
  Check,
  Copy,
  CreditCard,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Trash2,
  UserRound,
  UserRoundX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminCardsDialog, EditPersonDialog, type ManagePersonCards } from "./PeopleScreen";

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

const PERSON_ROLES = ["member", "admin", "owner"] as const;
type PersonRole = (typeof PERSON_ROLES)[number];

function isPersonRole(value: string): value is PersonRole {
  return (PERSON_ROLES as readonly string[]).includes(value);
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message.trim() ? err.message : fallback;
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
  const [inviteTokens, setInviteTokens] = useState<Record<string, string>>({});
  const [copiedPersonId, setCopiedPersonId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<PersonRole>("member");
  const [isEditing, startEditTransition] = useTransition();
  const [cardsTarget, setCardsTarget] = useState<AdminUserItem | null>(null);
  const [manageData, setManageData] = useState<ManagePersonCards | null>(null);

  const canManagePerson = (person: AdminUserItem) => {
    if (!person.person) return false;
    if (person.person.id === currentUserId) return false;
    if (isSuperUser) return true;
    return currentRole === "admin" || currentRole === "owner";
  };

  const canPromoteToOwner = isSuperUser || currentRole === "owner";

  const regenerateInvite = async (personId: string) => {
    if (!personId) return;
    setBusyUserId(personId);
    try {
      const result = await regeneratePersonInviteAction(organizationId, personId, organizationSlug);
      setInviteTokens((prev) => ({ ...prev, [personId]: result.token }));
      setCopiedPersonId(null);
      toast.success(t.admin.tokenGenerated);
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setBusyUserId(null);
    }
  };

  const copyToken = async (personId: string, token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedPersonId(personId);
    toast.success(t.admin.tokenCopied);
    setTimeout(() => setCopiedPersonId(null), 2000);
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
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setBusyUserId(null);
    }
  };

  const openEdit = (user: AdminUserItem) => {
    if (!user.person) return;
    const role = user.person.role && isPersonRole(user.person.role) ? user.person.role : "member";
    setEditTarget(user);
    setEditName(user.person.name);
    setEditRole(role);
  };

  const handleEdit = () => {
    const target = editTarget?.person;
    const trimmed = editName.trim();
    if (!target || trimmed.length < 2) return;
    if (editRole === "owner" && !canPromoteToOwner) {
      toast.error(t.people.cannotDemoteLastOwner);
      return;
    }
    startEditTransition(async () => {
      try {
        await updatePersonName(organizationId, target.id, trimmed, organizationSlug);
        if (editRole !== target.role) {
          await updatePersonRole(organizationId, target.id, editRole, organizationSlug);
        }
        toast.success(t.people.personUpdated);
        setEditTarget(null);
        router.refresh();
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  const openAdminCards = async (user: AdminUserItem) => {
    if (!user.person) return;
    setCardsTarget(user);
    try {
      const data = await getPersonCardsManageData(organizationId, user.person.id);
      setManageData(data);
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
      setCardsTarget(null);
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
              const canManage = canManagePerson(user);
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

                  <div className="flex flex-wrap gap-2">
                    {canManage && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          {t.people.editPerson}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openAdminCards(user)}
                        >
                          <CreditCard className="size-3.5" aria-hidden />
                          {t.people.adminCardsTitle}
                        </Button>
                      </>
                    )}
                    {canManage && (
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
                  </div>
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
              const personId = user.person?.id ?? "";
              const isBusy = busyUserId === personId;
              const token = inviteTokens[personId];
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
                      onClick={() => regenerateInvite(personId)}
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

                  {token && (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 sm:w-full">
                      <KeyRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <code className="font-mono text-lg font-semibold tracking-[0.4em] text-foreground">
                        {token}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToken(personId, token)}
                        className="ml-auto shrink-0 gap-1.5"
                      >
                        {copiedPersonId === personId ? (
                          <Check className="size-3.5" aria-hidden />
                        ) : (
                          <Copy className="size-3.5" aria-hidden />
                        )}
                        {t.admin.tokenCopy}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editTarget ? (
        <EditPersonDialog
          name={editName}
          onNameChange={setEditName}
          role={editRole}
          onRoleChange={(value) => {
            if (isPersonRole(value)) setEditRole(value);
          }}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
          isSaving={isEditing}
          canPromoteToOwner={canPromoteToOwner}
          t={t}
        />
      ) : null}

      {cardsTarget?.person && manageData ? (
        <AdminCardsDialog
          person={{ id: cardsTarget.person.id, name: cardsTarget.person.name }}
          data={manageData}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          onClose={() => {
            setCardsTarget(null);
            setManageData(null);
          }}
          t={t}
        />
      ) : null}
    </main>
  );
}
