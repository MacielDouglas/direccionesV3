"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type MeetingActionResult,
  refreshMeetingWeek,
  removeMeetingConnection,
  saveMeetingConnection,
  testMeetingConnection,
} from "@/features/meetings/application/meeting.actions";
import type { MeetingConnectionStatus } from "@/features/meetings/application/meeting.service";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { I18nDictionary } from "@/lib/i18n/types";
import { useState } from "react";

type Texts = I18nDictionary["meetings"];
type BusyAction = "save" | "test" | "refresh" | "remove" | null;

export function MeetingConnectionForm({
  organizationId,
  organizationSlug,
  initial,
  defaultBaseUrl,
  texts,
}: {
  organizationId: string;
  organizationSlug: string;
  initial: MeetingConnectionStatus;
  /** Padrão do servidor (env): pré-preenche o campo, que segue editável. */
  defaultBaseUrl: string;
  texts: Texts;
}) {
  const { t } = useI18n();
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl ?? defaultBaseUrl);
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(initial.connected);
  const [savedUrl, setSavedUrl] = useState<string | null>(initial.baseUrl);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<BusyAction>(null);
  const canSubmit =
    busy === null && token.trim() !== "" && (baseUrl.trim() !== "" || defaultBaseUrl !== "");

  function done(result: MeetingActionResult, okMessage: string) {
    if (!result.ok) {
      setError(result.error ?? texts.genericError);
      return;
    }
    setError(null);
    setNotice(okMessage);
  }

  async function handleTest() {
    setBusy("test");
    setError(null);
    setNotice(null);
    const result = await testMeetingConnection({ organizationId, baseUrl, token });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setNotice(texts.weeksFound.replace("{count}", String(result.weeks)));
  }

  async function handleSave() {
    setBusy("save");
    setError(null);
    setNotice(null);
    const result = await saveMeetingConnection(
      { organizationId, baseUrl, token },
      organizationSlug,
    );
    setBusy(null);
    done(result, texts.connectionSaved);
    if (result.ok) {
      setConnected(true);
      setSavedUrl(baseUrl.trim().replace(/\/+$/, "") || defaultBaseUrl);
      setToken("");
    }
  }

  async function handleRefresh() {
    setBusy("refresh");
    setError(null);
    setNotice(null);
    const result = await refreshMeetingWeek({ organizationId }, organizationSlug);
    setBusy(null);
    done(result, texts.weekUpdated);
  }

  async function handleRemove() {
    setBusy("remove");
    setError(null);
    setNotice(null);
    const result = await removeMeetingConnection({ organizationId }, organizationSlug);
    setBusy(null);
    done(result, texts.connectionRemoved);
    if (result.ok) {
      setConnected(false);
      setSavedUrl(null);
      setBaseUrl(defaultBaseUrl);
      setToken("");
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {texts.connectionTitle}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{texts.connectionDescription}</p>
      </div>

      {notice ? (
        <output
          aria-live="polite"
          className="block text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          {notice}
        </output>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {connected && savedUrl ? (
        <div className="flex flex-col gap-3 rounded-xl bg-muted/60 p-4">
          <p className="truncate font-mono text-xs text-muted-foreground">{savedUrl}</p>
          <p className="text-xs text-muted-foreground">{texts.connectedHint}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleRefresh}
              disabled={busy !== null}
              className="min-h-11"
            >
              {busy === "refresh" ? texts.saving : texts.refreshNow}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy !== null}
                  className="min-h-11"
                >
                  {texts.removeConnection}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>{texts.removeConnection}</AlertDialogTitle>
                  <AlertDialogDescription>{texts.removeConfirm}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={busy !== null} className="min-h-11">
                    {t.common.cancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={busy !== null}
                    className="min-h-11"
                  >
                    {busy === "remove" ? texts.saving : texts.removeConnection}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meeting-base-url">{texts.baseUrlLabel}</Label>
          <Input
            id="meeting-base-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder={texts.baseUrlPlaceholder}
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meeting-token">{texts.tokenLabel}</Label>
          <Input
            id="meeting-token"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={texts.tokenPlaceholder}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="font-mono tracking-widest"
            maxLength={32}
          />
          <p className="text-xs text-muted-foreground">{texts.tokenHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSave} disabled={!canSubmit} className="min-h-11">
            {busy === "save"
              ? texts.saving
              : connected
                ? texts.replaceConnection
                : texts.saveConnection}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={!canSubmit}
            className="min-h-11"
          >
            {busy === "test" ? texts.saving : texts.testConnection}
          </Button>
        </div>
      </div>
    </div>
  );
}
