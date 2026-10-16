import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import footerImg from "../../assets/footer.png";
import { ApiService } from "../core/api.service";
import { ToastService, UiService } from "../core/services";
import { CoinComponent, ParallaxDirective, RevealDirective, StaggerDirective } from "../shared/motion";
import { LogoComponent } from "./navbar.component";

@Component({
  selector: "app-footer",
  imports: [FormsModule, LogoComponent, CoinComponent, ParallaxDirective, RevealDirective, StaggerDirective],
  template: `
    <footer class="overflow-hidden bg-cream pt-16">
      <div class="mx-auto max-w-7xl px-5 md:px-10">
        <div class="grid gap-12 border-t border-forest/10 pt-14 md:grid-cols-[1fr_1.3fr]">
          <div reveal>
            <app-logo />
            <p class="mt-5 max-w-xs font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">Bringing the exciting world of digital assets closer to you.</p>
            <form (ngSubmit)="subscribe()" class="relative mt-7 flex max-w-sm items-center gap-2 overflow-hidden rounded-full border border-forest/15 bg-white p-1.5 transition focus-within:border-forest focus-within:shadow-[0_0_0_4px_rgba(181,217,107,0.5)]">
              <input name="email" type="email" required [(ngModel)]="email" placeholder="Your email address" class="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-forest/40" />
              <button [disabled]="loading()" class="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition hover:scale-105 active:scale-95 disabled:opacity-70">
                @if (loading()) {
                  <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                }
                Subscribe
              </button>
              @if (done()) {
                <div class="anim-rise absolute inset-0 grid place-items-center rounded-full bg-lime text-sm font-bold">🎉 {{ done() }}</div>
              }
            </form>
          </div>
          <div stagger class="grid grid-cols-2 gap-8 sm:grid-cols-3">
            @for (c of columns; track c.title) {
              <div>
                <h4 class="font-display text-sm font-bold">{{ c.title }}</h4>
                <ul class="mt-4 space-y-3 text-sm text-forest/70">
                  @for (l of c.links; track l.label) {
                    <li>
                      <button (click)="l.id && ui.scrollTo(l.id)" class="group relative inline-block transition hover:text-forest">
                        {{ l.label }}
                        <span class="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-forest transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100"></span>
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>

        <div class="relative mx-auto mt-20 max-w-4xl">
          <div reveal [y]="100" class="relative overflow-hidden rounded-t-[3rem] bg-sky">
            <div [parallax]="25">
              <img [src]="img" alt="Person trading crypto on a laptop and phone" class="aspect-[16/10] w-full scale-110 object-cover mix-blend-multiply" />
            </div>
          </div>
          <app-coin symbol="₿" class="-left-2 top-1/2 h-16 w-16 text-2xl sm:-left-8 sm:h-20 sm:w-20 sm:text-3xl" />
          <app-coin symbol="$" [delay]="1.5" class="-right-2 bottom-12 h-16 w-16 text-2xl sm:-right-8 sm:h-20 sm:w-20 sm:text-3xl" />
          <app-coin symbol="₿" [delay]="0.7" class="right-1/4 top-6 h-10 w-10 text-base" />
        </div>
      </div>

      <div class="relative bg-forest pt-10 text-cream">
        <div class="mx-auto max-w-7xl overflow-hidden px-5 md:px-10">
          <div reveal [y]="80" class="flex select-none justify-center font-display text-[13.5vw] font-extrabold leading-[0.85] tracking-tighter text-lime xl:text-[10.5rem]">
            @for (ch of letters; track $index) {
              <span class="inline-block cursor-default transition-all duration-300 ease-out hover:-translate-y-4 hover:text-lavender">{{ ch }}</span>
            }
          </div>
        </div>
        <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-cream/10 px-5 py-5 text-xs text-cream/60 sm:flex-row md:px-10">
          <span>© {{ year }} Coinmelang. All rights reserved.</span>
          <span class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full" [class]="api.mode() === 'server' ? 'bg-emerald-400' : 'bg-amber-300'"></span>
            {{ api.mode() === 'server' ? 'Connected to Node API' : 'Running in-browser API' }}
          </span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  api = inject(ApiService);
  ui = inject(UiService);
  private toast = inject(ToastService);
  img = footerImg;
  year = new Date().getFullYear();
  letters = "Coinmelang".split("");
  email = "";
  loading = signal(false);
  done = signal("");
  columns = [
    { title: "Company", links: [{ label: "About", id: "about" }, { label: "Testimonials", id: "testimonials" }, { label: "Contact", id: "contact" }] },
    { title: "Resources", links: [{ label: "Help Center", id: "contact" }, { label: "Blog", id: "" }, { label: "Security", id: "explore" }] },
    { title: "Legal", links: [{ label: "Privacy Policy", id: "" }, { label: "Terms of Service", id: "" }, { label: "Cookie", id: "" }] },
  ];

  async subscribe() {
    this.loading.set(true);
    try {
      const r = await this.api.post<{ message: string }>("/api/newsletter", { email: this.email });
      this.email = "";
      this.done.set(r.message);
      setTimeout(() => this.done.set(""), 3000);
    } catch (e) {
      this.toast.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
