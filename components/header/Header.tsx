import { Compass } from "lucide-react";
import MobileHeader from "./MobileHeader";
import SessionTimer from "@/domains/auth/components/SessionTimer";
import DarkModeButton from "../ui/DarkModeButton";
import type { Session } from "better-auth";
import type { Role } from "@/domains/member/types/role.types";
import type { Organization } from "better-auth/plugins";
import { NavLink } from "../ui/NavLink";

interface HeaderProps {
  role?: Role | null;
  session: Session;
  organization: Organization | null;
}

function Logo() {
  return (
    <span className="flex items-center gap-1 tracking-widest text-white">
      <span className="text-lg font-light uppercase md:text-xl">Direcci</span>
      <Compass className="size-5 text-brand" aria-hidden="true" />
      <span className="text-lg font-light uppercase md:text-xl">nes</span>
    </span>
  );
}

export default function Header({ session, role, organization }: HeaderProps) {
  return (
    <header className="w-full border-b border-white/10 bg-[#0c232a]">
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
            <SessionTimer expiresAt={session.expiresAt} />
            <DarkModeButton />
            <MobileHeader role={role ?? null} orgSlug={organization.slug} />
          </div>
        )}
      </div>
    </header>
  );
}
