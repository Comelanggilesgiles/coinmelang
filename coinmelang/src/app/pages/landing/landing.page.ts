import { Component } from "@angular/core";
import { ContactComponent, CtaComponent } from "./contact.component";
import { FeaturesComponent } from "./features.component";
import { HeroComponent } from "./hero.component";
import { TestimonialsComponent } from "./testimonials.component";

@Component({
  selector: "app-landing",
  imports: [HeroComponent, FeaturesComponent, TestimonialsComponent, CtaComponent, ContactComponent],
  template: `
    <app-hero />
    <app-features />
    <app-testimonials />
    <app-cta />
    <app-contact />
  `,
})
export class LandingPage {}
