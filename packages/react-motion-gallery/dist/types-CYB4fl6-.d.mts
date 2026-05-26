import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';

type RevealOptions = {
    renderReveal?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    disabled?: boolean;
    staggerLimit?: number;
};
type GridFullscreenTrigger = 'item' | 'media';
type GridSpan = number | "full";
type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
type ResponsiveGridTemplate = string | Record<string, string>;
type GridPluginKind = "lazy-load" | "fullscreen";
type GridPluginItemRenderArgs = {
    index: number;
    key: React.Key;
    itemProps: React.HTMLAttributes<HTMLDivElement>;
    children: React.ReactNode;
    registerExpandableImage: (index: number, node: HTMLImageElement | null) => void;
    revealedIndicesRef: React.RefObject<Set<number>>;
};
type GridPluginHost = {
    handle: GridHandle | null;
    itemCount: number;
    ready: boolean;
    fullscreenTrigger: GridFullscreenTrigger;
};
type GridPluginRuntimeProps = {
    host: GridPluginHost;
    options?: unknown;
};
type GridPlugin = {
    readonly __rmgGridPlugin: true;
    readonly kind: GridPluginKind;
    readonly options?: unknown;
    readonly blocksReady?: boolean;
    readonly Runtime?: React.ComponentType<GridPluginRuntimeProps>;
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
    fullscreenTrigger?: GridFullscreenTrigger;
    plugins?: GridPlugin[];
    reveal?: RevealOptions;
};

export type { GridFullscreenTrigger as G, RevealOptions as R, GridHandle as a, GridItemProps as b, GridOptions as c, GridPlugin as d, GridPluginHost as e, GridPluginKind as f, GridPluginRuntimeProps as g, GridSpan as h, ResponsiveGridSpan as i, ResponsiveGridTemplate as j };
