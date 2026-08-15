import { getServerDictionary } from "@/lib/i18n/server";
import type { Address } from "@prisma/client";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { PendingDeletionActions } from "../components/PendingDeletionActions";

type PendingDeletionAddress = Address & {
  requestedBy?: { name: string | null; user: { email: string | null } | null } | null;
};

interface Props {
  addresses: PendingDeletionAddress[];
}

export default async function PendingDeletionScreen({ addresses }: Props) {
  const t = await getServerDictionary();

  if (addresses.length === 0) {
    return (
      <p className="mt-10 text-center text-muted-foreground">{t.addresses.noPendingDeletions}</p>
    );
  }

  return (
    <ul className="mt-6 flex flex-col gap-4">
      {addresses.map((address) => (
        <li
          key={address.id}
          className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        >
          {address.image && (
            <Image
              src={address.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl"
              priority={false}
            />
          )}
          <div className="bg-black/30 absolute z-10 w-full h-full top-0 left-0 rounded-xl" />
          <div className="flex items-start gap-2 z-10">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              {address.businessName && <p className="font-semibold">{address.businessName}</p>}
              <p className="text-sm text-muted-foreground">
                {address.street}, {address.number} — {address.neighborhood}, {address.city}
              </p>
              {address.requestedBy && (
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {t.addresses.requestedBy}{" "}
                  <span className="font-medium">
                    {address.requestedBy.name ?? address.requestedBy.user?.email}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 z-10">
            <PendingDeletionActions addressId={address.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
