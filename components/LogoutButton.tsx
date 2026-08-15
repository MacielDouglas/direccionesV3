"use client";

import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success(t.common.sessionClosed);
            window.location.href = "/login";
          },
          onError: () => {
            toast.error(t.common.sessionCloseError);
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? t.common.logoutConfirm : t.common.logout}
      className="w-full rounded-full"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {loading ? t.common.logoutConfirm : t.common.logout}
    </Button>
  );
}
