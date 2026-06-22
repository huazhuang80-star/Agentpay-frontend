// Lightweight wrapper around fetch() for the AgentPay backend API.
// Centralises base URL resolution and error handling so call sites stay
// small.

import { resolveApiBase } from "./resolveApiBase";

// Resolved at module load time so any misconfiguration surfaces during boot
// rather than at the first fetch.
const API_BASE = resolveApiBase();

export type ApiError = {
  error: string;
  message: string;
  requestId?: string;
};

export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

export class RequestTimeoutError extends Error {
  readonly error = "request_timeout";

  constructor(readonly timeoutMs: number) {
    super("request timed out");
    this.name = "RequestTimeoutError";
  }
}

export type ApiFetchInit = RequestInit & {
  /** Maximum request duration before aborting the fetch. Defaults to 10s. */
  timeoutMs?: number;
};

function abortReason(signal: AbortSignal): unknown {
  return (signal as AbortSignal & { reason?: unknown }).reason;
}

export async function apiFetch<T>(
  path: string,
  init: ApiFetchInit = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, signal: callerSignal, ...fetchInit } = init;
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const abortFromCaller = () => {
    controller.abort(abortReason(callerSignal!));
  };

  if (callerSignal?.aborted) {
    abortFromCaller();
  } else {
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  if (timeoutMs > 0) {
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort(new RequestTimeoutError(timeoutMs));
    }, timeoutMs);
  }

  // Spread `init` first so caller-provided top-level keys win, then re-apply
  // `headers` so our default `Content-Type: application/json` is preserved
  // unless the caller explicitly overrides it via `init.headers`.
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...fetchInit,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(fetchInit.headers ?? {}),
      },
    });
    if (res.status === 204) return undefined as T;
    const body = (await res.json()) as T | ApiError;
    if (!res.ok) {
      const err = new Error((body as ApiError).message);
      throw Object.assign(err, body as ApiError);
    }
    return body as T;
  } catch (error) {
    if (timedOut) {
      throw new RequestTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}

export const apiGet = <T>(path: string, init?: ApiFetchInit) =>
  apiFetch<T>(path, init);
export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path: string) =>
  apiFetch<void>(path, { method: "DELETE" });
