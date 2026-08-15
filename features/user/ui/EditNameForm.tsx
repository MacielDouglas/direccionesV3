"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { updatePersonName } from "@/server/person";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  currentName: string;
  personId: string;
  organizationId: string;
  organizationSlug: string;
}

export function EditNameForm({ currentName, personId, organizationId, organizationSlug }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === currentName) {
      setEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        await updatePersonName(organizationId, personId, value.trim(), organizationSlug);
        toast.success(t.user.editNameSuccess);
        setEditing(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors.generic);
      }
    });
  };

  const handleCancel = () => {
    setValue(currentName);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold">{currentName}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditing(true)}
          aria-label={t.user.editNameAria}
          className="size-11 rounded-lg text-brand hover:bg-white/10 hover:text-brand"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
      aria-label={t.user.editNameFormAria}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        maxLength={80}
        aria-label={t.user.newNameAria}
        className="h-11 w-48 border-white/25 bg-transparent text-base text-white placeholder:text-white/50 focus-visible:border-white/40"
        disabled={isPending}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        disabled={isPending || !value.trim()}
        aria-label={t.common.confirm}
        className="size-11 text-green-400 hover:bg-white/10 hover:text-green-300"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleCancel}
        disabled={isPending}
        aria-label={t.common.cancel}
        className="size-11 text-red-300 hover:bg-white/10 hover:text-red-200"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
