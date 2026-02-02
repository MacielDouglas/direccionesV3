import Link from "next/link";
import { Compass } from "lucide-react";
import MobileHeader from "./MobileHeader";
import { getCurrentUser } from "@/server/users";

export default async function Header() {
  const { memberRole } = await getCurrentUser();

  return (
    <header className="h-24 md:h-28 bg-[#0c232a] w-full p-5 md:p-10">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between ">
        <Link
          href={"/"}
          className="text-white text-xl md:text-2xl md:font-medium uppercase tracking-widest font-light flex items-center"
        >
          Direcci
          <span className="text-orange-500">
            <Compass />
          </span>
          nes
        </Link>
        <MobileHeader role={memberRole?.role ?? null} />
      </div>
    </header>
  );
}
