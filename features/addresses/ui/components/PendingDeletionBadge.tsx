import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function PendingDeletionBadge({
  organizationId,
  orgSlug,
}: {
  organizationId: string;
  orgSlug: string;
}) {
  const count = await prisma.address.count({
    where: { organizationId, pendingDeletion: true },
  });

  if (count === 0) return null;

  return (
    <Link
      href={`/org/${orgSlug}/addresses/pending-deletion`}
      className={buttonVariants({ variant: "destructive" })}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {count} dirección{count !== 1 ? "es" : ""} pendiente
      {count !== 1 ? "s" : ""} de eliminación
    </Link>
  );
}
