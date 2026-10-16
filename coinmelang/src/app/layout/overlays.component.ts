import { Component, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../core/api.service";
import { AuthService, ToastService, UiService } from "../core/services";

@Component({
  selector: "app-auth-modal",
  imports: [FormsModule],
  host: { "(document:keydown.escape)": "close()" },
  template: `
    @if (ui.authModal(); as mode) {
      <div class="anim-fade fixed inset-0 z-[80] grid place-items-center bg-forest/40 p-4 backdrop-blur-sm" (click)="close()">
        <div class="anim-pop relative w-full max-w-md overflow-hidden rounded-[2rem] bg-paper shadow-2xl" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <div class="relative overflow-hidden bg-lime px-7 pb-6 pt-7">
            <div class="blob absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky/70 blur-2xl"></div>
            <button (click)="close()" class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/70 transition hover:rotate-90 hover:bg-white" aria-label="Close">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <h3 class="relative font-display text-3xl font-extrabold tracking-tight">{{ mode === 'login' ? 'Welcome back' : 'Create account' }}</h3>
            <p class="relative mt-1 text-sm text-forest/70">{{ mode === 'login' ? 'Log in to manage your portfolio.' : 'Get $10,000 in demo funds to start trading.' }}</p>

            <div class="relative mt-5 grid grid-cols-2 rounded-full bg-white/60 p-1 text-sm font-semibold">
              <span class="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-forest transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]" [style.transform]="mode === 'login' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))'"></span>
              <button (click)="switch('login')" class="relative z-10 py-2 transition-colors" [class.text-cream]="mode === 'login'">Login</button>
              <button (click)="switch('signup')" class="relative z-10 py-2 transition-colors" [class.text-cream]="mode === 'signup'">Sign Up</button>
            </div>
          </div>

          <form class="space-y-4 p-7" (ngSubmit)="submit()">
            @if (mode === 'signup') {
              <label class="anim-rise block">
                <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest/60">Full name</span>
                <input name="name" [(ngModel)]="name" required autocomplete="name" placeholder="Satoshi Nakamoto" class="w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 outline-none transition focus:border-forest focus:shadow-[0_0_0_4px_rgba(181,217,107,0.45)]" />
              </label>
            }
            <label class="block">
              <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest/60">Email</span>
              <input name="email" type="email" [(ngModel)]="email" required autocomplete="email" placeholder="you@example.com" class="w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 outline-none transition focus:border-forest focus:shadow-[0_0_0_4px_rgba(181,217,107,0.45)]" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest/60">Password</span>
              <div class="relative">
                <input name="password" [type]="show() ? 'text' : 'password'" [(ngModel)]="password" required minlength="6" [autocomplete]="mode === 'login' ? 'current-password' : 'new-password'" placeholder="At least 6 characters" class="w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 pr-16 outline-none transition focus:border-forest focus:shadow-[0_0_0_4px_rgba(181,217,107,0.45)]" />
                <button type="button" (click)="show.set(!show())" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-forest/60 hover:bg-forest/5">{{ show() ? 'Hide' : 'Show' }}</button>
              </div>
            </label>

            @if (error()) {
              <p class="anim-rise rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{{ error() }}</p>
            }

            <button type="submit" [disabled]="loading()" class="group relative w-full overflow-hidden rounded-full bg-forest py-3.5 font-semibold text-cream transition active:scale-[.98] disabled:opacity-70">
              <span class="absolute inset-0 translate-y-full bg-limedeep transition-transform duration-500 group-hover:translate-y-0"></span>
              <span class="relative flex items-center justify-center gap-2 transition-colors group-hover:text-forest">
                @if (loading()) {
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                }
                {{ mode === 'login' ? 'Log in' : 'Create my account' }}
              </span>
            </button>
            <p class="text-center text-xs text-forest/50">
              {{ api.mode() === 'server' ? '🔒 Secured by the Coinmelang Node API' : '🔒 Demo mode — data is stored securely in your browser' }}
            </p>
          </form>
        </div>
      </div>
    }
  `,
})
export class AuthModalComponent {
  ui = inject(UiService);
  api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  name = "";
  email = "";
  password = "";
  show = signal(false);
  loading = signal(false);
  error = signal("");

  constructor() {
    effect(() => {
      document.body.style.overflow = this.ui.authModal() ? "hidden" : "";
    });
  }

  switch(m: "login" | "signup") {
    this.error.set("");
    this.ui.authModal.set(m);
  }
  close() {
    this.ui.authModal.set(null);
    this.error.set("");
  }

  async submit() {
    this.error.set("");
    this.loading.set(true);
    try {
      const mode = this.ui.authModal();
      const user = mode === "login" ? await this.auth.login(this.email, this.password) : await this.auth.signup(this.name, this.email, this.password);
      this.toast.show(mode === "login" ? `Welcome back, ${user.name.split(" ")[0]}! 👋` : `Account created — $10,000 demo funds added 🎉`);
      this.password = "";
      const next = this.ui.afterAuth();
      this.close();
      if (next) next();
      else this.router.navigateByUrl("/dashboard");
    } catch (e: any) {
      this.error.set(e?.message || "Something went wrong");
    } finally {
      this.loading.set(false);
    }
  }
}

@Component({
  selector: "app-toasts",
  template: `
    <div class="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,22rem)] flex-col gap-2">
      @for (t of toast.toasts(); track t.id) {
        <div class="anim-toast pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-xl">
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold" [class]="t.kind === 'error' ? 'bg-red-100 text-red-600' : t.kind === 'info' ? 'bg-sky' : 'bg-forest text-lime'">
            {{ t.kind === 'error' ? '!' : t.kind === 'info' ? 'i' : '✓' }}
          </span>
          <p class="flex-1 pt-1 text-sm font-medium">{{ t.text }}</p>
          <button (click)="toast.dismiss(t.id)" class="text-forest/40 hover:text-forest" aria-label="Dismiss">✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  toast = inject(ToastService);
}
