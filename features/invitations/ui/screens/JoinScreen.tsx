"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyInviteTokenAction } from "../../applications/inviteToken.action";

export function JoinScreen({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [orgName, setOrgName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleJoin() {
    setStatus("loading");
    try {
      const org = await applyInviteTokenAction(token);
      setOrgName(org.name);
      setStatus("success");
      toast.success(`¡Te uniste a ${org.name}!`);

      // ✅ redireciona direto para a org em vez de "/"
      setTimeout(() => router.push("/"), 2000);
      // setTimeout(() => router.push(`/org/${org.slug}/addresses`), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al unirse.";
      setErrorMsg(msg);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h1 className="text-xl font-semibold">¡Bienvenido a {orgName}!</h1>
        <p className="text-sm text-muted-foreground">Redirigiendo…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Enlace no válido</h1>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Volver al inicio
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
          <h1 className="text-xl font-semibold">Unirse a organización</h1>
          <p className="text-sm text-muted-foreground">
            Fuiste invitado a formar parte de un equipo.
          </p>
        </div>

        <Button
          onClick={handleJoin}
          disabled={status === "loading"}
          className="w-full gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Users className="h-4 w-4" aria-hidden />
          )}
          Aceptar e ingresar
        </Button>
      </article>
    </main>
  );
}
