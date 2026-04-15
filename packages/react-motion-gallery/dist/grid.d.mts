import * as React from 'react';
import { c as BreakpointMap } from './responsive-D_xhZmVI.mjs';
import { G as GridItemProps, b as GridOptions } from './types-XEr8LRal.mjs';
export { a as GridLazyLoadOptions, c as GridSpan, R as ResponsiveGridSpan, d as ResponsiveGridTemplate } from './types-XEr8LRal.mjs';
import './plyrTypes-Cq4C3ul5.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import './layout-CR6f2aPH.mjs';
import './text-Cl2tR8oO.mjs';

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
type GridComponent = ((props: Props) => React.JSX.Element) & {
    Item: typeof GridItem;
};
declare const Grid: GridComponent;

declare const DEFAULT_GRID: Required<Pick<GridOptions, "minColumnWidth" | "gap">>;

export { DEFAULT_GRID, Grid, GridItemProps, GridOptions, Grid as default };
