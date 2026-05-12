import { BREAKPOINT_MAP, type BreakpointMap } from "../../Gallery/shared/responsive";
import type {
  SkeletonBaseStyle,
  SkeletonBaseStyleResponsive,
  SkeletonContainerStyle,
  SkeletonContainerStyleResponsive,
} from "../../Gallery/shared/skeleton/layout";

type ResponsiveStyleValue<T extends object> = T | Record<string, T>;

type ResponsiveStyleRule<T extends object> = {
  minWidth: number;
  style: T;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseResponsiveStyleMinWidth(
  key: string,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number | null {
  const named = breakpointMap[key];
  if (Number.isFinite(named)) return Math.max(0, named);

  const numeric = Number(key);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, numeric);
}

function splitResponsiveStyle<T extends object>(
  value: ResponsiveStyleValue<T> | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): {
  baseStyle: T | undefined;
  rules: ResponsiveStyleRule<T>[];
} {
  if (!isPlainObject(value)) {
    return {
      baseStyle: value as T | undefined,
      rules: [],
    };
  }

  const baseStyle: Record<string, unknown> = {};
  const rulesMap = new Map<number, Record<string, unknown>>();

  for (const [key, raw] of Object.entries(value)) {
    const minWidth = parseResponsiveStyleMinWidth(key, breakpointMap);
    if (minWidth != null && isPlainObject(raw)) {
      rulesMap.set(minWidth, {
        ...(rulesMap.get(minWidth) ?? {}),
        ...raw,
      });
      continue;
    }

    baseStyle[key] = raw;
  }

  return {
    baseStyle: Object.keys(baseStyle).length ? (baseStyle as T) : undefined,
    rules: Array.from(rulesMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([minWidth, style]) => ({
        minWidth,
        style: style as T,
      })),
  };
}

function mergeResolvedStyle<T extends object>(
  value: ResponsiveStyleValue<T> | undefined,
  minWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): T | undefined {
  const { baseStyle, rules } = splitResponsiveStyle(value, breakpointMap);
  const resolved: Record<string, unknown> = {
    ...(baseStyle ?? {}),
  };

  for (const rule of rules) {
    if (rule.minWidth > minWidth) break;
    Object.assign(resolved, rule.style);
  }

  return Object.keys(resolved).length ? (resolved as T) : undefined;
}

export function resolveResponsiveBaseStyleAtMinWidth(
  style: SkeletonBaseStyleResponsive | undefined,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonBaseStyle | undefined {
  return mergeResolvedStyle(style, minWidth, breakpointMap);
}

export function resolveResponsiveContainerStyleAtMinWidth(
  style: SkeletonContainerStyleResponsive | undefined,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonContainerStyle | undefined {
  return mergeResolvedStyle(style, minWidth, breakpointMap);
}

export function collectResponsiveStyleBreakpoints(
  style:
    | SkeletonBaseStyleResponsive
    | SkeletonContainerStyleResponsive
    | undefined,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  const { rules } = splitResponsiveStyle(
    style as ResponsiveStyleValue<Record<string, unknown>> | undefined,
    breakpointMap
  );

  for (const rule of rules) {
    if (rule.minWidth > 0) out.add(rule.minWidth);
  }
}
