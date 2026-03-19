"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInviteTokenAction } from "../../applications/inviteToken.action";

interface Props {
  organizationId: string;
  orgSlug: string;
}

export function InviteTokenGenerator({ organizationId, orgSlug }: Props) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const token = await createInviteTokenAction({ organizationId, orgSlug });
      const url = `${process.env.NEXT_PUBLIC_URL}/login?next=/join/${token.token}`;
      setLink(url);
      toast.success("¡Enlace generado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al generar enlace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("¡Enlace copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Cualquier persona con este enlace podrá unirse como{" "}
        <strong>miembro</strong>. El enlace expira en 24 horas y es de un solo
        uso. Al generar uno nuevo, el anterior se invalida.
      </p>

      {link ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={link}
              aria-label="Enlace de invitación"
              className="flex-1 truncate rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
            />
            <Button
              type="button"
              onClick={handleCopy}
              variant={copied ? "outline" : "default"}
              className="shrink-0 gap-2"
              aria-label="Copiar enlace"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setLink(null);
              handleGenerate();
            }}
            disabled={loading}
            className="self-start gap-2 text-xs text-muted-foreground"
          >
            {loading && (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            )}
            Generar nuevo enlace
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full gap-2 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
          Generar enlace
        </Button>
      )}
    </div>
  );
}
