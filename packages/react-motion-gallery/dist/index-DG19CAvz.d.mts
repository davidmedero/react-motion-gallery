import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { a as GridItemProps, b as GridOptions, G as GridHandle } from './types-Do4Pq-Td.mjs';

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

export { Grid as G };
