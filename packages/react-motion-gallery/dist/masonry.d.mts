import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { a as MasonryItemProps, c as MasonryOptions, M as MasonryHandle } from './types-DWzjXjYR.mjs';
export { b as MasonryLazyLoadOptions, d as MasonrySpan, R as ResponsiveMasonrySpan } from './types-DWzjXjYR.mjs';
export { MasonryReadyController, useMasonryReady } from './masonry-ready.mjs';
import './lazy-dGoYpcRa.mjs';

type MasonryItemComponent = React.FC<MasonryItemProps> & {
    __rmgMasonryItem: true;
};
declare const MasonryItem: MasonryItemComponent;

type Props = MasonryOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
};
type MasonryComponent = React.ForwardRefExoticComponent<Props & React.RefAttributes<MasonryHandle>> & {
    Item: typeof MasonryItem;
};
declare const Masonry: MasonryComponent;

export { Masonry, MasonryHandle, MasonryItemProps, MasonryOptions, Masonry as default };
