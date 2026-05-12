import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
import { G as GalleryLazyLoadOptions } from './lazy-dGoYpcRa.mjs';

type IntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    staggerLimit?: number;
};
type FullscreenTrigger = 'item' | 'media';
type GridLazyLoadOptions = GalleryLazyLoadOptions;
type GridSpan = number | "full";
type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
type ResponsiveGridTemplate = string | Record<string, string>;
type GridItemProps = {
    span?: ResponsiveGridSpan;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
};
type GridHandle = {
    getRootNode: () => HTMLElement | null;
    getItemNodes: () => HTMLElement[];
    isReady: () => boolean;
    onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};
type GridOptions = {
    columns?: ResponsiveNumber;
    templateColumns?: ResponsiveGridTemplate;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    rootClassName?: string;
    itemClassName?: string;
    fullscreenTrigger?: FullscreenTrigger;
    lazyLoad?: GridLazyLoadOptions;
    intro?: IntroOptions;
};

export type { GridHandle as G, IntroOptions as I, ResponsiveGridSpan as R, GridItemProps as a, GridLazyLoadOptions as b, GridOptions as c, GridSpan as d, ResponsiveGridTemplate as e };
