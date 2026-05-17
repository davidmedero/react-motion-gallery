import type * as React from "react";

export const SKELETON_CACHE_VERSION = 1;
export const DEFAULT_SKELETON_CACHE_TTL_MS = 10 * 60 * 1000;
export const DEFAULT_SKELETON_CACHE_DEBOUNCE_MS = 250;

export type SkeletonCacheKind =
  | "skeleton"
  | "slider"
  | "grid"
  | "masonry"
  | "entries";

export type SkeletonCacheTextRecord = {
  lines: number;
  barWidths?: string[];
  lineWidthsPx?: number[];
  barHeight?: number;
  lineHeight?: number;
  containerWidthPx?: number;
};

export type SkeletonCacheMasonrySnapshot = {
  variantKey: string;
  shellHeightPx?: number;
  itemHeightsPx?: number[];
};

export type SkeletonCacheSnapshot = {
  version: 1;
  key: string;
  scopeId: string;
  kind: SkeletonCacheKind;
  routeKey?: string;
  createdAt: number;
  widthBucketMin: number;
  viewportWidth: number;
  layoutWidthPx?: number;
  masonry?: SkeletonCacheMasonrySnapshot;
  text: Record<string, SkeletonCacheTextRecord>;
};

export type SkeletonCacheCookieOptions = {
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

export type SkeletonCacheOptions = {
  key: string;
  snapshot?: SkeletonCacheSnapshot | null;
  ttlMs?: number;
  debounceMs?: number;
  routeKey?: string;
  cookie?: SkeletonCacheCookieOptions;
};

export type SkeletonCacheProviderProps = {
  children?: React.ReactNode;
  options?: Omit<SkeletonCacheOptions, "snapshot">;
  snapshot?: SkeletonCacheSnapshot | null;
  snapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
};

export type SkeletonCacheParseOptions = {
  key?: string;
  scopeId?: string;
  kind?: SkeletonCacheKind;
  routeKey?: string;
  ttlMs?: number;
  now?: number;
  textIds?: readonly string[];
  itemCount?: number;
  variantKeys?: readonly string[];
  widthBucketMin?: number;
};

const COOKIE_PREFIX = "rmg_skel_cache";
const CSS_LENGTH_RE = /^(?:0|[1-9]\d{0,4})(?:\.\d{1,3})?(?:px|%)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeFiniteNumber(
  value: unknown,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }
) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (options?.min != null && numeric < options.min) return null;
  if (options?.max != null && numeric > options.max) return null;
  return options?.integer ? Math.trunc(numeric) : numeric;
}

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeCssLength(value: unknown) {
  const normalized = normalizeString(value);
  if (!normalized || !CSS_LENGTH_RE.test(normalized)) return null;
  return normalized;
}

function normalizeNumberArray(
  value: unknown,
  options?: {
    maxLength?: number;
    min?: number;
    max?: number;
  }
) {
  if (!Array.isArray(value)) return undefined;
  if (options?.maxLength != null && value.length > options.maxLength) {
    return undefined;
  }

  const out: number[] = [];
  for (const entry of value) {
    const numeric = normalizeFiniteNumber(entry, {
      min: options?.min,
      max: options?.max,
    });
    if (numeric == null) return undefined;
    out.push(Math.round(numeric * 1000) / 1000);
  }
  return out;
}

function normalizeTextRecord(value: unknown): SkeletonCacheTextRecord | null {
  if (Array.isArray(value)) {
    const [
      rawLines,
      rawLineWidthsPx,
      rawBarHeight,
      rawLineHeight,
      rawContainerWidthPx,
      rawBarWidths,
    ] = value;
    const lines = normalizeFiniteNumber(rawLines, {
      min: 1,
      max: 64,
      integer: true,
    });
    if (lines == null) return null;

    const lineWidthsPx = normalizeNumberArray(rawLineWidthsPx, {
      maxLength: 64,
      min: 0,
      max: 10000,
    });
    const barHeight =
      rawBarHeight == null
        ? undefined
        : normalizeFiniteNumber(rawBarHeight, { min: 0, max: 1000 });
    const lineHeight =
      rawLineHeight == null
        ? undefined
        : normalizeFiniteNumber(rawLineHeight, { min: 0, max: 10 });
    const containerWidthPx =
      rawContainerWidthPx == null
        ? undefined
        : normalizeFiniteNumber(rawContainerWidthPx, {
            min: 0,
            max: 100000,
          });
    const barWidths = Array.isArray(rawBarWidths)
      ? rawBarWidths.map(normalizeCssLength)
      : undefined;

    if (rawLineWidthsPx != null && !lineWidthsPx) return null;
    if (rawBarHeight != null && barHeight == null) return null;
    if (rawLineHeight != null && lineHeight == null) return null;
    if (rawContainerWidthPx != null && containerWidthPx == null) return null;
    if (barWidths && barWidths.some((entry) => !entry)) return null;

    return {
      lines,
      ...(lineWidthsPx?.length ? { lineWidthsPx } : null),
      ...(barHeight != null ? { barHeight } : null),
      ...(lineHeight != null ? { lineHeight } : null),
      ...(containerWidthPx != null ? { containerWidthPx } : null),
      ...(barWidths?.length ? { barWidths: barWidths as string[] } : null),
    };
  }

  if (!isRecord(value)) return null;

  const lines = normalizeFiniteNumber(value.lines, {
    min: 1,
    max: 64,
    integer: true,
  });
  if (lines == null) return null;

  const barWidths = Array.isArray(value.barWidths)
    ? value.barWidths.map(normalizeCssLength)
    : undefined;
  if (barWidths && barWidths.some((entry) => !entry)) return null;

  const lineWidthsPx = normalizeNumberArray(value.lineWidthsPx, {
    maxLength: 64,
    min: 0,
    max: 10000,
  });
  const barHeight =
    value.barHeight == null
      ? undefined
      : normalizeFiniteNumber(value.barHeight, { min: 0, max: 1000 });
  const lineHeight =
    value.lineHeight == null
      ? undefined
      : normalizeFiniteNumber(value.lineHeight, { min: 0, max: 10 });
  const containerWidthPx =
    value.containerWidthPx == null
      ? undefined
      : normalizeFiniteNumber(value.containerWidthPx, { min: 0, max: 100000 });

  if (value.barHeight != null && barHeight == null) return null;
  if (value.lineHeight != null && lineHeight == null) return null;
  if (value.containerWidthPx != null && containerWidthPx == null) return null;

  return {
    lines,
    ...(barWidths?.length ? { barWidths: barWidths as string[] } : null),
    ...(lineWidthsPx?.length ? { lineWidthsPx } : null),
    ...(barHeight != null ? { barHeight } : null),
    ...(lineHeight != null ? { lineHeight } : null),
    ...(containerWidthPx != null ? { containerWidthPx } : null),
  };
}

function normalizeTextMap(
  value: unknown
): Record<string, SkeletonCacheTextRecord> | null {
  if (!isRecord(value)) return null;

  const out: Record<string, SkeletonCacheTextRecord> = {};
  for (const [id, rawRecord] of Object.entries(value)) {
    const textId = normalizeString(id);
    if (!textId) return null;

    const record = normalizeTextRecord(rawRecord);
    if (!record) return null;
    out[textId] = record;
  }
  return out;
}

function normalizeMasonrySnapshot(
  value: unknown
): SkeletonCacheMasonrySnapshot | undefined | null {
  if (value == null) return undefined;
  if (!isRecord(value)) return null;

  const variantKey = normalizeString(value.variantKey ?? value.v);
  if (!variantKey) return null;

  const shellHeightPx =
    (value.shellHeightPx ?? value.h) == null
      ? undefined
      : normalizeFiniteNumber(value.shellHeightPx ?? value.h, {
          min: 0,
          max: 100000,
        });
  const itemHeightsPx = normalizeNumberArray(value.itemHeightsPx ?? value.i, {
    maxLength: 500,
    min: 0,
    max: 100000,
  });

  if ((value.shellHeightPx ?? value.h) != null && shellHeightPx == null) return null;
  if ((value.itemHeightsPx ?? value.i) != null && !itemHeightsPx) return null;

  return {
    variantKey,
    ...(shellHeightPx != null ? { shellHeightPx } : null),
    ...(itemHeightsPx?.length ? { itemHeightsPx } : null),
  };
}

function decodeCookieValue(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function hashKey(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

function slugKey(value: string) {
  const slug = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return slug || "default";
}

function normalizeSnapshot(value: unknown): SkeletonCacheSnapshot | null {
  if (!isRecord(value)) return null;
  if ((value.version ?? value.v) !== SKELETON_CACHE_VERSION) return null;

  const key = normalizeString(value.key ?? value.k);
  const scopeId = normalizeString(value.scopeId ?? value.s);
  const rawKind = value.kind ?? value.d;
  const kind =
    rawKind === "s" || rawKind === "skeleton"
      ? "skeleton"
      : rawKind === "l" || rawKind === "slider"
      ? "slider"
      : rawKind === "g" || rawKind === "grid"
      ? "grid"
      : rawKind === "m" || rawKind === "masonry"
      ? "masonry"
      : rawKind === "e" || rawKind === "entries"
      ? "entries"
      : null;
  const createdAt = normalizeFiniteNumber(value.createdAt ?? value.t, {
    min: 1,
  });
  const widthBucketMin = normalizeFiniteNumber(value.widthBucketMin ?? value.b, {
    min: 0,
    max: 100000,
  });
  const viewportWidth = normalizeFiniteNumber(value.viewportWidth ?? value.w, {
    min: 1,
    max: 100000,
  });
  const rawLayoutWidthPx = value.layoutWidthPx ?? value.l;
  const layoutWidthPx =
    rawLayoutWidthPx == null
      ? undefined
      : normalizeFiniteNumber(rawLayoutWidthPx, { min: 0, max: 100000 });
  const routeKey =
    (value.routeKey ?? value.r) == null
      ? undefined
      : normalizeString(value.routeKey ?? value.r);
  const text = normalizeTextMap(value.text ?? value.x);
  const masonry = normalizeMasonrySnapshot(value.masonry ?? value.m);

  if (
    !key ||
    !scopeId ||
    !kind ||
    createdAt == null ||
    widthBucketMin == null ||
    viewportWidth == null ||
    (rawLayoutWidthPx != null && layoutWidthPx == null) ||
    ((value.routeKey ?? value.r) != null && !routeKey) ||
    !text ||
    masonry === null
  ) {
    return null;
  }

  return {
    version: SKELETON_CACHE_VERSION,
    key,
    scopeId,
    kind,
    ...(routeKey ? { routeKey } : null),
    createdAt,
    widthBucketMin,
    viewportWidth,
    ...(layoutWidthPx != null ? { layoutWidthPx } : null),
    ...(masonry ? { masonry } : null),
    text,
  };
}

export function getSkeletonCacheCookieName(key: string) {
  const normalized = typeof key === "string" && key.trim() ? key.trim() : "default";
  return `${COOKIE_PREFIX}_${slugKey(normalized)}_${hashKey(normalized)}`;
}

export function serializeSkeletonCacheSnapshot(
  snapshot: SkeletonCacheSnapshot
) {
  const compactText: Record<string, unknown[]> = {};
  for (const [textId, record] of Object.entries(snapshot.text)) {
    const tuple: unknown[] = [
      record.lines,
      record.lineWidthsPx?.length ? record.lineWidthsPx : undefined,
      record.barHeight,
      record.lineHeight,
      record.containerWidthPx,
      record.barWidths?.length ? record.barWidths : undefined,
    ];
    while (tuple.length > 1 && tuple[tuple.length - 1] == null) {
      tuple.pop();
    }
    compactText[textId] = tuple;
  }

  return JSON.stringify({
    v: SKELETON_CACHE_VERSION,
    k: snapshot.key,
    s: snapshot.scopeId,
    d:
      snapshot.kind === "masonry"
        ? "m"
        : snapshot.kind === "slider"
        ? "l"
        : snapshot.kind === "grid"
        ? "g"
        : snapshot.kind === "entries"
        ? "e"
        : "s",
    ...(snapshot.routeKey ? { r: snapshot.routeKey } : null),
    t: snapshot.createdAt,
    b: snapshot.widthBucketMin,
    w: snapshot.viewportWidth,
    ...(snapshot.layoutWidthPx != null ? { l: snapshot.layoutWidthPx } : null),
    ...(snapshot.masonry
      ? {
          m: {
            v: snapshot.masonry.variantKey,
            ...(snapshot.masonry.shellHeightPx != null
              ? { h: snapshot.masonry.shellHeightPx }
              : null),
            ...(snapshot.masonry.itemHeightsPx?.length
              ? { i: snapshot.masonry.itemHeightsPx }
              : null),
          },
        }
      : null),
    x: compactText,
  });
}

export function validateSkeletonCacheSnapshot(
  snapshot: SkeletonCacheSnapshot | null | undefined,
  options: SkeletonCacheParseOptions = {}
): SkeletonCacheSnapshot | null {
  if (!snapshot) return null;

  const ttlMs =
    typeof options.ttlMs === "number" && Number.isFinite(options.ttlMs)
      ? Math.max(0, options.ttlMs)
      : DEFAULT_SKELETON_CACHE_TTL_MS;
  const now =
    typeof options.now === "number" && Number.isFinite(options.now)
      ? options.now
      : Date.now();
  const age = now - snapshot.createdAt;

  if (ttlMs > 0 && (age < 0 || age > ttlMs)) return null;
  if (options.key != null && snapshot.key !== options.key) return null;
  if (options.scopeId != null && snapshot.scopeId !== options.scopeId) return null;
  if (options.kind != null && snapshot.kind !== options.kind) return null;
  if (options.routeKey != null && snapshot.routeKey !== options.routeKey) return null;
  if (
    options.widthBucketMin != null &&
    snapshot.widthBucketMin !== options.widthBucketMin
  ) {
    return null;
  }

  if (options.textIds?.length) {
    for (const textId of options.textIds) {
      if (!snapshot.text[textId]) return null;
    }
  }

  if (options.variantKeys?.length && snapshot.masonry?.variantKey) {
    if (!options.variantKeys.includes(snapshot.masonry.variantKey)) return null;
  }

  if (options.itemCount != null && snapshot.masonry?.itemHeightsPx) {
    if (snapshot.masonry.itemHeightsPx.length !== options.itemCount) return null;
  }

  return snapshot;
}

export function parseSkeletonCacheCookie(
  raw: string | null | undefined,
  options: SkeletonCacheParseOptions = {}
): SkeletonCacheSnapshot | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeCookieValue(raw));
  } catch {
    return null;
  }

  return validateSkeletonCacheSnapshot(normalizeSnapshot(parsed), options);
}

export function getSkeletonCacheRouteKey(
  loc: Pick<Location, "pathname" | "search"> | undefined =
    typeof window !== "undefined" ? window.location : undefined
) {
  return loc ? `${loc.pathname}${loc.search}` : "";
}
