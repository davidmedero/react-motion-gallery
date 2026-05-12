import {
  BREAKPOINT_MAP,
  resolveNumberFromResponsive,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";

export type WrappedTransformArgs = {
  length: number;
  sign: number;
  gap?: number;
};

export function normalizeFullscreenSliderGap(gap: number | undefined) {
  return typeof gap === "number" && Number.isFinite(gap) ? Math.max(0, gap) : 0;
}

export function resolveFullscreenSliderGap(
  gap: ResponsiveNumber | undefined,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  return normalizeFullscreenSliderGap(
    resolveNumberFromResponsive(gap, 0, viewportWidth, breakpointMap)
  );
}

function createTranslateX(slots: number, sign: number, gap: number) {
  const percent = slots * 100 * sign;
  const px = slots * gap * sign;

  if (percent === 0 && px === 0) return "translateX(0%)";
  if (px === 0) return `translateX(${percent}%)`;
  if (percent === 0) return `translateX(${px}px)`;

  const op = px < 0 ? "-" : "+";
  return `translateX(calc(${percent}% ${op} ${Math.abs(px)}px))`;
}

export function createWrappedTransform({ length, sign, gap }: WrappedTransformArgs) {
  const resolvedGap = normalizeFullscreenSliderGap(gap);

  return (index: number) => {
    const originalCount = length - 2;
    if (index === 0) return createTranslateX(-1, sign, resolvedGap);
    if (index === length - 1) return createTranslateX(originalCount, sign, resolvedGap);
    return createTranslateX(index - 1, sign, resolvedGap);
  };
}

export function createSingleTransform() {
  return () => `translateX(0%)`;
}
