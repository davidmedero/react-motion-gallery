"use client";

import * as React from "react";
import type { EntriesLoadMoreOptions } from "../types";
import { createEntriesPlugin } from "./create";

export type UseEntriesLoadMoreOptions = {
  initialVisibleCount?: number;
  pageSize: number;
  total?: number;
  mode?: EntriesLoadMoreOptions["mode"];
  loading?: boolean;
  enabled?: boolean;
};

export type EntriesLoadMoreController = {
  visibleCount: number;
  pageSize: number;
  canLoadMore: boolean;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  loadMore: () => void;
  reset: () => void;
  plugin: ReturnType<typeof entriesLoadMore>;
};

function normalizeCount(value: number | undefined, fallback: number) {
  const next = value ?? fallback;
  return Math.max(0, next | 0);
}

export function entriesLoadMore(options: EntriesLoadMoreOptions) {
  return createEntriesPlugin("load-more", {
    ...options,
    enabled: options.enabled ?? true,
    mode: options.mode ?? "client",
    visibleCount: Math.max(0, options.visibleCount | 0),
  });
}

export function useEntriesLoadMore(
  options: UseEntriesLoadMoreOptions
): EntriesLoadMoreController {
  const pageSize = Math.max(1, options.pageSize | 0);
  const initialVisibleCount = normalizeCount(options.initialVisibleCount, pageSize);
  const total = options.total ?? initialVisibleCount;
  const [visibleCount, setVisibleCountRaw] = React.useState(initialVisibleCount);

  const setVisibleCount = React.useCallback<
    React.Dispatch<React.SetStateAction<number>>
  >((next) => {
    setVisibleCountRaw((prev) =>
      Math.max(0, typeof next === "function" ? next(prev) : next)
    );
  }, []);

  const canLoadMore = visibleCount < total;
  const loadMore = React.useCallback(() => {
    setVisibleCount((prev) => Math.min(total, prev + pageSize));
  }, [pageSize, setVisibleCount, total]);
  const reset = React.useCallback(() => {
    setVisibleCount(initialVisibleCount);
  }, [initialVisibleCount, setVisibleCount]);
  const plugin = React.useMemo(
    () =>
      entriesLoadMore({
        enabled: options.enabled,
        mode: options.mode,
        loading: options.loading,
        visibleCount,
        total,
      }),
    [
      options.enabled,
      options.loading,
      options.mode,
      total,
      visibleCount,
    ]
  );

  return React.useMemo(
    () => ({
      visibleCount,
      pageSize,
      canLoadMore,
      setVisibleCount,
      loadMore,
      reset,
      plugin,
    }),
    [canLoadMore, loadMore, pageSize, plugin, reset, setVisibleCount, visibleCount]
  );
}
