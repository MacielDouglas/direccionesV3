"use client";

import { useState, useRef, useEffect, useId } from "react";
import {
  CheckIcon,
  ChevronsUpDown,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddressSuggestions } from "../../hooks/useAddressSuggestions";

interface Props {
  value: string;
  onChange: (val: string) => void;
  existing: string[];
  placeholder?: string;
  label?: string;
  error?: string;
  inputClassName?: string;
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function SmartCombobox({
  value,
  onChange,
  existing,
  placeholder = "Escribe o selecciona...",
  label,
  error,
  inputClassName,
}: Props) {
  const id = useId();
  const listboxId = `${id}-listbox`;

  // ✅ inputValue é totalmente local — sem sincronização com effect
  // value inicial vem da prop (ex: edit mode), depois é controlado pelo usuário
  const [inputValue, setInputValue] = useState(value ?? "");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions } = useAddressSuggestions({
    existing,
    query: inputValue,
  });

  // Fecha ao clicar fora — único useEffect permitido aqui
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setOpen(true);
  }

  function handleSelect(suggestion: { value: string; isNew: boolean }) {
    setInputValue(suggestion.value);
    onChange(suggestion.value);
    setOpen(false);
    inputRef.current?.blur();
  }

  // Aviso de similaridade — só quando fechado
  const similarButDifferent = !open
    ? existing.find(
        (e) =>
          normalize(e) === normalize(inputValue) &&
          e !== inputValue &&
          inputValue.length > 1,
      )
    : null;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={!!error}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "flex h-10 w-full bg-background px-3 py-2 pr-9 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none",
            !inputClassName &&
              "rounded-md border border-input focus-visible:ring-2 focus-visible:ring-ring",
            error && "border-destructive",
            inputClassName,
          )}
        />
        <ChevronsUpDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>

      {/* Aviso de similaridade */}
      {similarButDifferent && (
        <div
          role="alert"
          className="flex items-start gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            Ya existe <strong>&ldquo;{similarButDifferent}&rdquo;</strong>.{" "}
            <button
              type="button"
              className="font-semibold underline underline-offset-2"
              onClick={() =>
                handleSelect({ value: similarButDifferent, isNew: false })
              }
            >
              ¿Usar este?
            </button>
          </span>
        </div>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label ?? "Sugerencias"}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg"
        >
          {suggestions.map((s, i) => {
            const isSelected = normalize(s.value) === normalize(value);
            return (
              <li
                key={i}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isSelected && "bg-accent/60",
                )}
              >
                {s.isNew ? (
                  <>
                    <PlusCircle
                      className="h-4 w-4 shrink-0 text-brand"
                      aria-hidden
                    />
                    <span>
                      Agregar{" "}
                      <strong className="text-brand">
                        &ldquo;{s.value}&rdquo;
                      </strong>
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      nuevo
                    </span>
                  </>
                ) : (
                  <>
                    <CheckIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "text-brand" : "text-transparent",
                      )}
                      aria-hidden
                    />
                    <span className="flex-1">{s.value}</span>
                    {s.score < 0.6 && (
                      <span className="ml-auto text-xs text-amber-500">
                        similar
                      </span>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
