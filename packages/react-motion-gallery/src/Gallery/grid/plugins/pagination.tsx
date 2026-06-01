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
import { createGridPlugin } from "./create";

export type GridPaginationOptions = DataPaginationOptions;
export type UseGridPaginationOptions = UseDataPaginationOptions;
export type GridPaginationUrlSyncOptions = DataPaginationUrlSyncOptions;
export type GridPaginationSessionStorageOptions =
  DataPaginationSessionStorageOptions;
export type GridItemsPerPageOption = DataItemsPerPageOption;
export type GridPageRangeItem = DataPageRangeItem;
export type GridPageControlItem = DataPageControlItem;
export type GridPageRangeOptions = DataPageRangeOptions;
export type GridPageItemsOptions = DataPageItemsOptions;
export type GridPaginationControlsProps = DataPaginationControlsProps;
export type GridPaginationRippleOptions = DataPaginationRippleOptions;
export type GridPaginationRippleProp = DataPaginationRippleProp;

export function getGridPageRange(options: GridPageRangeOptions) {
  return getDataPageRange(options);
}

export function getGridPageItems(options: GridPageItemsOptions) {
  return getDataPageItems(options);
}

export function gridPagination(options: GridPaginationOptions) {
  return createGridPlugin("pagination", {
    options: normalizeDataPaginationOptions(options),
  });
}

export function useGridPagination(options: UseGridPaginationOptions) {
  return useDataPagination(options, gridPagination);
}

export const GridPaginationControls: React.FC<GridPaginationControlsProps> =
  DataPaginationControls;
