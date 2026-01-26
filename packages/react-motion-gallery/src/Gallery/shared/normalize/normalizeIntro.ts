import { IntroOptions } from "../types/transitions";

export function normalizeIntro(src?: IntroOptions) {
  return {
    renderIntro: src?.renderIntro,
    staggerMs: src?.staggerMs ?? 40,
    transform: src?.transform ?? "translateY(10px) scale(0.99)",
    durationMs: src?.durationMs ?? 300,
    easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
  };
}