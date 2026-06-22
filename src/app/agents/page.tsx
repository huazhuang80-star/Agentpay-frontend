"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/apiClient";
import { formatRequests } from "@/lib/format";

type StatsResponse = {
  totalServices: number;
  totalApiKeys: number;
  totalRequests: number;
  uniqueAgents: number;
  paused: boolean;
};

type AgentItem = string | { agent?: string; name?: string; total?: number };
type AgentsResponse = {
  items?: AgentItem[];
  agents?: AgentItem[];
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
};

const PAGE_SIZE = 25;

export default function AgentsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [agents, setAgents] = useState<AgentItem[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<StatsResponse>("/api/v1/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setError(null);
    apiGet<AgentsResponse>(`/api/v1/agents?limit=${PAGE_SIZE}&page=${page}`)
      .then((body) => {
        const nextItems = body.items ?? body.agents ?? [];
        setAgents(nextItems);
        setHasNextPage(
          body.hasNextPage ?? (body.totalPages !== undefined ? page < body.totalPages : nextItems.length === PAGE_SIZE)
        );
      })
      .catch((e) => {
        setAgents([]);
        setHasNextPage(false);
        setError(e.message);
      });
  }, [page]);

  const normalisedAgents = useMemo(
    () =>
      (agents ?? [])
        .map((item) =>
          typeof item === "string"
            ? { name: item, total: undefined }
            : { name: item.agent ?? item.name ?? "", total: item.total }
        )
        .filter((item) => item.name.length > 0),
    [agents]
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-3xl flex-col gap-6 p-8 focus:outline-none"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Agents</h1>
      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
      {stats && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <strong>{stats.uniqueAgents}</strong> unique agent(s) seen across{" "}
          <strong>{stats.totalServices}</strong> services.
        </p>
      )}

      <section aria-labelledby="agent-directory-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="agent-directory-heading" className="text-xl font-medium">
            Agent directory
          </h2>
          <span className="text-xs text-zinc-500">Page {page}</span>
        </div>

        {agents === null && <p>Loading...</p>}
        {agents !== null && normalisedAgents.length === 0 && (
          <p className="text-sm text-zinc-500">No agents found yet.</p>
        )}
        {normalisedAgents.length > 0 && (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {normalisedAgents.map((agent) => (
              <li key={agent.name}>
                <Link
                  href={`/agents/${encodeURIComponent(agent.name)}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-900"
                >
                  <span className="font-mono">{agent.name}</span>
                  {typeof agent.total === "number" && (
                    <span className="text-zinc-500">
                      {formatRequests(agent.total)} requests
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-700"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasNextPage}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-700"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
