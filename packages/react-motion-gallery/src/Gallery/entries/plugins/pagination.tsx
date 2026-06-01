"use client";

import * as React from "react";
import type { EntriesPaginationOptions } from "../types";
import { createEntriesPlugin } from "./create";
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
  type DataPaginationController,
  type DataPaginationRippleOptions,
  type DataPaginationRippleProp,
  type DataPaginationSessionStorageOptions,
  type DataPaginationUrlSyncOptions,
  type UseDataPaginationOptions,
} from "../../shared/dataPlugins";

export type UseEntriesPaginationOptions = UseDataPaginationOptions;
export type EntriesPaginationController = DataPaginationController<
  ReturnType<typeof entriesPagination>
>;
export type EntriesPaginationUrlSyncOptions = DataPaginationUrlSyncOptions;
export type EntriesPaginationSessionStorageOptions =
  DataPaginationSessionStorageOptions;
export type EntriesItemsPerPageOption = DataItemsPerPageOption;
export type EntriesPageRangeItem = DataPageRangeItem;
export type EntriesPageControlItem = DataPageControlItem;
export type EntriesPageRangeOptions = DataPageRangeOptions;
export type EntriesPageItemsOptions = DataPageItemsOptions;
export type EntriesPaginationControlsProps = DataPaginationControlsProps;
export type EntriesPaginationRippleOptions = DataPaginationRippleOptions;
export type EntriesPaginationRippleProp = DataPaginationRippleProp;

export function getEntriesPageRange(options: EntriesPageRangeOptions) {
  return getDataPageRange(options);
}

export function getEntriesPageItems(options: EntriesPageItemsOptions) {
  return getDataPageItems(options);
}

export function entriesPagination(options: EntriesPaginationOptions) {
  return createEntriesPlugin(
    "pagination",
    normalizeDataPaginationOptions(options)
  );
}

export function useEntriesPagination(
  options: UseEntriesPaginationOptions
): EntriesPaginationController {
  return useDataPagination(options, entriesPagination);
}

export const EntriesPaginationControls: React.FC<EntriesPaginationControlsProps> =
  DataPaginationControls;
