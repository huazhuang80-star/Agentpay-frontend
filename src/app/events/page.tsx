"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { safeFormatTimestamp, safeStringify } from "@/lib/format";
import { useDebounce } from "@/lib/useDebounce";

type AppEvent = {
  id: string;
  ts: number;
  type: string;
  payload: Record<string, unknown>;
};

export default function EventsPage() {
  const [items, setItems] = useState<AppEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const debouncedTypeFilter = useDebounce(typeFilter.trim().toLowerCase(), 250);

  const loadEvents = useCallback(() => {
    setError(null);
    apiGet<{ items: AppEvent[] }>("/api/v1/events?limit=100")
      .then((body) => setItems(body.items))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(loadEvents, 10_000);
    return () => window.clearInterval(id);
  }, [autoRefresh, loadEvents]);

  const visibleItems = useMemo(() => {
    if (!items) return null;
    if (!debouncedTypeFilter) return items;
    return items.filter((event) =>
      String(event.type ?? "").toLowerCase().includes(debouncedTypeFilter)
    );
  }, [debouncedTypeFilter, items]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-6 p-8 focus:outline-none"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Event log</h1>

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-medium">Filter by event type</span>
          <input
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            placeholder="usage.recorded"
            className="rounded-md border border-zinc-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.target.checked)}
          />
          <span>Auto-refresh every 10s</span>
        </label>
        <button
          type="button"
          onClick={loadEvents}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
      {!items && !error && <p>Loading...</p>}
      {visibleItems && visibleItems.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No events yet.</p>
      )}
      {visibleItems && visibleItems.length > 0 && (
        <ol className="flex flex-col gap-2 text-sm">
          {visibleItems.map((event, index) => (
            <li
              key={`${index}-${String(event.id ?? "")}`}
              className="rounded border border-zinc-200 p-3 font-mono text-xs dark:border-zinc-800"
            >
              <div className="flex justify-between gap-4 text-zinc-500">
                <span className="break-all">{String(event.type ?? "")}</span>
                <span className="shrink-0">{safeFormatTimestamp(event.ts)}</span>
              </div>
              <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words">
                {safeStringify(event.payload)}
              </pre>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
