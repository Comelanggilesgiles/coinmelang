import { Component, Input } from "@angular/core";
import { MagneticDirective } from "../../shared/motion";

export const PARTNERS = [
  { name: "CoinMarketCap", mark: "M" },
  { name: "BitcoinCash", mark: "₿" },
  { name: "polygon", mark: "◇" },
  { name: "BitTorrent", mark: "B" },
  { name: "CONFLUX", mark: "◈" },
  { name: "TrueUSD", mark: "T" },
];

@Component({
  selector: "app-store-buttons",
  imports: [MagneticDirective],
  template: `
    <div class="flex flex-wrap gap-3">
      <a magnetic [strength]="0.2" href="https://www.apple.com/app-store/" target="_blank" rel="noopener" class="flex items-center gap-2.5 rounded-2xl px-5 py-3 shadow-[0_10px_30px_-12px_rgba(31,58,51,0.6)] transition active:scale-95" [class]="light ? 'bg-cream text-forest' : 'bg-forest text-cream'">
        <svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor"><path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.15-2.77.83-3.49.83-.72 0-1.83-.81-3-.79-1.55.02-2.97.9-3.77 2.28-1.61 2.79-.41 6.92 1.160 9.18.77 1.11 1.68 2.35 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.72c1.24-.02 2.03-1.130 2.79-2.24.88-1.29 1.24-2.53 1.26-2.6-.03-.01-2.42-.93-2.44-3.68zM14.08 5.84c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.03.08 2.07-.52 2.71-1.29z" /></svg>
        <span class="leading-tight"><span class="block text-[10px] opacity-75">Download on the</span><span class="block font-display text-base font-bold">App Store</span></span>
      </a>
      <a magnetic [strength]="0.2" href="https://play.google.com/store" target="_blank" rel="noopener" class="flex items-center gap-2.5 rounded-2xl px-5 py-3 shadow-[0_10px_30px_-12px_rgba(31,58,51,0.6)] transition active:scale-95" [class]="light ? 'bg-cream text-forest' : 'bg-forest text-cream'">
        <svg viewBox="0 0 24 24" class="h-6 w-6">
          <path d="M3.6 2.2 13.4 12l-9.8 9.8c-.36-.2-.6-.6-.6-1.1V3.3c0-.5.24-.9.6-1.1z" fill="#34D399" />
          <path d="m16.8 8.6-3.4 3.4-9.8-9.8c.3-.17.7-.18 1.06.02L16.8 8.6z" fill="#60A5FA" />
          <path d="m16.8 15.4-12.14 7.2c-.36.2-.76.19-1.06.02l9.8-9.8 3.4 3.4z" fill="#F87171" />
          <path d="m20.5 10.8c.67.4.67 1.99 0 2.4l-3.7 2.2-3.4-3.4 3.4-3.4 3.7 2.2z" fill="#FBBF24" />
        </svg>
        <span class="leading-tight"><span class="block text-[10px] uppercase opacity-75">Get it on</span><span class="block font-display text-base font-bold">Google Play</span></span>
      </a>
    </div>
  `,
})
export class StoreButtonsComponent {
  @Input() light = false;
}
