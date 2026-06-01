"use client";

import {
  normalizeDataLoadMoreOptions,
  useDataLoadMore,
  type DataLoadMoreOptions,
  type UseDataLoadMoreOptions,
} from "../../shared/dataPlugins";
import { createGridPlugin } from "./create";

export type GridLoadMoreOptions = DataLoadMoreOptions;
export type UseGridLoadMoreOptions = UseDataLoadMoreOptions;

export function gridLoadMore(options: GridLoadMoreOptions) {
  return createGridPlugin("load-more", {
    options: normalizeDataLoadMoreOptions(options),
  });
}

export function useGridLoadMore(options: UseGridLoadMoreOptions) {
  return useDataLoadMore(options, gridLoadMore);
}

