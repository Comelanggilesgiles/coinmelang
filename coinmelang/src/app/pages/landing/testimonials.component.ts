import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import type { Testimonial } from "../../core/models";
import { AuthService, ToastService, UiService } from "../../core/services";
import { RevealDirective, SplitTextComponent, TiltDirective } from "../../shared/motion";

const BGS = ["bg-lavender", "bg-sky", "bg-lime"];
const AVATARS = ["bg-amber-200", "bg-rose-200", "bg-sky-200", "bg-emerald-200", "bg-violet-200"];

@Component({
  selector: "app-testimonials",
  imports: [FormsModule, RevealDirective, SplitTextComponent, TiltDirective],
  template: `
    <section id="testimonials" class="relative pb-24 pt-10 md:pb-32" style="background: linear-gradient(to bottom, #F9F8F3 0%, #F9F8F3 55%, #F2F0E8 55%)">
      <div class="mx-auto max-w-7xl px-5 md:px-10">
        <div class="text-center">
          <span reveal class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">
            <span class="tracking-tight text-amber-400">★★★★★</span>
            <span class="ml-1">{{ avg() }} from {{ items().length }} member reviews</span>
          </span>
          <h2 class="mt-5 font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"><split-text text="Testimonials" /></h2>
          <p reveal [delay]="0.2" class="mt-3 text-forest/70 sm:text-lg">See what our clients have to say about us</p>
          <div reveal [delay]="0.3" class="mt-6">
            <button (click)="write()" class="group inline-flex items-center gap-2 rounded-full border-[1.5px] border-forest px-5 py-2.5 text-sm font-semibold transition hover:bg-forest hover:text-cream">
              <span class="transition-transform group-hover:rotate-90">＋</span> Write a review
            </button>
          </div>
        </div>

        <div class="mt-14 grid gap-5 md:grid-cols-3">
          @for (r of visible(); track r.id) {
            <div class="anim-card" [style.animation-delay.ms]="($index % 3) * 120">
              <div tilt [class]="'h-full rounded-[2rem] ' + bg($index)">
                <figure class="flex min-h-[19rem] flex-col justify-between p-7">
                  <div class="flex items-center justify-between">
                    <figcaption class="flex items-center gap-3">
                      <span class="grid h-12 w-12 place-items-center rounded-full border-2 border-white font-display text-sm font-bold transition-transform duration-700 hover:rotate-[360deg]" [class]="avatar(r.name)">{{ initials(r.name) }}</span>
                      <span>
                        <span class="block font-display font-bold">{{ r.name }}</span>
                        <span class="block text-xs text-forest/60">{{ r.role }} · {{ ago(r.createdAt) }}</span>
                      </span>
                    </figcaption>
                    <svg viewBox="0 0 32 32" class="h-8 w-8 opacity-20" fill="currentColor"><path d="M13 8H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h3v1a3 3 0 0 1-3 3v3a6 6 0 0 0 6-6V8zm15 0h-6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h3v1a3 3 0 0 1-3 3v3a6 6 0 0 0 6-6V8z" /></svg>
                  </div>
                  <div>
                    <div class="mb-3 mt-8 text-sm tracking-wider">{{ '★'.repeat(r.rating) }}<span class="opacity-25">{{ '★'.repeat(5 - r.rating) }}</span></div>
                    <blockquote class="text-lg leading-snug">"{{ r.quote }}"</blockquote>
                  </div>
                </figure>
              </div>
            </div>
          } @empty {
            @for (i of [1, 2, 3]; track i) {
              <div class="skeleton h-[19rem] rounded-[2rem]"></div>
            }
          }
        </div>

        @if (items().length > limit()) {
          <div class="mt-8 text-center">
            <button (click)="limit.set(limit() + 3)" class="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition hover:scale-105">Show more reviews</button>
          </div>
        }
      </div>

      @if (open()) {
        <div class="anim-fade fixed inset-0 z-[80] grid place-items-center bg-forest/40 p-4 backdrop-blur-sm" (click)="open.set(false)">
          <form (ngSubmit)="submit()" (click)="$event.stopPropagation()" class="anim-pop w-full max-w-lg rounded-[2rem] bg-paper p-7 shadow-2xl">
            <h3 class="font-display text-2xl font-extrabold">Share your experience</h3>
            <p class="mt-1 text-sm text-forest/60">Posting as <b>{{ auth.user()?.name }}</b></p>
            <div class="mt-5 flex gap-1" (mouseleave)="hoverStar.set(0)">
              @for (s of [1, 2, 3, 4, 5]; track s) {
                <button type="button" (click)="rating.set(s)" (mouseenter)="hoverStar.set(s)" class="text-3xl transition-transform hover:scale-125" [class]="s <= (hoverStar() || rating()) ? 'text-amber-400' : 'text-forest/20'" [attr.aria-label]="s + ' stars'">★</button>
              }
            </div>
            <input name="role" [(ngModel)]="role" placeholder="Your role (e.g. Designer)" maxlength="40" class="mt-4 w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 outline-none focus:border-forest" />
            <textarea name="quote" [(ngModel)]="quote" required maxlength="280" rows="4" placeholder="What do you love about Coinmelang?" class="mt-3 w-full resize-none rounded-2xl border border-forest/15 bg-white px-4 py-3 outline-none focus:border-forest"></textarea>
            <div class="mt-1 text-right text-xs text-forest/50">{{ quote.length }}/280</div>
            <div class="mt-4 flex justify-end gap-2">
              <button type="button" (click)="open.set(false)" class="rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-forest/5">Cancel</button>
              <button [disabled]="saving()" class="flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream disabled:opacity-60">
                @if (saving()) {<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>}
                Publish review
              </button>
            </div>
          </form>
        </div>
      }
    </section>
  `,
  styles: [`.anim-card { animation: pop-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }`],
})
export class TestimonialsComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private ui = inject(UiService);
  private toast = inject(ToastService);
  items = signal<Testimonial[]>([]);
  limit = signal(3);
  open = signal(false);
  saving = signal(false);
  rating = signal(5);
  hoverStar = signal(0);
  quote = "";
  role = "";

  visible = () => this.items().slice(0, this.limit());
  avg = () => {
    const i = this.items();
    return i.length ? (i.reduce((s, t) => s + t.rating, 0) / i.length).toFixed(1) : "5.0";
  };
  bg = (i: number) => BGS[i % 3];
  avatar = (n: string) => AVATARS[[...n].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATARS.length];
  initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  ago(t: number) {
    const d = Math.floor((Date.now() - t) / 86400000);
    if (d < 1) return "today";
    if (d < 30) return `${d}d ago`;
    return new Date(t).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  async ngOnInit() {
    try {
      const { testimonials } = await this.api.get<{ testimonials: Testimonial[] }>("/api/testimonials");
      this.items.set(testimonials);
    } catch (e) {
      this.toast.error(e);
    }
  }

  write() {
    if (this.auth.isLoggedIn()) this.open.set(true);
    else {
      this.toast.show("Log in to share your review", "info");
      this.ui.openAuth("login", () => this.open.set(true));
    }
  }

  async submit() {
    this.saving.set(true);
    try {
      const { testimonial } = await this.api.post<{ testimonial: Testimonial }>("/api/testimonials", { quote: this.quote, role: this.role, rating: this.rating() });
      this.items.update((i) => [testimonial, ...i]);
      this.quote = "";
      this.open.set(false);
      this.toast.show("Thanks! Your review is live 💚");
    } catch (e) {
      this.toast.error(e);
    } finally {
      this.saving.set(false);
    }
  }
}
