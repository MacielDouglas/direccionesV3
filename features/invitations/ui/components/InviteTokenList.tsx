import { getServerDictionary } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/types";
import type { Prisma } from "@prisma/client";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { CopyTokenButton } from "./CopyTokenButton";

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
  active: { icon: Clock, color: "text-amber-500" },
  used: { icon: CheckCircle, color: "text-green-500" },
  expired: { icon: XCircle, color: "text-slate-400" },
} as const;

type Status = keyof typeof STATUS;

function getStatusLabel(
  status: Status,
  t: { tokenActive: string; tokenUsed: string; tokenExpired: string },
) {
  switch (status) {
    case "active":
      return t.tokenActive;
    case "used":
      return t.tokenUsed;
    case "expired":
      return t.tokenExpired;
  }
}

interface Props {
  tokens: TokenWithRelations[];
  locale: Locale;
}

export async function InviteTokenList({ tokens, locale }: Props) {
  const t = await getServerDictionary();
  const dateLocale = locale === "pt" ? "pt-BR" : "es-419";

  if (tokens.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{t.admin.noInvites}</p>;
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
              <div className={`flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {getStatusLabel(status, t.admin)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.admin.generatedBy
                  .replace("{name}", token.createdBy.name)
                  .replace("{date}", new Date(token.createdAt).toLocaleString(dateLocale))}
              </p>
              {token.usedBy && token.usedAt && (
                <p className="text-xs text-muted-foreground">
                  {t.admin.usedBy
                    .replace("{name}", token.usedBy.name)
                    .replace("{date}", new Date(token.usedAt).toLocaleString(dateLocale))}
                </p>
              )}
              {status === "active" && (
                <p className="text-xs text-muted-foreground">
                  {t.admin.expiresAt.replace(
                    "{date}",
                    new Date(token.expiresAt).toLocaleString(dateLocale),
                  )}
                </p>
              )}
            </div>
            {status === "active" && (
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-muted/60 px-2.5 py-1 font-mono text-base font-semibold tracking-[0.3em]">
                  {token.token}
                </code>
                <CopyTokenButton token={token.token} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
