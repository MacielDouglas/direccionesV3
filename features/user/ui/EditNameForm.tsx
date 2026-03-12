"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { updateUserNameAction } from "@/server/users/user.action";

interface Props {
  currentName: string;
}

export function EditNameForm({ currentName }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [isPending, startTransition] = useTransition();

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
      toast.success("Nombre actualizado.");
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
          aria-label="Editar nombre"
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
      aria-label="Editar nombre de usuario"
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        maxLength={60}
        aria-label="Nuevo nombre"
        className="h-9 w-48 text-base"
        disabled={isPending}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        disabled={isPending || !value.trim()}
        aria-label="Confirmar"
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
        aria-label="Cancelar"
        className="h-8 w-8 text-destructive hover:text-destructive/80"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
