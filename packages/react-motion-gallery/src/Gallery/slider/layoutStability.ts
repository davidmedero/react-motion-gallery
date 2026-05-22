export const SLIDER_LAYOUT_EPSILON = 0.5;

export function roundSliderLayoutMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resolveSliderMeasuredSize(args: {
  rectSize: number;
  scale?: number;
  offsetSize: number;
  marginExtentSize?: number;
}): number {
  const { rectSize, scale, offsetSize, marginExtentSize } = args;

  const normalizedRect =
    Number.isFinite(rectSize) && rectSize > 0
      ? Number.isFinite(scale) && (scale ?? 0) > 0
        ? rectSize / (scale as number)
        : rectSize
      : 0;

  const intrinsicSize = Math.max(
    Number.isFinite(offsetSize) && offsetSize > 0 ? offsetSize : 0,
    Number.isFinite(marginExtentSize) && (marginExtentSize ?? 0) > 0
      ? (marginExtentSize as number)
      : 0
  );

  return Math.max(normalizedRect, intrinsicSize);
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

export type SliderGroupCellsInput = boolean | number | undefined;

export function normalizeSliderGroupCellCount(
  total: number,
  value?: number
): number | null {
  if (!Number.isFinite(total) || total <= 0) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const count = Math.trunc(value);
  if (count <= 0) return null;

  return Math.max(1, Math.min(total, count));
}

export function resolveSliderGroupCells(args: {
  total: number;
  groupCells?: SliderGroupCellsInput;
  cellsPerSlide?: number;
}): { enabled: boolean; fixedCount: number | null } {
  const { total, groupCells, cellsPerSlide } = args;

  if (typeof groupCells === "number") {
    const numericGroupCells = normalizeSliderGroupCellCount(total, groupCells);
    if (numericGroupCells == null || numericGroupCells <= 1) {
      return { enabled: false, fixedCount: null };
    }

    return { enabled: true, fixedCount: numericGroupCells };
  }

  if (groupCells !== true) {
    return { enabled: false, fixedCount: null };
  }

  return {
    enabled: true,
    fixedCount: normalizeSliderGroupCellCount(total, cellsPerSlide),
  };
}

export function containSliderScrollSnap(args: {
  snap: number;
  viewport: number;
  contentSpan?: number;
  containScroll?: boolean;
}): number {
  const { snap, viewport, contentSpan, containScroll } = args;
  if (!containScroll || viewport <= 0 || (contentSpan ?? 0) <= viewport) return snap;

  return Math.max(viewport - (contentSpan as number), Math.min(0, snap));
}

export function buildSliderScrollSnaps(args: {
  targets: number[];
  alignSizes: number[];
  viewport: number;
  centerAlign?: boolean;
  contentSpan?: number;
  containScroll?: boolean;
}): number[] {
  const { targets, alignSizes, viewport, centerAlign, contentSpan, containScroll } = args;

  return targets.map((target, index) => {
    const alignSize = alignSizes[index] ?? 0;
    const snap = -target + getSliderCenterOffset({ viewport, alignSize, centerAlign });
    return containSliderScrollSnap({ snap, viewport, contentSpan, containScroll });
  });
}

export function mergeDuplicateContainedSliderPages<
  T extends { target: number; alignSize: number; cells: unknown[] },
>(args: {
  pages: T[];
  viewport: number;
  contentSpan?: number;
  centerAlign?: boolean;
  containScroll?: boolean;
  epsilon?: number;
}): T[] {
  const {
    pages,
    viewport,
    contentSpan,
    centerAlign,
    containScroll,
    epsilon = SLIDER_LAYOUT_EPSILON,
  } = args;

  if (!containScroll || viewport <= 0 || (contentSpan ?? 0) <= viewport) return pages;

  const merged: T[] = [];
  let previousSnap: number | null = null;

  pages.forEach((page) => {
    const rawSnap =
      -page.target +
      getSliderCenterOffset({ viewport, alignSize: page.alignSize, centerAlign });
    const snap = containSliderScrollSnap({
      snap: rawSnap,
      viewport,
      contentSpan,
      containScroll,
    });
    const previousPage = merged[merged.length - 1];

    if (
      previousPage &&
      previousSnap != null &&
      Math.abs(snap - previousSnap) <= epsilon
    ) {
      previousPage.cells = previousPage.cells.concat(page.cells);
      return;
    }

    merged.push({ ...page, cells: page.cells.slice() } as T);
    previousSnap = snap;
  });

  return merged;
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
