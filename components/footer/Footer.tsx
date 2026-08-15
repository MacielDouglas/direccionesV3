import { getServerDictionary } from "@/lib/i18n/server";
import type { Organization } from "better-auth/plugins";
import { Compass } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  organization: Organization | null;
}

const currentYear = new Date().getFullYear();

export default async function Footer({ organization }: FooterProps) {
  const t = await getServerDictionary();

  return (
    <footer
      className="footer-fixed mt-auto w-full border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 md:pb-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* Brand */}
          <div className="text-center lg:text-left">
            <Link
              href="/"
              aria-label={`${t.common.appName} — ${t.footer.tagline}`}
              className="inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Compass className="size-5 text-brand" aria-hidden="true" />
              <span className="text-lg font-medium uppercase">{t.common.appName}</span>
            </Link>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground lg:mx-0">
              {t.footer.tagline}
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label={t.footer.terms}>
            <ul className="flex flex-col items-center gap-4 text-sm sm:flex-row sm:gap-6 lg:justify-end">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {t.common.appName}
                </Link>
              </li>
              {organization?.slug && (
                <li>
                  <Link
                    href={`/org/${organization.slug}/user`}
                    className="text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {t.footer.profile}
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/condition"
                  className="text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border pt-5">
          <p className="text-center text-xs text-muted-foreground lg:text-right">
            © {currentYear} {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
