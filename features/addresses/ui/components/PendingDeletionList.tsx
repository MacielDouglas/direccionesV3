"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CheckCircle, Loader2, MapPin, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  cancelAddressDeletionAction,
  confirmAddressDeletionAction,
} from "../../application/address.actions";

type AddressItem = {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  businessName: string | null;
  pendingDeletionAt: Date | null;
  requestedBy?: { name: string | null; user: { email: string | null } | null } | null;
  image: string | null;
};

export function PendingDeletionList({
  addresses,
}: {
  addresses: AddressItem[];
  orgSlug: string;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { t } = useI18n();
  const router = useRouter();

  async function handleConfirm(id: string) {
    try {
      setLoadingId(id);
      await confirmAddressDeletionAction(id);
      toast.success(t.addresses.deletionConfirmed);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.addresses.deleteError);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCancel(id: string) {
    try {
      setLoadingId(id);
      await cancelAddressDeletionAction(id);
      toast.success(t.addresses.deletionCancelled);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.addresses.cancelDeletionError);
    } finally {
      setLoadingId(null);
    }
  }

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
            <Button
              size="sm"
              variant="destructive"
              disabled={loadingId === address.id}
              onClick={() => handleConfirm(address.id)}
              className="gap-2"
            >
              {loadingId === address.id ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
              )}
              {t.addresses.confirmDeletion}
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={loadingId === address.id}
              onClick={() => handleCancel(address.id)}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {t.addresses.cancelDeletion}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
