import { Component, Directive, ElementRef, Input, OnDestroy, OnInit, inject } from "@angular/core";
import { animate, inView, scroll } from "motion";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fade/slide element in when scrolled into view.  <div reveal [y]="40" [delay]="0.1"> */
@Directive({ selector: "[reveal]" })
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input() delay = 0;
  @Input() y = 40;
  @Input() x = 0;
  @Input() scale = 1;
  private stop?: () => void;

  ngOnInit() {
    if (reducedMotion()) return;
    animate(this.el, { opacity: 0, x: this.x, y: this.y, scale: this.scale }, { duration: 0 });
    this.stop = inView(
      this.el,
      () => {
        animate(this.el, { opacity: 1, x: 0, y: 0, scale: 1 }, { duration: 0.9, ease: EASE as any, delay: this.delay });
      },
      { margin: "0px 0px -80px 0px" },
    );
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

/** Staggers direct children in on view.  <ul stagger [each]="0.1"> */
@Directive({ selector: "[stagger]" })
export class StaggerDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input() each = 0.12;
  private stop?: () => void;
  ngOnInit() {
    if (reducedMotion()) return;
    queueMicrotask(() => {
      const kids = Array.from(this.el.children) as HTMLElement[];
      kids.forEach((k) => animate(k, { opacity: 0, y: 36 }, { duration: 0 }));
      this.stop = inView(
        this.el,
        () => {
          kids.forEach((k, i) => animate(k, { opacity: 1, y: 0 }, { duration: 0.8, ease: EASE as any, delay: i * this.each }));
        },
        { margin: "0px 0px -60px 0px" },
      );
    });
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

/** Word-by-word masked text reveal. */
@Component({
  selector: "split-text",
  template: `@for (w of words; track $index) {<span class="inline-block overflow-hidden pb-[0.1em] align-bottom"><span class="word inline-block will-change-transform">{{ w }}&nbsp;</span></span>}`,
  host: { class: "inline" },
})
export class SplitTextComponent implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input({ required: true }) text!: string;
  @Input() delay = 0;
  get words() {
    return this.text.split(" ");
  }
  private stop?: () => void;
  ngOnInit() {
    if (reducedMotion()) return;
    queueMicrotask(() => {
      const words = Array.from(this.el.querySelectorAll<HTMLElement>(".word"));
      words.forEach((w) => (w.style.transform = "translateY(110%)"));
      this.stop = inView(this.el, () => {
        words.forEach((w, i) => animate(w, { y: ["110%", "0%"] }, { duration: 0.9, ease: EASE as any, delay: this.delay + i * 0.07 }));
      });
    });
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

/** Adds `in-view` class once the element enters the viewport (for CSS-driven effects). */
@Directive({ selector: "[inViewClass]" })
export class InViewClassDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private stop?: () => void;
  ngOnInit() {
    this.stop = inView(this.el, () => {
      this.el.classList.add("in-view");
    });
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

/** Animated number counter.  <span [countTo]="87" suffix="%"></span> */
@Directive({ selector: "[countTo]" })
export class CounterDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input({ required: true }) countTo!: number;
  @Input() suffix = "";
  @Input() prefix = "";
  @Input() decimals = 0;
  private stop?: () => void;
  private fmt = (v: number) =>
    this.prefix + v.toLocaleString("en-US", { minimumFractionDigits: this.decimals, maximumFractionDigits: this.decimals }) + this.suffix;
  ngOnInit() {
    if (reducedMotion()) {
      this.el.textContent = this.fmt(this.countTo);
      return;
    }
    this.el.textContent = this.fmt(0);
    this.stop = inView(this.el, () => {
      animate(0, this.countTo, { duration: 2, ease: EASE as any, onUpdate: (v) => (this.el.textContent = this.fmt(v)) });
    });
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

/** 3D tilt + glare following the cursor. */
@Directive({
  selector: "[tilt]",
  host: {
    "(pointermove)": "move($event)",
    "(pointerleave)": "leave()",
    class: "tilt-glare",
    style: "transform-style:preserve-3d",
  },
})
export class TiltDirective {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input() max = 8;
  move(e: PointerEvent) {
    if (reducedMotion() || e.pointerType === "touch") return;
    const r = this.el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    this.el.style.setProperty("--mx", `${px * 100}%`);
    this.el.style.setProperty("--my", `${py * 100}%`);
    animate(this.el, { rotateX: (0.5 - py) * this.max * 2, rotateY: (px - 0.5) * this.max * 2, transformPerspective: 900 } as any, { type: "spring", stiffness: 200, damping: 18 });
  }
  leave() {
    animate(this.el, { rotateX: 0, rotateY: 0 }, { type: "spring", stiffness: 150, damping: 14 });
  }
}

/** Element is gently attracted to the pointer. */
@Directive({ selector: "[magnetic]", host: { "(pointermove)": "move($event)", "(pointerleave)": "leave()", class: "inline-block" } })
export class MagneticDirective {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input() strength = 0.3;
  move(e: PointerEvent) {
    if (reducedMotion() || e.pointerType === "touch") return;
    const r = this.el.getBoundingClientRect();
    animate(this.el, { x: (e.clientX - r.left - r.width / 2) * this.strength, y: (e.clientY - r.top - r.height / 2) * this.strength }, { type: "spring", stiffness: 250, damping: 15 });
  }
  leave() {
    animate(this.el, { x: 0, y: 0 }, { type: "spring", stiffness: 250, damping: 12 });
  }
}

/** Scroll-linked vertical parallax. */
@Directive({ selector: "[parallax]" })
export class ParallaxDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input() parallax = 50;
  private stop?: () => void;
  ngOnInit() {
    if (reducedMotion()) return;
    const o = this.parallax;
    this.stop = scroll(animate(this.el, { y: [o, -o] }, { ease: "linear" }), { target: this.el, offset: ["start end", "end start"] });
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

/** Top-of-page scroll progress bar. */
@Component({
  selector: "scroll-progress",
  template: `<div #bar class="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-lime via-sky to-lavender" style="transform:scaleX(0)"></div>`,
})
export class ScrollProgressComponent implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private stop?: () => void;
  ngOnInit() {
    const bar = this.el.firstElementChild as HTMLElement;
    this.stop = scroll(animate(bar, { scaleX: [0, 1] }, { ease: "linear" }));
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

/** Floating, spinning, draggable coin with spring snap-back. */
@Component({
  selector: "app-coin",
  host: {
    class: "absolute z-20 block cursor-grab touch-none select-none active:cursor-grabbing",
    "(pointerdown)": "down($event)",
    "aria-hidden": "true",
  },
  template: `
    <div class="coin-float h-full w-full" [style.animation-delay.s]="delay">
      <div class="coin-spin grid h-full w-full place-items-center rounded-full border-[2.5px] border-forest bg-white font-display font-extrabold text-forest shadow-[3px_3px_0_0_#1F3A33] transition-transform duration-300 hover:scale-110" [style.animation-delay.s]="delay">
        <div class="grid h-[78%] w-[78%] place-items-center rounded-full border-2 border-dashed border-forest/60">
          <span class="leading-none">{{ symbol }}</span>
        </div>
      </div>
    </div>
  `,
})
export class CoinComponent implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  @Input() symbol = "₿";
  @Input() delay = 0;
  private stop?: () => void;

  ngOnInit() {
    if (reducedMotion()) return;
    animate(this.el, { opacity: 0, scale: 0, rotate: -90 }, { duration: 0 });
    this.stop = inView(this.el, () => {
      animate(this.el, { opacity: 1, scale: 1, rotate: 0 }, { type: "spring", stiffness: 180, damping: 12, delay: 0.4 + this.delay * 0.3 });
    });
  }
  ngOnDestroy() {
    this.stop?.();
  }

  down(e: PointerEvent) {
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    animate(this.el, { scale: 1.2 }, { duration: 0.2 });
    const move = (ev: PointerEvent) => animate(this.el, { x: ev.clientX - sx, y: ev.clientY - sy }, { duration: 0 });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      animate(this.el, { x: 0, y: 0, scale: 1 }, { type: "spring", stiffness: 300, damping: 12 });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
}

export const MOTION = [
  RevealDirective,
  StaggerDirective,
  SplitTextComponent,
  CounterDirective,
  TiltDirective,
  MagneticDirective,
  ParallaxDirective,
  ScrollProgressComponent,
  CoinComponent,
] as const;
