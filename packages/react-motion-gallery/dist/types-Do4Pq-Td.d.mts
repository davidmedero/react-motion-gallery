import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';

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
type GridSpan = number | "full";
type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
type ResponsiveGridTemplate = string | Record<string, string>;
type GridPluginKind = "lazy-load";
type GridPluginItemRenderArgs = {
    index: number;
    key: React.Key;
    itemProps: React.HTMLAttributes<HTMLDivElement>;
    children: React.ReactNode;
    registerExpandableImage: (index: number, node: HTMLImageElement | null) => void;
    revealedIndicesRef: React.RefObject<Set<number>>;
};
type GridPlugin = {
    readonly __rmgGridPlugin: true;
    readonly kind: GridPluginKind;
    readonly options?: unknown;
    readonly blocksReady?: boolean;
    renderItem?: (args: GridPluginItemRenderArgs, options?: unknown) => React.ReactNode;
};
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
    plugins?: GridPlugin[];
    intro?: IntroOptions;
};

export type { GridHandle as G, IntroOptions as I, ResponsiveGridSpan as R, GridItemProps as a, GridOptions as b, GridPlugin as c, GridPluginKind as d, GridSpan as e, ResponsiveGridTemplate as f };
