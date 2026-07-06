import { D as DataPaginationControlsProps, a as DataPageItemsOptions, b as DataPageControlItem, c as DataPageRangeOptions, d as DataPageRangeItem, o as DataPaginationOptions, U as UseDataPaginationOptions, e as DataPaginationController, f as DataItemsPerPageOption, g as DataPaginationRippleOptions, h as DataPaginationRippleProp, i as DataPaginationSessionStorageOptions, j as DataPaginationUrlSyncOptions } from './dataPlugins-CsUwdsuu.mjs';
import { f as GridPlugin } from './types-BmnPcuoM.mjs';
import * as React from 'react';
import './infiniteScrollTrigger-BluBDW9o.mjs';
import './force-C5m1QpdF.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './layout-BOy4geKv.mjs';
import './text-BBcRGVzn.mjs';

type GridPaginationOptions = DataPaginationOptions;
type UseGridPaginationOptions = UseDataPaginationOptions;
type GridPaginationUrlSyncOptions = DataPaginationUrlSyncOptions;
type GridPaginationSessionStorageOptions = DataPaginationSessionStorageOptions;
type GridItemsPerPageOption = DataItemsPerPageOption;
type GridPageRangeItem = DataPageRangeItem;
type GridPageControlItem = DataPageControlItem;
type GridPageRangeOptions = DataPageRangeOptions;
type GridPageItemsOptions = DataPageItemsOptions;
type GridPaginationControlsProps = DataPaginationControlsProps;
type GridPaginationRippleOptions = DataPaginationRippleOptions;
type GridPaginationRippleProp = DataPaginationRippleProp;
declare function getGridPageRange(options: GridPageRangeOptions): DataPageRangeItem[];
declare function getGridPageItems(options: GridPageItemsOptions): DataPageControlItem[];
declare function gridPagination(options: GridPaginationOptions): GridPlugin;
declare function useGridPagination(options: UseGridPaginationOptions): DataPaginationController<GridPlugin>;
declare const GridPaginationControls: React.FC<GridPaginationControlsProps>;

export { type GridItemsPerPageOption, type GridPageControlItem, type GridPageItemsOptions, type GridPageRangeItem, type GridPageRangeOptions, GridPaginationControls, type GridPaginationControlsProps, type GridPaginationOptions, type GridPaginationRippleOptions, type GridPaginationRippleProp, type GridPaginationSessionStorageOptions, type GridPaginationUrlSyncOptions, type UseGridPaginationOptions, getGridPageItems, getGridPageRange, gridPagination, useGridPagination };
