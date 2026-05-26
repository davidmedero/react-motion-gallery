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
type FullscreenTrigger = "item" | "media";
type MasonrySpan = number | "full";
type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;
type MasonryPluginKind = "lazy-load";
type MasonryPluginItemRenderArgs = {
    index: number;
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
    renderItem?: (args: MasonryPluginItemRenderArgs, options?: unknown) => React.ReactNode;
};
type MasonryItemProps = {
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
};

export type { MasonryPlugin as M, ResponsiveMasonrySpan as R, MasonryItemProps as a, MasonryOptions as b, MasonryHandle as c, MasonryPluginKind as d, MasonrySpan as e, RevealOptions as f };
