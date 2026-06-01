"use client";

import * as React from "react";
import {
  DataPaginationControls,
  getDataPageItems,
  getDataPageRange,
  normalizeDataPaginationOptions,
  useDataPagination,
  type DataItemsPerPageOption,
  type DataPageControlItem,
  type DataPageItemsOptions,
  type DataPageRangeItem,
  type DataPageRangeOptions,
  type DataPaginationControlsProps,
  type DataPaginationOptions,
  type DataPaginationRippleOptions,
  type DataPaginationRippleProp,
  type DataPaginationSessionStorageOptions,
  type DataPaginationUrlSyncOptions,
  type UseDataPaginationOptions,
} from "../../shared/dataPlugins";
import type { MasonryPlugin } from "../types";
import type { MasonryPlugin as LightMasonryPlugin } from "../light/types";

export type MasonryPaginationOptions = DataPaginationOptions;
export type UseMasonryPaginationOptions = UseDataPaginationOptions;
export type MasonryPaginationUrlSyncOptions = DataPaginationUrlSyncOptions;
export type MasonryPaginationSessionStorageOptions =
  DataPaginationSessionStorageOptions;
export type MasonryItemsPerPageOption = DataItemsPerPageOption;
export type MasonryPageRangeItem = DataPageRangeItem;
export type MasonryPageControlItem = DataPageControlItem;
export type MasonryPageRangeOptions = DataPageRangeOptions;
export type MasonryPageItemsOptions = DataPageItemsOptions;
export type MasonryPaginationControlsProps = DataPaginationControlsProps;
export type MasonryPaginationRippleOptions = DataPaginationRippleOptions;
export type MasonryPaginationRippleProp = DataPaginationRippleProp;
export type MasonryPaginationPlugin = MasonryPlugin & LightMasonryPlugin;

export function getMasonryPageRange(options: MasonryPageRangeOptions) {
  return getDataPageRange(options);
}

export function getMasonryPageItems(options: MasonryPageItemsOptions) {
  return getDataPageItems(options);
}

export function masonryPagination(
  options: MasonryPaginationOptions
): MasonryPaginationPlugin {
  return {
    __rmgMasonryPlugin: true,
    __rmgLightMasonryPlugin: true,
    kind: "pagination",
    options: normalizeDataPaginationOptions(options),
  } as MasonryPaginationPlugin;
}

export function useMasonryPagination(options: UseMasonryPaginationOptions) {
  return useDataPagination(options, masonryPagination);
}

export const MasonryPaginationControls: React.FC<MasonryPaginationControlsProps> =
  DataPaginationControls;
