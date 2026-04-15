import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { c as BreakpointMap } from './responsive-D_xhZmVI.mjs';
import { M as MasonryOptions } from './types-VULXzSa2.mjs';
export { a as MasonryLazyLoadOptions } from './types-VULXzSa2.mjs';
import './plyrTypes-Cq4C3ul5.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import './layout-CR6f2aPH.mjs';
import './text-Cl2tR8oO.mjs';

type Props = MasonryOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
};
declare function Masonry(props: Props): react_jsx_runtime.JSX.Element;

declare const DEFAULT_MASONRY: Required<Pick<MasonryOptions, "placement" | "fullscreenTrigger">>;

export { DEFAULT_MASONRY, Masonry, MasonryOptions, Masonry as default };
