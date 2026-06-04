import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { b as GridItemProps, e as GridOptions, a as GridHandle } from './types-BmnPcuoM.mjs';
export { G as GridFullscreenTrigger, c as GridLoadingOptions, d as GridLoadingSkeletonArgs, f as GridPlugin, g as GridPluginHost, h as GridPluginKind, i as GridPluginRuntimeProps, o as GridSkeletonNode, p as GridSkeletonSlot, l as GridSkeletonSpec, j as GridSpan, R as ResponsiveGridSpan, k as ResponsiveGridTemplate, m as RevealOptions } from './types-BmnPcuoM.mjs';
export { GridReadyController, useGridReady } from './grid-ready.mjs';
export { GridItemsPerPageOption, GridPaginationControlsProps, GridPaginationOptions, GridPaginationRippleOptions, GridPaginationRippleProp, GridPaginationSessionStorageOptions, UseGridPaginationOptions } from './grid-pagination.mjs';
export { GridLoadMoreOptions, UseGridLoadMoreOptions } from './grid-load-more.mjs';
export { GridInfiniteScrollOptions, UseGridInfiniteScrollOptions } from './grid-infinite-scroll.mjs';
export { GridVirtualizationOptions, UseGridVirtualizerOptions } from './grid-virtualization.mjs';
import './force-C5m1QpdF.mjs';
import './layout-BOy4geKv.mjs';
import './text-BBcRGVzn.mjs';
import './dataPlugins-C91mlyu6.mjs';

type GridItemComponent = React.FC<GridItemProps> & {
    __rmgGridItem: true;
};
declare const GridItem: GridItemComponent;

type Props = GridOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    gridItemBaseClass?: string;
    renderMode?: "wrap" | "passthrough";
};
type GridComponent = React.ForwardRefExoticComponent<Props & React.RefAttributes<GridHandle>> & {
    Item: typeof GridItem;
};
declare const Grid: GridComponent;

export { Grid, GridHandle, GridItemProps, GridOptions, Grid as default };
