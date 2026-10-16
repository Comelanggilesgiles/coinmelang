// Angular runs in JIT mode inside the Vite build (templates are compiled at runtime).
import "@angular/compiler";
import "./index.css";
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from "@angular/router";
import { App, routes } from "./app/app";

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withInMemoryScrolling({ scrollPositionRestoration: "top" }), withViewTransitions()),
  ],
}).catch((err) => console.error(err));
