import { Component, ElementRef, QueryList, ViewChildren, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService, ToastService, UiService } from "../core/services";
import { MagneticDirective } from "../shared/motion";

@Component({
  selector: "app-logo",
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="group flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <span class="relative grid h-8 w-8 place-items-center overflow-hidden rounded-xl bg-forest text-lime transition-transform duration-500 group-hover:rotate-[-8deg]">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
          <path d="M17 7.5A6.5 6.5 0 1 0 17 16.5" pathLength="1" class="anim-draw" style="animation-delay:.2s" />
          <circle cx="18.5" cy="12" r="1.6" fill="currentColor" stroke="none" class="animate-pulse" />
        </svg>
        <span class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
      </span>
      Coinmelang
    </a>
  `,
})
export class LogoComponent {}

@Component({
  selector: "app-navbar",
  imports: [LogoComponent, MagneticDirective, RouterLink],
  host: { "(window:scroll)": "scrolled.set(scrollY > 40)" },
  template: `
    <header class="fixed inset-x-0 top-0 z-50 px-3 pt-3" style="animation: rise .8s cubic-bezier(.22,1,.36,1) both">
      <nav
        class="mx-auto flex items-center justify-between rounded-full px-4 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:px-6"
        [class]="scrolled() ? 'max-w-[980px] bg-white/75 py-2.5 shadow-[0_12px_40px_-16px_rgba(31,58,51,0.3)]' : 'max-w-7xl bg-transparent py-3.5'"
      >
        <app-logo />

        <ul class="relative hidden items-center gap-1 text-sm font-medium md:flex" (mouseleave)="pill.set(null)">
          @if (pill(); as p) {
            <span class="absolute top-0 h-full rounded-full bg-forest/[0.07] transition-all duration-300 ease-out" [style.left.px]="p.left" [style.width.px]="p.width"></span>
          }
          @for (l of links; track l.id) {
            <li #item (mouseenter)="hover($index)">
              <button (click)="go(l.id)" class="relative block px-4 py-2">{{ l.label }}</button>
            </li>
          }
        </ul>

        <div class="hidden items-center gap-2 md:flex">
          @if (auth.user(); as u) {
            <a routerLink="/dashboard" magnetic class="group relative overflow-hidden rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream">
              <span class="absolute inset-0 translate-y-full rounded-full bg-limedeep transition-transform duration-500 ease-out group-hover:translate-y-0"></span>
              <span class="relative transition-colors group-hover:text-forest">Dashboard →</span>
            </a>
            <div class="relative">
              <button (click)="menu.set(!menu())" class="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-lavender font-display text-sm font-bold shadow transition hover:scale-105">{{ auth.initials() }}</button>
              @if (menu()) {
                <div class="anim-pop absolute right-0 top-12 w-56 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-forest/5">
                  <div class="px-3 py-2">
                    <div class="text-sm font-bold">{{ u.name }}</div>
                    <div class="truncate text-xs text-forest/60">{{ u.email }}</div>
                  </div>
                  <a routerLink="/dashboard" (click)="menu.set(false)" class="block rounded-xl px-3 py-2 text-sm hover:bg-forest/5">Portfolio</a>
                  <button (click)="logout()" class="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Log out</button>
                </div>
              }
            </div>
          } @else {
            <button (click)="ui.openAuth('login')" class="rounded-full px-5 py-2 text-sm font-semibold transition hover:bg-forest/5">Login</button>
            <button magnetic (click)="ui.openAuth('signup')" class="group relative overflow-hidden rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream">
              <span class="absolute inset-0 translate-y-full rounded-full bg-limedeep transition-transform duration-500 ease-out group-hover:translate-y-0"></span>
              <span class="relative transition-colors duration-300 group-hover:text-forest">Sign Up →</span>
            </button>
          }
        </div>

        <button class="relative grid h-10 w-10 place-items-center rounded-full bg-forest text-cream md:hidden" (click)="open.set(!open())" aria-label="Toggle menu">
          <span class="absolute h-0.5 w-4 rounded bg-current transition-transform duration-300" [style.transform]="open() ? 'rotate(45deg)' : 'translateY(-4px)'"></span>
          <span class="absolute h-0.5 w-4 rounded bg-current transition-transform duration-300" [style.transform]="open() ? 'rotate(-45deg)' : 'translateY(4px)'"></span>
        </button>
      </nav>

      @if (open()) {
        <div class="anim-pop mx-auto mt-2 max-w-md rounded-3xl bg-white/95 p-4 shadow-2xl backdrop-blur-xl md:hidden">
          @for (l of links; track l.id) {
            <button (click)="go(l.id)" class="anim-rise block w-full rounded-2xl px-4 py-3 text-left font-display text-lg font-bold hover:bg-forest/5" [style.animation-delay.ms]="$index * 60">{{ l.label }}</button>
          }
          <div class="mt-3 flex gap-2">
            @if (auth.user()) {
              <a routerLink="/dashboard" (click)="open.set(false)" class="flex-1 rounded-full bg-forest py-3 text-center text-sm font-semibold text-cream">Dashboard</a>
              <button (click)="logout()" class="flex-1 rounded-full border-[1.5px] border-forest py-3 text-sm font-semibold">Log out</button>
            } @else {
              <button (click)="open.set(false); ui.openAuth('login')" class="flex-1 rounded-full border-[1.5px] border-forest py-3 text-sm font-semibold">Login</button>
              <button (click)="open.set(false); ui.openAuth('signup')" class="flex-1 rounded-full bg-forest py-3 text-sm font-semibold text-cream">Sign Up</button>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);
  ui = inject(UiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  scrolled = signal(false);
  open = signal(false);
  menu = signal(false);
  pill = signal<{ left: number; width: number } | null>(null);
  @ViewChildren("item") items!: QueryList<ElementRef<HTMLElement>>;
  links = [
    { id: "about", label: "About" },
    { id: "explore", label: "Explore" },
    { id: "testimonials", label: "Testimonials" },
    { id: "contact", label: "Contact" },
  ];

  hover(i: number) {
    const el = this.items?.get(i)?.nativeElement;
    if (el) this.pill.set({ left: el.offsetLeft, width: el.offsetWidth });
  }

  async go(id: string) {
    this.open.set(false);
    if (this.router.url !== "/" && this.router.url !== "") {
      await this.router.navigateByUrl("/");
      setTimeout(() => this.ui.scrollTo(id), 350);
    } else this.ui.scrollTo(id);
  }

  async logout() {
    this.menu.set(false);
    this.open.set(false);
    await this.auth.logout();
    this.toast.show("You've been logged out. See you soon! 👋", "info");
    this.router.navigateByUrl("/");
  }
}
