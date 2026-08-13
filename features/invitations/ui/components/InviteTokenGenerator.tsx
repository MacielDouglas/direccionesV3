"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Check, Copy, KeyRound, Loader2, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createInviteTokenAction } from "../../applications/inviteToken.action";

interface Props {
  organizationId: string;
  orgSlug: string;
}

export function InviteTokenGenerator({ organizationId, orgSlug }: Props) {
  const { t } = useI18n();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await createInviteTokenAction({ organizationId, orgSlug });
      setToken(result.token);
      toast.success(t.admin.tokenGenerated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.admin.tokenGenerateError);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyToken() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success(t.admin.tokenCopied);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyMessage() {
    if (!token) return;
    const message = t.admin.inviteMessage.replace("{token}", token);
    await navigator.clipboard.writeText(message);
    toast.success(t.admin.tokenMessageCopied);
  }

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-sm text-muted-foreground"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: token description contains <strong> markup
        dangerouslySetInnerHTML={{ __html: t.admin.tokenDescription }}
      />

      {token ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <code className="truncate font-mono text-sm" aria-label={t.admin.generateTitle}>
                {token}
              </code>
            </div>
            <Button
              type="button"
              onClick={handleCopyToken}
              variant={copied ? "outline" : "default"}
              className="shrink-0 gap-2"
              aria-label={t.admin.tokenCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  {t.admin.tokenCopyLabel}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  {t.admin.tokenCopy}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2.5">
            <MessageSquareText
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="flex-1 text-xs text-muted-foreground">
              {t.admin.inviteMessage.replace("{token}", token)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyMessage}
              className="shrink-0 gap-1.5 text-xs"
              aria-label={t.admin.tokenMessageLabel}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {t.admin.tokenMessageLabel}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setToken(null);
              handleGenerate();
            }}
            disabled={loading}
            className="self-start gap-2 text-xs text-muted-foreground"
          >
            {loading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
            {t.admin.generateNewToken}
          </Button>
        </div>
      ) : (
        <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 sm:w-auto">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="h-4 w-4" aria-hidden />
          )}
          {t.admin.generateToken}
        </Button>
      )}
    </div>
  );
}
