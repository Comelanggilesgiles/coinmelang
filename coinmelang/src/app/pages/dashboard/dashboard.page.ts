import { Component, OnDestroy, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { formatUsd, sparkPoints } from "../../core/models";
import { AuthService, MarketService, PortfolioService, ToastService } from "../../core/services";
import { RevealDirective, StaggerDirective, TiltDirective } from "../../shared/motion";

@Component({
  selector: "app-dashboard",
  imports: [FormsModule, RevealDirective, StaggerDirective, TiltDirective],
  template: `
    <section class="relative min-h-screen overflow-hidden bg-cream pb-20 pt-28">
      <div aria-hidden class="blob absolute -left-40 top-10 h-96 w-96 rounded-full bg-lime/50 blur-3xl"></div>
      <div aria-hidden class="blob absolute -right-40 top-1/2 h-96 w-96 rounded-full bg-sky/60 blur-3xl" style="animation-delay:-5s"></div>

      <div class="relative mx-auto max-w-7xl px-5 md:px-10">
        <!-- header -->
        <div class="anim-rise flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p class="text-sm font-medium text-forest/60">{{ greeting() }},</p>
            <h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{{ firstName() }} 👋</h1>
          </div>
          <div class="flex items-center gap-2 self-start rounded-full bg-white/70 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur sm:self-auto">
            <span class="relative flex h-2 w-2"><span class="absolute h-full w-full animate-ping rounded-full opacity-75" [class]="api.mode() === 'server' ? 'bg-emerald-500' : 'bg-amber-400'"></span><span class="relative h-2 w-2 rounded-full" [class]="api.mode() === 'server' ? 'bg-emerald-500' : 'bg-amber-400'"></span></span>
            {{ api.mode() === 'server' ? 'Live · Node.js API' : 'Demo · In-browser API' }}
          </div>
        </div>

        <!-- stat cards -->
        <div stagger [each]="0.08" class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          @for (s of statCards(); track s.label) {
            <div tilt [max]="6" class="rounded-[1.75rem] p-5 sm:p-6" [class]="s.bg">
              <div class="text-xs font-semibold uppercase tracking-wider opacity-70">{{ s.label }}</div>
              @if (pf()) {
                <div class="mt-3 font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{{ s.value }}</div>
                <div class="mt-1 text-xs font-semibold" [class]="s.subClass">{{ s.sub }}</div>
              } @else {
                <div class="skeleton mt-3 h-8 w-32 rounded-lg"></div>
                <div class="skeleton mt-2 h-3 w-16 rounded"></div>
              }
            </div>
          }
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <!-- market -->
          <div reveal class="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-30px_rgba(31,58,51,0.4)]">
            <div class="flex items-center justify-between border-b border-forest/5 p-6">
              <div>
                <h2 class="font-display text-xl font-extrabold">Market</h2>
                <p class="text-xs text-forest/50">Prices update every 2 seconds</p>
              </div>
              <input [(ngModel)]="query" name="q" placeholder="Search…" class="w-36 rounded-full border border-forest/10 bg-paper px-4 py-2 text-sm outline-none transition focus:w-48 focus:border-forest" />
            </div>
            <div class="divide-y divide-forest/5">
              @for (a of filtered(); track a.symbol) {
                <button (click)="select(a.symbol)" class="group grid w-full grid-cols-[1.4fr_1fr_auto] items-center gap-3 px-6 py-4 text-left transition hover:bg-paper sm:grid-cols-[1.4fr_1fr_1fr_6rem]" [class.bg-lime]="selected() === a.symbol" [class.bg-opacity-40]="selected() === a.symbol">
                  <span class="flex items-center gap-3">
                    <span class="grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold text-white shadow-inner transition-transform group-hover:scale-110" [style.background]="a.color">{{ a.symbol.slice(0, 3) }}</span>
                    <span><span class="block text-sm font-bold">{{ a.name }}</span><span class="block text-xs text-forest/50">{{ a.symbol }}</span></span>
                  </span>
                  <span class="font-display text-sm font-bold tabular-nums">{{ usd(a.price) }}</span>
                  <span class="hidden text-sm font-semibold sm:block" [class]="a.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ a.change24h >= 0 ? '▲' : '▼' }} {{ abs(a.change24h).toFixed(2) }}%</span>
                  <svg viewBox="0 0 100 30" class="h-8 w-20 sm:w-24" preserveAspectRatio="none"><polyline [attr.points]="spark(a.history)" fill="none" [attr.stroke]="a.change24h >= 0 ? '#16a34a' : '#dc2626'" stroke-width="1.8" stroke-linejoin="round" vector-effect="non-scaling-stroke" /></svg>
                </button>
              } @empty {
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <div class="flex items-center gap-3 px-6 py-4"><div class="skeleton h-10 w-10 rounded-full"></div><div class="skeleton h-4 flex-1 rounded"></div></div>
                }
              }
            </div>
          </div>

          <!-- trade panel -->
          <div class="flex flex-col gap-6">
            <form reveal [delay]="0.1" (ngSubmit)="trade()" class="rounded-[2rem] bg-forest p-6 text-cream shadow-[0_30px_60px_-30px_rgba(31,58,51,0.8)]">
              <div class="flex items-center justify-between">
                <h2 class="font-display text-xl font-extrabold">Trade</h2>
                @if (asset(); as a) {
                  <span class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><span class="h-2 w-2 rounded-full" [style.background]="a.color"></span>{{ a.symbol }} · {{ usd(a.price) }}</span>
                }
              </div>

              <div class="relative mt-5 grid grid-cols-2 rounded-full bg-white/10 p-1 text-sm font-semibold">
                <span class="absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]" [class]="side() === 'buy' ? 'bg-limedeep' : 'bg-lavender'" [style.transform]="side() === 'buy' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))'"></span>
                <button type="button" (click)="side.set('buy')" class="relative z-10 py-2.5 transition-colors" [class.text-forest]="side() === 'buy'">Buy</button>
                <button type="button" (click)="side.set('sell')" class="relative z-10 py-2.5 transition-colors" [class.text-forest]="side() === 'sell'">Sell</button>
              </div>

              <label class="mt-5 block">
                <span class="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-wider text-cream/60">
                  <span>Amount (USD)</span>
                  <span class="normal-case tracking-normal">Max {{ usd(maxAmount()) }}</span>
                </span>
                <div class="flex items-center rounded-2xl bg-white/10 px-4 ring-limedeep transition focus-within:ring-2">
                  <span class="text-2xl font-bold text-cream/50">$</span>
                  <input name="amount" type="number" min="1" step="any" [ngModel]="amount()" (ngModelChange)="amount.set(+$event || 0)" class="w-full bg-transparent px-2 py-3.5 font-display text-2xl font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </label>
              <div class="mt-3 grid grid-cols-4 gap-2">
                @for (p of [0.1, 0.25, 0.5, 1]; track p) {
                  <button type="button" (click)="amount.set(floor2(maxAmount() * p))" class="rounded-xl bg-white/10 py-2 text-xs font-bold transition hover:bg-white/20 active:scale-95">{{ p === 1 ? 'MAX' : p * 100 + '%' }}</button>
                }
              </div>
              <div class="mt-4 flex justify-between text-sm text-cream/70">
                <span>You {{ side() === 'buy' ? 'receive' : 'sell' }}</span>
                <span class="font-semibold tabular-nums text-cream">≈ {{ qty().toFixed(6) }} {{ selected() }}</span>
              </div>
              <button [disabled]="busy() || amount() < 1" class="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 font-display font-bold text-forest transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98] disabled:translate-y-0 disabled:opacity-50" [class]="side() === 'buy' ? 'bg-limedeep' : 'bg-lavender'">
                @if (busy()) {<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>}
                {{ side() === 'buy' ? 'Buy' : 'Sell' }} {{ asset()?.name || selected() }}
              </button>
            </form>

            <!-- allocation -->
            <div reveal [delay]="0.2" class="rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(31,58,51,0.4)]">
              <h2 class="font-display text-xl font-extrabold">Allocation</h2>
              <div class="mt-4 flex items-center gap-5">
                <div class="relative h-32 w-32 shrink-0">
                  <svg viewBox="0 0 42 42" class="h-full w-full -rotate-90">
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#ECECEA" stroke-width="6" />
                    @for (s of segments(); track s.label) {
                      <circle cx="21" cy="21" r="15.9" fill="none" [attr.stroke]="s.color" stroke-width="6" pathLength="100" [attr.stroke-dasharray]="s.pct + ' ' + (100 - s.pct)" [attr.stroke-dashoffset]="-s.offset" class="transition-all duration-700" />
                    }
                  </svg>
                  <div class="absolute inset-0 grid place-items-center text-center">
                    <div><div class="text-[10px] font-semibold uppercase text-forest/50">Assets</div><div class="font-display text-lg font-extrabold">{{ pf()?.holdings?.length ?? 0 }}</div></div>
                  </div>
                </div>
                <ul class="flex-1 space-y-2 text-sm">
                  @for (s of segments(); track s.label) {
                    <li class="anim-rise flex items-center justify-between gap-2">
                      <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full" [style.background]="s.color"></span>{{ s.label }}</span>
                      <span class="font-semibold tabular-nums">{{ s.pct.toFixed(1) }}%</span>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <!-- holdings -->
          <div reveal class="rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(31,58,51,0.4)]">
            <h2 class="font-display text-xl font-extrabold">Your holdings</h2>
            <div class="mt-4 space-y-3">
              @for (h of pf()?.holdings ?? []; track h.symbol) {
                <button (click)="select(h.symbol); side.set('sell')" class="anim-rise flex w-full items-center gap-3 rounded-2xl bg-paper p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md">
                  <span class="grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold text-white" [style.background]="h.color">{{ h.symbol.slice(0, 3) }}</span>
                  <span class="flex-1"><span class="block text-sm font-bold">{{ h.name }}</span><span class="block text-xs text-forest/50">{{ h.qty.toFixed(6) }} {{ h.symbol }}</span></span>
                  <span class="text-right"><span class="block font-display text-sm font-bold tabular-nums">{{ usd(h.value) }}</span><span class="block text-xs font-semibold" [class]="h.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ h.change24h >= 0 ? '+' : '' }}{{ h.change24h.toFixed(2) }}%</span></span>
                </button>
              } @empty {
                <div class="grid place-items-center rounded-2xl border-2 border-dashed border-forest/10 py-10 text-center">
                  <div class="text-4xl">🪙</div>
                  <p class="mt-2 text-sm font-semibold">No holdings yet</p>
                  <p class="text-xs text-forest/50">Pick an asset from the market and make your first trade.</p>
                </div>
              }
            </div>
          </div>

          <!-- history -->
          <div reveal [delay]="0.1" class="rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(31,58,51,0.4)]">
            <h2 class="font-display text-xl font-extrabold">Recent activity</h2>
            <div class="mt-4 max-h-[22rem] space-y-1 overflow-y-auto pr-1">
              @for (t of pf()?.transactions ?? []; track t.id) {
                <div class="anim-rise flex items-center gap-3 rounded-2xl p-3 transition hover:bg-paper">
                  <span class="grid h-9 w-9 place-items-center rounded-full text-sm font-bold" [class]="t.side === 'buy' ? 'bg-lime' : 'bg-lavender'">{{ t.side === 'buy' ? '↓' : '↑' }}</span>
                  <span class="flex-1"><span class="block text-sm font-bold capitalize">{{ t.side }} {{ t.symbol }}</span><span class="block text-xs text-forest/50">{{ time(t.createdAt) }} · {{ t.qty.toFixed(6) }} &#64; {{ usd(t.price) }}</span></span>
                  <span class="font-display text-sm font-bold tabular-nums" [class]="t.side === 'buy' ? '' : 'text-emerald-600'">{{ t.side === 'buy' ? '-' : '+' }}{{ usd(t.usd) }}</span>
                </div>
              } @empty {
                <div class="grid place-items-center rounded-2xl border-2 border-dashed border-forest/10 py-10 text-center">
                  <div class="text-4xl">📜</div>
                  <p class="mt-2 text-sm font-semibold">No transactions yet</p>
                  <p class="text-xs text-forest/50">Your trades will show up here.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class DashboardPage implements OnInit, OnDestroy {
  api = inject(ApiService);
  private auth = inject(AuthService);
  private market = inject(MarketService);
  private portfolio = inject(PortfolioService);
  private toast = inject(ToastService);

  pf = this.portfolio.data;
  selected = signal("BTC");
  side = signal<"buy" | "sell">("buy");
  amount = signal(500);
  busy = signal(false);
  query = "";
  private timer?: ReturnType<typeof setInterval>;

  usd = formatUsd;
  abs = Math.abs;
  floor2 = (v: number) => Math.floor(v * 100) / 100;
  spark = (h: number[]) => sparkPoints(h.slice(-28));
  time = (t: number) => new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  firstName = computed(() => this.auth.user()?.name.split(" ")[0] ?? "");
  greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };
  filtered = () => {
    const q = this.query.trim().toLowerCase();
    return this.market.assets().filter((a) => !q || a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q));
  };
  asset = computed(() => this.market.bySymbol(this.selected()));
  holdingValue = computed(() => this.pf()?.holdings.find((h) => h.symbol === this.selected())?.value ?? 0);
  maxAmount = computed(() => (this.side() === "buy" ? this.pf()?.cash ?? 0 : this.holdingValue()));
  qty = computed(() => this.amount() / (this.asset()?.price || 1));

  statCards = computed(() => {
    const p = this.pf();
    const up = (p?.pnl ?? 0) >= 0;
    return [
      { label: "Total balance", value: formatUsd(p?.total ?? 0), sub: `${up ? "▲" : "▼"} ${Math.abs(p?.pnlPct ?? 0).toFixed(2)}% all time`, subClass: up ? "text-emerald-700" : "text-red-600", bg: "bg-forest text-cream" },
      { label: "Cash available", value: formatUsd(p?.cash ?? 0), sub: "Ready to invest", subClass: "opacity-60", bg: "bg-lime" },
      { label: "Invested", value: formatUsd(p?.invested ?? 0), sub: `${p?.holdings.length ?? 0} assets`, subClass: "opacity-60", bg: "bg-sky" },
      { label: "Profit / Loss", value: (up ? "+" : "") + formatUsd(p?.pnl ?? 0), sub: "vs. $10,000 start", subClass: "opacity-60", bg: "bg-lavender" },
    ];
  });

  segments = computed(() => {
    const p = this.pf();
    if (!p || p.total <= 0) return [];
    const parts = [...p.holdings.map((h) => ({ label: h.symbol, color: h.color, value: h.value })), { label: "Cash", color: "#B5D96B", value: p.cash }].filter((s) => s.value > 0.005);
    let offset = 0;
    return parts.map((s) => {
      const pct = (s.value / p.total) * 100;
      const seg = { ...s, pct, offset };
      offset += pct;
      return seg;
    });
  });

  async ngOnInit() {
    try {
      await this.portfolio.load();
    } catch (e) {
      this.toast.error(e);
    }
    this.timer = setInterval(() => this.portfolio.load().catch(() => {}), 3000);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }

  select(s: string) {
    this.selected.set(s);
    if (innerWidth < 1024) document.querySelector("form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async trade() {
    this.busy.set(true);
    try {
      const { transaction } = (await this.portfolio.trade(this.selected(), this.side(), this.amount())) as any;
      this.toast.show(`${transaction.side === "buy" ? "Bought" : "Sold"} ${transaction.qty.toFixed(6)} ${transaction.symbol} for ${formatUsd(transaction.usd)} ✅`);
    } catch (e) {
      this.toast.error(e);
    } finally {
      this.busy.set(false);
    }
  }
}
