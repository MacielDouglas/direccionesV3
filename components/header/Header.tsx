import SessionTimer from "@/domains/auth/components/SessionTimer";
import type { Role } from "@/domains/member/types/role.types";
import type { Session } from "better-auth";
import type { Organization } from "better-auth/plugins";
import { Compass } from "lucide-react";
import { LanguageSelector } from "../LanguageSelector";
import DarkModeButton from "../ui/DarkModeButton";
import { NavLink } from "../ui/NavLink";
import MobileHeader from "./MobileHeader";

interface HeaderProps {
  role?: Role | null;
  session: Session;
  organization: Organization | null;
}

function Logo() {
  return (
    <span className="flex items-center gap-1.5 tracking-wide text-foreground">
      <Compass className="size-5 text-brand" aria-hidden="true" />
      <span className="text-lg font-medium uppercase md:text-xl">Direcciones</span>
    </span>
  );
}

export default function Header({ session, role, organization }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-white/95 backdrop-blur-md dark:bg-[#1f1b17]/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-8">
        {organization?.slug ? (
          <NavLink
            href="/"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label="Ir al inicio de Direcciones"
          >
            <Logo />
          </NavLink>
        ) : (
          <Logo />
        )}

        {organization?.slug && (
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            <SessionTimer expiresAt={session.expiresAt} />
            <DarkModeButton />
            <MobileHeader role={role ?? null} orgSlug={organization.slug} />
          </div>
        )}
      </div>
    </header>
  );
}
