import * as React$1 from 'react';
import { RefObject } from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { L as LoadingTimingOptions } from './transitions-ChhEdSB6.mjs';
import { MediaItem } from './media.mjs';
import { A as APITypes, P as PlyrSourceBuilder, a as PlyrOptionsBuilder } from './plyrTypes-B3vioQaS.mjs';
import { b as ZoomPanOptions } from './types-CLMzNXt4.mjs';
import { R as ResponsiveTextBarHeight, a as ResponsiveTextBarWidth, b as ResponsiveTextLineHeight, c as ResponsiveTextLineCount, d as ResponsiveTextLastBarWidth, T as TextSkeletonResponsiveBy } from './text-BBcRGVzn.mjs';
import { Root } from 'react-dom/client';

type ArrowRenderArgs$1 = {
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

type ThumbnailPosition = "top" | "right" | "bottom" | "left";
type ResponsivePosition$1 = ThumbnailPosition | Array<ThumbnailPosition> | Record<string, ThumbnailPosition>;
type ThumbnailLoadingElements = {
    container?: ElementStyle;
    row?: ElementStyle;
    thumbnail?: ElementStyle;
};
type ThumbnailSkeletonMode = "fit" | "peek";
type ThumbnailLoadingRenderArgs = {
    count: number;
};
type ThumbnailLoadingOptions = {
    enabled?: boolean;
    force?: LoadingForceOptions;
    skeletonCount?: ResponsiveNumber;
    mode?: ThumbnailSkeletonMode;
    renderLoading?: (args: ThumbnailLoadingRenderArgs) => React$1.ReactNode;
    elements?: ThumbnailLoadingElements;
    timing?: LoadingTimingOptions;
};
type ThumbnailRevealOptions = {
    renderReveal?: (args: {
        active: boolean;
        containerProps: React$1.HTMLAttributes<HTMLDivElement>;
    }, inner: React$1.ReactNode) => React$1.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
};
type ThumbnailLayout = {
    width?: number | string;
    height?: number | string;
};
type ThumbnailContainerLayout = {
    width?: number | string;
    height?: number | string;
};
type ThumbnailsLayout = {
    position?: ResponsivePosition$1;
    gap?: number;
    center?: boolean;
    thumbnail?: ThumbnailLayout;
    container?: ThumbnailContainerLayout;
};
type ThumbnailsElements = {
    container?: ElementStyle;
    thumbnail?: ElementStyle;
};
type ThumbnailsScroll = {
    freeScroll?: boolean;
    groupCells?: boolean;
    loop?: boolean;
    skipSnaps?: boolean;
    centerActiveThumb?: boolean;
};
type ThumbnailsMotion = {
    selectDuration?: number;
    freeScrollDuration?: number;
    friction?: number;
};
type ThumbnailsRipple = {
    enabled?: boolean;
    className?: string;
};
type ThumbnailsControls = {
    enabled?: boolean;
    arrow?: ElementStyle;
    prev?: ElementStyle;
    next?: ElementStyle;
    render?: (args: ArrowRenderArgs$1 & {
        dir: "prev" | "next";
    }) => React$1.ReactNode;
    renderPrev?: (args: ArrowRenderArgs$1) => React$1.ReactNode;
    renderNext?: (args: ArrowRenderArgs$1) => React$1.ReactNode;
    ripple?: ThumbnailsRipple;
};
type ThumbnailCrossfadeOptions = {
    enabled?: boolean;
    durationMs?: number;
    easing?: string;
};
type ThumbnailSelectMeta = {
    transition: "scroll" | "crossfade";
    crossfade?: ThumbnailCrossfadeOptions;
};
type ThumbnailsTransitions = {
    loading?: ThumbnailLoadingOptions;
    crossfade?: ThumbnailCrossfadeOptions;
};
type ThumbnailsOptions = {
    children?: React$1.ReactNode;
    layout?: ThumbnailsLayout;
    elements?: ThumbnailsElements;
    scroll?: ThumbnailsScroll;
    controls?: ThumbnailsControls;
    motion?: ThumbnailsMotion;
    reveal?: ThumbnailRevealOptions;
    transitions?: ThumbnailsTransitions;
    breakpointMap?: BreakpointMap;
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
    preserveCellSize?: boolean;
    centerInsufficientSlides?: ResponsiveBoolean;
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
    render?: (args: ArrowRenderArgs$1 & {
        dir: "prev" | "next";
    }) => React.ReactNode;
    renderPrev?: (args: ArrowRenderArgs$1) => React.ReactNode;
    renderNext?: (args: ArrowRenderArgs$1) => React.ReactNode;
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
type SliderRevealOptions = {
    renderReveal?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    inView?: boolean;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
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
    reveal?: SliderRevealOptions;
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
    aspectRatio?: number | string;
};
type SkeletonBaseStyleResponsive = SkeletonBaseStyle | Record<string, SkeletonBaseStyle>;
type SkeletonContainerStyle = {
    display?: React$1.CSSProperties["display"];
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
    textId?: string;
    barHeight: ResponsiveTextBarHeight;
    barWidth?: ResponsiveTextBarWidth;
    lineHeight: ResponsiveTextLineHeight;
    lines?: ResponsiveTextLineCount;
    lastBarWidth?: ResponsiveTextLastBarWidth;
    responsiveBy?: TextSkeletonResponsiveBy;
    style?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
};
type EntrySkeletonSpec = {
    layout?: SkeletonNode;
    variant?: "solid";
    minHeight?: SkeletonLength;
    defaults?: {
        backgroundColor?: string;
        highlightColor?: string;
        radius?: SkeletonLength;
        shimmer?: SkeletonShimmer;
    };
};

type EntryItem = {
    media?: MediaItem[];
    [key: string]: any;
};
type EntryMediaRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
    media: MediaItem;
    mediaIndex: number;
    mediaPriority: boolean;
    mediaLoading: "eager" | "lazy";
    mediaDecoding: "async" | "sync" | "auto";
    mediaFetchPriority: "high" | "low" | "auto";
};
type MediaEntryLink = {
    entryIndex: number;
    mediaIndex: number;
};
type EntryOverlayRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
    media: MediaItem | null;
    mediaIndex: number | null;
    link: MediaEntryLink | null;
    opacity: number;
    fsIndex: number;
    style: React.CSSProperties;
    containerProps: React.HTMLAttributes<HTMLDivElement>;
};
type EntryOverlayStyle = ElementStyle & {
    width?: ResponsiveLength;
    height?: ResponsiveLength;
    placement?: ResponsiveCaptionPlacement;
    breakpoint?: number;
    overlayCrossfadeTarget?: "content" | "overlay";
    overlayCrossfadeDurationMs?: number;
    overlayCrossfadeEasing?: string;
    zoomFade?: boolean;
    zoomFadeDurationMs?: number;
    zoomFadeEasing?: string;
    zoomInTransform?: string;
    zoomOutTransform?: string;
};
type EntriesLayout = "list" | "grid";
type EntryMediaLayout = "slider" | "grid" | "masonry";
type EntryCardRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
    media: React.ReactNode;
};
type EntrySkeletonResolverArgs = {
    entry: EntryItem;
    entryIndex: number;
};
type EntriesLoadingOptions = {
    enabled?: boolean;
    force?: LoadingForceOptions;
    skeleton?: EntrySkeletonSpec | ((args: EntrySkeletonResolverArgs) => EntrySkeletonSpec | null | undefined);
    minHeight?: SkeletonLength;
    enterMs?: number;
    exitMs?: number;
    nearMargin?: string;
    viewMargin?: string;
    threshold?: number;
    waitForDecode?: boolean;
    decodeTimeoutMs?: number;
    skeletonWrap?: ElementStyle;
    rememberRevealed?: boolean;
};
type RevealOptions = {
    renderReveal?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    staggerLimit?: number;
};
type EntrySkeletonRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
};
type EntriesPluginKind = "pagination" | "load-more" | "infinite-scroll" | "virtualization";
type EntriesDataMode = "client" | "server";
type EntriesPaginationOptions = {
    enabled?: boolean;
    mode?: EntriesDataMode;
    pageIndex: number;
    pageSize: number;
    total?: number;
    loading?: boolean;
};
type EntriesLoadMoreOptions = {
    enabled?: boolean;
    mode?: EntriesDataMode;
    visibleCount: number;
    total?: number;
    loading?: boolean;
};
type EntriesInfiniteScrollOptions = {
    enabled?: boolean;
    hasMore?: boolean;
    loading?: boolean;
    rootMargin?: string;
    threshold?: number;
    onLoadMore?: () => void;
    sentinel?: React.ReactNode;
};
type EntriesVirtualizationOptions = {
    enabled?: boolean;
    layout?: EntriesLayout;
    estimateSize?: number;
    gap?: number;
    overscan?: number;
};
type EntriesPluginOptionsByKind = {
    pagination: EntriesPaginationOptions;
    "load-more": EntriesLoadMoreOptions;
    "infinite-scroll": EntriesInfiniteScrollOptions;
    virtualization: EntriesVirtualizationOptions;
};
type EntriesPlugin<Kind extends EntriesPluginKind = EntriesPluginKind> = {
    readonly __rmgEntriesPlugin: true;
    readonly kind: Kind;
    readonly options: EntriesPluginOptionsByKind[Kind];
};
type EntriesHandle = {
    getRootNode: () => HTMLDivElement | null;
    getEntryNodes: () => HTMLElement[];
    isReady: () => boolean;
    onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};
type EntriesOptions = {
    items?: EntryItem[];
    layout?: EntriesLayout;
    mediaLayout?: EntryMediaLayout;
    render?: {
        card?: (args: EntryCardRenderArgs) => React.ReactNode;
        media?: (args: EntryMediaRenderArgs) => React.ReactNode;
        overlay?: (args: EntryOverlayRenderArgs) => React.ReactNode;
        skeleton?: (args: EntrySkeletonRenderArgs) => React.ReactNode;
    };
    overlay?: EntryOverlayStyle;
    loading?: EntriesLoadingOptions;
    reveal?: RevealOptions;
    plugins?: EntriesPlugin[];
    entryList?: ElementStyle;
    entryRow?: ElementStyle;
};
type SlideOwner = {
    entryIndex: number;
};

type JumpMode = "instant" | "animated";
type FullscreenRequestMeta = {
    source?: "thumbnail" | "external";
    transition?: "scroll" | "crossfade";
    crossfade?: {
        durationMs?: number;
        easing?: string;
    };
};
type FSRequest = {
    type: "requestSet";
    index: number;
    mode?: IndexMode;
    meta?: FullscreenRequestMeta;
} | {
    type: "requestPrev";
} | {
    type: "requestNext";
} | {
    type: "center";
};
type FSEvent = {
    type: "internalIndex";
    index: number;
} | {
    type: "mounted";
} | {
    type: "unmounted";
};
type FullscreenSliderSub = {
    get: () => number;
    requestSet: (index: number, mode?: JumpMode, opts?: {
        meta?: FullscreenRequestMeta;
    }) => void;
    requestPrev: () => void;
    requestNext: () => void;
    requestCenter: () => void;
    onEvent: (fn: (evt: FSEvent) => void) => () => void;
    onRequest: (fn: (req: FSRequest) => void) => () => void;
    setLocalIndex: (index: number) => void;
    destroy: () => void;
    onBasePointerDown: (fn: () => void) => () => void;
    emitBasePointerDown: () => void;
};

type LimitType = ReturnType<typeof Limit>;
declare function Limit(min: number, max: number): {
    min: number;
    max: number;
    reachedMin(n: number): boolean;
    reachedMax(n: number): boolean;
    constrain(n: number): number;
    reachedAny(n: number): boolean;
    removeOffset(n: number): number;
};

type Vector1DType = {
    get: () => number;
    set: (n: number) => void;
    add: (n: number) => void;
};

interface FullscreenSliderHandle {
    centerSlider(): void;
}

type ArrowRenderArgs = {
    ref: React$1.RefObject<HTMLDivElement | null>;
    onClick: () => void;
    hidden: boolean;
    disabled: boolean;
    createRipple: (el: HTMLElement) => void;
    className?: string;
};
type FSItem = {
    thumbSrc: string;
    alt?: string;
};
type FullscreenThumbnailSlotLayout = {
    position: ThumbnailPosition;
    className?: string;
    style?: React$1.CSSProperties;
    fadeDurationMs?: number;
    fadeEasing?: string;
};
type FullscreenThumbnailBridge = {
    mountEl: HTMLDivElement | null;
    fsSub: FullscreenSliderSub;
    visible: boolean;
    invisible: boolean;
    direction: 'ltr' | 'rtl';
    registerLayout: (layout: FullscreenThumbnailSlotLayout) => void;
    clearLayout: () => void;
};
type FullscreenThumbnailSliderProps = {
    bridge: FullscreenThumbnailBridge;
    items: FSItem[];
    position: ThumbnailPosition;
    containerClassName?: string;
    containerStyle?: React$1.CSSProperties;
    thumbnailWidth?: number | string;
    thumbnailHeight?: number | string;
    thumbnailsCenter?: boolean;
    thumbnailsContainerWidth?: number | string;
    thumbnailsContainerHeight?: number | string;
    fadeDurationMs?: number;
    fadeEasing?: string;
    thumbnailItemClassName?: string;
    thumbnailItemStyle?: React$1.CSSProperties;
    gap?: number;
    freeScroll?: boolean;
    groupCells?: boolean;
    loop?: boolean;
    axis?: 'x' | 'y';
    skipSnaps?: boolean;
    centerActiveThumb?: boolean;
    selectDuration?: number;
    freeScrollDuration?: number;
    sliderFriction?: number;
    breakpointMap?: BreakpointMap;
    rippleEnabled?: boolean;
    rippleClassName?: string;
    showArrows?: boolean;
    arrowStyles?: React$1.CSSProperties;
    arrowClassName?: string;
    prevArrowStyles?: React$1.CSSProperties;
    prevArrowClassName?: string;
    nextArrowStyles?: React$1.CSSProperties;
    nextArrowClassName?: string;
    renderArrows?: (args: ArrowRenderArgs & {
        dir: 'prev' | 'next';
    }) => React$1.ReactNode;
    renderPrevArrow?: (args: ArrowRenderArgs) => React$1.ReactNode;
    renderNextArrow?: (args: ArrowRenderArgs) => React$1.ReactNode;
    thumbnailCrossfade?: ThumbnailCrossfadeOptions;
};

type ScrollBodyType = ReturnType<typeof ScrollBody>;
declare function ScrollBody(location: Vector1DType, offsetLocation: Vector1DType, previousLocation: Vector1DType, target: Vector1DType, baseDuration: number, baseFriction: number): {
    sync(): /*elided*/ any;
    resetVelocity(): /*elided*/ any;
    useDuration(n: number): /*elided*/ any;
    useFriction(n: number): /*elided*/ any;
    useBaseDuration(): /*elided*/ any;
    useBaseFriction(): /*elided*/ any;
    duration(): number;
    frictionFactor(): number;
    direction(): number;
    velocity(): number;
    seek(): /*elided*/ any;
    settled(): boolean;
};

type ScrollBoundsType = ReturnType<typeof ScrollBounds>;
declare function ScrollBounds(limit: LimitType, location: Vector1DType, target: Vector1DType, body: ScrollBodyType, pov: PercentOfViewType, selectDuration: number): {
    reached: () => boolean;
    passed: () => boolean;
    constrain(pointerDown: boolean): void;
};
type PercentOfViewType = ReturnType<typeof PercentOfView>;
declare function PercentOfView(viewSize: number): {
    measure(n: number): number;
};

declare function PanAxis(): {
    scroll: "x";
    cross: "y";
    direction(n: number): number;
};
type PanAxisType = ReturnType<typeof PanAxis>;

type AnimationsType = {
    start: () => void;
    stop: () => void;
    init: () => void;
    destroy: () => void;
    resetBlend: () => void;
};

type FullscreenRuntimeProps = {
    fsEnabled: boolean;
    fsSub: any;
    showFullscreenModal: boolean;
    setShowFullscreenModal: React$1.Dispatch<React$1.SetStateAction<boolean>>;
    setShowFullscreenSlider: React$1.Dispatch<React$1.SetStateAction<boolean>>;
    showFullscreenSlider: boolean;
    isClick: React$1.RefObject<boolean>;
    isAnimatingRef: React$1.RefObject<boolean>;
    overlayDivRef: React$1.RefObject<HTMLDivElement | null>;
    duplicateImgRef: React$1.RefObject<HTMLElement | null>;
    cells: React$1.RefObject<{
        element: HTMLElement;
        index: number;
    }[]>;
    slidesForFullscreen: React$1.RefObject<{
        cells: {
            element: HTMLElement;
            index: number;
        }[];
        target: number;
    }[]>;
    sliderForFullscreen: React$1.RefObject<HTMLDivElement | null>;
    isWrappingForFullscreen: React$1.RefObject<boolean>;
    setClosingModal: React$1.Dispatch<React$1.SetStateAction<boolean>>;
    closingModal: boolean;
    closeButtonRef: React$1.RefObject<HTMLElement | null>;
    counterRef: React$1.RefObject<HTMLElement | null>;
    leftChevronRef: React$1.RefObject<HTMLElement | null>;
    rightChevronRef: React$1.RefObject<HTMLElement | null>;
    centerSliderForFullscreen: () => void;
    setSliderIndexForFullscreen: (index: number, mode?: any) => void;
    layout?: 'slider' | 'grid' | 'masonry' | 'entries' | null;
    expandableImageRefs: React$1.RefObject<any[]>;
    resolveLayoutlessTarget: (index: number) => {
        host: HTMLElement | null;
        image: HTMLImageElement | null;
        media: HTMLElement | null;
    };
    entryMapRef: React$1.RefObject<MediaEntryLink[] | null>;
    entryMediaLayout: any;
    transitionFade: boolean;
    transitionDuration?: FullscreenIntroPathTiming<number>;
    transitionEasing?: FullscreenIntroPathTiming<string>;
    fullscreenSliderApi: React$1.RefObject<FullscreenSliderHandle | null>;
    slideIndex: number;
    isZoomClick: React$1.RefObject<boolean>;
    isZoomed: boolean;
    windowSize: any;
    imageRefs: React$1.RefObject<React$1.RefObject<HTMLDivElement | null>[]>;
    wrappedItems: MediaItem[];
    setWrappedItems: React$1.Dispatch<React$1.SetStateAction<MediaItem[]>>;
    scale: number;
    isZooming: React$1.RefObject<boolean>;
    singleModePlyrRefs: React$1.RefObject<(APITypes | null)[]>;
    wrappedModePlyrRefs: React$1.RefObject<(APITypes | null)[]>;
    direction: 'ltr' | 'rtl';
    sliderGap?: number;
    sliderDuration: number;
    sliderFriction: number;
    sliderSkipSnaps?: SliderSkipSnaps;
    sliderStrictSnaps?: boolean;
    suppressLoopRef: React$1.RefObject<boolean>;
    fsFadeOpening: boolean;
    normalizedItems: MediaItem[];
    fsThumbContainerRef: React$1.RefObject<HTMLDivElement | null>;
    fullscreenThumbnailSlot: FullscreenThumbnailSlotLayout | null;
    setFullscreenThumbnailMountEl: React$1.RefCallback<HTMLDivElement>;
    showFsEntryOverlayMount: boolean;
    fsIntroReq: FsIntroRequest;
    clearFsIntroReq: () => void;
    styles: Record<string, string>;
    fs: FullscreenOptions;
    overlayCaptionRef: React$1.RefObject<HTMLDivElement | null>;
    overlayCaptionRootRef: React$1.RefObject<Root | null>;
    setFsFadeOpening: React$1.Dispatch<React$1.SetStateAction<boolean>>;
    addShield: (timeoutMs?: number | undefined) => void;
    resolveFsCaptionPlacement: (placement: ResponsiveCaptionPlacement | undefined, breakpoint: number | undefined, viewportWidth: number) => FsCaptionPlacement | null;
    requestFsCloseRef: React$1.RefObject<null | (() => void)>;
    cancelFsCloseRef: React$1.RefObject<null | (() => void)>;
    suppressNextClickRef: React$1.RefObject<boolean>;
    currentImage: React$1.RefObject<HTMLDivElement | null>;
    scaleRef: React$1.RefObject<number>;
    pointerDownRef: React$1.RefObject<boolean>;
    interactionModeRef: React$1.RefObject<'idle' | 'drag' | 'wheel' | 'programmatic'>;
    boundsX: React$1.RefObject<ScrollBoundsType | null>;
    boundsY: React$1.RefObject<ScrollBoundsType | null>;
    bodyX: React$1.RefObject<ScrollBodyType | null>;
    bodyY: React$1.RefObject<ScrollBodyType | null>;
    locX: React$1.RefObject<Vector1DType | null>;
    locY: React$1.RefObject<Vector1DType | null>;
    prevX: React$1.RefObject<Vector1DType | null>;
    prevY: React$1.RefObject<Vector1DType | null>;
    offX: React$1.RefObject<Vector1DType | null>;
    offY: React$1.RefObject<Vector1DType | null>;
    tgtX: React$1.RefObject<Vector1DType | null>;
    tgtY: React$1.RefObject<Vector1DType | null>;
    axisRef: React$1.RefObject<PanAxisType | null>;
    animRef: React$1.RefObject<AnimationsType | null>;
    setScale: (newScale: number) => void;
    previousZoom: React$1.RefObject<{
        x: number;
        y: number;
    }>;
    panRef: React$1.RefObject<{
        x: number;
        y: number;
    }>;
    changingSlides: React$1.RefObject<boolean>;
    fsIndexRef: React$1.RefObject<number>;
    entriesObject: EntriesOptions;
    syncFullscreenSourceFromIndex: (nextIndex: number) => void;
    setFullscreenOpen: (open: boolean) => void;
    runtimePlugins?: FullscreenPlugin[];
};

type FsCounterArgs = {
    index: number;
    count: number;
};
type FsCaptionPlacement = "top" | "right" | "bottom" | "left";
type FsIntroRequest = null | {
    originalImage: HTMLImageElement | null;
    index: number;
    method: FullscreenOpenMethod;
    closestSelector?: string;
};
type FSImageRender = (args: {
    item: Extract<MediaItem, {
        kind: "image";
    }>;
    index: number;
    isZoomed: boolean;
    className: string;
    baseStyle: React$1.CSSProperties;
}) => React$1.ReactNode;
type FullscreenArrows = {
    enabled?: boolean;
    arrow?: ElementStyle;
    prev?: ElementStyle;
    next?: ElementStyle;
    render?: (args: {
        dir: "prev" | "next";
    }) => React$1.ReactNode;
    renderPrev?: () => React$1.ReactNode;
    renderNext?: () => React$1.ReactNode;
};
type FullscreenClose = {
    enabled?: boolean;
    style?: React$1.CSSProperties;
    className?: string;
    render?: () => React$1.ReactNode;
};
type FullscreenCounter = {
    enabled?: boolean;
    style?: React$1.CSSProperties;
    className?: string;
    render?: (args: FsCounterArgs) => React$1.ReactNode;
};
type FullscreenControlsOptions = {
    close?: FullscreenClose;
    arrows?: FullscreenArrows;
    counter?: FullscreenCounter;
};
type FullscreenDialogOptions = ElementStyle & {
    enabled?: boolean;
    opacityDuration?: number;
    opacityEasing?: string;
    media?: ElementStyle;
    caption?: ElementStyle;
};
type FsCaptionRenderArgs = {
    item: MediaItem;
    index: number;
    isZoomed: boolean;
};
type FullscreenCaptionOptions = {
    className?: string;
    style?: React$1.CSSProperties;
    width?: ResponsiveLength;
    height?: ResponsiveLength;
    placement?: ResponsiveCaptionPlacement;
    breakpoint?: number;
    render?: (args: FsCaptionRenderArgs) => React$1.ReactNode;
    layout?: "overlay" | "slide";
    overlayCrossfadeTarget?: "content" | "overlay";
    overlayCrossfadeDurationMs?: number;
    overlayCrossfadeEasing?: string;
    zoomFade?: boolean;
    zoomFadeDurationMs?: number;
    zoomFadeEasing?: string;
    zoomInTransform?: string;
    zoomOutTransform?: string;
};
type FullscreenCrossfadeOptions = CrossFade;
type FullscreenIntroPathTiming<T> = T | {
    transform?: T;
    fade?: T;
};
type FullscreenEffectsOptions = {
    transitionDuration?: FullscreenIntroPathTiming<number>;
    transitionEasing?: FullscreenIntroPathTiming<string>;
    transitionFade?: boolean;
    StickyNavSelector?: string;
    crossfade?: FullscreenCrossfadeOptions;
};
type FullscreenSliderOptions = {
    gap?: ResponsiveNumber;
    duration?: number;
    friction?: number;
    direction?: "ltr" | "rtl";
    skipSnaps?: SliderSkipSnaps;
    strictSnaps?: boolean;
};
type FullscreenZoomPanOptions = ZoomPanOptions;
type FullscreenVideoOptions = {
    source?: PlyrSourceBuilder;
    options?: PlyrOptionsBuilder;
    playOnOpen?: boolean;
    style?: React$1.CSSProperties;
    className?: string;
};
type FullscreenLazyLoadKind = "image" | "video";
type FullscreenLazyLoadArgs = {
    kind: FullscreenLazyLoadKind;
    isClone?: boolean;
};
type FullscreenLazyLoadConfig = {
    enabled?: boolean;
    spinner?: boolean | React$1.ReactNode | ((args: FullscreenLazyLoadArgs) => React$1.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React$1.CSSProperties;
};
type FullscreenLazyLoadOptions = {
    images?: FullscreenLazyLoadConfig;
    videos?: FullscreenLazyLoadConfig;
};
type FullscreenCloseScrollTiming = "before-close" | "after-close";
type FullscreenMobileDetectionContext = {
    viewportWidth: number;
    viewportHeight: number;
    visualViewportWidth: number;
    visualViewportHeight: number;
    coarsePointer: boolean;
    hoverNone: boolean;
    maxTouchPoints: number;
    userAgent: string;
};
type FullscreenCloseScrollContext = FullscreenMobileDetectionContext & {
    index: number;
    layout?: "slider" | "grid" | "masonry" | "entries" | null;
    target: HTMLElement | null;
    isMobile: boolean;
};
type FullscreenCloseScrollEnabled = boolean | "desktop-only" | "mobile-only" | ((context: FullscreenCloseScrollContext) => boolean);
type FullscreenCloseScrollOptions = {
    enabled?: FullscreenCloseScrollEnabled;
    timing?: FullscreenCloseScrollTiming;
    mobileDetection?: (context: FullscreenMobileDetectionContext) => boolean;
};
type FullscreenOptions = {
    enabled?: boolean;
    items?: MediaItem[] | string[];
    dialog?: FullscreenDialogOptions;
    renderImage?: FSImageRender;
    video?: FullscreenVideoOptions;
    controls?: FullscreenControlsOptions;
    caption?: FullscreenCaptionOptions;
    slider?: FullscreenSliderOptions;
    zoom?: FullscreenZoomPanOptions;
    effects?: FullscreenEffectsOptions;
    lazyLoad?: FullscreenLazyLoadOptions;
    closeScroll?: boolean | FullscreenCloseScrollOptions;
};
type FullscreenPluginKind = "slider" | "controls" | "captions" | "zoom-pan" | "video" | "lazy-load" | "crossfade" | "thumbnails";
type FullscreenPluginOptions = Partial<FullscreenOptions>;
type FullscreenRuntimeFeatures = {
    useZoomPanRuntime?: (args: any) => {
        isPinching: React$1.RefObject<boolean>;
        isTouchPinching: React$1.RefObject<boolean>;
        entryOverlayZoomMotion?: unknown;
        captionZoomMotion?: unknown;
        handlePanPointerStart: (e: React$1.PointerEvent<HTMLDivElement>, imageRef: React$1.RefObject<HTMLDivElement | null>) => void;
        handleZoomToggle: (e: React$1.PointerEvent<HTMLDivElement> | React$1.TouchEvent<HTMLDivElement>, imageRef: React$1.RefObject<HTMLDivElement | null>) => void;
        resetAllZoomDom: (args?: {
            disableImageTransition?: boolean;
        }) => void;
        resetForSlideNavigation: () => void;
        forceResetZoom?: () => void;
        handleHoverPointerEnter?: (e: React$1.PointerEvent<HTMLDivElement>, imageRef: React$1.RefObject<HTMLDivElement | null>) => void;
        handleHoverPointerMove?: (e: React$1.PointerEvent<HTMLDivElement>, imageRef: React$1.RefObject<HTMLDivElement | null>) => void;
        handleHoverPointerLeave?: (e: React$1.PointerEvent<HTMLDivElement>, imageRef: React$1.RefObject<HTMLDivElement | null>) => void;
    };
    usePlyrProps?: (args: {
        items: MediaItem[];
        source?: FullscreenVideoOptions["source"];
        options?: FullscreenVideoOptions["options"];
    }) => unknown[];
    defaultPlayerStyle?: React$1.CSSProperties;
    createVideoSnapshotStore?: () => unknown;
    renderSlides?: (args: any) => React$1.ReactNode[];
    renderCrossfadeSlides?: (args: any) => React$1.ReactNode[];
};
type FullscreenPlugin = {
    readonly __rmgFullscreenPlugin: true;
    readonly kind: FullscreenPluginKind;
    readonly options?: FullscreenPluginOptions;
    readonly runtime?: FullscreenRuntimeFeatures;
    readonly RuntimeHost?: React$1.ComponentType<FullscreenRuntimeProps>;
    readonly preload?: () => void;
};

type ResponsiveLengthValue = number | string;
type ResponsiveLength = ResponsiveLengthValue | Record<string, ResponsiveLengthValue>;
type ResponsiveBoolean = boolean | Array<boolean> | Record<string, boolean>;
type ResponsivePosition = ThumbnailPosition | Array<ThumbnailPosition> | Record<string, ThumbnailPosition>;
type ResponsiveCaptionPlacement = FsCaptionPlacement | Array<FsCaptionPlacement> | Record<string, FsCaptionPlacement>;

export { type FullscreenZoomPanOptions as $, type EntriesVirtualizationOptions as A, type SlideOwner as B, type CrossFade as C, type FullscreenCloseScrollContext as D, type ElementStyle as E, type FullscreenCaptionOptions as F, type GalleryApi as G, type FullscreenCloseScrollEnabled as H, type IndexMode as I, type FullscreenCloseScrollOptions as J, type FullscreenCloseScrollTiming as K, type FullscreenControlsOptions as L, type MediaEntryLink as M, type FullscreenCrossfadeOptions as N, type FullscreenDialogOptions as O, type PanAxisType as P, type FullscreenEffectsOptions as Q, type ResponsiveHeightRule as R, type SliderAutoHeight as S, type FullscreenIntroPathTiming as T, type FullscreenLazyLoadOptions as U, type FullscreenMobileDetectionContext as V, type FullscreenOptions as W, type FullscreenPlugin as X, type FullscreenPluginKind as Y, type FullscreenSliderOptions as Z, type FullscreenVideoOptions as _, type GalleryCoreApi as a, type FsCaptionPlacement as a0, type FsIntroRequest as a1, type FSItem as a2, type FullscreenThumbnailBridge as a3, type FullscreenThumbnailSliderProps as a4, type FullscreenThumbnailSlotLayout as a5, type ThumbnailPosition as a6, type ResponsivePosition$1 as a7, type ThumbnailLoadingElements as a8, type ThumbnailLoadingRenderArgs as a9, type EntriesLoadingOptions as aA, type RevealOptions as aB, type EntrySkeletonRenderArgs as aC, type EntriesDataMode as aD, type EntriesPluginOptionsByKind as aE, type FullscreenOpenRequest as aF, type FullscreenClose as aG, type FullscreenArrows as aH, type FullscreenCounter as aI, type FsCaptionRenderArgs as aJ, type FSImageRender as aK, type ThumbnailSelectMeta as aL, type ThumbnailLayout as aM, type ThumbnailContainerLayout as aN, type ThumbnailsLayout as aO, type ThumbnailsElements as aP, type ThumbnailsScroll as aQ, type ThumbnailsMotion as aR, type ThumbnailsRipple as aS, type ThumbnailsControls as aT, type ThumbnailsTransitions as aU, type ResponsivePosition as aV, type ThumbnailLoadingOptions as aa, type ThumbnailSkeletonMode as ab, type ThumbnailRevealOptions as ac, type ThumbnailsOptions as ad, type ResponsiveCaptionPlacement as ae, type ResponsiveLength as af, type ResponsiveLengthValue as ag, type EntryItem as ah, type SliderArrows as ai, type SliderAutoPlay as aj, type SliderAutoScroll as ak, type SliderDots as al, type SliderFade as am, type SliderLazyLoadOptions as an, type SliderLoadingOptions as ao, type SliderParallax as ap, type SliderProgress as aq, type SliderRipple as ar, type SliderScale as as, type SliderScrollbar as at, type EntryMediaRenderArgs as au, type EntryOverlayRenderArgs as av, type EntryOverlayStyle as aw, type EntryMediaLayout as ax, type EntryCardRenderArgs as ay, type EntrySkeletonResolverArgs as az, type GalleryLayoutApi as b, createSliderIndexChannel as c, type CrossFadeWheel as d, type CrossFadeWheelOptions as e, type SliderAutoPlayTimer as f, type SliderRevealOptions as g, type SliderSkipSnaps as h, type SliderSkipSnapsOptions as i, type SliderOptions as j, type SliderHandle as k, type SliderApi as l, type SliderItemsApi as m, type SliderNodeInput as n, type SliderRemoveTarget as o, type SliderPlugin as p, type SliderPluginKind as q, type SliderIndexChannel as r, type EntriesHandle as s, type EntriesInfiniteScrollOptions as t, type EntriesLayout as u, type EntriesLoadMoreOptions as v, type EntriesOptions as w, type EntriesPaginationOptions as x, type EntriesPlugin as y, type EntriesPluginKind as z };
