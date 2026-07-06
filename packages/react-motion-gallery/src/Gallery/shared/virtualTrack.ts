export type SliderVirtualizationOptions = {
  enabled?: boolean;
  overscan?: number;
  threshold?: number;
};

export type FixedVirtualTrackMetrics = {
  count: number;
  viewport: number;
  cellsPerSlide: number;
  cellSize: number;
  gap: number;
  stride: number;
  baseSpan: number;
  trackSpan: number;
};

export type FixedVirtualTrackItem = {
  virtualIndex: number;
  canonicalIndex: number;
  offset: number;
};

export type FixedVirtualTrackWindow = {
  enabled: boolean;
  from: number;
  to: number;
  items: FixedVirtualTrackItem[];
};

const DEFAULT_OVERSCAN = 2;
const DEFAULT_THRESHOLD = 40;
const DEFAULT_VIEWPORT_EPSILON = 0.75;

export function normalizeVirtualIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

export function resolveSliderVirtualizationOptions(
  options: SliderVirtualizationOptions | undefined
) {
  return {
    enabled: options?.enabled === true,
    overscan:
      typeof options?.overscan === "number" && Number.isFinite(options.overscan)
        ? Math.max(0, Math.trunc(options.overscan))
        : DEFAULT_OVERSCAN,
    threshold:
      typeof options?.threshold === "number" && Number.isFinite(options.threshold)
        ? Math.max(0, Math.trunc(options.threshold))
        : DEFAULT_THRESHOLD,
  };
}

export function resolveFixedVirtualTrackMetrics(args: {
  count: number;
  viewport: number;
  cellsPerSlide: number;
  gap: number;
  loop?: boolean;
}): FixedVirtualTrackMetrics | null {
  const count = Math.max(0, Math.trunc(args.count));
  const viewport = Number(args.viewport);
  const cellsPerSlide = Number(args.cellsPerSlide);
  const gap = Math.max(0, Number(args.gap) || 0);

  if (
    count <= 0 ||
    !Number.isFinite(viewport) ||
    viewport <= 0 ||
    !Number.isFinite(cellsPerSlide) ||
    cellsPerSlide <= 0
  ) {
    return null;
  }

  const visibleCells = Math.max(1, cellsPerSlide);
  const cellSize = (viewport - gap * Math.max(0, visibleCells - 1)) / visibleCells;
  if (!Number.isFinite(cellSize) || cellSize <= 0) return null;

  const stride = cellSize + gap;
  const baseSpan = count * cellSize + Math.max(0, count - 1) * gap;
  const trackSpan = args.loop && baseSpan > 0 ? baseSpan + gap : baseSpan;

  return {
    count,
    viewport,
    cellsPerSlide: visibleCells,
    cellSize,
    gap,
    stride,
    baseSpan,
    trackSpan,
  };
}

export function resolveFixedVirtualTrackMetricsFromCellSize(args: {
  count: number;
  viewport: number;
  cellSize: number;
  gap: number;
  loop?: boolean;
}): FixedVirtualTrackMetrics | null {
  const count = Math.max(0, Math.trunc(args.count));
  const viewport = Number(args.viewport);
  const cellSize = Number(args.cellSize);
  const gap = Math.max(0, Number(args.gap) || 0);

  if (
    count <= 0 ||
    !Number.isFinite(viewport) ||
    viewport <= 0 ||
    !Number.isFinite(cellSize) ||
    cellSize <= 0
  ) {
    return null;
  }

  const stride = cellSize + gap;
  const cellsPerSlide = Math.max(1, Math.floor((viewport + gap) / stride));
  const baseSpan = count * cellSize + Math.max(0, count - 1) * gap;
  const trackSpan = args.loop && baseSpan > 0 ? baseSpan + gap : baseSpan;

  return {
    count,
    viewport,
    cellsPerSlide,
    cellSize,
    gap,
    stride,
    baseSpan,
    trackSpan,
  };
}

export function fixedVirtualTrackMetricsMatchViewport(
  metrics: FixedVirtualTrackMetrics,
  viewport: number,
  epsilon = DEFAULT_VIEWPORT_EPSILON
) {
  const nextViewport = Number(viewport);
  if (!Number.isFinite(nextViewport) || nextViewport <= 0) return false;
  return Math.abs(metrics.viewport - nextViewport) <= Math.max(0, epsilon);
}

function resolveFixedVirtualTrackOverscanPx(
  metrics: FixedVirtualTrackMetrics,
  itemOverscan: number
) {
  const requested = Math.max(0, itemOverscan) * metrics.stride;
  return Math.max(requested, metrics.viewport);
}

export function buildFixedVirtualTrackWindow(args: {
  metrics: FixedVirtualTrackMetrics;
  scrollOffset: number;
  loop?: boolean;
  options?: SliderVirtualizationOptions;
}): FixedVirtualTrackWindow {
  const { metrics } = args;
  const options = resolveSliderVirtualizationOptions(args.options);
  const renderFull = (): FixedVirtualTrackWindow => ({
    enabled: false,
    from: 0,
    to: Math.max(0, metrics.count - 1),
    items: Array.from({ length: metrics.count }, (_, index) => ({
      virtualIndex: index,
      canonicalIndex: index,
      offset: index * metrics.stride,
    })),
  });

  if (
    !options.enabled ||
    metrics.count <= 0 ||
    metrics.count <= options.threshold ||
    metrics.viewport <= 0 ||
    metrics.stride <= 0
  ) {
    return renderFull();
  }

  const rawScrollOffset =
    typeof args.scrollOffset === "number" && Number.isFinite(args.scrollOffset)
      ? args.scrollOffset
      : 0;
  const scrollOffset = args.loop
    ? rawScrollOffset
    : Math.max(
        0,
        Math.min(rawScrollOffset, Math.max(0, metrics.baseSpan - metrics.viewport))
      );
  const overscanPx = resolveFixedVirtualTrackOverscanPx(
    metrics,
    options.overscan
  );
  let from = Math.floor((scrollOffset - overscanPx) / metrics.stride);
  let to = Math.ceil((scrollOffset + metrics.viewport + overscanPx) / metrics.stride) - 1;

  if (!args.loop) {
    from = Math.max(0, from);
    to = Math.min(metrics.count - 1, to);
  }

  if (to < from) return renderFull();

  const windowSize = to - from + 1;
  if (!args.loop && windowSize >= metrics.count) return renderFull();

  const items = Array.from({ length: windowSize }, (_, offset) => {
    const virtualIndex = from + offset;
    return {
      virtualIndex,
      canonicalIndex: normalizeVirtualIndex(virtualIndex, metrics.count),
      offset: virtualIndex * metrics.stride,
    };
  });

  return {
    enabled: true,
    from,
    to,
    items,
  };
}

export function sameFixedVirtualTrackWindow(
  a: FixedVirtualTrackWindow | null | undefined,
  b: FixedVirtualTrackWindow
) {
  return (
    sameFixedVirtualTrackWindowItems(a, b) &&
    a!.items.every((item, index) => b.items[index]?.offset === item.offset)
  );
}

export function sameFixedVirtualTrackWindowItems(
  a: FixedVirtualTrackWindow | null | undefined,
  b: FixedVirtualTrackWindow
) {
  return (
    !!a &&
    a.enabled === b.enabled &&
    a.from === b.from &&
    a.to === b.to &&
    a.items.length === b.items.length &&
    a.items.every((item, index) => {
      const other = b.items[index];
      return (
        other?.virtualIndex === item.virtualIndex &&
        other.canonicalIndex === item.canonicalIndex
      );
    })
  );
}

export function accumulateFixedVirtualTrackRebaseOffset(
  currentOffset: number,
  loopShift: number
) {
  const current = Number.isFinite(currentOffset) ? currentOffset : 0;
  const shift = Number.isFinite(loopShift) ? loopShift : 0;
  return current - shift;
}

let didWarnVirtualFallback = false;

export function warnSliderVirtualizationFallback(message: string) {
  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "production"
  ) {
    return;
  }

  if (didWarnVirtualFallback) return;
  didWarnVirtualFallback = true;
  console.warn(message);
}
