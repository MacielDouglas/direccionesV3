"use client";

import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function OrgSwitchButton({ name }: { name: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="default"
      disabled={pending}
      className="gap-2"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {name}
    </Button>
  );
}
