"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Building2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export type SuperOrg = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  personCount: number;
};

export function SuperUserOrganizations({ organizations }: { organizations: SuperOrg[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const dateLocale = locale === "pt" ? "pt-BR" : "es-419";

  return (
    <section aria-labelledby="super-orgs-title" className="text-left">
      <h2
        id="super-orgs-title"
        className="mb-1 flex items-center gap-2 text-base font-semibold text-foreground"
      >
        <Building2 className="size-4 text-brand" aria-hidden />
        {t.superuser.panelOrganizations}
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">{t.superuser.panelOrganizationsHint}</p>

      {organizations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          <Building2 className="size-6" aria-hidden />
          <p>{t.superuser.emptyOrganizations}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {organizations.map((org) => (
            <li
              key={org.id}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(org.createdAt).toLocaleDateString(dateLocale)} ·{" "}
                  {org.personCount === 1
                    ? t.superuser.personCountOne.replace("{count}", "1")
                    : t.superuser.personCountMany.replace("{count}", String(org.personCount))}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => router.push(`/org/${org.slug}`)}
                className="gap-2"
              >
                <LogIn className="size-3.5" aria-hidden />
                {t.superuser.enterOrg}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
