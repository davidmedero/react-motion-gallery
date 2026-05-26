import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { M as MasonryPlacement, R as ResponsiveMasonrySpan } from './placement-BWKxkHD8.mjs';
export { a as MasonrySpan } from './placement-BWKxkHD8.mjs';
import { M as MasonryPlugin } from './types-0ntfoMKP.mjs';
export { a as MasonryPluginHost, b as MasonryPluginKind, c as MasonryPluginRuntimeProps } from './types-0ntfoMKP.mjs';
export { MasonryReadyController, useMasonryReady } from './masonry-ready.mjs';
import './types-Cc37Drgz.mjs';

type MasonryClassNames = {
    root?: string;
    item?: string;
};
type MasonryRevealOptions = {
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    disabled?: boolean;
};
type MasonryItemProps = {
    width: number;
    height: number;
    span?: ResponsiveMasonrySpan;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
};
type MasonryHandle = {
    getRootNode: () => HTMLElement | null;
    getItemNodes: () => HTMLElement[];
    isReady: () => boolean;
    onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};
type MasonryOptions = {
    columns?: ResponsiveNumber;
    gap?: ResponsiveNumber;
    placement?: MasonryPlacement;
    plugins?: MasonryPlugin[];
    as?: React.ElementType;
    rootRef?: React.Ref<HTMLElement>;
    classNames?: MasonryClassNames;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    reveal?: MasonryRevealOptions;
    revealReady?: boolean;
};
type MasonryItemComponent = React.FC<MasonryItemProps> & {
    __rmgLightMasonryItem: true;
};
type MasonryComponent = React.ForwardRefExoticComponent<MasonryOptions & React.RefAttributes<MasonryHandle>> & {
    Item: MasonryItemComponent;
};
declare const MasonryItem: MasonryItemComponent;
declare const Masonry: MasonryComponent;

export { Masonry, type MasonryHandle, MasonryItem, type MasonryItemProps, type MasonryOptions, MasonryPlacement, MasonryPlugin, type MasonryRevealOptions, ResponsiveMasonrySpan, Masonry as default };
