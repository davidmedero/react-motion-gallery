import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { a as MasonryItemProps, b as MasonryOptions, M as MasonryHandle } from './types-Br27DWP7.mjs';
export { c as MasonryPlugin, d as MasonryPluginKind, e as MasonrySpan, R as ResponsiveMasonrySpan } from './types-Br27DWP7.mjs';
export { MasonryReadyController, useMasonryReady } from './masonry-ready.mjs';

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
