"use client";

import { Button } from "@/components/ui/button";
import {
  createOwnerOnboardingTokenAction,
  getOwnerOnboardingTokensAction,
} from "@/features/invitations/applications/inviteToken.action";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Check, Copy, Loader2, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type OnboardingToken = Awaited<ReturnType<typeof getOwnerOnboardingTokensAction>>[number];

export function OwnerTokenGenerator({
  initialTokens,
}: {
  initialTokens: OnboardingToken[];
}) {
  const { locale, t } = useI18n();
  const tokensI18n = t.superuser.ownerTokens;
  const [tokens, setTokens] = useState<OnboardingToken[]>(initialTokens);
  const [loading, setLoading] = useState(false);
  const [newToken, setNewToken] = useState<OnboardingToken | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const created = await createOwnerOnboardingTokenAction();
      const list = await getOwnerOnboardingTokensAction();
      setTokens(list);
      setNewToken(list.find((item) => item.id === created.id) ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tokensI18n.error);
    } finally {
      setLoading(false);
    }
  }

  async function copyToken() {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-8 flex flex-col gap-4 text-left">
      <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Ticket className="size-4" aria-hidden="true" />
        )}
        {loading ? tokensI18n.generating : tokensI18n.generate}
      </Button>

      {newToken && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{tokensI18n.newTokenExpires}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-sm">
              {newToken.token}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToken}
              aria-label={tokensI18n.copyToken}
            >
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      )}

      {tokens.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tokens.map((token) => (
            <li key={token.id} className="rounded-xl border bg-card px-4 py-3 text-sm">
              <code className="font-mono">{token.token}</code>
              <p className="mt-1 text-xs text-muted-foreground">
                {token.usedAt
                  ? tokensI18n.usedBy.replace(
                      "{name}",
                      token.usedBy?.name ?? token.usedBy?.user?.email ?? "—",
                    )
                  : token.expiresAt < new Date()
                    ? tokensI18n.expired
                    : tokensI18n.available}
                {" · "}
                {tokensI18n.createdOn.replace(
                  "{date}",
                  new Date(token.createdAt).toLocaleDateString(locale === "pt" ? "pt-BR" : "es-ES"),
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
