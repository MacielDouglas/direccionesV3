import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/server/users";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EditNameForm } from "@/features/user/ui/EditNameForm";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { LeaveOrganizationButton } from "./_components/LeaveOrganizationButton";
import type { Role } from "@/domains/member/types/role.types";
import { DeleteAccountButton } from "./_components/DeleteAccountButton";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

function upgradeGoogleAvatar(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  return url.replace(/s\d+-c/, "s720-c");
}

export default async function UserPage({ params }: Props) {
  const { organizationSlug } = await params;
  const data = await getCurrentUser();
  //  const user = await getCurrentUser();
  if (!data) redirect("/login");

  const { session, activeOrganization } = data;
  if (!session || !activeOrganization) return;

  const user = session.user;

  // Cards atribuídos ao usuário na org atual
  const cards = activeOrganization
    ? await prisma.card.findMany({
        where: {
          organizationId: activeOrganization.id,
          assignedUserId: user.id,
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

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 flex flex-col gap-8">
      {/* Avatar + nome */}
      <section
        aria-labelledby="profile-title"
        className="flex flex-col items-center gap-4 text-center"
      >
        <Avatar className="size-28 ring-2 ring-border shadow-md">
          <AvatarImage
            src={upgradeGoogleAvatar(user.image)}
            alt={`Foto de perfil de ${user.name}`}
          />
          <AvatarFallback className="text-3xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center gap-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Perfil de usuario
          </p>
          <EditNameForm currentName={user.name} />
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </section>

      {/* Cards atribuídos */}
      <section aria-labelledby="cards-title">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="cards-title"
            className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Mis tarjetas
          </h2>
          <span className="text-xs text-muted-foreground">
            {cards.length} asignada{cards.length !== 1 ? "s" : ""}
          </span>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-xl border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
            No tienes tarjetas asignadas.
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
                  aria-label={`Tarjeta #${String(card.number).padStart(2, "0")}`}
                >
                  <CreditCard
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold tabular-nums">
                      Tarjeta #{String(card.number).padStart(2, "0")}
                    </span>
                    {card.addresses.length > 0 && (
                      <span className="text-xs text-muted-foreground truncate">
                        {card.addresses
                          .map(
                            (a) => a.businessName ?? `${a.street}, ${a.number}`,
                          )
                          .join(" · ")}
                      </span>
                    )}
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {card.addresses.length} dir.
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t pt-6 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-destructive">
            Zona de perigo
          </h2>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium">Sair da organização</p>
            <p className="text-xs text-muted-foreground">
              Você perde acesso a esta organização. Sua conta permanece ativa.
            </p>
            <div className="mt-1">
              <LeaveOrganizationButton
                organizationId={activeOrganization.id}
                organizationName={activeOrganization.name}
                role={data.memberRole?.role as Role}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium">Excluir conta</p>
            <p className="text-xs text-muted-foreground">
              Remove sua conta permanentemente de todas as organizações e do
              app.
            </p>
            <div className="mt-1">
              <DeleteAccountButton userEmail={session.user.email} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
