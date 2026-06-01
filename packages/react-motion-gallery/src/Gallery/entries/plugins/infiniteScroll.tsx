"use client";

import * as React from "react";
import type { EntriesInfiniteScrollOptions } from "../types";
import { createEntriesPlugin } from "./create";

export type UseEntriesInfiniteScrollOptions = EntriesInfiniteScrollOptions;

export function entriesInfiniteScroll(
  options: EntriesInfiniteScrollOptions = {}
) {
  return createEntriesPlugin("infinite-scroll", {
    ...options,
    enabled: options.enabled ?? true,
    hasMore: options.hasMore ?? true,
    rootMargin: options.rootMargin ?? "600px 0px",
    threshold: options.threshold ?? 0,
  });
}

export function useEntriesInfiniteScroll(
  options: UseEntriesInfiniteScrollOptions = {}
) {
  return React.useMemo(
    () => entriesInfiniteScroll(options),
    [
      options.enabled,
      options.hasMore,
      options.loading,
      options.onLoadMore,
      options.rootMargin,
      options.sentinel,
      options.threshold,
    ]
  );
}
