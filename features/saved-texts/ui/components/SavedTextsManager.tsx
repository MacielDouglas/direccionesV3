"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Check, Merge, Pencil, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { mergeSavedTextsAction, renameSavedTextAction } from "../../application/saved-text.actions";
import type { SavedTextsByField } from "../../application/saved-text.service";
import type { SavedTextField } from "../../domain/saved-text.schema";

interface Props {
  initialData: SavedTextsByField;
  organizationId: string;
  organizationSlug: string;
}

const FIELDS: SavedTextField[] = ["street", "neighborhood", "city", "saida", "tipo", "territorio"];

export default function SavedTextsManager({
  initialData,
  organizationId,
  organizationSlug,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeField, setActiveField] = useState<SavedTextField>("neighborhood");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [mergeDest, setMergeDest] = useState("");
  const [mergeArmed, setMergeArmed] = useState(false);

  const tabLabels: Record<SavedTextField, string> = {
    street: t.savedTexts.tabStreet,
    neighborhood: t.savedTexts.tabNeighborhood,
    city: t.savedTexts.tabCity,
    saida: t.savedTexts.tabSaida,
    tipo: t.savedTexts.tabTipo,
    territorio: t.savedTexts.tabTerritorio,
  };

  const items = useMemo(() => {
    const all = initialData[activeField] ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((item) => item.value.toLowerCase().includes(q));
  }, [initialData, activeField, search]);

  function switchField(field: SavedTextField) {
    setActiveField(field);
    setSelected([]);
    setEditing(null);
    setMergeDest("");
    setMergeArmed(false);
  }

  function toggleSelect(value: string) {
    setMergeArmed(false);
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function usageLabel(count: number) {
    if (count <= 0) return t.savedTexts.unused;
    if (count === 1) return t.savedTexts.usageOne;
    return t.savedTexts.usageMany.replace("{count}", String(count));
  }

  function startRename(value: string) {
    setEditing(value);
    setRenameText(value);
  }

  function handleRename(from: string) {
    const to = renameText.trim();
    if (!to || to === from) {
      setEditing(null);
      return;
    }
    startTransition(async () => {
      const { error } = await renameSavedTextAction(organizationId, organizationSlug, {
        field: activeField,
        from,
        to,
      });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(t.savedTexts.renameSuccess);
      setEditing(null);
      setSelected((prev) => prev.map((v) => (v === from ? to : v)));
      router.refresh();
    });
  }

  function handleMerge() {
    const to = mergeDest.trim();
    if (selected.length < 2 || !to) return;
    if (!mergeArmed) {
      setMergeArmed(true);
      return;
    }
    startTransition(async () => {
      const { error } = await mergeSavedTextsAction(organizationId, organizationSlug, {
        field: activeField,
        froms: selected,
        to,
      });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(t.savedTexts.mergeSuccess);
      setSelected([]);
      setMergeDest("");
      setMergeArmed(false);
      router.refresh();
    });
  }

  function scrollToMerge() {
    document
      .getElementById("merge-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Aguarda o fim do scroll antes de focar o destino
    window.setTimeout(
      () => document.getElementById("merge-dest")?.focus({ preventScroll: true }),
      400,
    );
  }

  const canMerge = selected.length >= 2 && mergeDest.trim().length > 0;

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Abas por campo */}
      <div
        role="tablist"
        aria-label={t.savedTexts.title}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {FIELDS.map((field) => {
          const count = initialData[field]?.length ?? 0;
          const active = field === activeField;
          return (
            <button
              key={field}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchField(field)}
              className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {tabLabels[field]}
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  active ? "bg-white/20" : "bg-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.savedTexts.searchPlaceholder}
          aria-label={t.savedTexts.searchPlaceholder}
          className="pl-9"
        />
      </div>

      {/* Seleção */}
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          {selected.length > 0
            ? t.savedTexts.selectedCount.replace("{count}", String(selected.length))
            : tabLabels[activeField]}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelected(items.map((i) => i.value))}
            disabled={items.length === 0}
          >
            {t.savedTexts.selectAll}
          </Button>
          {selected.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected([]);
                setMergeArmed(false);
              }}
            >
              {t.savedTexts.clearSelection}
            </Button>
          )}
        </div>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t.savedTexts.emptyField}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const checked = selected.includes(item.value);
            const isEditing = editing === item.value;
            return (
              <li
                key={item.value}
                className={`rounded-2xl border bg-card transition-colors ${
                  checked ? "border-brand" : "border-border"
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2 p-3">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {t.savedTexts.renameTitle}
                    </p>
                    <Input
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      placeholder={t.savedTexts.renamePlaceholder}
                      aria-label={t.savedTexts.renamePlaceholder}
                      autoFocus
                      maxLength={200}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleRename(item.value)}
                        disabled={
                          isPending || !renameText.trim() || renameText.trim() === item.value
                        }
                        className="min-h-11 flex-1"
                      >
                        <Check className="size-4" aria-hidden="true" />
                        {isPending ? t.savedTexts.saving : t.savedTexts.renameButton}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(null)}
                        disabled={isPending}
                        className="min-h-11"
                        aria-label={t.savedTexts.cancel}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-14 items-center gap-1 p-1.5 pl-2">
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 pr-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(item.value)}
                        aria-label={item.value}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors ${
                          checked
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-muted-foreground/40 text-transparent"
                        }`}
                      >
                        <Check className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.value}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {usageLabel(item.count)}
                        </span>
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => startRename(item.value)}
                      aria-label={`${t.savedTexts.renameTitle}: ${item.value}`}
                      className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Juntar duplicados */}
      <section
        id="merge-section"
        aria-labelledby="merge-heading"
        className="scroll-mt-4 rounded-2xl border border-border bg-card p-4"
      >
        <h2 id="merge-heading" className="inline-flex items-center gap-2 text-sm font-semibold">
          <Merge className="size-4 text-brand" aria-hidden="true" />
          {t.savedTexts.mergeTitle}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{t.savedTexts.mergeHint}</p>

        <div className="mt-3 flex flex-col gap-2">
          <label htmlFor="merge-dest" className="text-xs font-medium text-muted-foreground">
            {t.savedTexts.mergeDestinationLabel}
          </label>
          <Input
            id="merge-dest"
            value={mergeDest}
            onChange={(e) => {
              setMergeDest(e.target.value);
              setMergeArmed(false);
            }}
            placeholder={t.savedTexts.mergeDestinationPlaceholder}
            list="merge-dest-options"
            maxLength={200}
            autoComplete="off"
          />
          <datalist id="merge-dest-options">
            {selected.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
          {selected.length > 0 && selected.length < 2 && (
            <p role="alert" className="text-xs text-amber-600 dark:text-amber-400">
              {t.savedTexts.mergeNeedsSelection}
            </p>
          )}
          <Button
            type="button"
            onClick={handleMerge}
            disabled={isPending || !canMerge}
            className="min-h-11 w-full"
          >
            <Merge className="size-4" aria-hidden="true" />
            {isPending
              ? t.savedTexts.saving
              : mergeArmed
                ? `${t.savedTexts.mergeButton} — ${mergeDest.trim()}?`
                : t.savedTexts.mergeButton}
          </Button>
        </div>
      </section>

      {/* Barra fixa de seleção → leva até a junção */}
      {selected.length > 0 && (
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 md:bottom-0">
          <div
            className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-card p-3 shadow-lg"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <p className="min-w-0 flex-1 truncate text-sm font-medium" aria-live="polite">
              {t.savedTexts.selectedCount.replace("{count}", String(selected.length))}
            </p>
            <Button type="button" onClick={scrollToMerge} className="min-h-11 shrink-0">
              <Merge className="size-4" aria-hidden="true" />
              {t.savedTexts.mergeTitle}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
