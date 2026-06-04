import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
import { c as SkeletonLayoutRoot, S as SkeletonNode$1, d as SkeletonWrapStyle, a as SkeletonLength, b as SkeletonShimmer } from './layout-BOy4geKv.mjs';

type GridSkeletonWrapStyle = SkeletonWrapStyle;
type SkeletonNode = SkeletonNode$1;
type GridSkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: GridSkeletonWrapStyle;
    span?: ResponsiveGridSpan;
};
type GridSkeletonLayoutNode = SkeletonLayoutRoot<"grid"> & {
    slots?: GridSkeletonSlot[];
};
type GridSkeletonNode = GridSkeletonLayoutNode | SkeletonNode$1;
type GridSkeletonSpec = {
    className?: string;
    layout?: GridSkeletonNode;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

type RevealOptions = {
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    disabled?: boolean;
    staggerLimit?: number;
};
type GridLoadingSkeletonArgs = {
    index: number;
    key: React.Key;
    revealKey?: React.Key;
    placeholder: boolean;
    ready: boolean;
};
type GridLoadingOptions = {
    enabled?: boolean;
    active?: boolean;
    count?: number;
    skeleton?: GridSkeletonSpec | ((args: GridLoadingSkeletonArgs) => React.ReactNode);
    force?: LoadingForceOptions;
    timing?: {
        enterMs?: number;
        minVisibleMs?: number;
        exitMs?: number;
    };
    animate?: boolean;
    waitForMedia?: boolean;
    decodeTimeoutMs?: number;
    rootMargin?: string;
    threshold?: number;
    keepSkeletonMounted?: boolean;
    rememberRevealed?: boolean;
};
type GridFullscreenTrigger = 'item' | 'media';
type GridSpan = number | "full";
type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
type ResponsiveGridTemplate = string | Record<string, string>;
type GridPluginKind = "lazy-load" | "fullscreen" | "pagination" | "load-more" | "infinite-scroll" | "virtualization";
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
    visibleItemCount: number;
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
    revealKey?: React.Key;
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
    loading?: GridLoadingOptions;
};

export type { GridFullscreenTrigger as G, ResponsiveGridSpan as R, GridHandle as a, GridItemProps as b, GridLoadingOptions as c, GridLoadingSkeletonArgs as d, GridOptions as e, GridPlugin as f, GridPluginHost as g, GridPluginKind as h, GridPluginRuntimeProps as i, GridSpan as j, ResponsiveGridTemplate as k, GridSkeletonSpec as l, RevealOptions as m, GridSkeletonLayoutNode as n, GridSkeletonNode as o, GridSkeletonSlot as p };
