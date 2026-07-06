"use client";

import * as React from "react";
import {
  DataInfiniteSentinel,
  normalizeDataInfiniteScrollOptions,
  type DataInfiniteScrollOptions,
} from "../../shared/dataPlugins";
import type { MasonryPlugin, MasonryPluginRuntimeProps } from "../types";
import type {
  MasonryPlugin as LightMasonryPlugin,
  MasonryPluginRuntimeProps as LightMasonryPluginRuntimeProps,
} from "../light/types";

export type MasonryInfiniteScrollOptions = DataInfiniteScrollOptions;
export type UseMasonryInfiniteScrollOptions = MasonryInfiniteScrollOptions;
export type MasonryInfiniteScrollPlugin = MasonryPlugin & LightMasonryPlugin;

function MasonryInfiniteScrollRuntime({
  host,
  options,
}: MasonryPluginRuntimeProps | LightMasonryPluginRuntimeProps) {
  return (
    <DataInfiniteSentinel
      scope="masonry"
      options={(options as MasonryInfiniteScrollOptions | undefined) ?? {}}
      resetKey={host.itemCount}
    />
  );
}

export function masonryInfiniteScroll(
  options: MasonryInfiniteScrollOptions = {}
): MasonryInfiniteScrollPlugin {
  return {
    __rmgMasonryPlugin: true,
    __rmgLightMasonryPlugin: true,
    kind: "infinite-scroll",
    options: normalizeDataInfiniteScrollOptions(options),
    Runtime: MasonryInfiniteScrollRuntime,
  } as MasonryInfiniteScrollPlugin;
}

export function useMasonryInfiniteScroll(
  options: UseMasonryInfiniteScrollOptions = {}
) {
  return React.useMemo(
    () => masonryInfiniteScroll(options),
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
