import * as React from "react";
import type { EntriesOptions } from "./types";

export function useNormalizedEntriesLoading(entries: EntriesOptions) {
  return React.useMemo(() => {
    const src = entries.loading ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading,
    };
  }, [entries.loading]);
}

export function useNormalizedEntriesIntro(entries: EntriesOptions) {
  return React.useMemo(() => {
    const src = entries.intro ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 200,
      transform: src.transform ?? "translateY(30px) scale(0.99)",
      durationMs: src.durationMs ?? 700,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)",
      staggerLimit: Math.max(0, (src.staggerLimit ?? 6) | 0),
    };
  }, [entries.intro]);
}