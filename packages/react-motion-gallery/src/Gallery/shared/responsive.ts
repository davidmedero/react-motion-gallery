import type { ThumbnailPosition } from "../thumbnails/types";

export const BREAKPOINT_MAP: Record<string, number> = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export type BreakpointMap = Record<string, number>;

export type ResponsiveNumber =
  | number
  | Record<string, number>;

export type ResponsivePosition =
  | ThumbnailPosition
  | Array<ThumbnailPosition>
  | Record<string, ThumbnailPosition>;

export function parseNumberLike(v: number | string | undefined, fallback: number): number {
  if (v == null) return fallback;
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}

export function effectiveViewportWidth(raw: number): number {
  if (raw > 0) return raw;
  if (typeof window !== 'undefined' && window.innerWidth > 0) return window.innerWidth;
  return 1024;
}

export function resolveNumberFromResponsive(
  value: ResponsiveNumber | undefined,
  fallback: number,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number {
  const vw = effectiveViewportWidth(viewportWidth);

  if (value == null) return fallback;

  if (typeof value === 'number' || typeof value === 'string') {
    return parseNumberLike(value as any, fallback);
  }

  if (Array.isArray(value)) {
    return resolveNumberFromResponsive(value[0] as any, fallback, vw, breakpointMap);
  }

  const entries = Object.entries(value)
    .map(([key, v]) => {
      const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
      return { minWidth: bp, value: v };
    })
    .sort((a, b) => a.minWidth - b.minWidth);

  let result = fallback;

  for (const bp of entries) {
    if (vw >= bp.minWidth) {
      result = resolveNumberFromResponsive(bp.value as any, result, vw, breakpointMap);
    }
  }

  return result;
}

export function resolvePositionFromResponsive(
  value: ResponsivePosition | undefined,
  fallback: ThumbnailPosition,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): ThumbnailPosition {
  const vw = effectiveViewportWidth(viewportWidth);

  if (value == null) return fallback;
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    return (value[0] ?? fallback) as ThumbnailPosition;
  }

  const entries = Object.entries(value)
    .map(([key, v]) => {
      const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
      return { minWidth: bp, value: v };
    })
    .sort((a, b) => a.minWidth - b.minWidth);

  let result: ThumbnailPosition = fallback;

  for (const bp of entries) {
    if (vw >= bp.minWidth) {
      result = resolvePositionFromResponsive(bp.value as any, result, vw, breakpointMap);
    }
  }

  return result;
}

export function normalizeResponsiveToMinWidthRules(
    value: ResponsiveNumber | undefined,
    fallback: number,
    breakpointMap: BreakpointMap
  ): Array<{ minWidth: number; count: number }> {
    if (value == null) return [{ minWidth: 0, count: fallback }];

    if (typeof value === 'number' || typeof value === 'string') {
      const n = Math.floor(parseNumberLike(value as any, fallback));
      return [{ minWidth: 0, count: Math.max(0, n) }];
    }

    if (Array.isArray(value)) {
      return normalizeResponsiveToMinWidthRules(value[0] as any, fallback, breakpointMap);
    }

    const entries = Object.entries(value)
      .map(([key, v]) => {
        const bp =
          breakpointMap[key] ??
          (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
        const n = Math.floor(parseNumberLike(v as any, fallback));
        return { minWidth: bp, count: Math.max(0, n) };
      })
      .sort((a, b) => a.minWidth - b.minWidth);

    if (entries.length === 0) return [{ minWidth: 0, count: fallback }];

    if (entries[0].minWidth > 0) {
      entries.unshift({ minWidth: 0, count: fallback });
    } else if (entries[0].minWidth < 0) {
      entries[0] = { ...entries[0], minWidth: 0 };
    }

    return entries;
  }
