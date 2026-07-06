"use client";

import * as React from "react";
import {
  DataInfiniteSentinel,
  normalizeDataInfiniteScrollOptions,
  type DataInfiniteScrollOptions,
} from "../../shared/dataPlugins";
import type { GridPluginRuntimeProps } from "../types";
import { createGridPlugin } from "./create";

export type GridInfiniteScrollOptions = DataInfiniteScrollOptions;
export type UseGridInfiniteScrollOptions = GridInfiniteScrollOptions;

function GridInfiniteScrollRuntime({
  host,
  options,
}: GridPluginRuntimeProps) {
  return (
    <DataInfiniteSentinel
      scope="grid"
      options={(options as GridInfiniteScrollOptions | undefined) ?? {}}
      resetKey={host.visibleItemCount}
    />
  );
}

export function gridInfiniteScroll(options: GridInfiniteScrollOptions = {}) {
  return createGridPlugin("infinite-scroll", {
    options: normalizeDataInfiniteScrollOptions(options),
    blocksReady: false,
    Runtime: GridInfiniteScrollRuntime,
  });
}

export function useGridInfiniteScroll(
  options: UseGridInfiniteScrollOptions = {}
) {
  return React.useMemo(
    () => gridInfiniteScroll(options),
    [
      options.enabled,
      options.hasMore,
      options.loading,
      options.onLoadMore,
      options.rootMargin,
      options.scrollRoot,
      options.sentinel,
      options.threshold,
    ]
  );
}
