"use client";

import * as React from "react";

import { isMeaningfulSliderRestoreState } from "../slider/SliderRestore";
import {
  DEFAULT_SKELETON_CACHE_DEBOUNCE_MS,
  DEFAULT_SKELETON_CACHE_TTL_MS,
  SKELETON_CACHE_VERSION,
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

function roundPx(value: number) {
  return Math.round(value * 1000) / 1000;
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

  document.cookie = [
    `${getSkeletonCacheCookieName(args.cache.key)}=${encodeURIComponent(serialized)}`,
    `path=${path}`,
    `max-age=${maxAge}`,
    `samesite=${sameSite}`,
    secure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
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
  const nextSlider = isMeaningfulSliderRestoreState(args.restore)
    ? {
        ...existingSlider,
        restore: args.restore,
      }
    : (() => {
        const rest = { ...existingSlider };
        delete rest.restore;
        return Object.keys(rest).length > 0 ? rest : undefined;
      })();

  writeSkeletonCacheSnapshotCookie({
    cache: args.cache,
    snapshot: {
      ...snapshot,
      routeKey,
      createdAt: Date.now(),
      slider: nextSlider,
    },
  });
  return true;
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

  React.useEffect(() => {
    if (!cache?.key || !textIds.length) return;

    let frame = 0;
    let timer = 0;
    let disposed = false;
    const debounceMs =
      typeof cache.debounceMs === "number" && Number.isFinite(cache.debounceMs)
        ? Math.max(0, cache.debounceMs)
        : DEFAULT_SKELETON_CACHE_DEBOUNCE_MS;

    const writeSnapshot = () => {
      if (disposed) return;

      const skeletonRoot = skeletonRootRef.current;
      const shell = shellRef?.current ?? null;
      const contentRoot = contentRootFromShell(shell);
      const text = measureTextSnapshot({
        textIds,
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

      writeSkeletonCacheSnapshotCookie({
        cache,
        snapshot: {
          version: SKELETON_CACHE_VERSION,
          key: cache.key,
          scopeId,
          kind,
          routeKey: cache.routeKey ?? getSkeletonCacheRouteKey(window.location),
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
        },
      });
    };

    const scheduleWrite = (delay: number) => {
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);

      timer = window.setTimeout(() => {
        frame = window.requestAnimationFrame(writeSnapshot);
      }, delay);
    };

    scheduleWrite(0);

    const onResize = () => scheduleWrite(debounceMs);
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [
    cache,
    getGeometrySnapshot,
    getSliderRestoreSnapshot,
    kind,
    scopeId,
    shellRef,
    skeletonRootRef,
    textIds,
    textIdsKey,
  ]);
}
