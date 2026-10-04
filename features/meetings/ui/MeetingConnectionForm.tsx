"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type MeetingActionResult,
  refreshMeetingWeek,
  removeMeetingConnection,
  saveMeetingConnection,
} from "@/features/meetings/application/meeting.actions";
import type { MeetingConnectionStatus } from "@/features/meetings/application/meeting.service";
import type { I18nDictionary } from "@/lib/i18n/types";
import { useState } from "react";

type Texts = I18nDictionary["meetings"];

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
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl ?? defaultBaseUrl);
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(initial.connected);
  const [savedUrl, setSavedUrl] = useState<string | null>(initial.baseUrl);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function done(result: MeetingActionResult, okMessage: string) {
    if (!result.ok) {
      setError(result.error ?? texts.genericError);
      return;
    }
    setError(null);
    setNotice(okMessage);
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await saveMeetingConnection(
      { organizationId, baseUrl, token },
      organizationSlug,
    );
    setBusy(false);
    done(result, texts.connectionSaved);
    if (result.ok) {
      setConnected(true);
      setSavedUrl(baseUrl.trim().replace(/\/+$/, "") || defaultBaseUrl);
      setToken("");
    }
  }

  async function handleRefresh() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await refreshMeetingWeek({ organizationId }, organizationSlug);
    setBusy(false);
    done(result, texts.weekUpdated);
  }

  async function handleRemove() {
    if (!window.confirm(texts.removeConfirm)) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await removeMeetingConnection({ organizationId }, organizationSlug);
    setBusy(false);
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
        <output className="block text-sm font-medium text-emerald-600 dark:text-emerald-400">
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
            <Button type="button" size="sm" onClick={handleRefresh} disabled={busy}>
              {busy ? texts.saving : texts.refreshNow}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRemove}
              disabled={busy}
            >
              {texts.removeConnection}
            </Button>
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
        <div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={busy || !token || (!baseUrl.trim() && !defaultBaseUrl)}
          >
            {busy ? texts.saving : connected ? texts.replaceConnection : texts.saveConnection}
          </Button>
        </div>
      </div>
    </div>
  );
}
