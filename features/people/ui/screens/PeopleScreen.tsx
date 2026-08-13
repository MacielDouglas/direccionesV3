"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  adminBulkUpdatePersonCards,
  createOrgPersonAction,
  deletePersonAction,
  getPersonWithCards,
  linkUserToPersonAction,
  regeneratePersonInviteAction,
  removePersonFromOrganization,
  searchUsersToLinkAction,
  updatePersonName,
  updatePersonRole,
} from "@/server/person";
import {
  Link2,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  UserRound,
  UserRoundX,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export type PeopleListItem = {
  id: string;
  name: string;
  role: string | null;
  organizationId: string | null;
  userId: string | null;
  user: { id: string; name: string; email: string; image: string | null } | null;
  inviteToken: string | null;
  inviteExpired: boolean;
};

export type LinkableUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type PersonWithCards = {
  id: string;
  name: string;
  role: string | null;
  userId: string | null;
  cardsOwned: { id: string; number: number; assignedPersonId: string | null }[];
  cardsAssigned: { id: string; number: number }[];
};

interface Props {
  persons: PeopleListItem[];
  organizationId: string;
  organizationSlug: string;
  currentRole: string | null;
  isSuperUser: boolean;
  currentUserId: string;
}

function roleLabel(t: ReturnType<typeof useI18n>["t"], role: string | null) {
  if (role === "owner") return t.people.roleOwner;
  if (role === "admin") return t.people.roleAdmin;
  return t.people.roleMember;
}

const badgeClasses = (linked: boolean) =>
  cn(
    "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
    linked
      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  );

export function PeopleScreen({
  persons,
  organizationId,
  organizationSlug,
  currentRole,
  isSuperUser,
  currentUserId,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isCreating, startTransition] = useTransition();
  const [busyPersonId, setBusyPersonId] = useState<string | null>(null);
  const [linkTarget, setLinkTarget] = useState<PeopleListItem | null>(null);
  const [editTarget, setEditTarget] = useState<PeopleListItem | null>(null);
  const [cardsTarget, setCardsTarget] = useState<PeopleListItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<string>("member");
  const [isEditing, startEditTransition] = useTransition();
  const [cardsData, setCardsData] = useState<PersonWithCards | null>(null);
  const [selectedOwnerCardIds, setSelectedOwnerCardIds] = useState<string[]>([]);
  const [selectedAssignedCardId, setSelectedAssignedCardId] = useState<string | null>(null);
  const [isSavingCards, startSaveCardsTransition] = useTransition();

  const linkedUsers = persons.filter((p) => p.userId);
  const unlinkedPersons = persons.filter((p) => !p.userId);

  const canRemoveUser = (person: PeopleListItem) => {
    if (person.userId === currentUserId) return false;
    if (isSuperUser) return true;
    if (currentRole === "admin" && person.role === "owner") return false;
    return currentRole === "admin" || currentRole === "owner";
  };

  const canEditPerson = (person: PeopleListItem) => {
    if (person.userId === currentUserId) return false;
    if (isSuperUser) return true;
    if (currentRole === "admin" && person.role === "owner") return false;
    return currentRole === "admin" || currentRole === "owner";
  };

  const canPromoteToOwner = () => isSuperUser || currentRole === "owner";

  const handleCreate = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error(t.people.namePlaceholder);
      return;
    }
    startTransition(async () => {
      try {
        await createOrgPersonAction(organizationId, trimmed, organizationSlug);
        setName("");
        toast.success(t.people.createButton);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      }
    });
  };

  const copyInvite = async (person: PeopleListItem) => {
    const token = person.inviteToken;
    if (!token) return;
    const url = `${window.location.origin}/join/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.people.inviteCopied);
    } catch {
      toast.error(t.errors.generic);
    }
  };

  const regenerate = (person: PeopleListItem) => {
    setBusyPersonId(person.id);
    startTransition(async () => {
      try {
        const token = await regeneratePersonInviteAction(
          organizationId,
          person.id,
          organizationSlug,
        );
        await navigator.clipboard.writeText(`${window.location.origin}/join/${token.token}`);
        toast.success(t.people.inviteCopied);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      } finally {
        setBusyPersonId(null);
      }
    });
  };

  const removeUser = (person: PeopleListItem) => {
    if (person.userId === currentUserId) {
      toast.error(t.people.cannotDeleteSelf);
      return;
    }
    if (currentRole === "admin" && person.role === "owner") {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
    if (!window.confirm(t.people.removeFromOrgConfirm.replace("{name}", person.name))) return;
    setBusyPersonId(person.id);
    startTransition(async () => {
      try {
        await removePersonFromOrganization(organizationId, person.id);
        toast.success(t.people.removeFromOrgSuccess);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      } finally {
        setBusyPersonId(null);
      }
    });
  };

  const deletePerson = (person: PeopleListItem) => {
    if (!window.confirm(t.people.deletePersonConfirm.replace("{name}", person.name))) return;
    setBusyPersonId(person.id);
    startTransition(async () => {
      try {
        await deletePersonAction(organizationId, person.id, organizationSlug);
        toast.success(t.people.deleteSuccess);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      } finally {
        setBusyPersonId(null);
      }
    });
  };

  const openEditPerson = (person: PeopleListItem) => {
    if (!canEditPerson(person)) {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
    setEditTarget(person);
    setEditName(person.name);
    setEditRole(person.role ?? "member");
  };

  const handleEditPerson = () => {
    const trimmed = editName.trim();
    if (trimmed.length < 2) {
      toast.error(t.people.namePlaceholder);
      return;
    }
    if (!editTarget) return;

    // Se não é owner/superuser, não pode promover a owner
    if (editRole === "owner" && !canPromoteToOwner()) {
      toast.error(t.people.cannotDemoteLastOwner);
      return;
    }

    // Se está rebaixando o último owner, bloquear
    if (editTarget.role === "owner" && editRole !== "owner") {
      const ownerCount = persons.filter((p) => p.role === "owner").length;
      if (ownerCount <= 1) {
        toast.error(t.people.cannotDemoteLastOwner);
        return;
      }
    }

    startEditTransition(async () => {
      try {
        await updatePersonName(organizationId, editTarget.id, trimmed, organizationSlug);
        if (editRole !== editTarget.role) {
          await updatePersonRole(
            organizationId,
            editTarget.id,
            editRole as "member" | "admin" | "owner",
            organizationSlug,
          );
        }
        toast.success(t.people.personUpdated);
        setEditTarget(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      }
    });
  };

  const openAdminCards = async (person: PeopleListItem) => {
    if (!canEditPerson(person)) {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
    setCardsTarget(person);
    setBusyPersonId(person.id);
    try {
      const data = await getPersonWithCards(organizationId, person.id);
      if (data) {
        setCardsData(data);
        setSelectedOwnerCardIds(data.cardsOwned.map((c) => c.id));
        setSelectedAssignedCardId(data.cardsAssigned[0]?.id ?? null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setBusyPersonId(null);
    }
  };

  const handleSaveCards = () => {
    if (!cardsTarget || !cardsData) return;
    startSaveCardsTransition(async () => {
      try {
        await adminBulkUpdatePersonCards(
          organizationId,
          cardsTarget.id,
          selectedOwnerCardIds,
          selectedAssignedCardId,
          organizationSlug,
        );
        toast.success(t.people.cardsUpdated);
        setCardsTarget(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      }
    });
  };

  const availableOwnerCards = cardsData
    ? (
        cardsData.cardsOwned as { id: string; number: number; assignedPersonId: string | null }[]
      ).filter((c) => !c.assignedPersonId || c.assignedPersonId === cardsTarget?.id)
    : [];
  const availableAssignedCards = cardsData
    ? [
        ...(
          cardsData.cardsOwned as { id: string; number: number; assignedPersonId: string | null }[]
        ).filter((c) => !c.assignedPersonId && !selectedOwnerCardIds.includes(c.id)),
        ...(
          cardsData.cardsAssigned as {
            id: string;
            number: number;
            assignedPersonId: string | null;
          }[]
        ).filter((c) => !selectedOwnerCardIds.includes(c.id)),
      ]
    : [];

  const handleOwnerCardToggle = (cardId: string) => {
    setSelectedOwnerCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId],
    );
    // Se o card era o assigned, limpa assigned
    if (selectedAssignedCardId === cardId) {
      setSelectedAssignedCardId(null);
    }
  };

  const handleAssignedCardChange = (cardId: string | null) => {
    setSelectedAssignedCardId(cardId);
    // Se o card assigned agora virou owner, remove do owner
    if (cardId && selectedOwnerCardIds.includes(cardId)) {
      setSelectedOwnerCardIds((prev) => prev.filter((id) => id !== cardId));
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t.people.title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.people.subtitle}</p>
      </header>

      {/* Criar pessoa */}
      <section
        aria-label={t.people.createTitle}
        className="rounded-2xl border bg-card p-5 shadow-xs"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <UserPlus className="size-4 text-brand" aria-hidden />
          {t.people.createTitle}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{t.people.createHint}</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="person-name" className="sr-only">
              {t.people.nameLabel}
            </Label>
            <Input
              id="person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.people.namePlaceholder}
              maxLength={80}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            aria-busy={isCreating}
            className="sm:w-auto"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <UserPlus className="size-4" aria-hidden />
            )}
            {isCreating ? t.people.creating : t.people.createButton}
          </Button>
        </div>
      </section>

      {/* Usuários */}
      <section aria-labelledby="users-list-title">
        <h2 id="users-list-title" className="mb-1 flex items-center gap-2 text-base font-semibold">
          <UserRoundX className="size-4 text-brand" aria-hidden />
          {t.people.usersSectionTitle}
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">{t.people.usersSubtitle}</p>

        {linkedUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            <UserRound className="size-6" aria-hidden />
            <p>{t.people.noUsers}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {linkedUsers.map((person) => {
              const isBusy = busyPersonId === person.id;
              const isSelf = person.userId === currentUserId;
              return (
                <li
                  key={person.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={person.user?.image ?? undefined} />
                      <AvatarFallback>{person.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {person.name}
                        {isSelf && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({t.people.youLabel})
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person.user?.email ?? t.people.linked}
                      </p>
                    </div>
                  </div>

                  <span className={badgeClasses(true)}>{roleLabel(t, person.role)}</span>

                  <div className="flex flex-wrap gap-2">
                    {canEditPerson(person) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditPerson(person)}
                        disabled={isBusy}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                        {t.people.editPerson}
                      </Button>
                    )}
                    {canEditPerson(person) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openAdminCards(person)}
                        disabled={isBusy}
                      >
                        <Link2 className="size-3.5" aria-hidden />
                        {t.people.adminCardsTitle}
                      </Button>
                    )}
                    {canRemoveUser(person) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeUser(person)}
                        disabled={isBusy}
                        aria-busy={isBusy}
                      >
                        {isBusy ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : (
                          <UserMinus className="size-3.5" aria-hidden />
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

      {/* Pessoas */}
      <section aria-labelledby="people-list-title">
        <h2 id="people-list-title" className="mb-1 flex items-center gap-2 text-base font-semibold">
          <UserRound className="size-4 text-brand" aria-hidden />
          {t.people.listTitle}
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {unlinkedPersons.length === 1
            ? t.people.countOne.replace("{count}", "1")
            : t.people.countMany.replace("{count}", String(unlinkedPersons.length))}
        </p>

        {unlinkedPersons.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            <Mail className="size-6" aria-hidden />
            <p>{t.people.empty}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {unlinkedPersons.map((person) => {
              const isBusy = busyPersonId === person.id;
              return (
                <li
                  key={person.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={person.user?.image ?? undefined} />
                      <AvatarFallback>{person.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person.inviteToken ? t.people.inviteHint : t.people.noUser}
                      </p>
                    </div>
                  </div>

                  <span className={badgeClasses(false)}>{roleLabel(t, person.role)}</span>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditPerson(person)}
                      disabled={isBusy}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      {t.people.editPerson}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openAdminCards(person)}
                      disabled={isBusy}
                    >
                      <Link2 className="size-3.5" aria-hidden />
                      {t.people.adminCardsTitle}
                    </Button>
                    {person.inviteToken ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvite(person)}
                      >
                        <Mail className="size-3.5" aria-hidden />
                        {t.people.invite}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => regenerate(person)}
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
                      variant="outline"
                      size="sm"
                      onClick={() => setLinkTarget(person)}
                      disabled={isBusy}
                    >
                      <Link2 className="size-3.5" aria-hidden />
                      {t.people.linkUser}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deletePerson(person)}
                      disabled={isBusy}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      {t.people.deletePerson}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {linkTarget && (
        <LinkUserDialog
          person={linkTarget}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          onClose={() => setLinkTarget(null)}
        />
      )}

      {editTarget && (
        <EditPersonDialog
          name={editName}
          onNameChange={setEditName}
          role={editRole}
          onRoleChange={setEditRole}
          onClose={() => setEditTarget(null)}
          onSave={handleEditPerson}
          isSaving={isEditing}
          canPromoteToOwner={canPromoteToOwner()}
          allPersons={persons}
          t={t}
        />
      )}

      {cardsTarget && cardsData && (
        <AdminCardsDialog
          person={cardsTarget}
          selectedOwnerCardIds={selectedOwnerCardIds}
          selectedAssignedCardId={selectedAssignedCardId}
          onOwnerCardToggle={handleOwnerCardToggle}
          onAssignedCardChange={handleAssignedCardChange}
          availableOwnerCards={availableOwnerCards}
          availableAssignedCards={availableAssignedCards}
          onClose={() => {
            setCardsTarget(null);
            setCardsData(null);
          }}
          onSave={handleSaveCards}
          isSaving={isSavingCards}
          t={t}
        />
      )}
    </main>
  );
}

function LinkUserDialog({
  person,
  organizationId,
  organizationSlug,
  onClose,
}: {
  person: PeopleListItem;
  organizationId: string;
  organizationSlug: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LinkableUser[]>([]);
  const [searched, setSearched] = useState(false);
  const [isSearching, startSearch] = useTransition();
  const [_isLinking, startLinking] = useTransition();
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      startSearch(async () => {
        try {
          const found = await searchUsersToLinkAction(organizationId, value);
          setResults(found);
          setSearched(true);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : t.errors.generic);
        }
      });
    }, 300);
  };

  const linkUser = (user: LinkableUser) => {
    setBusyUserId(user.id);
    startLinking(async () => {
      try {
        await linkUserToPersonAction(organizationId, person.id, user.id, organizationSlug);
        toast.success(t.people.linkSuccess);
        onClose();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      } finally {
        setBusyUserId(null);
      }
    });
  };

  return (
    <dialog
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      aria-modal="true"
      aria-label={t.people.linkUserTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">{t.people.linkUserTitle}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.people.linkUserHint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-4">
          <Label htmlFor="user-search" className="sr-only">
            {t.people.linkUserPlaceholder}
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="user-search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t.people.linkUserPlaceholder}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
        <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
          {isSearching && (
            <p className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t.people.searchingUsers}
            </p>
          )}
          {!isSearching && results.length === 0 && searched && (
            <p className="px-1 py-2 text-sm text-muted-foreground">{t.people.userNotFound}</p>
          )}
          {results.map((user) => {
            const busy = busyUserId === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => linkUser(user)}
                disabled={busy}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-muted/50 disabled:opacity-60"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </span>
                {busy && (
                  <Loader2
                    className="ml-auto size-4 animate-spin text-muted-foreground"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}

function EditPersonDialog({
  name,
  onNameChange,
  role,
  onRoleChange,
  onClose,
  onSave,
  isSaving,
  canPromoteToOwner,
  allPersons,
  t,
}: {
  name: string;
  onNameChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  canPromoteToOwner: boolean;
  allPersons: PeopleListItem[];
  t: ReturnType<typeof useI18n>["t"];
}) {
  const _ownerCount = allPersons.filter((p) => p.role === "owner").length;

  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      aria-label={t.people.editPersonTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">{t.people.editPersonTitle}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.people.editPersonHint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="edit-name">{t.people.nameLabel}</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t.people.namePlaceholder}
              maxLength={80}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="edit-role">{t.people.roleOwner}</Label>
            <Select value={role} onValueChange={onRoleChange}>
              <SelectTrigger id="edit-role">
                <SelectValue placeholder={t.people.roleMember} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">{t.people.roleMember}</SelectItem>
                <SelectItem value="admin">{t.people.roleAdmin}</SelectItem>
                {canPromoteToOwner && <SelectItem value="owner">{t.people.roleOwner}</SelectItem>}
              </SelectContent>
            </Select>
            {role === "owner" && !canPromoteToOwner && (
              <p className="mt-1 text-xs text-muted-foreground">{t.people.cannotDemoteLastOwner}</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || name.trim().length < 2}
            aria-busy={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              t.people.savePerson
            )}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

function AdminCardsDialog({
  person,
  selectedOwnerCardIds,
  selectedAssignedCardId,
  availableOwnerCards,
  availableAssignedCards,
  onOwnerCardToggle,
  onAssignedCardChange,
  onClose,
  onSave,
  isSaving,
  t,
}: {
  person: PeopleListItem;
  selectedOwnerCardIds: string[];
  onOwnerCardToggle: (cardId: string) => void;
  selectedAssignedCardId: string | null;
  onAssignedCardChange: (cardId: string | null) => void;
  availableOwnerCards: { id: string; number: number; assignedPersonId: string | null }[];
  availableAssignedCards: { id: string; number: number; assignedPersonId: string | null }[];
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      aria-label={t.people.adminCardsTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-5 shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">
              {t.people.adminCardsTitle} — {person.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.people.adminCardsHint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-4 flex-1 overflow-y-auto space-y-6">
          {/* Owner Cards */}
          <div>
            <h4 className="text-sm font-semibold mb-2">
              {t.people.ownerCards} ({selectedOwnerCardIds.length})
            </h4>
            {availableOwnerCards.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">{t.people.noAvailableCards}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableOwnerCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onOwnerCardToggle(card.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors",
                      selectedOwnerCardIds.includes(card.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    #{String(card.number).padStart(2, "0")}
                    {selectedOwnerCardIds.includes(card.id) && (
                      <UserRoundX className="size-3.5" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Card */}
          <div>
            <h4 className="text-sm font-semibold mb-2">{t.people.assignedCard}</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAssignedCardChange(null)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors",
                  !selectedAssignedCardId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {t.people.noAssignedCard}
              </button>
              {availableAssignedCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onAssignedCardChange(card.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors",
                    selectedAssignedCardId === card.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  #{String(card.number).padStart(2, "0")}
                  {selectedAssignedCardId === card.id && (
                    <UserRoundX className="size-3.5" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            aria-busy={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              t.people.saveCards
            )}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
