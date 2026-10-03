"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.jsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";

/**
 * Type-to-filter select. Unlike a native <select>, the dropdown list narrows
 * as the user types (e.g. typing "alp" shows only "Alpha 1", "Alpha 2") and
 * only options from the given list can be picked — no free text.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  emptyText = "No matches found.",
  disabled = false,
  error = false,
  className,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full h-12 justify-between rounded-xl bg-slate-50 dark:bg-slate-900 px-3 text-sm font-bold",
            error ? "border-red-400" : "border-slate-200 dark:border-slate-800",
            !value && "text-muted-foreground font-normal",
            className,
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Inline tag multi-select — selected options render as removable chips
 * inside the field itself, with a plain text input right after them for
 * typing to search and add more. Matches the "Preferred Location" pattern:
 * chips + inline search, not a popover you have to reopen per pick.
 */
export function TagMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Search & select...",
  emptyText = "No matches found.",
  disabled = false,
  error = false,
  className,
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options
    .filter((opt) => !value.includes(opt) && opt.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  const addOption = (opt) => {
    onChange([...value, opt]);
    setQuery("");
  };

  const removeOption = (opt) => {
    onChange(value.filter((v) => v !== opt));
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "min-h-12 w-full rounded-xl border bg-slate-50 dark:bg-slate-900 p-2 flex flex-wrap items-center gap-1.5",
          error ? "border-red-400" : "border-slate-200 dark:border-slate-800",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
      >
        {value.map((opt) => (
          <span
            key={opt}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 pl-3 pr-2 py-1 text-xs font-bold"
          >
            {opt}
            <button type="button" onClick={() => removeOption(opt)} aria-label={`Remove ${opt}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground placeholder:font-normal py-1"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addOption(opt); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
