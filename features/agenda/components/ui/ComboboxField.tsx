"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

interface Props {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function ComboboxField({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtra opções pelo texto digitado
  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sincroniza query com value externo (ex: reset do form)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="pr-8"
        />
        {options.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setOpen((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label="Ver opciones guardadas"
          >
            <ChevronDown className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Dropdown de sugestões */}
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md",
            "max-h-48 overflow-y-auto py-1",
          )}
        >
          {filtered.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              onMouseDown={(e) => {
                e.preventDefault(); // evita blur antes do click
                onChange(opt);
                setQuery(opt);
                setOpen(false);
              }}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors",
                opt === value && "bg-primary/10 text-primary font-medium",
              )}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
