"use client";

import { DeleteAccountButton } from "@/app/(protected)/org/[organizationSlug]/(members)/user/_components/DeleteAccountButton";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { redeemWelcomeTokenAction } from "../../applications/inviteToken.action";

interface WelcomeScreenProps {
  userEmail: string;
}

const ERROR_TOAST = {
  invalid: "tokenInvalid",
  used: "tokenUsed",
  expired: "tokenExpired",
  already_in_org: "alreadyInOrg",
  unauthorized: "tokenError",
  other: "tokenError",
} as const;

export function WelcomeScreen({ userEmail }: WelcomeScreenProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [token, setToken] = useState("");
  const [needsOrgName, setNeedsOrgName] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const clean = token.trim();
    if (!/^\d{6}$/.test(clean)) {
      toast.error(t.invitations.tokenInvalidFormat);
      return;
    }

    setLoading(true);
    try {
      const result = await redeemWelcomeTokenAction({
        token: clean,
        name: needsOrgName ? orgName : undefined,
      });

      if (result.kind === "owner_needs_name") {
        setNeedsOrgName(true);
        setLoading(false);
        return;
      }

      if (result.kind === "error") {
        toast.error(t.invitations[ERROR_TOAST[result.code]]);
        setLoading(false);
        return;
      }

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
    <div className="space-y-5 text-foreground">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight">{t.invitations.welcomeCardTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.invitations.notInOrg}</p>
      </div>

      <div className="flex flex-col gap-2 text-left">
        <label htmlFor="welcome-token" className="text-sm font-medium">
          {t.invitations.tokenLabel}
        </label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="welcome-token"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
            placeholder={t.invitations.tokenPlaceholder}
            className="pl-9 font-mono text-center text-lg tracking-[0.4em]"
            autoComplete="off"
            autoFocus
          />
        </div>
        <p className="text-xs text-muted-foreground">{t.invitations.tokenHint}</p>
      </div>

      {needsOrgName && (
        <div className="flex flex-col gap-2 text-left">
          <label htmlFor="welcome-org-name" className="text-sm font-medium">
            {t.invitations.orgNameLabel}{" "}
            <span className="font-normal text-muted-foreground">{t.invitations.orgNameHint}</span>
          </label>
          <Input
            id="welcome-org-name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder={t.invitations.orgNamePlaceholder}
            maxLength={80}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        aria-busy={loading}
        className="w-full gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <KeyRound className="size-4" aria-hidden />
        )}
        {loading ? t.invitations.entering : t.invitations.enterWithToken}
      </Button>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <LogoutButton />
        <DeleteAccountButton userEmail={userEmail} />
      </div>
    </div>
  );
}
