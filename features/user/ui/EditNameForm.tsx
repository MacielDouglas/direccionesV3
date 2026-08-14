"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { updateUserNameAction } from "@/server/users/user.action";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  currentName: string;
}

export function EditNameForm({ currentName }: Props) {
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
      const result = await updateUserNameAction({ name: value.trim() });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t.user.editNameSuccess);
      setEditing(false);
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
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
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
        maxLength={60}
        aria-label={t.user.newNameAria}
        className="h-9 w-48 text-base"
        disabled={isPending}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        disabled={isPending || !value.trim()}
        aria-label={t.common.confirm}
        className="h-8 w-8 text-green-600 hover:text-green-700"
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
        className="h-8 w-8 text-destructive hover:text-destructive/80"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
