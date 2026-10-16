import { Injectable, signal } from "@angular/core";
import { createBackend, type Backend } from "../../../server/core.mjs";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const TOKEN_KEY = "coinmelang_token";
const DB_KEY = "coinmelang_db_v1";

/**
 * Talks to the Node.js API (server/index.mjs). If no server is reachable
 * (e.g. the static build is hosted on its own), it transparently falls back to
 * the *same* backend core running in the browser, persisted in localStorage.
 */
@Injectable({ providedIn: "root" })
export class ApiService {
  readonly mode = signal<"checking" | "server" | "browser">("checking");
  private readonly base: string = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  private local?: Backend;
  private readonly ready = this.detect();

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  set token(v: string | null) {
    if (v) localStorage.setItem(TOKEN_KEY, v);
    else localStorage.removeItem(TOKEN_KEY);
  }

  private async detect() {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`${this.base}/api/health`, { signal: ctrl.signal });
      clearTimeout(t);
      const json = await res.json();
      if (res.ok && json?.ok) {
        this.mode.set("server");
        return;
      }
    } catch {
      /* no server → browser mode */
    }
    this.local = createBackend({
      load: () => {
        try {
          return JSON.parse(localStorage.getItem(DB_KEY) || "null");
        } catch {
          return null;
        }
      },
      save: (db) => localStorage.setItem(DB_KEY, JSON.stringify(db)),
    });
    this.mode.set("browser");
  }

  get<T>(path: string) {
    return this.request<T>("GET", path);
  }
  post<T>(path: string, body: unknown = {}) {
    return this.request<T>("POST", path, body);
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    await this.ready;
    let status: number;
    let data: any;
    if (this.mode() === "server") {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (this.token) headers.Authorization = `Bearer ${this.token}`;
      try {
        const res = await fetch(`${this.base}${path}`, { method, headers, body: method === "GET" ? undefined : JSON.stringify(body ?? {}) });
        status = res.status;
        data = await res.json().catch(() => ({}));
      } catch {
        throw new ApiError("Network error — is the server running?", 0);
      }
    } else {
      // simulate a little network latency so loading states feel real
      if (method !== "GET") await new Promise((r) => setTimeout(r, 350));
      ({ status, data } = await this.local!.handle(method, path, body, this.token));
    }
    if (status >= 400) throw new ApiError(data?.error || "Request failed", status);
    return data as T;
  }
}
