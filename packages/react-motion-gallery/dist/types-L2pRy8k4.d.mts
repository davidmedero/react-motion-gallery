import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
import { g as SkeletonLayoutRoot, S as SkeletonNode$1, h as SkeletonWrapStyle, e as SkeletonLength, f as SkeletonShimmer } from './layout-BSjd7pwQ.mjs';

type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";
type MasonrySkeletonWrapStyle = SkeletonWrapStyle;
type SkeletonNode = SkeletonNode$1;
type MasonrySkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: MasonrySkeletonWrapStyle;
    ratio?: number;
    heightPx?: number;
    span?: ResponsiveMasonrySpan;
};
type MasonrySkeletonLayoutNode = SkeletonLayoutRoot<"masonry"> & {
    slots?: MasonrySkeletonSlot[];
};
type MasonrySkeletonNode = MasonrySkeletonLayoutNode | SkeletonNode$1;
type MasonrySkeletonSpec = {
    className?: string;
    layout?: MasonrySkeletonNode;
    ratios?: number[];
    heightsPx?: number[];
    backgroundColor?: string;
    highlightColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

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
type FullscreenTrigger = "item" | "media";
type MasonrySpan = number | "full";
type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;
type MasonryLoadingSkeletonArgs = {
    index: number;
    itemIndex?: number;
    key: React.Key;
    revealKey?: React.Key;
    placeholder: boolean;
    ready: boolean;
    span?: ResponsiveMasonrySpan;
    width?: number;
    height?: number;
};
type MasonryLoadingOptions = {
    enabled?: boolean;
    active?: boolean;
    count?: number;
    skeleton?: MasonrySkeletonSpec | ((args: MasonryLoadingSkeletonArgs) => React.ReactNode);
    cache?: SkeletonCacheOptions;
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
type MasonryPluginKind = "lazy-load" | "pagination" | "load-more" | "infinite-scroll" | "virtualization";
type MasonryPluginItemRenderArgs = {
    index: number;
    itemIndex?: number;
    itemRef: React.Ref<HTMLDivElement>;
    itemProps: React.HTMLAttributes<HTMLDivElement>;
    children: React.ReactNode;
    revealedIndicesRef: React.RefObject<Set<number>>;
};
type MasonryPlugin = {
    readonly __rmgMasonryPlugin: true;
    readonly kind: MasonryPluginKind;
    readonly options?: unknown;
    readonly blocksReady?: boolean;
    readonly Runtime?: React.ComponentType<MasonryPluginRuntimeProps>;
    renderItem?: (args: MasonryPluginItemRenderArgs, options?: unknown) => React.ReactNode;
};
type MasonryPluginHost = {
    handle: MasonryHandle | null;
    itemCount: number;
    ready: boolean;
};
type MasonryPluginRuntimeProps = {
    host: MasonryPluginHost;
    options?: unknown;
};
type MasonryItemProps = {
    span?: ResponsiveMasonrySpan;
    revealKey?: React.Key;
    placeholder?: boolean;
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
    initialHeights?: ReadonlyArray<number | undefined>;
    placement?: "balanced" | "roundRobin" | "horizontalOrder";
    fullscreenTrigger?: FullscreenTrigger;
    itemWrapClassName?: string;
    itemWrapStyle?: React.CSSProperties;
    as?: React.ElementType;
    rootRef?: React.Ref<HTMLDivElement>;
    classNames?: {
        root?: string;
        column?: string;
        item?: string;
    };
    plugins?: MasonryPlugin[];
    reveal?: RevealOptions;
    loading?: MasonryLoadingOptions;
};

export type { MasonryPlugin as M, RevealOptions as R, MasonryPlacement as a, MasonrySkeletonNode as b, MasonrySkeletonSlot as c, MasonrySkeletonSpec as d, MasonryItemProps as e, MasonryOptions as f, MasonryHandle as g, MasonryLoadingOptions as h, MasonryLoadingSkeletonArgs as i, MasonryPluginHost as j, MasonryPluginKind as k, MasonryPluginRuntimeProps as l, MasonrySpan as m, ResponsiveMasonrySpan as n, MasonrySkeletonLayoutNode as o };
