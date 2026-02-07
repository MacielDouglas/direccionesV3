"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logout sucesso!!!");
          redirect("/login");
        },
      },
    });
  };

  return (
    <Button
      variant="destructive"
      className="mt-6"
      onClick={signOut}
      disabled={loading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Salir
    </Button>
  );
}
