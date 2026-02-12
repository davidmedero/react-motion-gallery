import * as React from "react";
import type { EntriesOptions } from "./types";

function cssLen(v: number | string | undefined | null): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export function useNormalizedEntriesLoading(entries: EntriesOptions) {
  return React.useMemo(() => {
    const src: any = entries.loading ?? {};

    const nearMargin = typeof src.nearMargin === "string" ? src.nearMargin : "700px 0px";
    const viewMargin = typeof src.viewMargin === "string" ? src.viewMargin : "0px 0px";

    const threshold =
      typeof src.threshold === "number" && !Number.isNaN(src.threshold)
        ? src.threshold
        : 0.01;

    const waitForDecode = src.waitForDecode !== false; // default true

    const decodeTimeoutMs =
      typeof src.decodeTimeoutMs === "number" && src.decodeTimeoutMs > 0
        ? src.decodeTimeoutMs
        : 8000;

    const minHeight = cssLen(src.minHeight) ?? "260px";

    return {
      enabled: src.enabled,
      force: src.force,
      skeleton: src.skeleton,
      minHeight,
      nearMargin,
      viewMargin,
      threshold,
      waitForDecode,
      decodeTimeoutMs,
      skeletonWrap: src.skeletonWrap
    };
  }, [entries.loading]);
}

export function useNormalizedEntriesIntro(entries: EntriesOptions) {
  return React.useMemo(() => {
    const src = entries.intro ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 200,
      durationMs: src.durationMs ?? 700,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)",
      staggerLimit: Math.max(0, (src.staggerLimit ?? 6) | 0),
    };
  }, [entries.intro]);
}