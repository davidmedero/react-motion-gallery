import { I as IndexMode, R as ResponsiveNumber, E as ElementStyle, L as LoadingTimingOptions } from './responsive-D_xhZmVI.mjs';
import { A as ArrowRenderArgs, D as DotsRenderArgs, P as ProgressRenderArgs, S as ScrollbarRenderArgs } from './controls-SpWg1Kgt.mjs';
import * as React$1 from 'react';
import { RefObject } from 'react';
import { R as ResponsiveTextLineCount, a as ResponsiveTextLineWidth } from './text-Cl2tR8oO.mjs';
import { S as SliderIndexChannel } from './sliderSub-Bo6Y8as_.mjs';

type SkeletonLength = number | string;
type SkeletonShimmer = {
    enabled?: boolean;
    durationMs?: number;
    angleDeg?: number;
    opacity?: number;
    blurPx?: number;
    timing?: string;
    c1?: string;
    c2?: string;
    c3?: string;
};
type SkeletonBaseStyle = {
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
    height?: SkeletonLength;
    maxHeight?: SkeletonLength;
    backgroundColor?: string;
    borderRadius?: SkeletonLength;
    overflow?: React$1.CSSProperties["overflow"];
    marginTop?: SkeletonLength;
    marginRight?: SkeletonLength;
    marginBottom?: SkeletonLength;
    marginLeft?: SkeletonLength;
    alignSelf?: React$1.CSSProperties["alignSelf"];
    aspectRatio?: SkeletonLength;
    scale?: number;
};
type SkeletonBaseStyleResponsive = SkeletonBaseStyle | Record<string, SkeletonBaseStyle>;
type SliderSkeletonWrapStyle = SkeletonBaseStyle & {
    border?: React$1.CSSProperties["border"];
    boxShadow?: React$1.CSSProperties["boxShadow"];
};
type SkeletonContainerStyle = {
    gap?: SkeletonLength;
    padding?: SkeletonLength;
    align?: React$1.CSSProperties["alignItems"];
    justify?: React$1.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
    overflow?: React$1.CSSProperties["overflow"];
};
type SkeletonContainerStyleResponsive = SkeletonContainerStyle | Record<string, SkeletonContainerStyle>;
type SliderSkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: SliderSkeletonWrapStyle;
};
type SliderSkeletonSliderNode = {
    kind: "slider";
    style?: SkeletonContainerStyleResponsive;
    count?: number;
    item: SkeletonNode;
    itemWrapStyle?: SliderSkeletonWrapStyle;
    slots?: SliderSkeletonSlot[];
    direction?: "row" | "col";
    children?: SkeletonNode[];
};
type SliderSkeletonNode = SliderSkeletonSliderNode | SkeletonNode;
type SkeletonNode = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    children: SkeletonNode[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyleResponsive;
        shimmer?: SkeletonShimmer;
    };
} | {
    kind: "text";
    fontSize: number;
    lineHeight: number;
    lines?: ResponsiveTextLineCount;
    lineWidth?: ResponsiveTextLineWidth;
    style?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
};
type SliderSkeletonSpec = {
    mode?: "fit" | "peek";
    centering?: "first";
    className?: string;
    style?: React$1.CSSProperties;
    layout?: SliderSkeletonNode;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

type ResponsiveHeightRule = {
    query: string;
    height: string;
};
type SliderLayout = {
    gap?: number;
    cellsPerSlide?: ResponsiveNumber;
};
type SliderDirection = {
    dir?: "ltr" | "rtl";
    axis?: "x" | "y";
};
type SliderElements = {
    viewport?: ElementStyle;
    container?: ElementStyle;
};
type SliderScroll = {
    groupCells?: boolean;
    skipSnaps?: boolean;
    freeScroll?: boolean;
    loop?: boolean;
};
type SliderArrows = {
    enabled?: boolean;
    arrow?: ElementStyle;
    prev?: ElementStyle;
    next?: ElementStyle;
    render?: (args: ArrowRenderArgs & {
        dir: "prev" | "next";
    }) => React.ReactNode;
    renderPrev?: (args: ArrowRenderArgs) => React.ReactNode;
    renderNext?: (args: ArrowRenderArgs) => React.ReactNode;
};
type SliderDots = {
    enabled?: boolean;
    root?: ElementStyle;
    dot?: ElementStyle;
    render?: (args: DotsRenderArgs) => React.ReactNode;
};
type SliderProgress = {
    enabled?: boolean;
    root?: ElementStyle;
    bar?: ElementStyle;
    render?: (args: ProgressRenderArgs) => React.ReactNode;
};
type SliderScrollbar = {
    enabled?: boolean;
    root?: ElementStyle;
    render?: (args: ScrollbarRenderArgs) => React.ReactNode;
};
type SliderRipple = {
    enabled?: boolean;
    className?: string;
};
type SliderControls = {
    arrows?: SliderArrows;
    dots?: SliderDots;
    progress?: SliderProgress;
    scrollbar?: SliderScrollbar;
    ripple?: SliderRipple;
};
type SliderAutoPlay = {
    enabled?: boolean;
    speedMs?: number;
    pauseMs?: number;
    pauseOnHover?: boolean;
};
type SliderAutoScroll = {
    enabled?: boolean;
    speedMs?: number;
    pauseMs?: number;
    pauseOnHover?: boolean;
};
type SliderAuto = {
    play?: SliderAutoPlay;
    scroll?: SliderAutoScroll;
};
type SliderLoadingOptions = {
    enabled?: boolean;
    force?: boolean;
    skeletonCount?: ResponsiveNumber;
    renderLoading?: (args: {
        count: number;
    }) => React.ReactNode;
    skeleton?: SliderSkeletonSpec;
    timing?: LoadingTimingOptions;
};
type SliderIntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
};
type SliderTransitions = {
    loading?: SliderLoadingOptions;
    intro?: SliderIntroOptions;
};
type SliderParallax = {
    enabled?: boolean;
    bleedPct?: string;
    borderRadius?: string;
    sideWidth?: string;
};
type SliderScale = {
    enabled?: boolean;
    amount?: number;
};
type SliderFade = {
    enabled?: boolean;
    minOpacity?: number;
};
type CrossFade = {
    controls?: boolean;
    drag?: boolean;
    durationMs?: number;
    easing?: string;
};
type SliderEffects = {
    parallax?: SliderParallax;
    scale?: SliderScale;
    fade?: SliderFade;
    crossfade?: CrossFade;
};
type SliderMotion = {
    selectDuration?: number;
    freeScrollDuration?: number;
    friction?: number;
};
type SliderLazyLoadOptions = {
    enabled?: boolean;
    spinner?: boolean | React.ReactNode | ((args: {
        kind: "image" | "video";
        isClone: boolean;
    }) => React.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React.CSSProperties;
};
type SliderOptions = {
    layout?: SliderLayout;
    direction?: SliderDirection;
    align?: "start" | "center";
    scroll?: SliderScroll;
    elements?: SliderElements;
    lazyLoad?: SliderLazyLoadOptions;
    controls?: SliderControls;
    auto?: SliderAuto;
    transitions?: SliderTransitions;
    motion?: SliderMotion;
    effects?: SliderEffects;
    indexChannel?: SliderIndexChannel;
};
type SliderUiSelectOptions = {
    crossfade?: boolean;
    durationMs?: number;
    easing?: string;
};
interface SliderHandle {
    centerSlider: () => void;
    getIndex: () => number;
    setIndex: (i: number, mode?: IndexMode) => void;
    subscribeIndex: (fn: () => void) => () => void;
    slideIndexForCell: (cellIndex: number) => number;
    getRootNode(): HTMLElement | null;
    getContainerNode(): HTMLElement | null;
    getSlideNodes(): HTMLElement[];
    getViewportNode: () => HTMLDivElement | null;
    onSlidesBuilt(cb: (nodes: HTMLElement[]) => void): () => void;
    whenSlidesBuilt(): Promise<HTMLElement[]>;
    isSlidesBuilt(): boolean;
    scrollNext: (mode?: IndexMode) => void;
    scrollPrev: (mode?: IndexMode) => void;
    canScrollNext: () => boolean;
    canScrollPrev: () => boolean;
    scrollProgress: () => number;
    cellsInView: () => number[];
    getInternals(): {
        slides: RefObject<{
            cells: {
                element: HTMLElement;
                index: number;
            }[];
            target: number;
        }[]>;
        slider: RefObject<HTMLDivElement | null>;
        visibleImages: RefObject<number>;
        selectedIndex: RefObject<number>;
        sliderX: RefObject<number>;
        sliderVelocity: RefObject<number>;
        isWrapping: RefObject<boolean>;
    };
    setIndexFromUi: (i: number, opts?: SliderUiSelectOptions) => void;
}

export type { ResponsiveHeightRule as R, SliderOptions as S, SliderHandle as a };
