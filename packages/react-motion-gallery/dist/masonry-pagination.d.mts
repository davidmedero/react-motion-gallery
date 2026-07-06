import { f as DataItemsPerPageOption, o as DataPaginationOptions, i as DataPaginationSessionStorageOptions, U as UseDataPaginationOptions, D as DataPaginationControlsProps, a as DataPageItemsOptions, b as DataPageControlItem, c as DataPageRangeOptions, d as DataPageRangeItem, e as DataPaginationController, g as DataPaginationRippleOptions, h as DataPaginationRippleProp, j as DataPaginationUrlSyncOptions } from './dataPlugins-CsUwdsuu.mjs';
import * as React from 'react';
import { M as MasonryPlugin } from './types-Bg0qLhxl.mjs';
import { M as MasonryPlugin$1 } from './types-qMg7LB37.mjs';
import './infiniteScrollTrigger-BluBDW9o.mjs';

type MasonryPaginationOptions = DataPaginationOptions;
type UseMasonryPaginationOptions = UseDataPaginationOptions;
type MasonryPaginationUrlSyncOptions = DataPaginationUrlSyncOptions;
type MasonryPaginationSessionStorageOptions = DataPaginationSessionStorageOptions;
type MasonryItemsPerPageOption = DataItemsPerPageOption;
type MasonryPageRangeItem = DataPageRangeItem;
type MasonryPageControlItem = DataPageControlItem;
type MasonryPageRangeOptions = DataPageRangeOptions;
type MasonryPageItemsOptions = DataPageItemsOptions;
type MasonryPaginationControlsProps = DataPaginationControlsProps;
type MasonryPaginationRippleOptions = DataPaginationRippleOptions;
type MasonryPaginationRippleProp = DataPaginationRippleProp;
type MasonryPaginationPlugin = MasonryPlugin & MasonryPlugin$1;
declare function getMasonryPageRange(options: MasonryPageRangeOptions): DataPageRangeItem[];
declare function getMasonryPageItems(options: MasonryPageItemsOptions): DataPageControlItem[];
declare function masonryPagination(options: MasonryPaginationOptions): MasonryPaginationPlugin;
declare function useMasonryPagination(options: UseMasonryPaginationOptions): DataPaginationController<MasonryPaginationPlugin>;
declare const MasonryPaginationControls: React.FC<MasonryPaginationControlsProps>;

export { type MasonryItemsPerPageOption, type MasonryPageControlItem, type MasonryPageItemsOptions, type MasonryPageRangeItem, type MasonryPageRangeOptions, MasonryPaginationControls, type MasonryPaginationControlsProps, type MasonryPaginationOptions, type MasonryPaginationPlugin, type MasonryPaginationRippleOptions, type MasonryPaginationRippleProp, type MasonryPaginationSessionStorageOptions, type MasonryPaginationUrlSyncOptions, type UseMasonryPaginationOptions, getMasonryPageItems, getMasonryPageRange, masonryPagination, useMasonryPagination };
