import type { Role } from "@/domains/member/types/role.types";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Session } from "better-auth";
import type { Organization } from "better-auth/plugins";
import { Compass } from "lucide-react";
import { NavLink } from "../ui/NavLink";
import MobileHeader from "./MobileHeader";

interface HeaderProps {
  role?: Role | null;
  session: Session;
  organization: Organization | null;
  isSuperUser?: boolean;
  hasPerson?: boolean;
}

function AppIcon() {
  return <Compass className="size-6 text-brand" aria-hidden="true" />;
}

export default async function Header({
  session,
  role,
  organization,
  isSuperUser = false,
  hasPerson = false,
}: HeaderProps) {
  const t = await getServerDictionary();
  const showControls = Boolean(organization?.slug) || isSuperUser || hasPerson;

  return (
    <header className="sticky top-[env(safe-area-inset-top)] z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-8">
        {showControls ? (
          <NavLink
            href="/"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label={t.header.goToHome}
          >
            <AppIcon />
          </NavLink>
        ) : (
          <AppIcon />
        )}

        {showControls && (
          <MobileHeader
            role={role ?? null}
            orgSlug={organization?.slug}
            sessionExpiresAt={session.expiresAt}
          />
        )}
      </div>
    </header>
  );
}
