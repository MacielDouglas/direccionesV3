import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { Prisma } from "@prisma/client";

type TokenWithRelations = Prisma.InviteTokenGetPayload<{
  include: {
    createdBy: { select: { name: true } };
    usedBy: { select: { name: true } };
  };
}>;

function getTokenStatus(token: TokenWithRelations) {
  if (token.usedAt) return "used";
  if (token.expiresAt < new Date()) return "expired";
  return "active";
}

const STATUS = {
  active: { label: "Activo", icon: Clock, color: "text-amber-500" },
  used: { label: "Utilizado", icon: CheckCircle, color: "text-green-500" },
  expired: { label: "Expirado", icon: XCircle, color: "text-slate-400" },
} as const;

export function InviteTokenList({ tokens }: { tokens: TokenWithRelations[] }) {
  if (tokens.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No hay invitaciones generadas.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tokens.map((token) => {
        const status = getTokenStatus(token);
        const config = STATUS[status];
        const Icon = config.icon;

        return (
          <li
            key={token.id}
            className="flex flex-col gap-1.5 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-0.5">
              <div
                className={`flex items-center gap-1.5 text-sm font-medium ${config.color}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {config.label}
              </div>
              <p className="text-xs text-muted-foreground">
                Generado por {token.createdBy.name} —{" "}
                {new Date(token.createdAt).toLocaleString("es-419")}
              </p>
              {token.usedBy && (
                <p className="text-xs text-muted-foreground">
                  Usado por <strong>{token.usedBy.name}</strong> en{" "}
                  {new Date(token.usedAt!).toLocaleString("es-419")}
                </p>
              )}
              {status === "active" && (
                <p className="text-xs text-muted-foreground">
                  Expira: {new Date(token.expiresAt).toLocaleString("es-419")}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
