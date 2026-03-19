"use client";

import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  return (
    <Button onClick={() => signIn(next)} className="w-full">
      Iniciar sesión con Google
    </Button>
  );
}
