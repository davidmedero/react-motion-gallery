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
type FullscreenTrigger = "item" | "media";
type MasonryLazyLoadOptions = GalleryLazyLoadOptions;
type MasonrySpan = number | "full";
type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;
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
    lazyLoad?: MasonryLazyLoadOptions;
    intro?: IntroOptions;
};

export type { IntroOptions as I, MasonryHandle as M, ResponsiveMasonrySpan as R, MasonryItemProps as a, MasonryLazyLoadOptions as b, MasonryOptions as c, MasonrySpan as d };
