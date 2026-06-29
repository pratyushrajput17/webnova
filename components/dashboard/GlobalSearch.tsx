"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileSearch, Users, Ticket, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface SearchResult {
  id: string;
  label: string;
  description: string;
  href: string;
  badge?: string;
}

const badgeColors: Record<string, string> = {
  Audit: "bg-blue-100 text-blue-700",
  Competitor: "bg-indigo-100 text-indigo-700",
  STARTER: "bg-blue-100 text-blue-700",
  PRO: "bg-indigo-100 text-indigo-700",
  ENTERPRISE: "bg-amber-100 text-amber-700",
  User: "bg-zinc-100 text-zinc-700",
};

function ResultIcon({ badge }: { badge?: string }) {
  if (badge === "Audit") return <FileSearch className="h-4 w-4 text-blue-500" />;
  if (badge === "Competitor") return <TrendingUp className="h-4 w-4 text-indigo-500" />;
  if (badge === "User") return <Users className="h-4 w-4 text-zinc-500" />;
  return <Ticket className="h-4 w-4 text-amber-500" />;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("/api/search", { params: { q } });
      setResults(res.data.results);
      setOpen(res.data.results.length > 0);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      navigate(results[selectedIndex].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className="relative max-w-md flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="Search audits, competitors, codes..."
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-zinc-300 focus:bg-white"
      />
      {query && (
        <button
          onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-400">
                  No results found.
                </p>
              ) : (
                results.map((result, i) => (
                  <button
                    key={result.id + result.label}
                    onClick={() => navigate(result.href)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      i === selectedIndex ? "bg-zinc-50" : "hover:bg-zinc-50"
                    )}
                  >
                    <ResultIcon badge={result.badge} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800">
                        {result.label}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        {result.description}
                      </p>
                    </div>
                    {result.badge && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          badgeColors[result.badge] ?? "bg-zinc-100 text-zinc-600"
                        )}
                      >
                        {result.badge}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
