import { Component, inject } from "@angular/core";
import dreamImg from "../../../assets/dream.png";
import { formatUsd, sparkPoints } from "../../core/models";
import { MarketService } from "../../core/services";
import { CounterDirective, InViewClassDirective, ParallaxDirective, RevealDirective, SplitTextComponent, StaggerDirective, TiltDirective } from "../../shared/motion";

@Component({
  selector: "app-features",
  imports: [CounterDirective, InViewClassDirective, ParallaxDirective, RevealDirective, SplitTextComponent, StaggerDirective, TiltDirective],
  template: `
    <section id="explore" class="relative bg-paper py-24 md:py-32">
      <div class="mx-auto max-w-7xl px-5 md:px-10">
        <div class="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span reveal class="inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]"><span class="h-1.5 w-1.5 rounded-full bg-forest"></span> Why Coinmelang</span>
            <h2 class="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl"><split-text text="Everything you need to grow your crypto." /></h2>
          </div>
          <p reveal [delay]="0.2" class="max-w-sm text-forest/70">Built for first-timers and pros alike — trade, learn and track your goals in one beautifully simple app.</p>
        </div>

        <div class="grid gap-12 md:grid-cols-[5fr_7fr] lg:gap-16">
          <div reveal [x]="-40" [y]="0">
            <div class="group relative overflow-hidden rounded-[2.75rem] bg-lime">
              <div [parallax]="30">
                <img [src]="img" alt="Person daydreaming about skateboards and sneakers" class="aspect-[4/5] w-full scale-110 object-cover mix-blend-multiply transition-transform duration-1000 ease-out group-hover:scale-[1.16]" />
              </div>
              @for (t of tags; track t.t) {
                <span class="tag absolute rounded-full border-2 border-forest bg-white px-3 py-1.5 text-xs font-bold shadow-[3px_3px_0_0_#1F3A33]" [class]="t.c" [style.animation-delay.s]="t.d">{{ t.t }}</span>
              }
            </div>
            <p class="mt-6 max-w-sm text-sm leading-relaxed text-forest/70">The protocol is the largest onchain marketplace, with billions of dollars. Products are powered largest — turn everyday dreams into real-world goals.</p>
          </div>

          <div class="flex flex-col">
            <ul stagger [each]="0.15" class="border-t border-forest/10">
              @for (f of features; track f.title) {
                <li class="group relative grid cursor-pointer items-center gap-3 overflow-hidden border-b border-forest/10 px-2 py-7 sm:grid-cols-[1fr_1fr_auto] sm:gap-8">
                  <span class="absolute inset-0 origin-bottom scale-y-0 rounded-2xl bg-white transition-transform duration-500 ease-out group-hover:scale-y-100"></span>
                  <div class="relative flex items-center gap-4">
                    <span class="font-display text-xs font-bold text-forest/30">0{{ $index + 1 }}</span>
                    <span class="grid h-12 w-12 place-items-center rounded-2xl border border-forest/15 bg-white transition-all duration-300 group-hover:rotate-12 group-hover:border-forest group-hover:bg-forest group-hover:text-lime">
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="f.icon" /></svg>
                    </span>
                    <h3 class="font-display text-xl font-bold transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">{{ f.title }}</h3>
                  </div>
                  <p class="relative text-sm leading-relaxed text-forest/70">{{ f.desc }}</p>
                  <span class="relative hidden h-10 w-10 place-items-center overflow-hidden rounded-full border border-forest/15 sm:grid">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-8 group-hover:translate-x-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
                    <svg viewBox="0 0 24 24" class="absolute h-4 w-4 -translate-x-8 translate-y-8 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
                  </span>
                </li>
              }
            </ul>

            <!-- live mini market -->
            <div reveal class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              @for (a of market.assets().slice(0, 4); track a.symbol) {
                <div class="rounded-2xl border border-forest/10 bg-white p-3 transition hover:-translate-y-1 hover:shadow-lg">
                  <div class="flex items-center justify-between text-xs font-bold">
                    <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full" [style.background]="a.color"></span>{{ a.symbol }}</span>
                    <span [class]="a.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ a.change24h >= 0 ? '▲' : '▼' }}{{ abs(a.change24h).toFixed(1) }}%</span>
                  </div>
                  <div class="mt-1 font-display text-sm font-extrabold tabular-nums">{{ usd(a.price) }}</div>
                  <svg viewBox="0 0 100 30" class="mt-1 h-7 w-full" preserveAspectRatio="none"><polyline [attr.points]="spark(a.history)" fill="none" [attr.stroke]="a.change24h >= 0 ? '#16a34a' : '#dc2626'" stroke-width="1.6" vector-effect="non-scaling-stroke" /></svg>
                </div>
              } @empty {
                @for (i of [1, 2, 3, 4]; track i) {
                  <div class="skeleton h-[88px] rounded-2xl"></div>
                }
              }
            </div>

            <div class="mt-auto grid items-stretch gap-5 pt-8 sm:grid-cols-2">
              <div reveal class="flex flex-col justify-between rounded-[2rem] bg-forest p-7 text-cream">
                <div class="flex -space-x-3">
                  @for (c of avatars; track c.t) {
                    <span class="relative grid h-11 w-11 place-items-center rounded-full border-2 border-forest font-display text-xs font-bold text-forest transition hover:z-10 hover:-translate-y-1.5" [class]="c.c">{{ c.t }}</span>
                  }
                </div>
                <p class="mt-8 text-sm leading-relaxed text-cream/75">Join over 2 million learners building confidence with bite-sized lessons and real-time market insights.</p>
                <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-lime">Start learning →</span>
              </div>

              <div reveal [delay]="0.15">
                <div tilt inViewClass class="h-full rounded-[2rem] border border-forest/10 bg-white p-7 shadow-[0_20px_50px_-25px_rgba(31,58,51,0.35)]">
                  <div class="flex items-start justify-between">
                    <span [countTo]="87" suffix="%" class="font-display text-6xl font-extrabold tracking-tight lg:text-7xl"></span>
                    <svg viewBox="0 0 80 80" class="h-20 w-20 -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#1F3A33" stroke-opacity=".1" stroke-width="8" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#B5D96B" stroke-width="8" stroke-linecap="round" pathLength="100" stroke-dasharray="100" class="ring" />
                    </svg>
                  </div>
                  <p class="mt-10 max-w-[12rem] text-sm leading-relaxed text-forest/70">Master crypto basics, become a pro in no time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .tag { animation: tag-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both, tag-float 3s ease-in-out infinite; }
      @keyframes tag-in { from { opacity: 0; transform: scale(0); } }
      @keyframes tag-float { 50% { translate: 0 -8px; } }
      .ring { stroke-dashoffset: 100; transition: stroke-dashoffset 2s 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
      .in-view .ring { stroke-dashoffset: 13; }
    `,
  ],
})
export class FeaturesComponent {
  market = inject(MarketService);
  img = dreamImg;
  usd = formatUsd;
  abs = Math.abs;
  spark = (h: number[]) => sparkPoints(h.slice(-24));
  tags = [
    { t: "🛹 Skateboard", c: "left-4 top-8", d: 0.6 },
    { t: "👟 Sneakers", c: "right-4 top-24", d: 0.9 },
    { t: "🎧 Headphones", c: "left-6 bottom-28", d: 1.2 },
  ];
  avatars = [
    { t: "LC", c: "bg-lavender" },
    { t: "JS", c: "bg-sky" },
    { t: "PL", c: "bg-lime" },
    { t: "+2M", c: "bg-cream" },
  ];
  features = [
    { title: "Crypto Tech", desc: "The protocol is the largest onchain marketplace, with billions.", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
    { title: "Protocol Selling", desc: "We're the most trusted place for people and businesses to buy.", icon: "M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" },
    { title: "Tech Products", desc: "Buy, sell and manage crypto with billions selling.", icon: "M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" },
  ];
}
