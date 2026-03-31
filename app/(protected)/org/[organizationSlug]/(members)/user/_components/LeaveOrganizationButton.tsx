"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Role } from "@/domains/member/types/role.types";
import { leaveOrganizationAction } from "@/server/organization/leave-organization.action";

export function LeaveOrganizationButton({
  organizationId,
  organizationName,
  role,
}: {
  organizationId: string;
  organizationName: string;
  role: Role;
}) {
  const [isLoading, setIsLoading] = useState(false);

  if (role === "owner") return null;

  async function handleLeave() {
    try {
      setIsLoading(true);
      await leaveOrganizationAction(organizationId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao sair.");
      setIsLoading(false);
    }
  }

  const description =
    role === "member" ? (
      <>
        <p>
          Tus <strong>tarjetas asignadas</strong> y{" "}
          <strong>tus propias tarjetas</strong> se liberarán para otros
          usuarios. Tus <strong>direcciones registradas</strong> se conservarán.
          <span className="uppercase text-red-500 font-semibold">
            Toda su información personal será borrada y eliminada de esta
            organización, aún tendra acceso a la aplicación con otras
            organizaciones a las que pertenezca.
          </span>{" "}
          según nuestra condiciones de uso.
        </p>
      </>
    ) : (
      <>
        <p>
          Tus <strong>tarjetas y registros enviados</strong> se conservarán.
          Perderás el acceso a la applicación y tus tarjetas asignadas se
          liberarán.
          <span className="uppercase text-red-500 font-semibold">
            Toda su información personal será borrada y eliminada de esta
            aplicación,
          </span>{" "}
          según nuestra condiciones de uso.
        </p>
      </>
    );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <LogOut className="size-4" aria-hidden />
          Abandonar la organización
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Salir de {organizationName}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90 gap-2"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4" aria-hidden />
            )}
            Confirmar salida
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
