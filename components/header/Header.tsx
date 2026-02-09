import Link from "next/link";
import { Compass } from "lucide-react";
import MobileHeader from "./MobileHeader";
import { getCurrentUser } from "@/server/users";
import { getActiveOrganization } from "@/server/organizations";
import DarkModeButton from "./DarkModeButton";
import SessionTimer from "./SessionTimer";

export default async function Header() {
  const data = await getCurrentUser();

  const memberRole = data?.activeMember?.role ?? null;
  const session = data?.session.session;

  if (!session?.activeOrganizationId) {
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
  const organization = await getActiveOrganization(data?.user.id ?? "");

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
              role={memberRole ?? null}
              orgSlug={organization?.slug ?? ""}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
