import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Role } from "@/domains/member/types/role.types";
import { EditNameForm } from "@/features/user/ui/EditNameForm";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/users";
import { CreditCard, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccountButton } from "./_components/DeleteAccountButton";
import { LeaveOrganizationButton } from "./_components/LeaveOrganizationButton";

export const metadata: Metadata = {
  title: "Perfil de Usuario",
};

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

function upgradeGoogleAvatar(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/s\d+-c/, "s720-c");
}

export default async function UserPage({ params }: Props) {
  const { organizationSlug } = await params;
  const [data, t] = await Promise.all([getCurrentUser(), getServerDictionary()]);
  if (!data) redirect("/login");

  const { session, activeOrganization, memberRole } = data;
  if (!session) return;

  const user = session.user;
  const person = data.person;

  // Cards atribuídos à pessoa na org atual
  const cards = activeOrganization
    ? await prisma.card.findMany({
        where: {
          organizationId: activeOrganization.id,
          assignedPersonId: person.id,
        },
        select: {
          id: true,
          number: true,
          addresses: {
            select: {
              id: true,
              street: true,
              number: true,
              businessName: true,
            },
          },
        },
        orderBy: { number: "asc" },
      })
    : [];

  const initials = (person.name ?? user.name)
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  const roleLabel =
    memberRole?.role === "owner"
      ? t.people.roleOwner
      : memberRole?.role === "admin"
        ? t.people.roleAdmin
        : t.people.roleMember;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      {/* Hero: avatar + nome da pessoa + e-mail */}
      <section
        aria-labelledby="profile-title"
        className="rounded-2xl bg-black p-6 text-white shadow-md shadow-black/20 sm:p-8"
      >
        <span
          id="profile-title"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-400"
        >
          {t.user.title}
        </span>
        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
          <Avatar className="size-20 shrink-0 ring-2 ring-white/20">
            <AvatarImage
              src={upgradeGoogleAvatar(user.image)}
              alt={`Foto de perfil de ${person.name}`}
            />
            <AvatarFallback className="bg-white/10 text-2xl font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:items-start">
            <EditNameForm
              currentName={person.name}
              personId={person.id}
              organizationId={activeOrganization?.id ?? ""}
              organizationSlug={organizationSlug}
            />
            <p className="text-sm text-neutral-300">{user.email}</p>
            {memberRole ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                <ShieldCheck className="size-3" aria-hidden="true" />
                {roleLabel}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Cards atribuídos */}
      {activeOrganization && (
        <>
          <section aria-labelledby="cards-title">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="cards-title"
                className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t.cards.title}
              </h2>
              <span className="text-xs text-muted-foreground">
                {cards.length === 1
                  ? t.user.assignedCardsOne
                  : t.user.assignedCardsMany.replace("{count}", String(cards.length))}
              </span>
            </div>

            {cards.length === 0 ? (
              <div className="rounded-xl border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                {t.cards.noCards}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {cards.map((card) => (
                  <li key={card.id}>
                    <Link
                      href={`/org/${organizationSlug}/my-cards`}
                      className="
                    flex items-center gap-3
                    rounded-xl border bg-card px-4 py-3
                    transition-colors hover:bg-muted/50
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                  "
                      aria-label={t.cards.cardNumber.replace(
                        "{number}",
                        String(card.number).padStart(2, "0"),
                      )}
                    >
                      <CreditCard
                        className="h-5 w-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-semibold tabular-nums">
                          {t.cards.cardNumber.replace(
                            "{number}",
                            String(card.number).padStart(2, "0"),
                          )}
                        </span>
                        {card.addresses.length > 0 && (
                          <span className="truncate text-xs text-muted-foreground">
                            {card.addresses
                              .map((a) => a.businessName ?? `${a.street}, ${a.number}`)
                              .join(" · ")}
                          </span>
                        )}
                      </div>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {card.addresses.length} {t.user.dirShort}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Zona de perigo */}
          <section aria-labelledby="danger-zone-title" className="border-t border-border pt-6">
            <h2 id="danger-zone-title" className="text-sm font-medium text-destructive">
              {t.user.dangerZone}
            </h2>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">{t.user.leaveOrg}</p>
                <p className="text-xs text-muted-foreground">{t.user.leaveOrgDescription}</p>
                <div className="mt-1">
                  <LeaveOrganizationButton
                    organizationId={activeOrganization.id}
                    organizationName={activeOrganization.name}
                    role={memberRole?.role as Role}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">{t.user.deleteAccount}</p>
                <p className="text-xs text-muted-foreground">{t.user.deleteAccountDescription}</p>
                <div className="mt-1">
                  <DeleteAccountButton userEmail={session.user.email} />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
