import { getServerDictionary } from "@/lib/i18n/server";

export default async function ConditionPage() {
  const t = await getServerDictionary();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:py-10">
      <section className="rounded-2xl border bg-card p-6 shadow-xs">
        <h1 className="text-3xl font-semibold tracking-tight">{t.terms.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.terms.intro}</p>
      </section>

      <div className="flex flex-col gap-6 text-base text-foreground/80">
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">{t.terms.generalTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t.terms.generalItem1}</li>
            <li>{t.terms.generalItem2}</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">{t.terms.privacyTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t.terms.privacyItem1}</li>
            <li>{t.terms.privacyItem2}</li>
            <li>{t.terms.privacyItem3}</li>
            <li>{t.terms.privacyItem4}</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-xs sm:p-6 dark:border-amber-800 dark:bg-amber-950/30">
          <h2 className="text-xl font-semibold tracking-tight text-amber-800 dark:text-amber-300">
            {t.terms.adminTitle}
          </h2>
          <p>{t.terms.adminText}</p>
        </div>
      </div>
    </main>
  );
}
