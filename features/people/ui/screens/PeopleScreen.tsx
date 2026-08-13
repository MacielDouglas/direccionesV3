"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  createOrgPersonAction,
  deletePersonAction,
  linkUserToPersonAction,
  regeneratePersonInviteAction,
  removePersonFromOrganization,
  searchUsersToLinkAction,
} from "@/server/person";
import {
  Link2,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  UserRound,
  UserRoundX,
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

interface Props {
  persons: PeopleListItem[];
  organizationId: string;
  organizationSlug: string;
  currentRole: string | null;
  isSuperUser: boolean;
  currentUserId: string;
}

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

  const linkedUsers = persons.filter((p) => p.userId);
  const unlinkedPersons = persons.filter((p) => !p.userId);

  const canRemoveUser = (person: PeopleListItem) => {
    if (person.userId === currentUserId) return false;
    if (isSuperUser) return true;
    if (currentRole === "admin" && person.role === "owner") return false;
    return currentRole === "admin" || currentRole === "owner";
  };

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

  const roleLabel = (role: string | null) => {
    if (role === "owner") return t.people.roleOwner;
    if (role === "admin") return t.people.roleAdmin;
    return t.people.roleMember;
  };

  const badgeClasses = (linked: boolean) =>
    cn(
      "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
      linked
        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    );

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

                  <span className={badgeClasses(true)}>{roleLabel(person.role)}</span>

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

                  <span className={badgeClasses(false)}>{roleLabel(person.role)}</span>

                  <div className="flex flex-wrap gap-2">
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
  const [, startLinking] = useTransition();
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl p-5 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{t.people.linkUserTitle}</DialogTitle>
        </DialogHeader>

        <div>
          <h3 className="text-base font-semibold">{t.people.linkUserTitle}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.people.linkUserHint}</p>
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
      </DialogContent>
    </Dialog>
  );
}
