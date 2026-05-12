export const BREAKPOINT_MAP: Record<string, number> = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const DEFAULT_SERVER_VIEWPORT_WIDTH = 1024;
export const DEFAULT_SERVER_VIEWPORT_HEIGHT = 768;

export type BreakpointMap = Record<string, number>;

export type ResponsiveNumber =
  | number
  | Record<string, number>;

export type ResponsiveNumberRule = {
  minWidth: number;
  value: number;
};

export function parseNumberLike(v: number | string | undefined, fallback: number): number {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}

export function normalizeResponsiveNumberRules(
  value: ResponsiveNumber | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): ResponsiveNumberRule[] {
  if (value == null) return [];

  if (typeof value === "number" || typeof value === "string") {
    const numeric = parseNumberLike(value as any, Number.NaN);
    return Number.isFinite(numeric) ? [{ minWidth: 0, value: numeric }] : [];
  }

  if (Array.isArray(value) || typeof value !== "object") {
    return [];
  }

  const entries = Object.entries(value)
    .map(([key, raw]) => {
      const minWidth =
        breakpointMap[key] ??
        (Number.isNaN(parseFloat(key)) ? Number.NaN : parseFloat(key));
      const numeric = parseNumberLike(raw as any, Number.NaN);

      return { minWidth, value: numeric };
    })
    .filter(
      (entry): entry is ResponsiveNumberRule =>
        Number.isFinite(entry.minWidth) && entry.minWidth >= 0 && Number.isFinite(entry.value)
    )
    .sort((a, b) => a.minWidth - b.minWidth);

  const deduped: ResponsiveNumberRule[] = [];

  for (const entry of entries) {
    const last = deduped[deduped.length - 1];

    if (last && last.minWidth === entry.minWidth) {
      last.value = entry.value;
      continue;
    }

    deduped.push(entry);
  }

  return deduped;
}

export function resolveResponsiveNumberRuleValue(
  rules: readonly ResponsiveNumberRule[],
  minWidth: number
): number | undefined {
  let resolved: number | undefined;

  for (const rule of rules) {
    if (rule.minWidth > minWidth) break;
    resolved = rule.value;
  }

  return resolved;
}

export function effectiveViewportWidth(raw: number): number {
  if (raw > 0) return raw;
  if (typeof window !== "undefined" && window.innerWidth > 0) return window.innerWidth;
  return DEFAULT_SERVER_VIEWPORT_WIDTH;
}

export function effectiveViewportHeight(raw: number): number {
  if (raw > 0) return raw;
  if (typeof window !== "undefined" && window.innerHeight > 0) return window.innerHeight;
  return DEFAULT_SERVER_VIEWPORT_HEIGHT;
}

export function resolveNumberFromResponsive(
  value: ResponsiveNumber | undefined,
  fallback: number,
  viewportWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number {
  const vw = effectiveViewportWidth(viewportWidth);

  if (value == null) return fallback;

  if (typeof value === "number" || typeof value === "string") {
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

export function normalizeResponsiveToMinWidthRules(
  value: ResponsiveNumber | undefined,
  fallback: number,
  breakpointMap: BreakpointMap
): Array<{ minWidth: number; count: number }> {
  if (value == null) return [{ minWidth: 0, count: fallback }];

  if (typeof value === "number" || typeof value === "string") {
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
