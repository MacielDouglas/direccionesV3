"use client";

import { Button } from "@/components/ui/button";
import { resolveActionError } from "@/lib/action-error";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  cancelAddressDeletionAction,
  confirmAddressDeletionAction,
} from "../../application/address.actions";

interface Props {
  addressId: string;
}

export function PendingDeletionActions({ addressId }: Props) {
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const router = useRouter();

  async function handleConfirm() {
    if (loading) return;
    try {
      setLoading(true);
      await confirmAddressDeletionAction(addressId);
      toast.success(t.addresses.deletionConfirmed);
      router.refresh();
    } catch (error) {
      toast.error(resolveActionError(error, t));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (loading) return;
    try {
      setLoading(true);
      await cancelAddressDeletionAction(addressId);
      toast.success(t.addresses.deletionCancelled);
      router.refresh();
    } catch (error) {
      toast.error(resolveActionError(error, t));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        disabled={loading}
        onClick={handleConfirm}
        className="min-h-11 gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
        )}
        {t.addresses.confirmDeletion}
      </Button>

      <Button
        variant="outline"
        disabled={loading}
        onClick={handleCancel}
        className="min-h-11 gap-2"
      >
        <XCircle className="h-4 w-4" aria-hidden="true" />
        {t.addresses.cancelDeletion}
      </Button>
    </>
  );
}
