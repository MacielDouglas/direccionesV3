"use client";

import { DeleteAccountButton } from "@/app/(protected)/org/[organizationSlug]/(members)/user/_components/DeleteAccountButton";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { redeemWelcomeTokenAction } from "../../applications/inviteToken.action";

interface WelcomeScreenProps {
  userEmail: string;
}

type SuccessOrg = { name: string; slug: string };

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
  const [successOrg, setSuccessOrg] = useState<SuccessOrg | null>(null);

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

      setSuccessOrg(result.org);
      setLoading(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.invitations.tokenError);
      setLoading(false);
    }
  }

  const goToOrg = () => {
    if (!successOrg) return;
    router.push(`/org/${successOrg.slug}`);
    router.refresh();
  };

  if (successOrg) {
    return (
      <div className="flex flex-col items-center gap-5 text-foreground">
        <div className="flex flex-col items-center gap-2 text-center">
          <CheckCircle2 className="size-12 text-brand" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight">{t.invitations.welcomeCardTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.invitations.goToOrgHint}</p>
        </div>

        <Button type="button" onClick={goToOrg} className="w-full gap-2 rounded-full" autoFocus>
          <ArrowRight className="size-4" aria-hidden />
          {t.invitations.goToOrg.replace("{orgName}", successOrg.name)}
        </Button>

        <div className="flex w-full flex-col gap-3 border-t border-border pt-4">
          <LogoutButton />
          <DeleteAccountButton userEmail={userEmail} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-foreground">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight">{t.invitations.welcomeCardTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.invitations.notInOrg}</p>
      </div>

      <div className="flex flex-col items-center gap-2 text-left">
        <label htmlFor="welcome-token" className="self-start text-sm font-medium">
          {t.invitations.tokenLabel}
        </label>
        <InputOTP
          id="welcome-token"
          maxLength={6}
          value={token}
          onChange={(value) => setToken(value.replace(/\D/g, ""))}
          inputMode="numeric"
          pattern={REGEXP_ONLY_DIGITS}
          autoComplete="one-time-code"
          autoFocus
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
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
        className="w-full gap-2 rounded-full"
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
