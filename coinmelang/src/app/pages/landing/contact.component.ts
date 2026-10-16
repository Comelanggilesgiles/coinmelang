import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import type { Stats } from "../../core/models";
import { AuthService, ToastService, UiService } from "../../core/services";
import { RevealDirective, SplitTextComponent } from "../../shared/motion";
import { StoreButtonsComponent } from "./shared.component";

@Component({
  selector: "app-cta",
  imports: [RevealDirective, SplitTextComponent, StoreButtonsComponent],
  template: `
    <section class="bg-cream px-3 py-10 md:px-6">
      <div reveal [scale]="0.94" [y]="20" class="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-forest py-20 text-cream md:py-28">
        <div aria-hidden class="blob absolute -left-20 -top-20 h-80 w-80 rounded-full bg-lime/25 blur-3xl"></div>
        <div aria-hidden class="blob absolute -bottom-24 -right-10 h-96 w-96 rounded-full bg-lavender/25 blur-3xl" style="animation-delay:-8s"></div>
        <div aria-hidden class="pointer-events-none absolute inset-x-0 top-8 overflow-hidden opacity-[0.07]">
          <div class="marquee w-max whitespace-nowrap font-display text-7xl font-extrabold">{{ ticker }}</div>
        </div>
        <div aria-hidden class="pointer-events-none absolute inset-x-0 bottom-8 overflow-hidden opacity-[0.07]">
          <div class="marquee w-max whitespace-nowrap font-display text-7xl font-extrabold" style="animation-direction:reverse">{{ ticker }}</div>
        </div>

        <div class="relative mx-auto max-w-3xl px-6 text-center">
          <h2 class="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            <split-text text="Start your crypto journey" />
            <span class="text-limedeep"><split-text text="in under 2 minutes." [delay]="0.3" /></span>
          </h2>
          <p reveal [delay]="0.4" class="mx-auto mt-6 max-w-lg text-cream/70">Sign up, get $10,000 in demo funds, and make your first trade — no paperwork, bank-grade security.</p>
          <div reveal [delay]="0.55" class="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button (click)="go()" class="rounded-2xl bg-limedeep px-7 py-4 font-display font-bold text-forest transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(181,217,107,0.8)] active:scale-95">
              {{ auth.isLoggedIn() ? 'Go to dashboard →' : 'Create free account →' }}
            </button>
            <app-store-buttons [light]="true" />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CtaComponent {
  auth = inject(AuthService);
  private ui = inject(UiService);
  private coins = ["BTC", "ETH", "SOL", "USDT", "BNB", "XRP", "ADA", "DOGE", "POL", "DOT"].join(" • ");
  ticker = `${this.coins} • ${this.coins} • ${this.coins} • `;
  go() {
    if (this.auth.isLoggedIn()) location.hash = "#/dashboard";
    else this.ui.openAuth("signup");
  }
}

@Component({
  selector: "app-contact",
  imports: [FormsModule, RevealDirective, SplitTextComponent],
  template: `
    <section id="contact" class="bg-cream py-20 md:py-28">
      <div class="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-2 md:px-10 lg:gap-16">
        <div>
          <span reveal class="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]"><span class="h-1.5 w-1.5 rounded-full bg-forest"></span> Contact</span>
          <h2 class="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl"><split-text text="Questions? We're here to help." /></h2>
          <p reveal [delay]="0.2" class="mt-5 max-w-md text-forest/70">Send us a message and a real human from our support team will get back to you within 24 hours.</p>

          <div reveal [delay]="0.3" class="mt-10 grid grid-cols-2 gap-4">
            @for (s of statCards(); track s.label) {
              <div class="rounded-3xl bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
                <div class="flex items-center gap-2 text-xs font-semibold text-forest/60"><span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>{{ s.label }}</div>
                <div class="mt-2 font-display text-3xl font-extrabold tabular-nums">{{ s.value }}</div>
              </div>
            }
          </div>
          <p reveal [delay]="0.35" class="mt-3 text-xs text-forest/50">Live community numbers from the Coinmelang API.</p>
        </div>

        <form reveal [delay]="0.15" (ngSubmit)="send()" class="rounded-[2.5rem] bg-white p-7 shadow-[0_30px_60px_-30px_rgba(31,58,51,0.35)] sm:p-9">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest/60">Name</span>
              <input name="name" [(ngModel)]="name" required class="w-full rounded-2xl border border-forest/15 bg-paper px-4 py-3 outline-none transition focus:border-forest focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,222,227,0.8)]" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest/60">Email</span>
              <input name="email" type="email" [(ngModel)]="email" required class="w-full rounded-2xl border border-forest/15 bg-paper px-4 py-3 outline-none transition focus:border-forest focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,222,227,0.8)]" />
            </label>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            @for (t of topics; track t) {
              <button type="button" (click)="topic.set(t)" class="rounded-full border px-4 py-1.5 text-xs font-semibold transition" [class]="topic() === t ? 'border-forest bg-forest text-cream' : 'border-forest/15 hover:border-forest'">{{ t }}</button>
            }
          </div>
          <label class="mt-4 block">
            <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest/60">Message</span>
            <textarea name="message" [(ngModel)]="message" required rows="5" maxlength="1000" class="w-full resize-none rounded-2xl border border-forest/15 bg-paper px-4 py-3 outline-none transition focus:border-forest focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,222,227,0.8)]"></textarea>
          </label>
          <button [disabled]="sending()" class="group relative mt-5 w-full overflow-hidden rounded-full bg-forest py-4 font-semibold text-cream transition active:scale-[.98] disabled:opacity-70">
            <span class="absolute inset-0 translate-y-full bg-limedeep transition-transform duration-500 group-hover:translate-y-0"></span>
            <span class="relative flex items-center justify-center gap-2 transition-colors group-hover:text-forest">
              @if (sending()) {<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>}
              Send message
              <span class="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </button>
        </form>
      </div>
    </section>
  `,
})
export class ContactComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  stats = signal<Stats | null>(null);
  sending = signal(false);
  topics = ["General", "Account", "Trading", "Security"];
  topic = signal("General");
  name = "";
  email = "";
  message = "";

  statCards = () => {
    const s = this.stats();
    const f = (n?: number) => (n === undefined ? "—" : n.toLocaleString("en-US"));
    return [
      { label: "Members joined", value: f(s?.users) },
      { label: "Trades executed", value: f(s?.trades) },
      { label: "Newsletter readers", value: f(s?.subscribers) },
      { label: "Reviews posted", value: f(s?.reviews) },
    ];
  };

  async ngOnInit() {
    const u = this.auth.user();
    if (u) {
      this.name = u.name;
      this.email = u.email;
    }
    this.loadStats();
    setInterval(() => this.loadStats(), 8000);
  }

  async loadStats() {
    try {
      this.stats.set(await this.api.get<Stats>("/api/stats"));
    } catch {
      /* ignore */
    }
  }

  async send() {
    this.sending.set(true);
    try {
      const r = await this.api.post<{ message: string }>("/api/contact", { name: this.name, email: this.email, message: `[${this.topic()}] ${this.message}` });
      this.message = "";
      this.toast.show(r.message);
    } catch (e) {
      this.toast.error(e);
    } finally {
      this.sending.set(false);
    }
  }
}
