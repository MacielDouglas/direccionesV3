"use client";

import { DeleteAccountButton } from "@/app/(protected)/org/[organizationSlug]/(members)/user/_components/DeleteAccountButton";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Building2, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { redeemWelcomeTokenAction } from "../../applications/inviteToken.action";

interface WelcomeScreenProps {
  userEmail: string;
}

export function WelcomeScreen({ userEmail }: WelcomeScreenProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!token.trim()) {
      toast.error(t.invitations.tokenMissing);
      return;
    }

    setLoading(true);
    try {
      const result = await redeemWelcomeTokenAction({
        token: token.trim(),
        name: name.trim(),
      });

      toast.success(
        result.kind === "owner"
          ? t.invitations.ownerCreated.replace("{orgName}", result.org.name)
          : t.invitations.joiningSuccess.replace("{orgName}", result.org.name),
      );

      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.invitations.tokenError);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-foreground">
      <p className="text-muted-foreground">{t.invitations.welcomeDescription}</p>

      <div className="flex flex-col gap-2 text-left">
        <Label htmlFor="welcome-token" className="text-sm">
          {t.invitations.tokenLabel}
        </Label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="welcome-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t.invitations.tokenPlaceholder}
            className="pl-9 font-mono"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 text-left">
        <Label htmlFor="welcome-org-name" className="text-sm">
          {t.invitations.orgNameLabel}{" "}
          <span className="text-muted-foreground">{t.invitations.orgNameHint}</span>
        </Label>
        <div className="relative">
          <Building2
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="welcome-org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.invitations.orgNamePlaceholder}
            className="pl-9"
          />
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        aria-busy={loading}
        className="w-full gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="size-4" aria-hidden="true" />
        )}
        {loading ? t.invitations.entering : t.invitations.enterWithToken}
      </Button>

      <div className="flex flex-col gap-3 pt-2">
        <LogoutButton />
        <DeleteAccountButton userEmail={userEmail} />
      </div>
    </div>
  );
}
