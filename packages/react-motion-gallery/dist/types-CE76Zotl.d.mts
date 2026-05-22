import { B as BreakpointMap, R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
import { RefObject } from 'react';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { MediaItem } from './media.mjs';

type ArrowRenderArgs = {
    ref: React.RefObject<HTMLDivElement | null>;
    onClick: () => void;
    hidden: boolean;
    disabled: boolean;
    createRipple: (el: HTMLElement) => void;
    className?: string;
};
type DotsRenderArgs = {
    ref: React.RefObject<HTMLDivElement | null>;
    count: number;
    activeIndex: number;
    hidden: boolean;
    goTo: (index: number) => void;
    getDotRef: (index: number) => (el: HTMLDivElement | null) => void;
    createRipple: (el: HTMLElement) => void;
    classNameContainer?: string;
    classNameDot?: string;
};
type ProgressRenderArgs = {
    ref: React.Ref<HTMLDivElement>;
    innerRef?: React.Ref<HTMLDivElement>;
    hidden: boolean;
    progress: number;
    axis: 'x' | 'y';
    className?: string;
    style?: React.CSSProperties;
    innerClassName?: string;
    innerStyle?: React.CSSProperties;
};
type ScrollbarRenderArgs = {
    ref: React.RefObject<HTMLInputElement | null>;
    hidden: boolean;
    value: number;
    axis: 'x' | 'y';
    min: number;
    max: number;
    step: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    style?: React.CSSProperties;
};

type ElementStyle = {
    className?: string;
    style?: React.CSSProperties;
};

type IndexMode = "animated" | "instant";
type FullscreenOpenMethod = "fade" | "scale";
type OpenFullscreenAtArgs = {
    index: number;
    method?: FullscreenOpenMethod;
    event?: Event;
};
type FullscreenOpenSource = "slider" | "grid" | "masonry" | "entries" | "api";
type FullscreenOpenRequest = {
    source: FullscreenOpenSource;
    index: number;
    image: HTMLImageElement | null;
    method?: FullscreenOpenMethod;
    requestedMethod?: FullscreenOpenMethod;
    event?: Event;
};
interface GalleryCoreApi {
    layout: "slider" | "grid" | "masonry" | "entries" | null;
    effectiveBreakpoints: BreakpointMap;
    normalizedItems: MediaItem[];
    fsEnabled: boolean;
    setFsEnabled: (enabled: boolean) => void;
    isFullscreenOpen: boolean;
    isFullscreenOpenRef: React.RefObject<boolean>;
    setFullscreenOpen: (open: boolean) => void;
    openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
    notifyBaseVisibleIndex: (index: number) => void;
    notifyFsVisibleIndex: (index: number) => void;
    registerExpandableImage: (index: number, node: HTMLElement | null) => void;
}
interface GalleryLayoutApi {
    rootNode(): HTMLElement | null;
    containerNode(): HTMLElement | null;
    getViewportNode: () => HTMLDivElement | null;
    slideNodes(): HTMLElement[];
    onReady?(cb: (nodes: HTMLElement[]) => void): () => void;
    whenReady?(): Promise<HTMLElement[]>;
    isReady?(): boolean;
    scrollTo(index: number, jump?: boolean): void;
    scrollNext(jump?: boolean): void;
    scrollPrev(jump?: boolean): void;
    canScrollNext(): boolean;
    canScrollPrev(): boolean;
    getIndex(): number;
    selectCell(index: number, jump?: boolean): void;
    scrollProgress(): number;
    cellsInView(): number[];
}
interface GalleryApi extends GalleryLayoutApi, SliderApi {
    openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
}

type IndexListener = () => void;
type IndexEventMeta = {
    source?: "thumbnail" | "external";
    transition?: "scroll" | "crossfade";
    crossfade?: {
        durationMs?: number;
        easing?: string;
    };
};
type IndexEvent = {
    type: "set";
    index: number;
    mode: IndexMode;
    meta?: IndexEventMeta;
} | {
    type: "bump";
    delta: number;
    mode: IndexMode;
    meta?: IndexEventMeta;
};
type EventListener = (ev: IndexEvent) => void;
type BasePointerDownListener = () => void;
type SliderIndexChannel = ReturnType<typeof createSliderIndexChannel>;
declare function createSliderIndexChannel(initialIndex?: number, initialMode?: IndexMode): {
    get(): {
        index: number;
        mode: IndexMode;
    };
    set(next: number, m?: IndexMode, opts?: {
        silent?: boolean;
        meta?: IndexEventMeta;
    }): void;
    bump(delta: number, m?: IndexMode, opts?: {
        silent?: boolean;
        meta?: IndexEventMeta;
    }): void;
    subscribe(fn: IndexListener): () => void;
    onEvent(fn: EventListener): () => void;
    onBasePointerDown(fn: BasePointerDownListener): () => void;
    emitBasePointerDown: () => void;
};

type SliderNodeInput = React.ReactNode | React.ReactNode[];
type SliderRemoveTarget = number | ((i: number) => boolean);
interface SliderItemsApi {
    append(nodes: SliderNodeInput): number;
    prepend(nodes: SliderNodeInput): number;
    insert(index: number, nodes: SliderNodeInput): number;
    remove(indexOrPredicate: SliderRemoveTarget): number;
    replace(index: number, node: React.ReactNode): void;
    setItems(nodes: React.ReactNode[]): number;
}
interface SliderApi extends SliderItemsApi {
    onIndexChange(cb: (i: number, meta: {
        mode: IndexMode;
    }) => void): () => void;
}
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
type SliderSkipSnapsOptions = {
    enabled?: boolean;
    threshold?: number;
};
type SliderSkipSnaps = boolean | SliderSkipSnapsOptions;
type SliderScroll = {
    groupCells?: boolean | ResponsiveNumber;
    skipSnaps?: SliderSkipSnaps;
    strictSnaps?: boolean;
    freeScroll?: boolean;
    loop?: boolean;
    containScroll?: boolean;
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
type SliderAutoPlay = {
    enabled?: boolean;
    speedMs?: number;
    pauseMs?: number;
    pauseOnHover?: boolean;
};
type SliderAutoPlayTimer = {
    active: boolean;
    speedMs: number;
    startedAt: number | null;
    elapsedMs: number;
    remainingMs: number;
    progress: number;
};
type SliderAutoScroll = {
    enabled?: boolean;
    speedMs?: number;
    pauseMs?: number;
    pauseOnHover?: boolean;
};
type SliderAutoHeight = {
    enabled?: boolean;
    duration?: string;
    easing?: string;
};
type SliderLoadingOptions = {
    enabled?: boolean;
    force?: LoadingForceOptions;
    skeletonCount?: ResponsiveNumber;
    renderLoading?: (args: {
        count: number;
    }) => React.ReactNode;
};
type SliderIntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    inView?: boolean;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
};
type SliderTransitions = {
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
type CrossFadeWheelOptions = {
    enabled?: boolean;
    sensitivity?: number;
    commitThreshold?: number;
    durationMs?: number;
    sessionGapMs?: number;
};
type CrossFadeWheel = boolean | CrossFadeWheelOptions;
type CrossFade = {
    controls?: boolean;
    drag?: boolean;
    wheel?: CrossFadeWheel;
    durationMs?: number;
    easing?: string;
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
type SliderPluginKind = "arrows" | "dots" | "progress" | "scrollbar" | "ripple" | "auto-play" | "auto-scroll" | "auto-height" | "lazy-load" | "parallax" | "scale" | "fade" | "crossfade" | "fullscreen" | "loading";
type SliderPluginHost = {
    handle: SliderHandle | null;
    coreReady: boolean;
    index: number;
    slideCount: number;
    cellsInView: number[];
    progress: number;
    axis: "x" | "y";
    dir: "ltr" | "rtl";
    loop: boolean;
    freeScroll: boolean;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    createRipple: (el: HTMLElement) => void;
    hasPlugin: (kind: SliderPluginKind) => boolean;
    setPluginReady: (ready: boolean) => void;
    setAutoPlayTimer: (timer: SliderAutoPlayTimer | null) => void;
};
type SliderPluginRuntimeProps = {
    host: SliderPluginHost;
};
type SliderPlugin = {
    readonly __rmgSliderPlugin: true;
    readonly kind: SliderPluginKind;
    readonly options?: unknown;
    readonly blocksReady?: boolean;
    transformChildren?: (children: React.ReactNode, options?: unknown) => React.ReactNode;
    Runtime?: React.ComponentType<SliderPluginRuntimeProps & {
        options?: unknown;
    }>;
    renderOverlay?: (host: SliderPluginHost, options?: unknown) => React.ReactNode;
};
type SliderOptions = {
    initialIndex?: number;
    layout?: SliderLayout;
    direction?: SliderDirection;
    align?: "start" | "center";
    scroll?: SliderScroll;
    elements?: SliderElements;
    transitions?: SliderTransitions;
    motion?: SliderMotion;
    indexChannel?: SliderIndexChannel;
    plugins?: SliderPlugin[];
};
type SliderUiSelectOptions = {
    crossfade?: boolean;
    durationMs?: number;
    easing?: string;
};
type SliderMotionSnapshot = {
    location: number;
    previous: number;
    offset: number;
    target: number;
    x: number;
};
type SliderCrossfadeCoreApi = {
    getIndex: () => number;
    getSlideCount: () => number;
    getViewportMainSize: () => number;
    getViewportNode: () => HTMLDivElement | null;
    getSnapLocationForIndex: (index: number) => number;
    readMotionState: () => SliderMotionSnapshot;
    restoreMotionState: (state: SliderMotionSnapshot) => void;
    renderTrackAtLocation: (location: number) => void;
    jumpTrackToIndexInstant: (index: number) => void;
    jumpToIndexInstant: (index: number, mode?: IndexMode) => void;
    commitIndexOnly: (index: number, mode: IndexMode, sourceIndex?: number) => void;
};
type SliderCrossfadeRuntime = {
    isBusy: () => boolean;
    finish: () => void;
    canUseDrag: () => boolean;
    beginDrag: () => void;
    updateDrag: (delta: number) => boolean;
    settleDrag: (force: number) => boolean;
    canUseWheel: () => boolean;
    updateWheel: (signedWheelDelta: number, now: number) => boolean;
    clearWheelSession: () => void;
    startUi: (index: number, options?: {
        durationMs?: number;
        easing?: string;
    }) => boolean;
};
interface SliderCoreHandle {
    centerSlider: () => void;
    getIndex: () => number;
    setIndex: (i: number, mode?: IndexMode) => void;
    subscribeIndex: (fn: () => void) => () => void;
    getAutoPlayTimer: () => SliderAutoPlayTimer;
    slideIndexForCell: (cellIndex: number) => number;
    getRootNode(): HTMLElement | null;
    getContainerNode(): HTMLElement | null;
    getSlideNodes(): HTMLElement[];
    getViewportNode: () => HTMLDivElement | null;
    onSlidesBuilt(cb: (nodes: HTMLElement[]) => void): () => void;
    whenSlidesBuilt(): Promise<HTMLElement[]>;
    isSlidesBuilt(): boolean;
    onReady(cb: (nodes: HTMLElement[]) => void): () => void;
    whenReady(): Promise<HTMLElement[]>;
    isReady(): boolean;
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
        sliderWidth: RefObject<number>;
        offsetLocation: RefObject<{
            get(): number;
        } | null>;
        visibleImages: RefObject<number>;
        selectedIndex: RefObject<number>;
        sliderX: RefObject<number>;
        sliderVelocity: RefObject<number>;
        isWrapping: RefObject<boolean>;
        getCenterOffsetForIndex: (idx: number) => number;
    };
    _scrollByPixels?: (deltaPx: number) => boolean;
    _scrollToProgressFromUi?: (progress: number) => boolean;
    _usesLegacyEngine?: boolean;
    _getCrossfadeCore?: () => SliderCrossfadeCoreApi;
    _registerCrossfadeRuntime?: (runtime: SliderCrossfadeRuntime | null) => () => void;
    setIndexFromUi: (i: number, opts?: SliderUiSelectOptions) => void;
}
interface SliderHandle extends SliderCoreHandle, SliderApi {
}

export { type ArrowRenderArgs as A, type SliderRipple as B, type CrossFade as C, type SliderScale as D, type ElementStyle as E, type SliderScrollbar as F, type GalleryApi as G, type FullscreenOpenRequest as H, type IndexMode as I, type FullscreenOpenMethod as J, type ResponsiveHeightRule as R, type SliderAutoHeight as S, type GalleryCoreApi as a, type GalleryLayoutApi as b, createSliderIndexChannel as c, type CrossFadeWheel as d, type CrossFadeWheelOptions as e, type SliderAutoPlayTimer as f, type SliderSkipSnaps as g, type SliderSkipSnapsOptions as h, type SliderOptions as i, type SliderHandle as j, type SliderApi as k, type SliderItemsApi as l, type SliderNodeInput as m, type SliderRemoveTarget as n, type SliderPlugin as o, type SliderPluginKind as p, type SliderIndexChannel as q, type SliderArrows as r, type SliderAutoPlay as s, type SliderAutoScroll as t, type SliderDots as u, type SliderFade as v, type SliderLazyLoadOptions as w, type SliderLoadingOptions as x, type SliderParallax as y, type SliderProgress as z };
