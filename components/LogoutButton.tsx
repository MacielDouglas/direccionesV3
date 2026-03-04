"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Sesión cerrada correctamente");
            window.location.href = "/login";
          },
          onError: () => {
            toast.error("Error al cerrar sesión. Intente nuevamente.");
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleSignOut}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? "Cerrando sesión…" : "Cerrar sesión"}
      className="w-full"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {loading ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  );
}
