"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CheckCircle, Loader2, Users, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { applyInviteTokenAction } from "../../applications/inviteToken.action";

export function JoinScreen({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [orgName, setOrgName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleJoin() {
    setStatus("loading");
    try {
      // Server Action: vincula a Pessoa, marca token como usado
      const org = await applyInviteTokenAction(token);

      setOrgName(org.name);
      setStatus("success");
      toast.success(t.invitations.joiningSuccess.replace("{orgName}", org.name));

      // Redireciona para a página da organização após 1.5s
      setTimeout(() => {
        router.push(`/org/${org.slug}`);
        router.refresh();
      }, 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t.invitations.joinError;
      setErrorMsg(msg);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h1 className="text-xl font-semibold">
          {t.invitations.welcomeTitle.replace("{orgName}", orgName ?? "")}
        </h1>
        <p className="text-sm text-muted-foreground">{t.invitations.redirecting}</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">{t.invitations.invalidLink}</h1>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          {t.invitations.backToHome}
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4">
      <article className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm flex flex-col gap-5 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-brand/10 p-4">
            <Users className="h-8 w-8 text-brand" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold">{t.invitations.joinTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.invitations.joinDescription}</p>
        </div>

        <Button onClick={handleJoin} disabled={status === "loading"} className="w-full gap-2">
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Users className="h-4 w-4" aria-hidden />
          )}
          {t.invitations.acceptAndJoin}
        </Button>
      </article>
    </main>
  );
}
