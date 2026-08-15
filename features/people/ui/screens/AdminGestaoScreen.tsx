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
import { Switch } from "@/components/ui/switch";
import { deleteInviteTokenAction } from "@/features/invitations/applications/inviteToken.action";
import {
  AdminCardsDialog,
  EditPersonDialog,
  LinkUserDialog,
  type ManagePersonCards,
  ModalOverlay,
  type PeopleListItem,
} from "@/features/people/ui/screens/PeopleScreen";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  createOrgPersonAction,
  getPersonCardsManageData,
  regeneratePersonInviteAction,
  removePersonFromOrganization,
  updatePersonName,
  updatePersonRole,
} from "@/server/person";
import {
  AlertTriangle,
  Check,
  Copy,
  CreditCard,
  KeyRound,
  Loader2,
  MessageSquareText,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type GestaoToken = {
  id: string;
  token: string;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
  createdByName: string;
  personName: string | null;
  usedByName: string | null;
};

interface Props {
  persons: PeopleListItem[];
  tokens: GestaoToken[];
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  currentRole: string | null;
  isSuperUser: boolean;
  currentUserId: string;
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message.trim() ? err.message : fallback;
}

function roleLabel(t: ReturnType<typeof useI18n>["t"], role: string | null) {
  if (role === "owner") return t.people.roleOwner;
  if (role === "admin") return t.people.roleAdmin;
  return t.people.roleMember;
}

const roleBadgeClasses = (role: string | null) =>
  role === "owner" || role === "admin"
    ? "inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand"
    : "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

const cardCountBadge = (t: ReturnType<typeof useI18n>["t"], count: number) =>
  count === 1
    ? t.people.cardCountOne.replace("{count}", "1")
    : t.people.cardCountMany.replace("{count}", String(count));

function sortPersons(persons: PeopleListItem[]): PeopleListItem[] {
  return [...persons].sort(
    (a, b) =>
      Number(Boolean(a.userId)) - Number(Boolean(b.userId)) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function AdminGestaoScreen({
  persons,
  tokens,
  organizationId,
  organizationSlug,
  organizationName,
  currentRole,
  isSuperUser,
  currentUserId,
}: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"people" | "invites">("people");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {/* Abas */}
      <div
        role="tablist"
        aria-label={t.admin.dashboard}
        className="flex w-full rounded-full border border-border bg-card p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "people"}
          onClick={() => setTab("people")}
          className={cn(
            "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
            tab === "people"
              ? "bg-brand text-brand-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.admin.people}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "invites"}
          onClick={() => setTab("invites")}
          className={cn(
            "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
            tab === "invites"
              ? "bg-brand text-brand-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.admin.invitations}
        </button>
      </div>

      {tab === "people" ? (
        <PeopleTab
          persons={sortPersons(persons)}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          currentRole={currentRole}
          isSuperUser={isSuperUser}
          currentUserId={currentUserId}
        />
      ) : (
        <InvitesTab
          persons={persons}
          tokens={tokens}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          organizationName={organizationName}
        />
      )}
    </div>
  );
}

// ────────────────────────── Aba Pessoas ─────────────────────────

function PeopleTab({
  persons,
  organizationId,
  organizationSlug,
  currentRole,
  isSuperUser,
  currentUserId,
}: {
  persons: PeopleListItem[];
  organizationId: string;
  organizationSlug: string;
  currentRole: string | null;
  isSuperUser: boolean;
  currentUserId: string;
}) {
  const { t } = useI18n();
  const router = useRouter();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState<PeopleListItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<string>("member");
  const [isEditing, setIsEditing] = useState(false);
  const [cardsTarget, setCardsTarget] = useState<PeopleListItem | null>(null);
  const [manageData, setManageData] = useState<ManagePersonCards | null>(null);
  const [linkTarget, setLinkTarget] = useState<PeopleListItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<PeopleListItem | null>(null);
  const [isRemoving, setRemoving] = useState(false);

  const canPromoteToOwner = isSuperUser || currentRole === "owner";

  const handleCreate = async () => {
    const name = newName.trim();
    if (name.length < 2) return;
    setCreating(true);
    try {
      await createOrgPersonAction(organizationId, name, organizationSlug);
      toast.success(t.people.personCreated);
      setNewName("");
      setIsCreating(false);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (person: PeopleListItem) => {
    const role =
      person.role && ["member", "admin", "owner"].includes(person.role) ? person.role : "member";
    setEditTarget(person);
    setEditName(person.name);
    setEditRole(role);
  };

  const handleEdit = async () => {
    const target = editTarget;
    const trimmed = editName.trim();
    if (!target || trimmed.length < 2) return;
    setIsEditing(true);
    try {
      await updatePersonName(organizationId, target.id, trimmed, organizationSlug);
      if (editRole !== target.role) {
        await updatePersonRole(
          organizationId,
          target.id,
          editRole as "member" | "admin" | "owner",
          organizationSlug,
        );
      }
      toast.success(t.people.personUpdated);
      setEditTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setIsEditing(false);
    }
  };

  const openAdminCards = async (person: PeopleListItem) => {
    setCardsTarget(person);
    try {
      const data = await getPersonCardsManageData(organizationId, person.id);
      setManageData(data);
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
      setCardsTarget(null);
    }
  };

  const handleRemove = async () => {
    const target = removeTarget;
    if (!target) return;
    setRemoving(true);
    try {
      await removePersonFromOrganization(organizationId, target.id);
      toast.success(t.people.removeFromOrgSuccess);
      setRemoveTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section aria-labelledby="people-tab-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="people-tab-title" className="text-base font-semibold text-foreground">
            {t.people.listTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {persons.length === 1
              ? t.people.countOne.replace("{count}", "1")
              : t.people.countMany.replace("{count}", String(persons.length))}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="size-3.5" aria-hidden />
          {t.people.createButton}
        </Button>
      </div>

      {isCreating && (
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
          <Label htmlFor="new-person-name">{t.people.nameLabel}</Label>
          <div className="flex gap-2">
            <Input
              id="new-person-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.people.namePlaceholder}
              maxLength={80}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <Button
              type="button"
              onClick={handleCreate}
              disabled={creating || newName.trim().length < 2}
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" aria-hidden />
              )}
              {t.common.confirm}
            </Button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {persons.map((person) => {
          const isSelf = person.id === currentUserId;
          const canManage = isSuperUser || currentRole === "admin" || currentRole === "owner";
          const canRemove =
            canManage && !isSelf && !(currentRole === "admin" && person.role === "owner");
          return (
            <li
              key={person.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={person.user?.image ?? undefined} alt="" />
                  <AvatarFallback>{person.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
                    <span className={roleBadgeClasses(person.role)}>
                      {roleLabel(t, person.role)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {person.user ? person.user.email : t.people.personWithoutUser}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cardCountBadge(t, person.cardsCount)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!person.userId && canManage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setLinkTarget(person)}
                  >
                    <UserPlus className="size-3.5" aria-hidden />
                    {t.people.linkUser}
                  </Button>
                )}
                {canManage && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openEdit(person)}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      {t.people.editPerson}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openAdminCards(person)}
                    >
                      <CreditCard className="size-3.5" aria-hidden />
                      {t.people.adminCardsTitle}
                    </Button>
                  </>
                )}
                {canRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => setRemoveTarget(person)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    {t.people.removeFromOrg}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {editTarget && (
        <EditPersonDialog
          name={editName}
          onNameChange={setEditName}
          role={editRole as "member" | "admin" | "owner"}
          onRoleChange={(v) => setEditRole(v)}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
          isSaving={isEditing}
          canPromoteToOwner={canPromoteToOwner}
          t={t}
        />
      )}

      {cardsTarget && manageData && (
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
      )}

      {linkTarget && (
        <LinkUserDialog
          person={linkTarget}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          onClose={() => setLinkTarget(null)}
        />
      )}

      {removeTarget && (
        <RemovePersonDialog
          person={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onRemove={handleRemove}
          isRemoving={isRemoving}
          t={t}
        />
      )}
    </section>
  );
}

// ────────────────── Modal de remoção (irreversível) ─────────────

export function RemovePersonDialog({
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
  const [confirmed, setConfirmed] = useState(false);

  return (
    <ModalOverlay
      label={t.people.removePersonConfirmTitle.replace("{name}", person.name)}
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {t.people.removePersonConfirmTitle.replace("{name}", person.name)}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.people.removePersonConfirmHint.replace("{name}", person.name)}
            </p>
          </div>
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

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <Switch
          id="confirm-remove"
          checked={confirmed}
          onCheckedChange={setConfirmed}
          disabled={isRemoving}
        />
        <Label htmlFor="confirm-remove" className="text-sm font-medium text-foreground">
          {t.people.removePersonConfirmSwitch}
        </Label>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
        <Button variant="outline" onClick={onClose} disabled={isRemoving} className="flex-1">
          {t.common.cancel}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
          disabled={!confirmed || isRemoving}
          className="flex-1 gap-2"
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="size-4" aria-hidden />
          )}
          {t.people.removeFromOrg}
        </Button>
      </div>
    </ModalOverlay>
  );
}

// ────────────────────────── Aba Convites ────────────────────────

function InvitesTab({
  persons,
  tokens,
  organizationId,
  organizationSlug,
  organizationName,
}: {
  persons: PeopleListItem[];
  tokens: GestaoToken[];
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
}) {
  const { t } = useI18n();
  const unlinked = sortPersons(persons).filter((p) => !p.userId);

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="generate-title"
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h2 id="generate-title" className="text-base font-semibold text-foreground">
          {t.admin.generateTitle}
        </h2>
        <PersonTokenGenerator
          persons={unlinked}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          organizationName={organizationName}
        />
      </section>

      <section aria-labelledby="history-title">
        <h2 id="history-title" className="mb-3 text-base font-semibold text-foreground">
          {t.admin.historyTitle}
        </h2>
        <TokenHistoryList
          tokens={tokens}
          organizationId={organizationId}
          organizationSlug={organizationSlug}
        />
      </section>
    </div>
  );
}

function PersonTokenGenerator({
  persons,
  organizationId,
  organizationSlug,
  organizationName,
}: {
  persons: PeopleListItem[];
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [personId, setPersonId] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"token" | "message" | null>(null);

  const handleGenerate = async () => {
    if (!personId) {
      toast.error(t.admin.selectPersonToInvite);
      return;
    }
    setLoading(true);
    try {
      const result = await regeneratePersonInviteAction(organizationId, personId, organizationSlug);
      setToken(result.token);
      toast.success(t.admin.tokenGenerated);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setLoading(false);
    }
  };

  const message = token
    ? t.admin.inviteMessage.replace("{orgName}", organizationName).replace("{token}", token)
    : "";

  const handleCopy = async (kind: "token" | "message") => {
    const text = kind === "token" ? (token ?? "") : message;
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    toast.success(kind === "token" ? t.admin.tokenCopied : t.admin.tokenMessageCopied);
    setTimeout(() => setCopied(null), 2000);
  };

  if (persons.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">{t.admin.noUnlinkedPersons}</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={personId} onValueChange={setPersonId}>
          <SelectTrigger className="w-full sm:flex-1" aria-label={t.admin.selectPersonToInvite}>
            <SelectValue placeholder={t.admin.selectPersonPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {persons.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !personId}
          className="gap-2 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="size-4" aria-hidden />
          )}
          {t.admin.generateToken}
        </Button>
      </div>

      {token && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center justify-center gap-2 rounded-md border bg-muted/40 px-3 py-2.5">
              <KeyRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <code className="font-mono text-2xl font-semibold tracking-[0.4em] text-foreground">
                {token}
              </code>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCopy("token")}
              className="shrink-0 gap-1.5"
            >
              {copied === "token" ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
              {t.admin.tokenCopy}
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2.5">
            <MessageSquareText
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <p className="flex-1 text-xs text-muted-foreground">{message}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleCopy("message")}
              className="shrink-0 gap-1.5 text-xs"
            >
              {copied === "message" ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
              {t.admin.tokenMessageLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TokenHistoryList({
  tokens,
  organizationId,
  organizationSlug,
}: {
  tokens: GestaoToken[];
  organizationId: string;
  organizationSlug: string;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const dateLocale = locale === "pt" ? "pt-BR" : "es-419";

  const statusOf = (token: GestaoToken) => {
    if (token.usedAt) return "used";
    if (new Date(token.expiresAt) < new Date()) return "expired";
    return "active";
  };

  const handleDelete = async (token: GestaoToken) => {
    if (!window.confirm(t.admin.deleteTokenConfirm)) return;
    setBusyId(token.id);
    try {
      await deleteInviteTokenAction(organizationId, token.id, organizationSlug);
      toast.success(t.admin.tokenDeleted);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err, t.errors.generic));
    } finally {
      setBusyId(null);
    }
  };

  if (tokens.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{t.admin.noInvites}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {tokens.map((token) => {
        const status = statusOf(token);
        const busy = busyId === token.id;
        return (
          <li
            key={token.id}
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    status === "active" && "bg-amber-500/10 text-amber-600",
                    status === "used" && "bg-green-500/10 text-green-600",
                    status === "expired" && "bg-muted text-muted-foreground",
                  )}
                >
                  {status === "active" && t.admin.tokenActive}
                  {status === "used" && t.admin.tokenUsed}
                  {status === "expired" && t.admin.tokenExpired}
                </span>
                {status === "active" && (
                  <code className="rounded-md bg-muted/60 px-2.5 py-1 font-mono text-base font-semibold tracking-[0.3em] text-foreground">
                    {token.token}
                  </code>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.admin.generatedBy
                  .replace("{name}", token.createdByName)
                  .replace("{date}", new Date(token.createdAt).toLocaleString(dateLocale))}
              </p>
              {token.personName && (
                <p className="text-xs text-muted-foreground">
                  {t.admin.tokenFor.replace("{name}", token.personName)}
                </p>
              )}
              {token.usedByName && token.usedAt && (
                <p className="text-xs text-muted-foreground">
                  {t.admin.usedBy
                    .replace("{name}", token.usedByName)
                    .replace("{date}", new Date(token.usedAt).toLocaleString(dateLocale))}
                </p>
              )}
              {status === "active" && (
                <p className="text-xs text-muted-foreground">
                  {t.admin.expiresAt.replace(
                    "{date}",
                    new Date(token.expiresAt).toLocaleString(dateLocale),
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {status === "active" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(token)}
                  disabled={busy}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  {busy ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="size-3.5" aria-hidden />
                  )}
                  {t.admin.deleteToken}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
