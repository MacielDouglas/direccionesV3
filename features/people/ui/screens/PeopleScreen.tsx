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
  adminDesignateCardsAction,
  adminReturnCardsAction,
  adminTransferCardAction,
  createOrgPersonAction,
  deletePersonAction,
  getPersonCardsManageData,
  linkUserToPersonAction,
  regeneratePersonInviteAction,
  searchUsersToLinkAction,
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
  MapPin,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  UserRoundX,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

const PERSON_ROLES = ["member", "admin", "owner"] as const;
type PersonRole = (typeof PERSON_ROLES)[number];

function isPersonRole(value: string): value is PersonRole {
  return (PERSON_ROLES as readonly string[]).includes(value);
}

export type PeopleListItem = {
  id: string;
  name: string;
  role: string | null;
  organizationId: string | null;
  userId: string | null;
  user: { id: string; name: string; email: string; image: string | null } | null;
  inviteToken: string | null;
  inviteExpired: boolean;
  cardsCount: number;
};

export type LinkableUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type ManageCardInfo = {
  id: string;
  number: number;
  neighborhoods: string[];
  addressCount: number;
};

export type ManagePersonCards = {
  person: { id: string; name: string; role: string | null };
  personCards: (ManageCardInfo & { designationDate: string })[];
  availableCards: (ManageCardInfo & { lastReturnDate: string | null })[];
  designatedCards: (ManageCardInfo & { personName: string; designationDate: string })[];
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

const roleBadgeClasses = (role: string | null) => {
  if (role === "owner" || role === "admin") {
    return "inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand";
  }
  return "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";
};

const cardCountBadge = (t: ReturnType<typeof useI18n>["t"], count: number) =>
  count === 1
    ? t.people.cardCountOne.replace("{count}", "1")
    : t.people.cardCountMany.replace("{count}", String(count));

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message.trim() ? err.message : fallback;
}

export function ModalOverlay({
  label,
  onClose,
  children,
  panelClassName,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
}) {
  const titleId = useId();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby={titleId}
      aria-label={label}
      className="fixed inset-0 z-50 m-0 flex h-full w-full items-center justify-center bg-transparent p-4"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50"
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl",
          panelClassName,
        )}
      >
        <span id={titleId} className="sr-only">
          {label}
        </span>
        {children}
      </div>
    </dialog>
  );
}

function PersonCard({
  person,
  subtitle,
  isSelf = false,
  showLinkAction = false,
  canManage,
  canRemove = false,
  onEdit,
  onAdminCards,
  onLink,
  onRemove,
  t,
}: {
  person: PeopleListItem;
  subtitle: string;
  isSelf?: boolean;
  showLinkAction?: boolean;
  canManage: boolean;
  canRemove?: boolean;
  onEdit: () => void;
  onAdminCards: () => void;
  onLink?: () => void;
  onRemove: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const actionButtonClasses =
    "inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand";

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={person.user?.image ?? undefined} alt="" />
          <AvatarFallback className="bg-brand/10 text-sm font-semibold text-brand">
            {person.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <span className="truncate">{person.name}</span>
            {isSelf ? (
              <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                {t.people.youLabel}
              </span>
            ) : null}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-4">
        <span className={roleBadgeClasses(person.role)}>
          <ShieldCheck className="size-3" aria-hidden="true" />
          {roleLabel(t, person.role)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <CreditCard className="size-3" aria-hidden="true" />
          {cardCountBadge(t, person.cardsCount)}
        </span>
      </div>

      <div className="mt-auto flex border-t border-border bg-muted/40">
        {canManage ? (
          <button
            type="button"
            onClick={onEdit}
            className={cn(actionButtonClasses, "text-brand hover:bg-muted/60")}
          >
            <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{t.people.editPerson}</span>
          </button>
        ) : null}
        {canManage ? (
          <button
            type="button"
            onClick={onAdminCards}
            className={cn(
              actionButtonClasses,
              "border-l border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <CreditCard className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{t.people.adminCardsTitle}</span>
          </button>
        ) : null}
        {showLinkAction ? (
          <button
            type="button"
            onClick={onLink}
            className={cn(
              actionButtonClasses,
              "border-l border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <UserPlus className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{t.people.linkUser}</span>
          </button>
        ) : null}
        {canRemove && !isSelf ? (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              actionButtonClasses,
              "border-l border-border text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
          >
            <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{t.people.removePerson}</span>
          </button>
        ) : null}
      </div>
    </li>
  );
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
  const [linkTarget, setLinkTarget] = useState<PeopleListItem | null>(null);
  const [editTarget, setEditTarget] = useState<PeopleListItem | null>(null);
  const [cardsTarget, setCardsTarget] = useState<PeopleListItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<PersonRole>("member");
  const [isEditing, startEditTransition] = useTransition();
  const [manageData, setManageData] = useState<ManagePersonCards | null>(null);
  const [removeTarget, setRemoveTarget] = useState<PeopleListItem | null>(null);
  const [isRemoving, startRemoveTransition] = useTransition();

  const linkedUsers = persons.filter((p) => Boolean(p.userId));
  const unlinkedPersons = persons.filter((p) => !p.userId);

  const canManagePerson = useCallback(
    (person: PeopleListItem) => {
      if (person.userId === currentUserId) return false;
      if (isSuperUser) return true;
      return currentRole === "admin" || currentRole === "owner";
    },
    [currentRole, currentUserId, isSuperUser],
  );

  const canRemovePerson = useCallback(
    (person: PeopleListItem) => {
      if (!canManagePerson(person)) return false;
      if (isSuperUser) return true;
      return !(currentRole === "admin" && person.role === "owner");
    },
    [canManagePerson, currentRole, isSuperUser],
  );

  const canPromoteToOwner = isSuperUser || currentRole === "owner";

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
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  const openEditPerson = (person: PeopleListItem) => {
    if (!canManagePerson(person)) {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
    const nextRole = person.role && isPersonRole(person.role) ? person.role : "member";
    setEditTarget(person);
    setEditName(person.name);
    setEditRole(nextRole);
  };

  const handleEditPerson = () => {
    const trimmed = editName.trim();
    if (trimmed.length < 2) {
      toast.error(t.people.namePlaceholder);
      return;
    }
    if (!editTarget) return;
    if (!canManagePerson(editTarget)) {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
    if (editRole === "owner" && !canPromoteToOwner) {
      toast.error(t.people.cannotDemoteLastOwner);
      return;
    }
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
          await updatePersonRole(organizationId, editTarget.id, editRole, organizationSlug);
        }
        toast.success(t.people.personUpdated);
        setEditTarget(null);
        router.refresh();
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  const openAdminCards = async (person: PeopleListItem) => {
    if (!canManagePerson(person)) {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
    setCardsTarget(person);
    try {
      const data = await getPersonCardsManageData(organizationId, person.id);
      setManageData(data);
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
      setCardsTarget(null);
    }
  };

  const handleRemovePerson = () => {
    if (!removeTarget) return;
    startRemoveTransition(async () => {
      try {
        await deletePersonAction(organizationId, removeTarget.id, organizationSlug);
        toast.success(t.people.personRemoved);
        setRemoveTarget(null);
        router.refresh();
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  return (
    <div className="mx-auto w-full space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          {t.people.title}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t.people.subtitle}
        </h1>
      </header>

      <section
        aria-label={t.people.createTitle}
        className="rounded-2xl bg-black p-6 text-white shadow-md shadow-black/20 sm:p-8"
      >
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-400">
          <UserPlus className="size-4" aria-hidden="true" />
          {t.people.createTitle}
        </span>
        <p className="mt-3 max-w-md text-lg font-semibold leading-snug sm:text-xl">
          {t.people.createHint}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.people.namePlaceholder}
            maxLength={80}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            className="w-full border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20 sm:w-64"
          />
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            aria-busy={isCreating}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
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

      <section aria-labelledby="users-list-title">
        <h2
          id="users-list-title"
          className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground"
        >
          <UserRoundX className="size-4 text-brand" aria-hidden="true" />
          {t.people.usersSectionTitle}
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">{t.people.usersSubtitle}</p>

        {linkedUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            <UserRound className="size-6" aria-hidden />
            <p>{t.people.noUsers}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {linkedUsers.map((person) => {
              const isSelf = person.userId === currentUserId;
              const canManage = canManagePerson(person);
              return (
                <PersonCard
                  key={person.id}
                  person={person}
                  subtitle={person.user?.email ?? ""}
                  isSelf={isSelf}
                  canManage={canManage}
                  canRemove={canManagePerson(person) && canRemovePerson(person)}
                  t={t}
                  onEdit={() => openEditPerson(person)}
                  onAdminCards={() => openAdminCards(person)}
                  onRemove={() => setRemoveTarget(person)}
                />
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="people-list-title">
        <h2
          id="people-list-title"
          className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground"
        >
          <UserRound className="size-4 text-brand" aria-hidden="true" />
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
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unlinkedPersons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                subtitle={person.inviteToken ? t.people.inviteHint : t.people.noUser}
                showLinkAction
                canManage={canManagePerson(person)}
                canRemove={canManagePerson(person) && canRemovePerson(person)}
                t={t}
                onEdit={() => openEditPerson(person)}
                onAdminCards={() => openAdminCards(person)}
                onLink={() => setLinkTarget(person)}
                onRemove={() => setRemoveTarget(person)}
              />
            ))}
          </ul>
        )}
      </section>

      {linkTarget ? (
        <LinkUserDialog
          person={linkTarget}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          onClose={() => setLinkTarget(null)}
        />
      ) : null}

      {editTarget ? (
        <EditPersonDialog
          name={editName}
          onNameChange={setEditName}
          role={editRole}
          onRoleChange={(value) => {
            if (isPersonRole(value)) setEditRole(value);
          }}
          onClose={() => setEditTarget(null)}
          onSave={handleEditPerson}
          isSaving={isEditing}
          canPromoteToOwner={canPromoteToOwner}
          t={t}
        />
      ) : null}

      {cardsTarget && manageData ? (
        <AdminCardsDialog
          person={{ id: cardsTarget.id, name: cardsTarget.name }}
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

      {removeTarget ? (
        <RemovePersonDialog
          person={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onRemove={handleRemovePerson}
          isRemoving={isRemoving}
          t={t}
        />
      ) : null}
    </div>
  );
}

export function LinkUserDialog({
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
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGeneratingToken, startTokenGeneration] = useTransition();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const generateToken = () => {
    startTokenGeneration(async () => {
      try {
        const result = await regeneratePersonInviteAction(
          organizationId,
          person.id,
          organizationSlug,
        );
        setGeneratedToken(result.token);
        setCopied(false);
        toast.success(t.admin.tokenGenerated);
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  const copyToken = async () => {
    if (!generatedToken) return;
    await navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    toast.success(t.admin.tokenCopied);
    setTimeout(() => setCopied(false), 2000);
  };

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
          const found = await searchUsersToLinkAction(organizationId, value.trim());
          setResults(found);
          setSearched(true);
        } catch (err) {
          toast.error(errorMessage(err, t.errors.generic));
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
        toast.error(errorMessage(err, t.errors.generic));
      } finally {
        setBusyUserId(null);
      }
    });
  };

  return (
    <ModalOverlay label={t.people.linkUserTitle} onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t.people.linkUserTitle}</h3>
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
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
        {isSearching ? (
          <p className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t.people.searchingUsers}
          </p>
        ) : null}
        {!isSearching && results.length === 0 && searched ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">{t.people.userNotFound}</p>
        ) : null}
        {results.map((user) => {
          const busy = busyUserId === user.id;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => linkUser(user)}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-surface-subtle-light disabled:opacity-60"
            >
              <Avatar className="size-9 shrink-0">
                <AvatarImage src={user.image ?? undefined} alt="" />
                <AvatarFallback className="text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              {busy ? (
                <Loader2
                  className="ml-auto size-4 animate-spin text-muted-foreground"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground">{t.people.linkTokenTitle}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.people.linkTokenHint}</p>
        <div className="mt-3">
          {generatedToken ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-center font-mono text-lg font-semibold tracking-[0.4em] text-foreground">
                {generatedToken}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyToken}
                className="shrink-0 gap-1.5"
              >
                {copied ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
                {t.admin.tokenCopy}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateToken}
              disabled={isGeneratingToken}
              aria-busy={isGeneratingToken}
              className="w-full gap-1.5"
            >
              {isGeneratingToken ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="size-3.5" aria-hidden />
              )}
              {t.people.generateLinkToken}
            </Button>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

export function EditPersonDialog({
  name,
  onNameChange,
  role,
  onRoleChange,
  onClose,
  onSave,
  isSaving,
  canPromoteToOwner,
  t,
}: {
  name: string;
  onNameChange: (v: string) => void;
  role: PersonRole;
  onRoleChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  canPromoteToOwner: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <ModalOverlay label={t.people.editPersonTitle} onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t.people.editPersonTitle}</h3>
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
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="edit-role">{t.people.roleLabel}</Label>
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger id="edit-role">
              <SelectValue placeholder={t.people.roleMember} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">{t.people.roleMember}</SelectItem>
              <SelectItem value="admin">{t.people.roleAdmin}</SelectItem>
              {canPromoteToOwner ? (
                <SelectItem value="owner">{t.people.roleOwner}</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
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
            <>
              <Check className="mr-2 size-4" aria-hidden />
              {t.people.savePerson}
            </>
          )}
        </Button>
      </div>
    </ModalOverlay>
  );
}

export function AdminCardsDialog({
  person,
  data,
  organizationId,
  organizationSlug,
  onClose,
  t,
}: {
  person: { id: string; name: string };
  data: ManagePersonCards;
  organizationId: string;
  organizationSlug: string;
  onClose: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const { locale } = useI18n();
  const router = useRouter();
  const dateLocale = locale === "pt" ? "pt-BR" : "es-419";
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(dateLocale);
  const cardNumber = (number: number) => `#${String(number).padStart(2, "0")}`;
  const [selectedReturnIds, setSelectedReturnIds] = useState<string[]>([]);
  const [selectedDesignateIds, setSelectedDesignateIds] = useState<string[]>([]);
  const [selectedTransferCard, setSelectedTransferCard] = useState<
    ManagePersonCards["designatedCards"][number] | null
  >(null);
  const [confirmTarget, setConfirmTarget] = useState<
    ManagePersonCards["designatedCards"][number] | null
  >(null);
  const [isReturning, startReturnTransition] = useTransition();
  const [isDesignating, startDesignateTransition] = useTransition();
  const [isTransferring, startTransferTransition] = useTransition();

  const toggleIn = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleReturn = () => {
    if (selectedReturnIds.length === 0) return;
    startReturnTransition(async () => {
      try {
        await adminReturnCardsAction(
          organizationId,
          person.id,
          selectedReturnIds,
          organizationSlug,
        );
        toast.success(t.people.cardsReturned);
        onClose();
        router.refresh();
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  const handleDesignate = () => {
    if (selectedDesignateIds.length === 0) return;
    startDesignateTransition(async () => {
      try {
        await adminDesignateCardsAction(
          organizationId,
          person.id,
          selectedDesignateIds,
          organizationSlug,
        );
        toast.success(t.people.cardsDesignated);
        onClose();
        router.refresh();
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  const handleTransfer = () => {
    if (!confirmTarget) return;
    startTransferTransition(async () => {
      try {
        await adminTransferCardAction(
          organizationId,
          person.id,
          confirmTarget.id,
          organizationSlug,
        );
        toast.success(t.people.cardTransferred);
        setConfirmTarget(null);
        onClose();
        router.refresh();
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
        setConfirmTarget(null);
      }
    });
  };

  const addressCountLabel = (count: number) =>
    count === 1
      ? t.people.addressesCountOne.replace("{count}", "1")
      : t.people.addressesCountMany.replace("{count}", String(count));

  const selectableRow = (
    card: ManageCardInfo,
    selected: boolean,
    onToggle: () => void,
    meta?: ReactNode,
  ) => (
    <li key={card.id}>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
          selected
            ? "border-brand bg-brand/10"
            : "border-border bg-card hover:border-brand/50 hover:bg-surface-subtle-light",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded border",
              selected
                ? "border-brand bg-brand text-brand-foreground"
                : "border-muted-foreground/40 bg-transparent",
            )}
            aria-hidden
          >
            {selected ? <Check className="size-3.5" /> : null}
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {cardNumber(card.number)}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {addressCountLabel(card.addressCount)}
              </span>
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {card.neighborhoods.length > 0 ? card.neighborhoods.join(" · ") : "—"}
            </span>
          </span>
        </span>
        {meta}
      </button>
    </li>
  );

  const personCardMeta = (designationDate: string) => (
    <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
      {t.people.designatedOn.replace("{date}", formatDate(designationDate))}
    </span>
  );

  return (
    <ModalOverlay label={t.people.adminCardsTitle} onClose={onClose} panelClassName="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
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

      <div className="mt-4 flex max-h-[65vh] flex-col gap-6 overflow-y-auto">
        {/* Seção 1: cards designados à própria pessoa */}
        <section aria-label={t.people.personCardsTitle}>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="size-5 text-brand" aria-hidden="true" />
            {t.people.personCardsTitle} ({data.personCards.length})
          </h4>
          {data.personCards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
              <CreditCard className="size-6" aria-hidden />
              <p>{t.people.noPersonCards}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.personCards.map((card) =>
                selectableRow(
                  card,
                  selectedReturnIds.includes(card.id),
                  () => toggleIn(card.id, setSelectedReturnIds),
                  personCardMeta(card.designationDate),
                ),
              )}
            </ul>
          )}
        </section>

        {/* Seção 2: cards disponíveis */}
        <section aria-label={t.people.availableCardsTitle}>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="size-5 text-brand" aria-hidden="true" />
            {t.people.availableCardsTitle} ({data.availableCards.length})
          </h4>
          {data.availableCards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
              <MapPin className="size-6" aria-hidden />
              <p>{t.people.noAvailableCards}</p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {data.availableCards.map((card) =>
                  selectableRow(
                    card,
                    selectedDesignateIds.includes(card.id),
                    () => toggleIn(card.id, setSelectedDesignateIds),
                    card.lastReturnDate ? (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {t.people.lastReturnedOn.replace("{date}", formatDate(card.lastReturnDate))}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                        {t.people.newCard}
                      </span>
                    ),
                  ),
                )}
              </ul>
              <Button
                type="button"
                onClick={handleDesignate}
                disabled={isDesignating || selectedDesignateIds.length === 0}
                aria-busy={isDesignating}
                className="mt-3 w-full gap-2 sm:w-auto"
              >
                {isDesignating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Check className="size-4" aria-hidden />
                )}
                {isDesignating
                  ? t.people.designatingCards
                  : t.people.designateCardsFor.replace("{name}", person.name)}
              </Button>
            </>
          )}
        </section>

        {/* Seção 3: todos os cards designados (para transferir) */}
        <section aria-label={t.people.designatedCardsTitle}>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="size-5 text-brand" aria-hidden="true" />
            {t.people.designatedCardsTitle} ({data.designatedCards.length})
          </h4>
          {data.designatedCards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
              <CreditCard className="size-6" aria-hidden />
              <p>{t.people.noDesignatedCards}</p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {data.designatedCards.map((card) =>
                  selectableRow(
                    card,
                    selectedTransferCard?.id === card.id,
                    () => setSelectedTransferCard((prev) => (prev?.id === card.id ? null : card)),
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        card.personName === person.name
                          ? "bg-muted text-muted-foreground"
                          : "bg-brand/10 text-brand",
                      )}
                    >
                      {card.personName}
                    </span>,
                  ),
                )}
              </ul>
              <div className="mt-3 flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">
                  {selectedTransferCard && selectedTransferCard.personName !== person.name
                    ? t.people.transferFrom.replace("{from}", selectedTransferCard.personName)
                    : t.people.selectCardToTransfer}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmTarget(selectedTransferCard)}
                  disabled={
                    isTransferring ||
                    !selectedTransferCard ||
                    selectedTransferCard.personName === person.name
                  }
                  aria-busy={isTransferring}
                  className="w-full gap-2 sm:w-auto"
                >
                  {isTransferring ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <CreditCard className="size-4" aria-hidden />
                  )}
                  {isTransferring ? t.people.transferringCard : t.people.transferCard}
                </Button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Barra flutuante: devolver cards da pessoa */}
      {selectedReturnIds.length > 0 && (
        <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-4 flex justify-end border-t border-border bg-card/95 p-4 backdrop-blur">
          <Button
            type="button"
            variant="destructive"
            onClick={handleReturn}
            disabled={isReturning}
            aria-busy={isReturning}
            className="gap-2"
          >
            {isReturning ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="size-4" aria-hidden />
            )}
            {isReturning
              ? t.people.returningCards
              : selectedReturnIds.length === 1
                ? t.people.returnCard
                : t.people.returnCardsMany.replace("{count}", String(selectedReturnIds.length))}
          </Button>
        </div>
      )}

      {/* Confirmação de transferência */}
      {confirmTarget ? (
        <ModalOverlay label={t.people.transferCardTitle} onClose={() => setConfirmTarget(null)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {t.people.transferCardTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.people.transferCardHint}</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmTarget(null)}
              aria-label={t.common.close}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2.5 text-sm text-foreground">
            {t.people.transferCardConfirm
              .replace("{card}", cardNumber(confirmTarget.number))
              .replace("{fromName}", confirmTarget.personName)
              .replace("{name}", person.name)}
          </p>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmTarget(null)}
              disabled={isTransferring}
              className="w-full sm:w-auto"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={handleTransfer}
              disabled={isTransferring}
              aria-busy={isTransferring}
              className="w-full gap-2 sm:w-auto"
            >
              {isTransferring ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CreditCard className="size-4" aria-hidden />
              )}
              {isTransferring ? t.people.transferringCard : t.people.transferCard}
            </Button>
          </div>
        </ModalOverlay>
      ) : null}
    </ModalOverlay>
  );
}

function RemovePersonDialog({
  person,
  onClose,
  onRemove,
  isRemoving,
  t,
}: {
  person: PeopleListItem;
  onClose: () => void;
  onRemove: () => void;
  isRemoving: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <ModalOverlay label={t.people.removePersonTitle} onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t.people.removePersonTitle}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.people.removePersonHint}</p>
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
      <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2.5 text-sm text-foreground">
        {t.people.removePersonConfirm.replace("{name}", person.name)}
      </p>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isRemoving}
          className="w-full sm:w-auto"
        >
          {t.common.cancel}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
          disabled={isRemoving}
          aria-busy={isRemoving}
          className="w-full gap-2 sm:w-auto"
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="size-4" aria-hidden />
          )}
          {isRemoving ? t.people.removingPerson : t.people.removePerson}
        </Button>
      </div>
    </ModalOverlay>
  );
}
