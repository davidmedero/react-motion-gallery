export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function easeOutCubic(t: number) {
  t = clamp(t, 0, 1);
  return 1 - Math.pow(1 - t, 3);
}