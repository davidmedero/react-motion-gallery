"use client";

import {
  normalizeDataLoadMoreOptions,
  useDataLoadMore,
  type DataLoadMoreOptions,
  type UseDataLoadMoreOptions,
} from "../../shared/dataPlugins";
import type { MasonryPlugin } from "../types";
import type { MasonryPlugin as LightMasonryPlugin } from "../light/types";

export type MasonryLoadMoreOptions = DataLoadMoreOptions;
export type UseMasonryLoadMoreOptions = UseDataLoadMoreOptions;
export type MasonryLoadMorePlugin = MasonryPlugin & LightMasonryPlugin;

export function masonryLoadMore(
  options: MasonryLoadMoreOptions
): MasonryLoadMorePlugin {
  return {
    __rmgMasonryPlugin: true,
    __rmgLightMasonryPlugin: true,
    kind: "load-more",
    options: normalizeDataLoadMoreOptions(options),
  } as MasonryLoadMorePlugin;
}

export function useMasonryLoadMore(options: UseMasonryLoadMoreOptions) {
  return useDataLoadMore(options, masonryLoadMore);
}

