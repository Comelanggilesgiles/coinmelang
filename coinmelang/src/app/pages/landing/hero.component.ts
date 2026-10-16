import { Component, computed, inject, signal } from "@angular/core";
import heroImg from "../../../assets/hero.png";
import { formatUsd, sparkPoints } from "../../core/models";
import { AuthService, MarketService, UiService } from "../../core/services";
import { CoinComponent, CounterDirective, MagneticDirective } from "../../shared/motion";
import { PARTNERS, StoreButtonsComponent } from "./shared.component";

@Component({
  selector: "app-hero",
  imports: [CoinComponent, CounterDirective, MagneticDirective, StoreButtonsComponent],
  host: { "(mousemove)": "move($event)" },
  template: `
    <section id="about" class="relative overflow-hidden bg-cream pt-28 md:pt-32">
      <div aria-hidden class="blob absolute -left-32 top-20 h-96 w-96 rounded-full bg-lime/60 blur-3xl"></div>
      <div aria-hidden class="blob absolute -right-20 top-60 h-[28rem] w-[28rem] rounded-full bg-lavender/50 blur-3xl" style="animation-delay:-6s"></div>
      <div aria-hidden class="absolute inset-0 bg-[radial-gradient(#1F3A33_1px,transparent_1px)] opacity-[0.06] [background-size:22px_22px]"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 md:grid-cols-2 md:px-10 lg:gap-16">
        <div>
          <button (click)="cta()" class="anim-rise group mb-7 inline-flex items-center gap-2 rounded-full border border-forest/10 bg-white/70 py-1 pl-1 pr-4 text-xs font-semibold shadow-sm backdrop-blur transition hover:shadow-md" style="animation-delay:.3s">
            <span class="rounded-full bg-forest px-2.5 py-1 text-[10px] uppercase tracking-wider text-lime">New</span>
            $10,000 demo portfolio for every new account
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <h1 class="font-display text-[3.2rem] font-extrabold leading-[1] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            <span class="block">
              @for (w of ['The', 'Future', 'of']; track w) {
                <span class="inline-block overflow-hidden pb-2 align-bottom"><span class="anim-word inline-block" [style.animation-delay.s]="0.4 + $index * 0.08">{{ w }}&nbsp;</span></span>
              }
            </span>
            <span class="block">
              <span class="inline-block overflow-hidden pb-2 align-bottom">
                <span class="anim-word relative inline-block" style="animation-delay:.64s">
                  Money
                  <svg viewBox="0 0 200 20" class="absolute -bottom-1 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden>
                    <path d="M2 14 Q 50 2 100 10 T 198 8" pathLength="1" fill="none" stroke="#B5D96B" stroke-width="6" stroke-linecap="round" class="anim-draw" style="animation-delay:1.4s" />
                  </svg>
                </span>
              </span>
              <span class="bubble relative mx-2 inline-block align-middle transition-transform duration-300 hover:rotate-6 hover:scale-110">
                <span class="relative z-10 inline-block -translate-y-2 rounded-2xl border-[3px] border-forest bg-sky px-3 pb-1.5 text-[0.55em] leading-none shadow-[4px_4px_0_0_#1F3A33]">is</span>
                <svg viewBox="0 0 20 14" class="absolute bottom-[-2px] left-3 z-20 h-3.5 w-5" aria-hidden><path d="M1 0v12L13 1" fill="#C9DEE3" stroke="#1F3A33" stroke-width="3" stroke-linejoin="round" /></svg>
              </span>
              <span class="inline-block overflow-hidden pb-2 align-bottom"><span class="anim-word inline-block" style="animation-delay:.8s">Here</span></span>
            </span>
          </h1>

          <p class="anim-rise mt-7 max-w-md text-base leading-relaxed text-forest/70 sm:text-lg" style="animation-delay:1s">
            Explore crypto like Bitcoin, Ethereum, and more. Simply and securely buy, sell, trade, and easily manage hundreds of cryptocurrencies today.
          </p>

          <div class="anim-rise mt-9 flex flex-wrap items-center gap-4" style="animation-delay:1.15s">
            <button magnetic (click)="cta()" class="group relative overflow-hidden rounded-2xl bg-limedeep px-7 py-4 font-display font-bold shadow-[0_10px_30px_-12px_rgba(31,58,51,0.6)] transition active:scale-95">
              <span class="absolute inset-0 translate-y-full bg-forest transition-transform duration-500 group-hover:translate-y-0"></span>
              <span class="relative transition-colors group-hover:text-lime">{{ auth.isLoggedIn() ? 'Open dashboard →' : 'Start trading free →' }}</span>
            </button>
            <app-store-buttons />
          </div>

          <div class="anim-rise mt-10 flex items-center gap-8" style="animation-delay:1.4s">
            <div><span [countTo]="2.4" [decimals]="1" suffix="M+" class="font-display text-2xl font-extrabold"></span><div class="text-xs text-forest/60">Active users</div></div>
            <div><span [countTo]="350" suffix="+" class="font-display text-2xl font-extrabold"></span><div class="text-xs text-forest/60">Crypto assets</div></div>
            <div><span [countTo]="4.9" [decimals]="1" suffix="★" class="font-display text-2xl font-extrabold"></span><div class="text-xs text-forest/60">App rating</div></div>
          </div>
        </div>

        <!-- visual -->
        <div class="anim-pop relative mx-auto w-full max-w-md md:max-w-none" style="animation-delay:.4s; animation-duration:1.1s">
          <div class="relative overflow-hidden rounded-[2.75rem] bg-sky shadow-[0_40px_80px_-40px_rgba(31,58,51,0.5)] transition-transform duration-700 ease-out" [style.transform]="'translate(' + mx() * -12 + 'px,' + my() * -12 + 'px)'">
            <div aria-hidden class="absolute inset-0 scale-[2] animate-[spin_14s_linear_infinite] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.5),transparent_30%)]"></div>
            <img [src]="img" alt="Person checking crypto portfolio on a smartphone" class="relative aspect-square w-full object-cover mix-blend-multiply" />
          </div>

          <!-- live price card -->
          <div class="absolute -left-4 bottom-10 z-10 transition-transform duration-700 ease-out sm:-left-10" [style.transform]="'translate(' + mx() * 28 + 'px,' + my() * 28 + 'px)'">
            <div class="anim-pop w-56 rounded-3xl border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-xl" style="animation-delay:1.3s">
              <div class="flex items-center gap-2">
                <span class="grid h-8 w-8 place-items-center rounded-full bg-amber-400 text-sm font-extrabold text-white">₿</span>
                <div class="flex-1">
                  <div class="text-xs font-bold">Bitcoin</div>
                  <div class="flex items-center gap-1 text-[10px] text-forest/50"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>Live · BTC/USD</div>
                </div>
                @if (btc(); as b) {
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-bold" [class]="b.change24h >= 0 ? 'bg-lime' : 'bg-red-100 text-red-700'">{{ b.change24h >= 0 ? '+' : '' }}{{ b.change24h.toFixed(2) }}%</span>
                }
              </div>
              @if (btc(); as b) {
                <div class="mt-2 font-display text-xl font-extrabold tabular-nums">{{ usd(b.price) }}</div>
                <svg viewBox="0 0 100 30" class="h-10 w-full" preserveAspectRatio="none">
                  <defs><linearGradient id="hsg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#84cc16" stop-opacity=".4" /><stop offset="100%" stop-color="#84cc16" stop-opacity="0" /></linearGradient></defs>
                  <polygon [attr.points]="'0,30 ' + spark() + ' 100,30'" fill="url(#hsg)" />
                  <polyline [attr.points]="spark()" fill="none" stroke="#1F3A33" stroke-width="1.8" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                </svg>
              } @else {
                <div class="skeleton mt-2 h-6 w-28 rounded-lg"></div>
                <div class="skeleton mt-2 h-10 w-full rounded-lg"></div>
              }
            </div>
          </div>

          <!-- notification -->
          <div class="absolute -right-2 top-6 z-10 transition-transform duration-700 ease-out sm:-right-6" [style.transform]="'translate(' + mx() * 20 + 'px,' + my() * 20 + 'px)'">
            <div class="anim-pop flex items-center gap-3 rounded-2xl border border-white/60 bg-white/85 p-3 pr-5 shadow-xl backdrop-blur-xl" style="animation-delay:1.8s">
              <span class="grid h-9 w-9 animate-pulse place-items-center rounded-full bg-forest text-lime">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10" /></svg>
              </span>
              <div>
                <div class="text-xs font-bold">Purchase complete</div>
                <div class="text-[10px] text-forest/60">+0.0251 ETH received</div>
              </div>
            </div>
          </div>

          <app-coin symbol="₿" class="-left-6 top-6 h-16 w-16 text-2xl" />
          <app-coin symbol="$" [delay]="1.2" class="-right-4 top-1/2 h-20 w-20 text-3xl" />
          <app-coin symbol="Ξ" [delay]="2.4" class="bottom-[-1rem] right-1/4 h-12 w-12 text-lg" />
        </div>
      </div>

      <!-- partner marquee -->
      <div class="relative border-y border-forest/10 bg-white/40 py-7 backdrop-blur [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div class="marquee flex w-max gap-16">
          @for (p of partnerLoop; track $index) {
            <div class="flex shrink-0 items-center gap-2 font-display text-lg font-bold opacity-60 transition hover:opacity-100">
              <span class="grid h-7 w-7 place-items-center rounded-full bg-forest text-[11px] font-extrabold text-cream">{{ p.mark }}</span>
              {{ p.name }}
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .anim-word { animation: word-up 1s cubic-bezier(0.22, 1, 0.36, 1) both; }
      @keyframes word-up { from { transform: translateY(110%); } to { transform: none; } }
      .bubble { animation: bubble-pop 0.7s 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      @keyframes bubble-pop { from { transform: scale(0) rotate(-30deg); } to { transform: scale(1) rotate(-6deg); } }
    `,
  ],
})
export class HeroComponent {
  auth = inject(AuthService);
  private ui = inject(UiService);
  private market = inject(MarketService);
  img = heroImg;
  mx = signal(0);
  my = signal(0);
  btc = this.market.btc;
  spark = computed(() => sparkPoints(this.btc()?.history.slice(-24) ?? []));
  partnerLoop = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];
  usd = formatUsd;

  move(e: MouseEvent) {
    this.mx.set(e.clientX / innerWidth - 0.5);
    this.my.set(e.clientY / innerHeight - 0.5);
  }

  cta() {
    if (this.auth.isLoggedIn()) location.hash = "#/dashboard";
    else this.ui.openAuth("signup");
  }
}
