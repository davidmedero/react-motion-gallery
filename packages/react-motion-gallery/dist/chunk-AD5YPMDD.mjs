// src/Gallery/shared/responsive.ts
var BREAKPOINT_MAP = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
};
function parseNumberLike(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}
function effectiveViewportWidth(raw) {
  if (raw > 0) return raw;
  if (typeof window !== "undefined" && window.innerWidth > 0) return window.innerWidth;
  return 1024;
}
function resolveNumberFromResponsive(value, fallback, viewportWidth, breakpointMap = BREAKPOINT_MAP) {
  const vw = effectiveViewportWidth(viewportWidth);
  if (value == null) return fallback;
  if (typeof value === "number" || typeof value === "string") {
    return parseNumberLike(value, fallback);
  }
  if (Array.isArray(value)) {
    return resolveNumberFromResponsive(value[0], fallback, vw, breakpointMap);
  }
  const entries = Object.entries(value).map(([key, v]) => {
    const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
    return { minWidth: bp, value: v };
  }).sort((a, b) => a.minWidth - b.minWidth);
  let result = fallback;
  for (const bp of entries) {
    if (vw >= bp.minWidth) {
      result = resolveNumberFromResponsive(bp.value, result, vw, breakpointMap);
    }
  }
  return result;
}
function resolvePositionFromResponsive(value, fallback, viewportWidth, breakpointMap = BREAKPOINT_MAP) {
  const vw = effectiveViewportWidth(viewportWidth);
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  const entries = Object.entries(value).map(([key, v]) => {
    const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
    return { minWidth: bp, value: v };
  }).sort((a, b) => a.minWidth - b.minWidth);
  let result = fallback;
  for (const bp of entries) {
    if (vw >= bp.minWidth) {
      result = resolvePositionFromResponsive(bp.value, result, vw, breakpointMap);
    }
  }
  return result;
}
function normalizeResponsiveToMinWidthRules(value, fallback, breakpointMap) {
  if (value == null) return [{ minWidth: 0, count: fallback }];
  if (typeof value === "number" || typeof value === "string") {
    const n = Math.floor(parseNumberLike(value, fallback));
    return [{ minWidth: 0, count: Math.max(0, n) }];
  }
  if (Array.isArray(value)) {
    return normalizeResponsiveToMinWidthRules(value[0], fallback, breakpointMap);
  }
  const entries = Object.entries(value).map(([key, v]) => {
    const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
    const n = Math.floor(parseNumberLike(v, fallback));
    return { minWidth: bp, count: Math.max(0, n) };
  }).sort((a, b) => a.minWidth - b.minWidth);
  if (entries.length === 0) return [{ minWidth: 0, count: fallback }];
  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, count: fallback });
  } else if (entries[0].minWidth < 0) {
    entries[0] = { ...entries[0], minWidth: 0 };
  }
  return entries;
}

export { BREAKPOINT_MAP, normalizeResponsiveToMinWidthRules, parseNumberLike, resolveNumberFromResponsive, resolvePositionFromResponsive };
//# sourceMappingURL=chunk-AD5YPMDD.mjs.map
//# sourceMappingURL=chunk-AD5YPMDD.mjs.map