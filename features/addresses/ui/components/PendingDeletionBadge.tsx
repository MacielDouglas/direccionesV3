import { buttonVariants } from "@/components/ui/button";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export async function PendingDeletionBadge({
  organizationId,
  orgSlug,
}: {
  organizationId: string;
  orgSlug: string;
}) {
  const [t, count] = await Promise.all([
    getServerDictionary(),
    prisma.address.count({
      where: { organizationId, pendingDeletion: true },
    }),
  ]);

  if (count === 0) return null;

  const label =
    count === 1
      ? t.addresses.pendingDeletionCountOne
      : t.addresses.pendingDeletionCountMany.replace("{count}", String(count));

  return (
    <Link
      href={`/org/${orgSlug}/addresses/pending-deletion`}
      className={buttonVariants({ variant: "destructive" })}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}
