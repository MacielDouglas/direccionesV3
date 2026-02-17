import Link from "next/link";
import { Compass } from "lucide-react";
import MobileHeader from "./MobileHeader";
import SessionTimer from "@/domains/auth/components/SessionTimer";
import { Session } from "better-auth";
import { Role } from "@/domains/member/types/role.types";
import DarkModeButton from "../ui/DarkModeButton";

import { Organization } from "better-auth/plugins";

interface HeaderProps {
  role?: Role | null;
  session: Session;
  organization: Organization | null;
}

export default async function Header({
  session,
  role,
  organization,
}: HeaderProps) {
  // const organization = await getActiveOrganization(session.userId ?? "");

  if (!organization?.slug) {
    return (
      <header className="w-full bg-[#0c232a] border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-8">
          {/* Logo */}
          <div className="flex items-center gap-1 text-white tracking-widest">
            <span className="text-lg md:text-xl font-light uppercase">
              Direcci
            </span>

            <Compass className="size-5 text-orange-500" />

            <span className="text-lg md:text-xl font-light uppercase">nes</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-[#0c232a] border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 text-white tracking-widest"
        >
          <span className="text-lg md:text-xl font-light uppercase">
            Direcci
          </span>

          <Compass className="size-5 text-orange-500" />

          <span className="text-lg md:text-xl font-light uppercase">nes</span>
        </Link>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <SessionTimer expiresAt={session.expiresAt} />
            <DarkModeButton />

            {/* Mobile menu */}
            <MobileHeader
              role={role ?? null}
              orgSlug={organization?.slug ?? ""}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
