export function getCurrentTransform(slide: HTMLElement | null) {
  if (!slide) return { x: 0, y: 0 };
  const computedStyle = window.getComputedStyle(slide);
  const transform = computedStyle.transform;
  if (!transform || transform === "none") return { x: 0, y: 0 };
  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (!matrixMatch) return { x: 0, y: 0 };
  const matrixValues = matrixMatch[1].split(",").map(parseFloat);
  const tx = matrixValues[4] || 0;
  const ty = matrixValues[5] || 0;
  return { x: tx, y: ty };
}

export function baseFitSize(
  imgEl: HTMLImageElement,
  containerW: number,
  containerH: number
) {
  const natW = imgEl.naturalWidth || imgEl.width || containerW;
  const natH = imgEl.naturalHeight || imgEl.height || containerH;
  const fit = Math.min(containerW / natW, containerH / natH);
  return { baseW: natW * fit, baseH: natH * fit };
}

export function clampNum(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export type Point = { x: number; y: number };

export function midpoint(a: Touch, b: Touch): Point {
  if (!b) return { x: a.clientX, y: a.clientY };
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

export function distance(a: Touch, b: Touch): number {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}