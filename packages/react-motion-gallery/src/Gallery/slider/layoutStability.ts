export const SLIDER_LAYOUT_EPSILON = 0.5;

export function roundSliderLayoutMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

export function fitsWithinSliderViewport(occupied: number, viewport: number): boolean {
  return occupied <= viewport + SLIDER_LAYOUT_EPSILON;
}

export function resolveSliderContentSpan(args: {
  baseSpan: number;
  gap: number;
  shouldLoop: boolean;
}): number {
  const { baseSpan, gap, shouldLoop } = args;
  if (!shouldLoop) return baseSpan;
  return baseSpan + (baseSpan > 0 ? gap : 0);
}

export function getSliderCenterOffset(args: {
  viewport: number;
  alignSize: number;
  centerAlign?: boolean;
}): number {
  const { viewport, alignSize, centerAlign } = args;
  if (!centerAlign || viewport <= 0 || alignSize <= 0) return 0;
  return (viewport - alignSize) / 2;
}

export function buildSliderScrollSnaps(args: {
  targets: number[];
  alignSizes: number[];
  viewport: number;
  centerAlign?: boolean;
}): number[] {
  const { targets, alignSizes, viewport, centerAlign } = args;

  return targets.map((target, index) => {
    const alignSize = alignSizes[index] ?? 0;
    return -target + getSliderCenterOffset({ viewport, alignSize, centerAlign });
  });
}

export function shouldEnableSliderLoop(args: {
  loop: boolean | undefined;
  itemCount: number;
  span: number;
  viewport: number;
}): boolean {
  const { loop, itemCount, span, viewport } = args;
  return !!loop && itemCount > 1 && !fitsWithinSliderViewport(span, viewport);
}
