import { Injectable, computed, inject, signal } from "@angular/core";
import { ApiError, ApiService } from "./api.service";
import type { Asset, Portfolio, User } from "./models";

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */
export interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  text: string;
}

@Injectable({ providedIn: "root" })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private n = 0;
  show(text: string, kind: Toast["kind"] = "success") {
    const id = ++this.n;
    this.toasts.update((t) => [...t, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), 4200);
  }
  error(e: unknown) {
    this.show(e instanceof ApiError || e instanceof Error ? e.message : "Something went wrong", "error");
  }
  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

/* ------------------------------------------------------------------ */
/* UI state (modals)                                                   */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: "root" })
export class UiService {
  readonly authModal = signal<null | "login" | "signup">(null);
  readonly afterAuth = signal<(() => void) | null>(null);
  openAuth(mode: "login" | "signup", then?: () => void) {
    this.afterAuth.set(then ?? null);
    this.authModal.set(mode);
  }
  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: "root" })
export class AuthService {
  private api = inject(ApiService);
  readonly user = signal<User | null>(null);
  readonly loaded = signal(false);
  readonly isLoggedIn = computed(() => !!this.user());
  readonly initials = computed(() =>
    (this.user()?.name || "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  );

  readonly ready = this.restore();

  private async restore() {
    if (this.api.token) {
      try {
        const { user } = await this.api.get<{ user: User }>("/api/auth/me");
        this.user.set(user);
      } catch {
        this.api.token = null;
      }
    }
    this.loaded.set(true);
  }

  async login(email: string, password: string) {
    const r = await this.api.post<{ token: string; user: User }>("/api/auth/login", { email, password });
    this.api.token = r.token;
    this.user.set(r.user);
    return r.user;
  }

  async signup(name: string, email: string, password: string) {
    const r = await this.api.post<{ token: string; user: User }>("/api/auth/signup", { name, email, password });
    this.api.token = r.token;
    this.user.set(r.user);
    return r.user;
  }

  async logout() {
    try {
      await this.api.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
    this.api.token = null;
    this.user.set(null);
  }
}

/* ------------------------------------------------------------------ */
/* Market data (polled)                                                */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: "root" })
export class MarketService {
  private api = inject(ApiService);
  readonly assets = signal<Asset[]>([]);
  readonly btc = computed(() => this.assets().find((a) => a.symbol === "BTC"));
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 2000);
  }

  bySymbol(s: string) {
    return this.assets().find((a) => a.symbol === s);
  }

  async refresh() {
    try {
      const { assets } = await this.api.get<{ assets: Asset[] }>("/api/market");
      this.assets.set(assets);
    } catch {
      /* keep last snapshot */
    }
  }

  stop() {
    clearInterval(this.timer);
  }
}

/* ------------------------------------------------------------------ */
/* Portfolio                                                           */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: "root" })
export class PortfolioService {
  private api = inject(ApiService);
  readonly data = signal<Portfolio | null>(null);

  async load() {
    this.data.set(await this.api.get<Portfolio>("/api/portfolio"));
  }

  async trade(symbol: string, side: "buy" | "sell", amountUsd: number) {
    const r = await this.api.post<{ portfolio: Portfolio }>("/api/trade", { symbol, side, amountUsd });
    this.data.set(r.portfolio);
    return r;
  }

  clear() {
    this.data.set(null);
  }
}
