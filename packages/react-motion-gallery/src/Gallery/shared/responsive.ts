import {
  BREAKPOINT_MAP,
  effectiveViewportWidth,
  type BreakpointMap,
} from "./responsiveNumber";
import type { ThumbnailPosition } from "../thumbnails/types";
import type { FsCaptionPlacement } from "../fullscreen/types";

export {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_HEIGHT,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  effectiveViewportHeight,
  effectiveViewportWidth,
  normalizeResponsiveNumberRules,
  normalizeResponsiveToMinWidthRules,
  parseNumberLike,
  resolveNumberFromResponsive,
  resolveResponsiveNumberRuleValue,
} from "./responsiveNumber";
export type {
  BreakpointMap,
  ResponsiveNumber,
  ResponsiveNumberRule,
} from "./responsiveNumber";

export type ResponsiveLengthValue = number | string;

export type ResponsiveLength =
  | ResponsiveLengthValue
  | Record<string, ResponsiveLengthValue>;

export type ResponsiveBoolean =
  | boolean
  | Array<boolean>
  | Record<string, boolean>;

export type ResponsivePosition =
  | ThumbnailPosition
  | Array<ThumbnailPosition>
  | Record<string, ThumbnailPosition>;

export type ResponsiveCaptionPlacement =
  | FsCaptionPlacement
  | Array<FsCaptionPlacement>
  | Record<string, FsCaptionPlacement>;

export function parseLengthLike(
  v: ResponsiveLengthValue | undefined,
  fallback: number,
  referenceSize: number
): number {
  if (v == null) return fallback;
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;

  const raw = v.trim();
  if (!raw) return fallback;

  const match = raw.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(px|%)?$/i);
  if (!match) return fallback;

  const numeric = Number.parseFloat(match[1]);
  if (!Number.isFinite(numeric)) return fallback;

  // Fullscreen caption percentages are viewport-relative, not CSS parent-relative.
  if (match[2] === "%") {
    return referenceSize * (numeric / 100);
  }

  return numeric;
}

export function resolveLengthFromResponsive(
  value: ResponsiveLength | undefined,
  fallback: number,
  viewportWidth: number,
  referenceSize: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number {
  const vw = effectiveViewportWidth(viewportWidth);

  if (value == null) return fallback;

  if (typeof value === "number" || typeof value === "string") {
    return parseLengthLike(value, fallback, referenceSize);
  }

  if (Array.isArray(value)) {
    return resolveLengthFromResponsive(value[0] as any, fallback, vw, referenceSize, breakpointMap);
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
      result = resolveLengthFromResponsive(bp.value as any, result, vw, referenceSize, breakpointMap);
    }
  }

  return result;
}

export function resolveBooleanFromResponsive(
  value: ResponsiveBoolean | undefined,
  fallback: boolean,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): boolean {
  const vw = effectiveViewportWidth(viewportWidth);

  if (value == null) return fallback;
  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value[0] ?? fallback;
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
      result = resolveBooleanFromResponsive(bp.value, result, vw, breakpointMap);
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
  if (typeof value === "string") return value;

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

export function resolveCaptionPlacementFromResponsive(
  value: ResponsiveCaptionPlacement | undefined,
  fallback: FsCaptionPlacement,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): FsCaptionPlacement {
  const vw = effectiveViewportWidth(viewportWidth);

  if (value == null) return fallback;
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return (value[0] ?? fallback) as FsCaptionPlacement;
  }

  const entries = Object.entries(value)
    .map(([key, v]) => {
      const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
      return { minWidth: bp, value: v };
    })
    .sort((a, b) => a.minWidth - b.minWidth);

  let result: FsCaptionPlacement = fallback;

  for (const bp of entries) {
    if (vw >= bp.minWidth) {
      result = resolveCaptionPlacementFromResponsive(bp.value as any, result, vw, breakpointMap);
    }
  }

  return result;
}
