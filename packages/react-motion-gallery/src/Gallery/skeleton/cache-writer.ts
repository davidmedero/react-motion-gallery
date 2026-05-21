"use client";

import * as React from "react";

import { isMeaningfulSliderRestoreState } from "../slider/SliderRestore";
import {
  DEFAULT_SKELETON_CACHE_COOKIE_MAX_BYTES,
  DEFAULT_SKELETON_CACHE_COOKIE_MAX_TOTAL_BYTES,
  DEFAULT_SKELETON_CACHE_DEBOUNCE_MS,
  DEFAULT_SKELETON_CACHE_TTL_MS,
  SKELETON_CACHE_VERSION,
  SKELETON_CACHE_CHANGE_EVENT,
  getSkeletonCacheCookieName,
  getSkeletonCacheRouteKey,
  parseSkeletonCacheCookie,
  serializeSkeletonCacheSnapshot,
  type SkeletonCacheKind,
  type SkeletonCacheMasonrySnapshot,
  type SkeletonCacheOptions,
  type SkeletonCacheSliderRestoreSnapshot,
  type SkeletonCacheSnapshot,
  type SkeletonCacheTextRecord,
} from "./cache";

const useClientLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const SKELETON_CACHE_COOKIE_PREFIX = "rmg_skel_cache_";

type GeometrySnapshot = {
  widthBucketMin: number;
  viewportWidth?: number;
  layoutWidthPx?: number;
  masonry?: SkeletonCacheMasonrySnapshot;
};

type UseSkeletonCacheWriterArgs = {
  cache: SkeletonCacheOptions | null;
  kind: SkeletonCacheKind;
  scopeId: string;
  textIds: readonly string[];
  skeletonRootRef: React.RefObject<HTMLElement | null>;
  shellRef?: React.RefObject<HTMLElement | null>;
  getGeometrySnapshot?: () => GeometrySnapshot | null;
  getSliderRestoreSnapshot?: () => SkeletonCacheSliderRestoreSnapshot | null;
};

type SkeletonCacheCookieEntry = {
  name: string;
  pairBytes: number;
  createdAt: number;
};

function roundPx(value: number) {
  return Math.round(value * 1000) / 1000;
}

function byteLength(value: string) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).byteLength;
  }

  return encodeURIComponent(value).replace(/%[0-9A-F]{2}/g, "x").length;
}

function resolveCookieByteLimit(
  value: number | undefined,
  fallback: number
) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback;
}

function escapeCssAttrValue(value: string) {
  const css = (globalThis as typeof globalThis & { CSS?: { escape?: (v: string) => string } }).CSS;
  if (css?.escape) return css.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}

function queryByTextId<T extends Element>(
  root: ParentNode,
  attr: string,
  textId: string
) {
  return root.querySelector<T>(
    `[${attr}="${escapeCssAttrValue(textId)}"]`
  );
}

function groupRectsIntoLineWidths(rects: DOMRect[]) {
  const lines: Array<{ top: number; left: number; right: number }> = [];

  for (const rect of rects) {
    if (rect.width <= 0 || rect.height <= 0) continue;

    const existing = lines.find((line) => Math.abs(line.top - rect.top) <= 1.5);
    if (existing) {
      existing.left = Math.min(existing.left, rect.left);
      existing.right = Math.max(existing.right, rect.right);
    } else {
      lines.push({
        top: rect.top,
        left: rect.left,
        right: rect.right,
      });
    }
  }

  return lines
    .sort((a, b) => a.top - b.top)
    .map((line) => roundPx(Math.max(0, line.right - line.left)));
}

function measureContentLineWidths(node: HTMLElement) {
  const doc = node.ownerDocument;
  const range = doc.createRange();
  range.selectNodeContents(node);

  try {
    const lineWidths =
      typeof range.getClientRects === "function"
        ? groupRectsIntoLineWidths(Array.from(range.getClientRects()))
        : [];
    if (lineWidths.length) return lineWidths;

    const rect = node.getBoundingClientRect();
    return rect.width > 0 ? [roundPx(rect.width)] : [];
  } finally {
    range.detach();
  }
}

function measureSkeletonTextMetrics(
  skeletonRoot: HTMLElement | null,
  textId: string
) {
  const skeletonNode = skeletonRoot
    ? queryByTextId<HTMLElement>(
        skeletonRoot,
        "data-rmg-skel-text-id",
        textId
      )
    : null;
  const firstLine = skeletonNode?.querySelector<HTMLElement>(
    '[data-rmg-skel-text-line="true"]'
  );
  const barHeight = firstLine?.getBoundingClientRect().height;

  return {
    ...(barHeight && barHeight > 0 ? { barHeight: roundPx(barHeight) } : null),
  };
}

function measureTextSnapshot(args: {
  textIds: readonly string[];
  skeletonRoot: HTMLElement | null;
  contentRoot: ParentNode;
}) {
  const text: Record<string, SkeletonCacheTextRecord> = {};

  for (const textId of args.textIds) {
    const contentNode = queryByTextId<HTMLElement>(
      args.contentRoot,
      "data-skeleton-text-id",
      textId
    );
    if (!contentNode) return null;

    const lineWidthsPx = measureContentLineWidths(contentNode);
    if (!lineWidthsPx.length) return null;

    const lines = Math.max(1, lineWidthsPx.length);
    const containerRect = contentNode.getBoundingClientRect();
    const containerWidthPx =
      containerRect.width > 0 ? roundPx(containerRect.width) : undefined;
    text[textId] = {
      lines,
      lineWidthsPx,
      ...(containerWidthPx != null ? { containerWidthPx } : null),
      ...measureSkeletonTextMetrics(args.skeletonRoot, textId),
    };
  }

  return text;
}

function contentRootFromShell(shell: HTMLElement | null) {
  return (
    shell?.querySelector<HTMLElement>('[data-rmg-skeleton-content-layer="true"]') ??
    shell ??
    document
  );
}

function readCookieValue(name: string) {
  if (typeof document === "undefined" || !document.cookie) return null;

  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

function dispatchSkeletonCacheChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SKELETON_CACHE_CHANGE_EVENT));
}

function deleteSkeletonCacheCookie(args: {
  name: string;
  path: string;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
}) {
  document.cookie = [
    `${args.name}=`,
    `path=${args.path}`,
    "max-age=0",
    `samesite=${args.sameSite}`,
    args.secure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function clearSkeletonCacheCookies(args: {
  path: string;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
}) {
  const cookies = listSkeletonCacheCookies();
  if (!cookies.length) return false;

  for (const cookie of cookies) {
    deleteSkeletonCacheCookie({
      name: cookie.name,
      path: args.path,
      sameSite: args.sameSite,
      secure: args.secure,
    });
  }

  dispatchSkeletonCacheChange();
  return true;
}

function listSkeletonCacheCookies() {
  if (typeof document === "undefined" || !document.cookie) {
    return [] as SkeletonCacheCookieEntry[];
  }

  return document.cookie
    .split("; ")
    .map((pair) => {
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex <= 0) return null;

      const name = pair.slice(0, separatorIndex);
      if (!name.startsWith(SKELETON_CACHE_COOKIE_PREFIX)) return null;

      const value = pair.slice(separatorIndex + 1);
      const snapshot = parseSkeletonCacheCookie(value, { ttlMs: 0 });

      return {
        name,
        pairBytes: byteLength(pair),
        createdAt: snapshot?.createdAt ?? 0,
      };
    })
    .filter((entry): entry is SkeletonCacheCookieEntry => entry != null);
}

function sameNullableNumber(a: number | undefined, b: number | undefined) {
  if (a == null || b == null) return a == null && b == null;
  return Math.abs(a - b) < 0.001;
}

function sameSliderRestoreSnapshot(
  a: SkeletonCacheSliderRestoreSnapshot | undefined,
  b: SkeletonCacheSliderRestoreSnapshot | undefined
) {
  if (!a || !b) return !a && !b;

  return (
    a.version === b.version &&
    a.index === b.index &&
    sameNullableNumber(a.heightPx, b.heightPx) &&
    a.viewportWidth === b.viewportWidth &&
    a.slideCount === b.slideCount &&
    a.skeletonSlotCount === b.skeletonSlotCount &&
    a.scrollY === b.scrollY &&
    a.scrollMax === b.scrollMax &&
    a.wasAtBottom === b.wasAtBottom &&
    (a.storageKeyId ?? "") === (b.storageKeyId ?? "") &&
    (a.routeKey ?? "") === (b.routeKey ?? "") &&
    (a.scopeId ?? "") === (b.scopeId ?? "")
  );
}

function combinedCookiePairsBytes(pairBytes: readonly number[]) {
  return pairBytes.reduce(
    (total, next, index) => total + next + (index > 0 ? 2 : 0),
    0
  );
}

function pruneSkeletonCacheCookiesForWrite(args: {
  nextName: string;
  nextPairBytes: number;
  maxTotalCookieBytes: number;
  path: string;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
}) {
  let retainedCookies = listSkeletonCacheCookies().filter(
    (cookie) => cookie.name !== args.nextName
  );
  const cookiesByAge = [...retainedCookies].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.name.localeCompare(b.name);
  });

  for (const cookie of cookiesByAge) {
    const totalBytes = combinedCookiePairsBytes([
      ...retainedCookies.map((entry) => entry.pairBytes),
      args.nextPairBytes,
    ]);
    if (totalBytes <= args.maxTotalCookieBytes) return true;

    deleteSkeletonCacheCookie({
      name: cookie.name,
      path: args.path,
      sameSite: args.sameSite,
      secure: args.secure,
    });
    retainedCookies = retainedCookies.filter(
      (entry) => entry.name !== cookie.name
    );
  }

  return (
    combinedCookiePairsBytes([
      ...retainedCookies.map((entry) => entry.pairBytes),
      args.nextPairBytes,
    ]) <= args.maxTotalCookieBytes
  );
}

export function writeSkeletonCacheSnapshotCookie(args: {
  cache: SkeletonCacheOptions;
  snapshot: SkeletonCacheSnapshot;
}) {
  const ttlMs =
    typeof args.cache.ttlMs === "number" && Number.isFinite(args.cache.ttlMs)
      ? Math.max(0, args.cache.ttlMs)
      : DEFAULT_SKELETON_CACHE_TTL_MS;
  const maxAge = Math.max(0, Math.ceil(ttlMs / 1000));
  const cookie = args.cache.cookie ?? {};
  const sameSite = cookie.sameSite ?? "lax";
  const path = cookie.path ?? "/";
  const secure = cookie.secure || sameSite === "none";
  const serialized = serializeSkeletonCacheSnapshot(args.snapshot);
  const name = getSkeletonCacheCookieName(args.cache.key);
  const encodedValue = encodeURIComponent(serialized);
  const pair = `${name}=${encodedValue}`;
  const pairBytes = byteLength(pair);
  const maxCookieBytes = resolveCookieByteLimit(
    cookie.maxCookieBytes,
    DEFAULT_SKELETON_CACHE_COOKIE_MAX_BYTES
  );
  const maxTotalCookieBytes = resolveCookieByteLimit(
    cookie.maxTotalCookieBytes,
    DEFAULT_SKELETON_CACHE_COOKIE_MAX_TOTAL_BYTES
  );

  if (
    pairBytes > maxCookieBytes ||
    !pruneSkeletonCacheCookiesForWrite({
      nextName: name,
      nextPairBytes: pairBytes,
      maxTotalCookieBytes,
      path,
      sameSite,
      secure,
    })
  ) {
    deleteSkeletonCacheCookie({ name, path, sameSite, secure });
    dispatchSkeletonCacheChange();
    return false;
  }

  document.cookie = [
    pair,
    `path=${path}`,
    `max-age=${maxAge}`,
    `samesite=${sameSite}`,
    secure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
  dispatchSkeletonCacheChange();
  return true;
}

export function readSkeletonCacheSnapshotCookie(
  cache: SkeletonCacheOptions,
  options: {
    scopeId?: string;
    kind?: SkeletonCacheKind;
    routeKey?: string;
  } = {}
) {
  return parseSkeletonCacheCookie(
    readCookieValue(getSkeletonCacheCookieName(cache.key)),
    {
      key: cache.key,
      scopeId: options.scopeId,
      kind: options.kind,
      routeKey: options.routeKey,
      ttlMs: cache.ttlMs,
    }
  );
}

export function updateSkeletonCacheSliderRestoreCookie(args: {
  cache: SkeletonCacheOptions;
  kind: SkeletonCacheKind;
  scopeId: string;
  restore: SkeletonCacheSliderRestoreSnapshot;
}) {
  if (typeof document === "undefined") return false;

  const routeKey = args.cache.routeKey ?? getSkeletonCacheRouteKey(window.location);
  const snapshot = readSkeletonCacheSnapshotCookie(args.cache, {
    scopeId: args.scopeId,
    kind: args.kind,
    routeKey,
  });
  if (!snapshot) return false;

  const existingSlider = snapshot.slider ?? {};
  const nextRestore = isMeaningfulSliderRestoreState(args.restore)
    ? args.restore
    : undefined;

  if (sameSliderRestoreSnapshot(existingSlider.restore, nextRestore)) {
    return false;
  }

  const nextSlider = nextRestore
    ? {
        ...existingSlider,
        restore: nextRestore,
      }
    : (() => {
        const rest = { ...existingSlider };
        delete rest.restore;
        return Object.keys(rest).length > 0 ? rest : undefined;
      })();

  const nextSnapshot: SkeletonCacheSnapshot = {
    ...snapshot,
    routeKey,
    createdAt: Date.now(),
    slider: nextSlider,
  };

  return writeSkeletonCacheSnapshotCookie({
    cache: args.cache,
    snapshot: nextSnapshot,
  });
}

export function useSkeletonCacheWriter({
  cache,
  kind,
  scopeId,
  textIds,
  skeletonRootRef,
  shellRef,
  getGeometrySnapshot,
  getSliderRestoreSnapshot,
}: UseSkeletonCacheWriterArgs) {
  const textIdsKey = textIds.join("\u0001");
  const stableTextIds = React.useMemo(() => [...textIds], [textIdsKey]);
  const cacheKey = cache?.key;
  const cacheTtlMs = cache?.ttlMs;
  const cacheDebounceMs = cache?.debounceMs;
  const cacheRouteKey = cache?.routeKey;
  const cacheCookiePath = cache?.cookie?.path;
  const cacheCookieSameSite = cache?.cookie?.sameSite;
  const cacheCookieSecure = cache?.cookie?.secure;
  const cacheCookieMaxBytes = cache?.cookie?.maxCookieBytes;
  const cacheCookieMaxTotalBytes = cache?.cookie?.maxTotalCookieBytes;
  const cacheWriteOptions = React.useMemo<SkeletonCacheOptions | null>(() => {
    if (!cacheKey) return null;

    const cookie =
      cacheCookiePath != null ||
      cacheCookieSameSite != null ||
      cacheCookieSecure != null ||
      cacheCookieMaxBytes != null ||
      cacheCookieMaxTotalBytes != null
        ? {
            ...(cacheCookiePath != null ? { path: cacheCookiePath } : null),
            ...(cacheCookieSameSite != null
              ? { sameSite: cacheCookieSameSite }
              : null),
            ...(cacheCookieSecure != null ? { secure: cacheCookieSecure } : null),
            ...(cacheCookieMaxBytes != null
              ? { maxCookieBytes: cacheCookieMaxBytes }
              : null),
            ...(cacheCookieMaxTotalBytes != null
              ? { maxTotalCookieBytes: cacheCookieMaxTotalBytes }
              : null),
          }
        : undefined;

    return {
      key: cacheKey,
      ...(cacheTtlMs != null ? { ttlMs: cacheTtlMs } : null),
      ...(cacheDebounceMs != null ? { debounceMs: cacheDebounceMs } : null),
      ...(cacheRouteKey != null ? { routeKey: cacheRouteKey } : null),
      ...(cookie ? { cookie } : null),
    };
  }, [
    cacheCookieMaxBytes,
    cacheCookieMaxTotalBytes,
    cacheCookiePath,
    cacheCookieSameSite,
    cacheCookieSecure,
    cacheDebounceMs,
    cacheKey,
    cacheRouteKey,
    cacheTtlMs,
  ]);

  useClientLayoutEffect(() => {
    if (!cacheWriteOptions?.key || !stableTextIds.length) return;

    let frame = 0;
    let timer = 0;
    let disposed = false;
    const debounceMs =
      typeof cacheWriteOptions.debounceMs === "number" &&
      Number.isFinite(cacheWriteOptions.debounceMs)
        ? Math.max(0, cacheWriteOptions.debounceMs)
        : DEFAULT_SKELETON_CACHE_DEBOUNCE_MS;
    const cookie = cacheWriteOptions.cookie ?? {};
    const sameSite = cookie.sameSite ?? "lax";
    const path = cookie.path ?? "/";
    const secure = cookie.secure || sameSite === "none";

    const writeSnapshot = () => {
      if (disposed) return;

      const skeletonRoot = skeletonRootRef.current;
      const shell = shellRef?.current ?? null;
      const contentRoot = contentRootFromShell(shell);
      const text = measureTextSnapshot({
        textIds: stableTextIds,
        skeletonRoot,
        contentRoot,
      });
      if (!text) return;

      const geometry = getGeometrySnapshot?.() ?? {
        widthBucketMin: 0,
      };
      if (!geometry) return;
      const sliderRestore = getSliderRestoreSnapshot?.() ?? null;

      const doc = document.documentElement;
      const viewportWidth =
        geometry.viewportWidth ??
        (window.innerWidth || doc.clientWidth || 0);
      if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) return;

      const snapshot: SkeletonCacheSnapshot = {
        version: SKELETON_CACHE_VERSION,
        key: cacheWriteOptions.key,
        scopeId,
        kind,
        routeKey:
          cacheWriteOptions.routeKey ?? getSkeletonCacheRouteKey(window.location),
        createdAt: Date.now(),
        widthBucketMin: Math.max(0, roundPx(geometry.widthBucketMin)),
        viewportWidth: roundPx(viewportWidth),
        ...(geometry.layoutWidthPx != null
          ? { layoutWidthPx: roundPx(geometry.layoutWidthPx) }
          : null),
        ...(geometry.masonry ? { masonry: geometry.masonry } : null),
        ...(sliderRestore
          ? { slider: { restore: sliderRestore } }
          : null),
        text,
      };

      writeSkeletonCacheSnapshotCookie({
        cache: cacheWriteOptions,
        snapshot,
      });
    };

    const scheduleWrite = (delay: number) => {
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);

      timer = window.setTimeout(() => {
        frame = window.requestAnimationFrame(writeSnapshot);
      }, delay);
    };

    writeSnapshot();

    const onResize = () => {
      clearSkeletonCacheCookies({ path, sameSite, secure });
      scheduleWrite(debounceMs);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [
    cacheWriteOptions,
    getGeometrySnapshot,
    getSliderRestoreSnapshot,
    kind,
    scopeId,
    shellRef,
    skeletonRootRef,
    stableTextIds,
  ]);
}
