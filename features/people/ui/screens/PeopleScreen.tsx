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
  getPersonWithCards,
  linkUserToPersonAction,
  searchUsersToLinkAction,
  updatePersonName,
  updatePersonRole,
} from "@/server/person";
import {
  Check,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Search,
  ShieldCheck,
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

type AdminCardOption = {
  id: string;
  number: number;
  ownerPersonId: string | null;
  assignedPersonId: string | null;
  ownerName: string | null;
  assignedToName: string | null;
  neighborhoods: string[];
};

type NeighborhoodOption = {
  name: string;
  count: number;
};

export type PersonWithCards = {
  id: string;
  name: string;
  role: string | null;
  userId: string | null;
  cardsOwned: { id: string; number: number; assignedPersonId: string | null }[];
  cardsAssigned: { id: string; number: number }[];
  allCards: AdminCardOption[];
  neighborhoods: NeighborhoodOption[];
};

type CardOption = {
  id: string;
  number: number;
  assignedPersonId: string | null;
  neighborhoods: string[];
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

function ModalOverlay({
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
  onEdit,
  onAdminCards,
  onLink,
  t,
}: {
  person: PeopleListItem;
  subtitle: string;
  isSelf?: boolean;
  showLinkAction?: boolean;
  canManage: boolean;
  onEdit: () => void;
  onAdminCards: () => void;
  onLink?: () => void;
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
  const [cardsData, setCardsData] = useState<PersonWithCards | null>(null);
  const [selectedOwnerCardIds, setSelectedOwnerCardIds] = useState<string[]>([]);
  const [selectedAssignedCardId, setSelectedAssignedCardId] = useState<string | null>(null);
  const [isSavingCards, startSaveCardsTransition] = useTransition();

  const linkedUsers = persons.filter((p) => Boolean(p.userId));
  const unlinkedPersons = persons.filter((p) => !p.userId);

  const canManagePerson = useCallback(
    (person: PeopleListItem) => {
      if (person.userId === currentUserId) return false;
      if (isSuperUser) return true;
      if (currentRole === "admin" && person.role === "owner") return false;
      return currentRole === "admin" || currentRole === "owner";
    },
    [currentRole, currentUserId, isSuperUser],
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
      const data = await getPersonWithCards(organizationId, person.id);
      if (data) {
        setCardsData(data);
        setSelectedOwnerCardIds(data.cardsOwned.map((c) => c.id));
        setSelectedAssignedCardId(data.cardsAssigned[0]?.id ?? null);
      }
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
      setCardsTarget(null);
    }
  };

  const handleSaveCards = () => {
    if (!cardsTarget || !cardsData) return;
    if (!canManagePerson(cardsTarget)) {
      toast.error(t.people.cannotRemoveOwner);
      return;
    }
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
        setCardsData(null);
        router.refresh();
      } catch (err) {
        toast.error(errorMessage(err, t.errors.generic));
      }
    });
  };

  const availableOwnerCards: CardOption[] = cardsData
    ? cardsData.allCards
        .filter((c) => !c.ownerPersonId || c.ownerPersonId === cardsTarget?.id)
        .map((c) => ({
          id: c.id,
          number: c.number,
          assignedPersonId: c.assignedPersonId,
          neighborhoods: c.neighborhoods,
        }))
    : [];

  const availableAssignedCards: CardOption[] = cardsData
    ? cardsData.allCards
        .filter(
          (c) =>
            (!c.assignedPersonId || c.assignedPersonId === cardsTarget?.id) &&
            !selectedOwnerCardIds.includes(c.id),
        )
        .map((c) => ({
          id: c.id,
          number: c.number,
          assignedPersonId: c.assignedPersonId,
          neighborhoods: c.neighborhoods,
        }))
    : [];

  const handleOwnerCardToggle = (cardId: string) => {
    setSelectedOwnerCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId],
    );
    if (selectedAssignedCardId === cardId) {
      setSelectedAssignedCardId(null);
    }
  };

  const handleAssignedCardChange = (cardId: string | null) => {
    setSelectedAssignedCardId(cardId);
    if (cardId && selectedOwnerCardIds.includes(cardId)) {
      setSelectedOwnerCardIds((prev) => prev.filter((id) => id !== cardId));
    }
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
                  t={t}
                  onEdit={() => openEditPerson(person)}
                  onAdminCards={() => openAdminCards(person)}
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
                t={t}
                onEdit={() => openEditPerson(person)}
                onAdminCards={() => openAdminCards(person)}
                onLink={() => setLinkTarget(person)}
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

      {cardsTarget && cardsData ? (
        <AdminCardsDialog
          person={cardsTarget}
          selectedOwnerCardIds={selectedOwnerCardIds}
          selectedAssignedCardId={selectedAssignedCardId}
          onOwnerCardToggle={handleOwnerCardToggle}
          onAssignedCardChange={handleAssignedCardChange}
          availableOwnerCards={availableOwnerCards}
          availableAssignedCards={availableAssignedCards}
          allCards={cardsData.allCards}
          neighborhoods={cardsData.neighborhoods}
          onClose={() => {
            setCardsTarget(null);
            setCardsData(null);
          }}
          onSave={handleSaveCards}
          isSaving={isSavingCards}
          t={t}
        />
      ) : null}
    </div>
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
    </ModalOverlay>
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

function AdminCardsDialog({
  person,
  selectedOwnerCardIds,
  selectedAssignedCardId,
  availableOwnerCards,
  availableAssignedCards,
  allCards,
  neighborhoods,
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
  availableOwnerCards: CardOption[];
  availableAssignedCards: CardOption[];
  allCards: AdminCardOption[];
  neighborhoods: NeighborhoodOption[];
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const cardStatusLabel = (card: AdminCardOption) => {
    if (card.ownerName) return t.people.cardOwner.replace("{name}", card.ownerName);
    if (card.assignedToName) return t.cards.assignedTo.replace("{name}", card.assignedToName);
    return t.cards.free;
  };

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
      <div className="mt-4 flex max-h-[60vh] flex-col gap-6 overflow-y-auto sm:max-h-[70vh]">
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="size-5 text-brand" aria-hidden="true" />
            {t.people.allCards} ({allCards.length})
          </h4>
          {allCards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
              <CreditCard className="size-6" aria-hidden />
              <p>{t.people.noAvailableCards}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {allCards.map((card) => (
                <li
                  key={card.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      #{String(card.number).padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {card.neighborhoods.length > 0 ? card.neighborhoods.join(" · ") : "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {cardStatusLabel(card)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="size-5 text-brand" aria-hidden="true" />
            {t.people.neighborhoods} ({neighborhoods.length})
          </h4>
          {neighborhoods.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
              <MapPin className="size-6" aria-hidden />
              <p>{t.people.noNeighborhoods}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {neighborhoods.map((neighborhood) => (
                <span
                  key={neighborhood.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                >
                  {neighborhood.name}
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                    {neighborhood.count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="size-5 text-brand" aria-hidden="true" />
            {t.people.ownerCards} ({selectedOwnerCardIds.length})
          </h4>
          {availableOwnerCards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
              <CreditCard className="size-6" aria-hidden />
              <p>{t.people.noAvailableCards}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableOwnerCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onOwnerCardToggle(card.id)}
                  className={cn(
                    "inline-flex flex-col items-start gap-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                    selectedOwnerCardIds.includes(card.id)
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-card text-muted-foreground hover:border-brand/50 hover:bg-surface-subtle-light",
                  )}
                >
                  <span className="flex items-center gap-2">
                    #{String(card.number).padStart(2, "0")}
                    {selectedOwnerCardIds.includes(card.id) ? (
                      <Check className="size-4 text-brand" aria-hidden />
                    ) : null}
                  </span>
                  {card.neighborhoods.length > 0 ? (
                    <span className="max-w-44 truncate text-[10px] font-medium text-muted-foreground">
                      {card.neighborhoods.join(" · ")}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="size-5 text-brand" aria-hidden="true" />
            {t.people.assignedCard}
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAssignedCardChange(null)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                !selectedAssignedCardId
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card text-muted-foreground hover:border-brand/50 hover:bg-surface-subtle-light",
              )}
            >
              <X className="size-4" aria-hidden />
              {t.people.noAssignedCard}
            </button>
            {availableAssignedCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onAssignedCardChange(card.id)}
                className={cn(
                  "inline-flex flex-col items-start gap-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                  selectedAssignedCardId === card.id
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-card text-muted-foreground hover:border-brand/50 hover:bg-surface-subtle-light",
                )}
              >
                <span className="flex items-center gap-2">
                  #{String(card.number).padStart(2, "0")}
                  {selectedAssignedCardId === card.id ? (
                    <Check className="size-4 text-brand" aria-hidden />
                  ) : null}
                </span>
                {card.neighborhoods.length > 0 ? (
                  <span className="max-w-44 truncate text-[10px] font-medium text-muted-foreground">
                    {card.neighborhoods.join(" · ")}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row">
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
            <>
              <Check className="mr-2 size-4" aria-hidden />
              {t.people.saveCards}
            </>
          )}
        </Button>
      </div>
    </ModalOverlay>
  );
}
