import { getServerDictionary } from "@/lib/i18n/server";

export default async function ConditionPage() {
  const t = await getServerDictionary();

  return (
    <div className="space-y-6 px-4 py-6">
      <section className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-xs">
        <h1 className="text-3xl font-semibold tracking-tight">{t.terms.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.terms.intro}</p>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 p-6 text-base text-foreground/80">
        <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs">
          <h2 className="text-xl font-semibold tracking-tight">{t.terms.generalTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t.terms.generalItem1}</li>
            <li>{t.terms.generalItem2}</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs">
          <h2 className="text-xl font-semibold tracking-tight">{t.terms.privacyTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t.terms.privacyItem1}</li>
            <li>{t.terms.privacyItem2}</li>
            <li>{t.terms.privacyItem3}</li>
            <li>{t.terms.privacyItem4}</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <h2 className="text-xl font-semibold tracking-tight text-amber-800 dark:text-amber-300">
            {t.terms.adminTitle}
          </h2>
          <p>{t.terms.adminText}</p>
        </div>
      </div>
    </div>
  );
}
