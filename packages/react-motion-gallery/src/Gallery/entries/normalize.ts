import * as React from "react";
import type { EntriesOptions } from "./types";

export const DEFAULT_ENTRIES_SKELETON_EXIT_MS = 220;

function cssLen(v: number | string | undefined | null): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export function useNormalizedEntriesLoading(entries: EntriesOptions) {
  return React.useMemo(() => {
    const src: any = entries.loading ?? {};

    const nearMargin =
      typeof src.nearMargin === "string" ? src.nearMargin : "700px 0px";
    const viewMargin =
      typeof src.viewMargin === "string" ? src.viewMargin : "0px 0px";

    const threshold =
      typeof src.threshold === "number" && !Number.isNaN(src.threshold)
        ? src.threshold
        : 0.01;

    const waitForMedia = src.waitForMedia ?? src.waitForDecode ?? true;

    const decodeTimeoutMs =
      typeof src.decodeTimeoutMs === "number" && src.decodeTimeoutMs > 0
        ? src.decodeTimeoutMs
        : 8000;

    const minHeight = cssLen(src.minHeight) ?? "260px";
    const exitMs =
      typeof src.exitMs === "number" && Number.isFinite(src.exitMs)
        ? Math.max(0, src.exitMs)
        : DEFAULT_ENTRIES_SKELETON_EXIT_MS;
    const enterMs =
      typeof src.enterMs === "number" && Number.isFinite(src.enterMs)
        ? Math.max(0, src.enterMs)
        : exitMs;

    return {
      enabled: src.enabled,
      force: src.force,
      skeleton: src.skeleton,
      minHeight,
      enterMs,
      exitMs,
      nearMargin,
      viewMargin,
      threshold,
      waitForMedia,
      decodeTimeoutMs,
      skeletonWrap: src.skeletonWrap,
      rememberRevealed: src.rememberRevealed ?? true,
    };
  }, [entries.loading]);
}

export function useNormalizedEntriesReveal(entries: EntriesOptions) {
  return React.useMemo(() => {
    const src = entries.reveal ?? {};
    return {
      renderReveal: src.renderReveal,
      durationMs: src.durationMs ?? 700,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)",
    };
  }, [entries.reveal]);
}
