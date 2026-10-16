import { Component, inject } from "@angular/core";
import { Router, RouterOutlet, type CanActivateFn, type Routes } from "@angular/router";
import { AuthService, UiService } from "./core/services";
import { FooterComponent } from "./layout/footer.component";
import { NavbarComponent } from "./layout/navbar.component";
import { AuthModalComponent, ToastsComponent } from "./layout/overlays.component";
import { DashboardPage } from "./pages/dashboard/dashboard.page";
import { LandingPage } from "./pages/landing/landing.page";
import { ScrollProgressComponent } from "./shared/motion";

const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const ui = inject(UiService);
  const router = inject(Router);
  await auth.ready;
  if (auth.isLoggedIn()) return true;
  ui.openAuth("login", () => router.navigateByUrl("/dashboard"));
  return router.parseUrl("/");
};

export const routes: Routes = [
  { path: "", component: LandingPage, title: "Coinmelang — The Future of Money is Here" },
  { path: "dashboard", component: DashboardPage, canActivate: [authGuard], title: "Dashboard · Coinmelang" },
  { path: "**", redirectTo: "" },
];

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuthModalComponent, ToastsComponent, ScrollProgressComponent],
  template: `
    <scroll-progress />
    <app-navbar />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-auth-modal />
    <app-toasts />
  `,
})
export class App {}
