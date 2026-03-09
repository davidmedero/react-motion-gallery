import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React$1 from 'react';
import React__default, { RefObject } from 'react';
import { APITypes } from 'plyr-react';

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

type ElementStyle = {
    className?: string;
    style?: React.CSSProperties;
};

type ThumbnailPosition = "top" | "right" | "bottom" | "left";

declare const BREAKPOINT_MAP: Record<string, number>;
type BreakpointMap = Record<string, number>;
type ResponsiveNumber = number | Record<string, number>;

type MediaItem = {
    kind: "image";
    src: string;
    alt?: string;
    caption?: React.ReactNode;
    srcSet?: string;
    sizes?: string;
    width?: number;
    height?: number;
} | {
    kind: "video";
    src: string;
    alt?: string;
    poster?: string;
    caption?: React.ReactNode;
} | {
    kind: "node";
    node: React.ReactNode;
};
type MediaInput = string | {
    src: string;
    kind?: "image" | "video";
    poster?: string;
    alt?: string;
    caption?: React.ReactNode;
    srcSet?: string;
    sizes?: string;
    width?: number;
    height?: number;
} | {
    kind: "node";
    node: React.ReactNode;
};
declare const toMediaItems: (inputs: string[] | MediaInput[]) => MediaItem[];

type IndexMode = "animated" | "instant";
type FullscreenOpenMethod$1 = "fade" | "scale";
type OpenFullscreenAtArgs = {
    index: number;
    method?: FullscreenOpenMethod$1;
    event?: Event;
};
type FullscreenOpenSource = "slider" | "grid" | "masonry" | "entries" | "api";
type FullscreenOpenRequest = {
    source: FullscreenOpenSource;
    index: number;
    image: HTMLImageElement | null;
    method?: FullscreenOpenMethod$1;
    requestedMethod?: FullscreenOpenMethod$1;
    event?: Event;
};
interface GalleryApi {
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
    append(nodes: React.ReactNode | React.ReactNode[]): number;
    prepend(nodes: React.ReactNode | React.ReactNode[]): number;
    insert(index: number, nodes: React.ReactNode | React.ReactNode[]): number;
    remove(indexOrPredicate: number | ((i: number) => boolean)): number;
    replace(index: number, node: React.ReactNode): void;
    setItems(nodes: React.ReactNode[]): number;
    onIndexChange(cb: (i: number, meta: {
        mode: IndexMode;
    }) => void): () => void;
    openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
}

type SkeletonLength$3 = number | string;
type SkeletonShimmer$3 = {
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
type SkeletonBaseStyle$2 = {
    width?: SkeletonLength$3;
    maxWidth?: SkeletonLength$3;
    height?: SkeletonLength$3;
    maxHeight?: SkeletonLength$3;
    backgroundColor?: string;
    borderRadius?: SkeletonLength$3;
    marginTop?: SkeletonLength$3;
    marginRight?: SkeletonLength$3;
    marginBottom?: SkeletonLength$3;
    marginLeft?: SkeletonLength$3;
    alignSelf?: React$1.CSSProperties["alignSelf"];
    aspectRatio?: SkeletonLength$3;
};
type SkeletonContainerStyle$2 = {
    gap?: SkeletonLength$3;
    padding?: SkeletonLength$3;
    align?: React$1.CSSProperties["alignItems"];
    justify?: React$1.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength$3;
    maxWidth?: SkeletonLength$3;
};
type SkeletonContainerStyleResponsive$2 = SkeletonContainerStyle$2 | Record<string, SkeletonContainerStyle$2>;
type SliderSkeletonNode = {
    kind: "slider";
    style?: SkeletonContainerStyleResponsive$2;
    count?: number;
    item: SkeletonNode$2;
    itemWrapStyle?: SkeletonBaseStyle$2;
    direction?: "row" | "col";
} | SkeletonNode$2;
type SkeletonNode$2 = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive$2;
    children: SkeletonNode$2[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyle$2;
    shimmer?: SkeletonShimmer$3;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive$2;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyle$2;
        shimmer?: SkeletonShimmer$3;
    };
} | {
    kind: "text";
    fontSize: number;
    lineHeight: number;
    lines?: number;
    style?: SkeletonBaseStyle$2;
    shimmer?: SkeletonShimmer$3;
};
type SliderSkeletonSpec = {
    mode?: "fit" | "peek";
    className?: string;
    layout?: SliderSkeletonNode;
    backgroundColor?: string;
    radius?: SkeletonLength$3;
    shimmer?: SkeletonShimmer$3;
};

type IndexListener = () => void;
type IndexEvent = {
    type: "set";
    index: number;
    mode: IndexMode;
} | {
    type: "bump";
    delta: number;
    mode: IndexMode;
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
    }): void;
    bump(delta: number, m?: IndexMode, opts?: {
        silent?: boolean;
    }): void;
    subscribe(fn: IndexListener): () => void;
    onEvent(fn: EventListener): () => void;
    onBasePointerDown(fn: BasePointerDownListener): () => void;
    emitBasePointerDown: () => void;
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
type SliderRipple = {
    enabled?: boolean;
    className?: string;
};
type SliderControls = {
    arrows?: SliderArrows;
    dots?: SliderDots;
    progress?: SliderProgress;
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
};
type SliderIntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    transform?: number | string;
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
};
type SliderEffects = {
    parallax?: SliderParallax;
    scale?: SliderScale;
    fade?: SliderFade;
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
}

type SkeletonLength$2 = number | string;
type SkeletonShimmer$2 = {
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
type SkeletonBaseStyle$1 = {
    width?: SkeletonLength$2;
    maxWidth?: SkeletonLength$2;
    height?: SkeletonLength$2;
    maxHeight?: SkeletonLength$2;
    backgroundColor?: string;
    borderRadius?: SkeletonLength$2;
    marginTop?: SkeletonLength$2;
    marginRight?: SkeletonLength$2;
    marginBottom?: SkeletonLength$2;
    marginLeft?: SkeletonLength$2;
    alignSelf?: React$1.CSSProperties["alignSelf"];
    aspectRatio?: number | string;
};
type SkeletonContainerStyle$1 = {
    gap?: SkeletonLength$2;
    padding?: SkeletonLength$2;
    align?: React$1.CSSProperties["alignItems"];
    justify?: React$1.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength$2;
    maxWidth?: SkeletonLength$2;
};
type SkeletonContainerStyleResponsive$1 = SkeletonContainerStyle$1 | Record<string, SkeletonContainerStyle$1>;
type SkeletonNode$1 = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive$1;
    children: SkeletonNode$1[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyle$1;
    shimmer?: SkeletonShimmer$2;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive$1;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyle$1;
        shimmer?: SkeletonShimmer$2;
    };
} | {
    kind: "text";
    fontSize: number;
    lineHeight: number;
    lines?: number;
    style?: SkeletonBaseStyle$1;
    shimmer?: SkeletonShimmer$2;
};
type EntrySkeletonSpec = {
    layout?: SkeletonNode$1;
    variant?: "solid";
    minHeight?: SkeletonLength$2;
    defaults?: {
        backgroundColor?: string;
        highlightColor?: string;
        radius?: SkeletonLength$2;
        shimmer?: SkeletonShimmer$2;
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
};
type MediaEntryLink = {
    entryIndex: number;
    mediaIndex: number;
};
type EntryOverlayRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
    mediaIndex: number | null;
    link: MediaEntryLink | null;
    opacity: number;
    fsIndex: number;
    style: React.CSSProperties;
    containerProps: React.HTMLAttributes<HTMLDivElement>;
};
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
    force?: boolean;
    skeleton?: EntrySkeletonSpec | ((args: EntrySkeletonResolverArgs) => EntrySkeletonSpec | null | undefined);
    minHeight?: SkeletonLength$2;
    nearMargin?: string;
    viewMargin?: string;
    threshold?: number;
    waitForDecode?: boolean;
    decodeTimeoutMs?: number;
    skeletonWrap?: ElementStyle;
};
type IntroOptions$2 = {
    renderIntro?: (args: {
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
type EntriesOptions = {
    items?: EntryItem[];
    mediaLayout?: EntryMediaLayout;
    render?: {
        card?: (args: EntryCardRenderArgs) => React.ReactNode;
        media?: (args: EntryMediaRenderArgs) => React.ReactNode;
        overlay?: (args: EntryOverlayRenderArgs) => React.ReactNode;
        skeleton?: (args: EntrySkeletonRenderArgs) => React.ReactNode;
    };
    overlay?: ElementStyle;
    loading?: EntriesLoadingOptions;
    intro?: IntroOptions$2;
    entryList?: ElementStyle;
    entryRow?: ElementStyle;
};
type SlideOwner = {
    entryIndex: number;
};

declare const DEFAULT_ENTRIES: Required<Pick<EntriesOptions, "mediaLayout">>;

type EntriesMediaContainerRender = (args: {
    entryIndex: number;
    mediaNodes: React$1.ReactNode[];
    entrySliderRefs?: React$1.RefObject<Array<SliderHandle | null>>;
}) => React$1.ReactNode;
type FullscreenItemsInput = MediaItem[] | string[];
declare function flattenEntries(items: EntryItem[] | undefined): {
    flattenedMedia: MediaItem[];
    flattenedMap: MediaEntryLink[];
    entryFlatIndex: number[][] | null;
    owners: SlideOwner[];
};
type EntriesProps = {
    enabled?: boolean;
    entries: EntriesOptions;
    fullscreen?: {
        enabled?: boolean;
        items?: FullscreenItemsInput;
    };
    renderMediaContainer: EntriesMediaContainerRender;
    nodeFromMedia?: (m: MediaItem) => React$1.ReactNode;
    entryFlatIndexRef?: React$1.RefObject<number[][] | null>;
    entryMapRef?: React$1.RefObject<MediaEntryLink[] | null>;
    fsOwnersRef?: React$1.RefObject<SlideOwner[]>;
    entrySliderRefs?: React$1.RefObject<Array<SliderHandle | null>>;
};
declare function Entries(props: EntriesProps): react_jsx_runtime.JSX.Element;

type CoreLayout = "slider" | "grid" | "masonry" | "entries";
type Cell = {
    id: string;
    node: React$1.ReactNode;
};
type FullscreenSource = FullscreenOpenRequest["source"];
type BaseVisibleIndexEvent = {
    index: number;
    reason?: "io";
};
type FsVisibleIndexEvent = {
    index: number;
    reason?: "active";
};
type FullscreenEntryContext = {
    entryMapRef?: React$1.RefObject<MediaEntryLink[] | null>;
    entryMediaLayout?: "slider" | "grid" | "masonry";
    entriesObject?: any;
    entrySliderRefs?: React$1.RefObject<Array<SliderHandle | null>>;
    expandableImageRefs?: React$1.RefObject<Array<HTMLImageElement | null>>;
};
type FullscreenSourceAdapter = {
    getOwnerSliderHandle?: (index: number) => SliderHandle | null;
    syncBeforeOpen?: (index: number) => void;
    closestSelector?: string;
    getEntryContext?: () => FullscreenEntryContext;
};
type GalleryCoreProps = {
    children?: React$1.ReactNode;
    layout: CoreLayout;
    breakpoints?: BreakpointMap;
    fullscreenItems?: MediaItem[] | string[];
    nodes?: React$1.ReactNode | React$1.ReactNode[];
};
declare function GalleryCoreProvider(props: GalleryCoreProps): react_jsx_runtime.JSX.Element;
type GalleryCore = {
    layout: CoreLayout;
    effectiveBreakpoints: BreakpointMap;
    cellsState: Cell[];
    cellsRef: React$1.RefObject<Cell[]>;
    normalizedItems: MediaItem[];
    setNormalizedItems: React$1.Dispatch<React$1.SetStateAction<MediaItem[]>>;
    sliderApiRef: React$1.RefObject<SliderHandle | null>;
    append: (nodes: React$1.ReactNode | React$1.ReactNode[]) => number;
    prepend: (nodes: React$1.ReactNode | React$1.ReactNode[]) => number;
    insert: (index: number, nodes: React$1.ReactNode | React$1.ReactNode[]) => number;
    remove: (index: number) => number;
    replace: (index: number, node: React$1.ReactNode) => void;
    setItems: (nodes: React$1.ReactNode[]) => number;
    requestFullscreenOpen: (req: FullscreenOpenRequest) => void;
    fsOpenSub: {
        emit(v: FullscreenOpenRequest): void;
        subscribe(fn: (v: FullscreenOpenRequest) => void): () => void;
    };
    isFullscreenOpen: boolean;
    isFullscreenOpenRef: React$1.RefObject<boolean>;
    setFullscreenOpen: (open: boolean) => void;
    registerFullscreenAdapter: (source: FullscreenSource, a: FullscreenSourceAdapter) => void;
    getFullscreenAdapter: (source: FullscreenSource) => FullscreenSourceAdapter | null;
    expandableImageRefs: React$1.RefObject<Array<HTMLImageElement | null>>;
    registerExpandableImage: (index: number, node: HTMLElement | null) => void;
    baseVisibleSub: {
        emit(v: BaseVisibleIndexEvent): void;
        subscribe(fn: (v: BaseVisibleIndexEvent) => void): () => void;
    };
    notifyBaseVisibleIndex: (index: number) => void;
    fsVisibleSub: {
        emit(v: FsVisibleIndexEvent): void;
        subscribe(fn: (v: FsVisibleIndexEvent) => void): () => void;
    };
    notifyFsVisibleIndex: (index: number) => void;
    openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
};
declare const GalleryCore: typeof GalleryCoreProvider;

type PlyrSource = Plyr.SourceInfo;
type PlyrOptions = Plyr.Options;
type PlyrSourceBuilder = (item: MediaItem, index: number) => PlyrSource;
type PlyrOptionsBuilder = PlyrOptions | ((item: MediaItem, index: number) => PlyrOptions);

type FsCounterArgs = {
    index: number;
    count: number;
};
type FsCaptionPlacement = "top" | "right" | "bottom" | "left";
type FsIntroRequest = null | {
    originalImage: HTMLImageElement | null;
    index: number;
    method: FullscreenOpenMethod$1;
    closestSelector?: string;
};
/**
 * Custom fullscreen image renderers must output a real DOM `<img>` somewhere in
 * the returned tree so zoom, pinch, pan, and close transitions can resolve the
 * primary active image element. Wrapped renderers such as `next/image` are
 * supported, but the wrapper should act as layout scaffolding instead of
 * shrinking the fullscreen media surface on both axes or forcing the inner
 * image itself to behave like a full-bleed fill box.
 *
 * When this callback is provided and `fullscreen.lazyLoad.images.enabled` is
 * `false`, the renderer owns loading, placeholders, and image optimization
 * behavior exactly as usual.
 *
 * When this callback is provided and `fullscreen.lazyLoad.images.enabled` is
 * `true`, the built-in fullscreen lazy/decode/spinner pipeline waits on the
 * primary descendant DOM `<img>`. Custom placeholders or spinners inside the
 * renderer may still be visible beneath the built-in fullscreen spinner once
 * the renderer mounts.
 */
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
type FsCaptionRenderArgs = {
    item: MediaItem;
    index: number;
    isZoomed: boolean;
};
type FullscreenCaptionOptions = {
    className?: string;
    style?: React$1.CSSProperties;
    placement?: FsCaptionPlacement;
    width?: number;
    height?: number;
    breakpoint?: number;
    render?: (args: FsCaptionRenderArgs) => React$1.ReactNode;
};
type FullscreenEffectsOptions = {
    introDuration?: number;
    introEasing?: string;
    introFade?: boolean;
    slideFade?: boolean;
    slideFadeDuration?: number;
    slideFadeEasing?: string;
};
type FullscreenSliderOptions = {
    duration?: number;
    friction?: number;
};
type FullscreenZoomPanOptions = {
    clickZoomLevel?: number;
    maxZoomLevel?: number;
    panDuration?: number;
    panFriction?: number;
};
type FullscreenVideoOptions = {
    source?: PlyrSourceBuilder;
    options?: PlyrOptionsBuilder;
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
type FullscreenOptions = {
    enabled?: boolean;
    items?: MediaItem[] | string[];
    renderImage?: FSImageRender;
    video?: FullscreenVideoOptions;
    controls?: FullscreenControlsOptions;
    caption?: FullscreenCaptionOptions;
    slider?: FullscreenSliderOptions;
    zoom?: FullscreenZoomPanOptions;
    effects?: FullscreenEffectsOptions;
    lazyLoad?: FullscreenLazyLoadOptions;
};

type JumpMode = 'instant' | 'animated';
type FSRequest = {
    type: 'requestSet';
    index: number;
    mode?: JumpMode;
} | {
    type: 'requestNext';
} | {
    type: 'requestPrev';
} | {
    type: 'center';
};
type FSEvent = {
    type: 'internalIndex';
    index: number;
} | {
    type: 'mounted';
} | {
    type: 'unmounted';
};
type FullscreenSliderSub = {
    get: () => number;
    requestSet: (index: number, mode?: JumpMode) => void;
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
};

type FullscreenOpenMethod = "fade" | "scale";
type UseFullscreenArgs = {
    fullscreen?: FullscreenOptions;
    slider?: SliderOptions;
    sliderObject: any;
    cellsStateLength: number;
};
declare function useFullscreenController(args: UseFullscreenArgs): {
    fs: {
        slider: {
            duration: number;
            friction: number;
        };
        zoom: {
            clickZoomLevel: number;
            maxZoomLevel: number;
            panDuration: number;
            panFriction: number;
        };
        effects: {
            introDuration: number;
            introEasing: string;
            introFade: boolean;
            slideFade: boolean;
            slideFadeDuration: number;
            slideFadeEasing: string;
            thumbnailsFadeDuration?: number;
            thumbnailsFadeEasing?: string;
        };
        controls: {
            close?: FullscreenClose;
            arrows?: FullscreenArrows;
            counter?: FullscreenCounter;
        };
        caption: {
            className?: string;
            style?: React__default.CSSProperties;
            placement?: FsCaptionPlacement;
            width?: number;
            height?: number;
            breakpoint?: number;
            render?: (args: FsCaptionRenderArgs) => React__default.ReactNode;
        };
        enabled: boolean;
        items?: MediaItem[] | string[];
        renderImage?: FSImageRender;
        video?: FullscreenVideoOptions;
        lazyLoad?: FullscreenLazyLoadOptions;
        thumbnails?: unknown;
    };
    fullscreenNode: react_jsx_runtime.JSX.Element | null;
    fullscreenThumbnailBridge: FullscreenThumbnailBridge;
    openFullscreenAt: (source: FullscreenOpenRequest["source"], gridIndex: number, originEl?: HTMLElement | null, requestedMethod?: FullscreenOpenMethod) => void;
    isClick: React__default.RefObject<boolean>;
    expandableImageRefs: React__default.RefObject<(HTMLImageElement | null)[]>;
    overlayDivRef: React__default.RefObject<HTMLDivElement | null>;
    duplicateImgRef: React__default.RefObject<HTMLElement | null>;
    closeButtonRef: React__default.RefObject<HTMLElement | null>;
    counterRef: React__default.RefObject<HTMLElement | null>;
    leftChevronRef: React__default.RefObject<HTMLElement | null>;
    rightChevronRef: React__default.RefObject<HTMLElement | null>;
    sliderForFullscreen: React__default.RefObject<HTMLDivElement | null>;
    slidesForFullscreen: React__default.RefObject<{
        cells: {
            element: HTMLElement;
            index: number;
        }[];
        target: number;
    }[]>;
    visibleImagesForFullscreen: React__default.RefObject<number>;
    selectedIndexForFullscreen: React__default.RefObject<number>;
    sliderXForFullscreen: React__default.RefObject<number>;
    sliderVelocityForFullscreen: React__default.RefObject<number>;
    isWrappingForFullscreen: React__default.RefObject<boolean>;
    fsThumbContainerRef: React__default.RefObject<HTMLDivElement | null>;
    cells: React__default.RefObject<{
        element: HTMLElement;
        index: number;
    }[]>;
    setSlideIndex: React__default.Dispatch<React__default.SetStateAction<number>>;
    setShowFullscreenModal: React__default.Dispatch<React__default.SetStateAction<boolean>>;
    setShowFullscreenSlider: React__default.Dispatch<React__default.SetStateAction<boolean>>;
    setFsFadeOpening: React__default.Dispatch<React__default.SetStateAction<boolean>>;
    showFullscreenModal: boolean;
    showFullscreenSlider: boolean;
    fsFadeOpening: boolean;
    closingModal: boolean;
};

declare function FullscreenThumbnailSlider({ bridge, items, position, containerClassName, containerStyle, thumbnailWidth, thumbnailHeight, thumbnailsCenter, thumbnailsContainerWidth, thumbnailsContainerHeight, fadeDurationMs, fadeEasing, thumbnailItemClassName, thumbnailItemStyle, gap, freeScroll, groupCells, loop, skipSnaps, centerActiveThumb, selectDuration, freeScrollDuration, sliderFriction, breakpointMap, rippleEnabled, rippleClassName, showArrows, arrowStyles, arrowClassName, prevArrowStyles, prevArrowClassName, nextArrowStyles, nextArrowClassName, renderArrows, renderPrevArrow, renderNextArrow }: FullscreenThumbnailSliderProps): React__default.ReactPortal | null;

declare const Slider: React$1.ForwardRefExoticComponent<SliderOptions & {
    children?: React$1.ReactNode;
    breakpoints?: BreakpointMap;
    expandableImageRefs?: React$1.RefObject<Array<HTMLImageElement | null>>;
    indexChannel?: SliderIndexChannel;
} & React$1.RefAttributes<SliderHandle>>;

type GalleryLazyLoadRenderArgs = {
    kind: "image" | "video";
    isClone: boolean;
};
type GalleryLazyLoadOptions = {
    enabled?: boolean;
    spinner?: boolean | React$1.ReactNode | ((args: GalleryLazyLoadRenderArgs) => React$1.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React$1.CSSProperties;
};

type SkeletonLength$1 = number | string;
type SkeletonShimmer$1 = {
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
    width?: SkeletonLength$1;
    maxWidth?: SkeletonLength$1;
    height?: SkeletonLength$1;
    maxHeight?: SkeletonLength$1;
    backgroundColor?: string;
    borderRadius?: SkeletonLength$1;
    marginTop?: SkeletonLength$1;
    marginRight?: SkeletonLength$1;
    marginBottom?: SkeletonLength$1;
    marginLeft?: SkeletonLength$1;
    alignSelf?: React$1.CSSProperties["alignSelf"];
    aspectRatio?: SkeletonLength$1;
};
type SkeletonContainerStyle = {
    gap?: SkeletonLength$1;
    padding?: SkeletonLength$1;
    align?: React$1.CSSProperties["alignItems"];
    justify?: React$1.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength$1;
    maxWidth?: SkeletonLength$1;
};
type SkeletonContainerStyleResponsive = SkeletonContainerStyle | Record<string, SkeletonContainerStyle>;
type GridSkeletonNode = {
    kind: "grid";
    style?: SkeletonContainerStyleResponsive;
    count?: number;
    item: SkeletonNode;
    itemWrapStyle?: SkeletonBaseStyle;
} | SkeletonNode;
type SkeletonNode = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    children: SkeletonNode[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyle;
    shimmer?: SkeletonShimmer$1;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyle;
        shimmer?: SkeletonShimmer$1;
    };
} | {
    kind: "text";
    fontSize: number;
    lineHeight: number;
    lines?: number;
    style?: SkeletonBaseStyle;
    shimmer?: SkeletonShimmer$1;
};
type GridSkeletonSpec = {
    className?: string;
    layout?: GridSkeletonNode;
    backgroundColor?: string;
    radius?: SkeletonLength$1;
    shimmer?: SkeletonShimmer$1;
};

type LoadingOptions$1 = {
    enabled?: boolean;
    force?: boolean;
    renderLoading?: (args: {
        count: number;
    }) => React.ReactNode;
    skeleton?: GridSkeletonSpec;
};
type IntroOptions$1 = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    transform?: string;
    durationMs?: number;
    easing?: string;
    staggerLimit?: number;
};
type FullscreenTrigger = 'item' | 'media';
type GridLazyLoadOptions = GalleryLazyLoadOptions;
type GridOptions = {
    columns?: ResponsiveNumber;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    rootClassName?: string;
    itemClassName?: string;
    fullscreenTrigger?: FullscreenTrigger;
    lazyLoad?: GridLazyLoadOptions;
    loading?: LoadingOptions$1;
    intro?: IntroOptions$1;
};

type Props$1 = GridOptions & {
    children?: React$1.ReactNode;
    breakpoints?: BreakpointMap;
    gridItemBaseClass?: string;
    renderMode?: "wrap" | "passthrough";
};
declare function GridLayoutRuntime(props: Props$1): react_jsx_runtime.JSX.Element;

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
type MasonrySkeletonSpec = {
    className?: string;
    ratios?: number[];
    heightsPx?: number[];
    backgroundColor?: string;
    highlightColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

type LoadingOptions = {
    enabled?: boolean;
    force?: boolean;
    renderLoading?: (args: {
        count: number;
    }) => React.ReactNode;
    skeleton?: MasonrySkeletonSpec;
};
type IntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    transform?: string;
    durationMs?: number;
    easing?: string;
    staggerLimit?: number;
};
type MasonryLazyLoadOptions = GalleryLazyLoadOptions;
type MasonryOptions = {
    columns?: ResponsiveNumber;
    gap?: ResponsiveNumber;
    placement?: "balanced" | "roundRobin";
    estimatedItemHeight?: number;
    as?: React.ElementType;
    rootRef?: React.Ref<HTMLDivElement>;
    classNames?: {
        root?: string;
        column?: string;
        item?: string;
    };
    lazyLoad?: MasonryLazyLoadOptions;
    loading?: LoadingOptions;
    intro?: IntroOptions;
};

type Props = MasonryOptions & {
    children?: React$1.ReactNode;
    breakpoints?: BreakpointMap;
};
declare function Masonry(props: Props): react_jsx_runtime.JSX.Element;

type RmgPlyrSourceBuilder = (args: {
    src: string;
}) => PlyrSource;
type RmgPlyrOptionsResolver = PlyrOptions | ((args: {
    src: string;
    index: number;
}) => PlyrOptions);
type RmgVideoLazyLoadOptions = {
    enabled?: boolean;
    spinner?: boolean | React$1.ReactNode | ((args: {
        kind: 'image' | 'video';
        isClone: boolean;
    }) => React$1.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React$1.CSSProperties;
};
type VideoProps = {
    src: string;
    poster?: string;
    alt?: string;
    source?: PlyrSource;
    sourceBuilder?: RmgPlyrSourceBuilder;
    options?: RmgPlyrOptionsResolver;
    className?: string;
    style?: React$1.CSSProperties;
    onApi?: (api: APITypes | null) => void;
    registerApiByIndex?: (index: number, api: APITypes | null) => void;
    lazyLoad?: RmgVideoLazyLoadOptions;
};
declare function Video(props: VideoProps): react_jsx_runtime.JSX.Element;

declare function PanAxis(): {
    scroll: "x";
    cross: "y";
    direction(n: number): number;
};
type PanAxisType = ReturnType<typeof PanAxis>;

declare const DEFAULT_SLIDER: {
    readonly layout: {
        readonly gap: 20;
    };
    readonly direction: {
        readonly dir: "ltr";
        readonly axis: "x";
    };
    readonly align: "start";
    readonly scroll: {
        readonly groupCells: false;
        readonly skipSnaps: false;
        readonly freeScroll: false;
        readonly loop: false;
    };
    readonly lazyLoad: {
        readonly enabled: false;
        readonly spinner: true;
        readonly spinnerClassName: "";
        readonly spinnerStyle: {};
    };
    readonly controls: {
        readonly arrows: {
            readonly enabled: true;
            readonly arrow: {};
            readonly prev: {};
            readonly next: {};
        };
        readonly dots: {
            readonly enabled: true;
            readonly root: {};
            readonly dot: {};
        };
        readonly progress: {
            readonly enabled: false;
            readonly root: {};
            readonly bar: {};
        };
        readonly ripple: {
            readonly enabled: true;
            readonly className: "";
        };
    };
    readonly auto: {
        readonly play: {
            readonly enabled: false;
            readonly speedMs: 3000;
            readonly pauseMs: 1000;
            readonly pauseOnHover: true;
        };
        readonly scroll: {
            readonly enabled: false;
            readonly speedMs: 3000;
            readonly pauseMs: 1000;
            readonly pauseOnHover: true;
        };
    };
    readonly motion: {
        readonly selectDuration: 25;
        readonly freeScrollDuration: 43;
        readonly friction: 0.68;
    };
};

declare const DEFAULT_GRID: Required<Pick<GridOptions, "minColumnWidth" | "gap">>;

declare const DEFAULT_MASONRY: Required<Pick<MasonryOptions, "placement">>;

declare const DEFAULT_FULLSCREEN: {
    readonly enabled: false;
    readonly controls: {
        readonly close: {
            readonly enabled: true;
            readonly style: {};
            readonly className: "";
            readonly render: undefined;
        };
        readonly arrows: {
            readonly enabled: true;
            readonly arrow: {};
            readonly prev: {};
            readonly next: {};
            readonly render: undefined;
            readonly renderPrev: undefined;
            readonly renderNext: undefined;
        };
        readonly counter: {
            readonly enabled: true;
            readonly style: {};
            readonly className: "";
            readonly render: undefined;
        };
    };
    readonly effects: {
        readonly introDuration: 300;
        readonly introEasing: "cubic-bezier(.4,0,.22,1)";
        readonly introFade: false;
        readonly slideFade: false;
        readonly slideFadeDuration: 120;
        readonly slideFadeEasing: "cubic-bezier(.4,0,.22,1)";
    };
    readonly slider: {
        readonly duration: 25;
        readonly friction: 0.68;
    };
    readonly zoom: {
        readonly clickZoomLevel: 2.5;
        readonly maxZoomLevel: 3;
        readonly panDuration: 43;
        readonly panFriction: 0.68;
    };
    readonly caption: {};
};

export { BREAKPOINT_MAP, DEFAULT_ENTRIES, DEFAULT_FULLSCREEN, DEFAULT_GRID, DEFAULT_MASONRY, DEFAULT_SLIDER, type ElementStyle, Entries, type EntriesOptions, type FsCaptionPlacement, type FsIntroRequest, type FullscreenOptions, type FullscreenThumbnailBridge, FullscreenThumbnailSlider, type FullscreenThumbnailSlotLayout, type GalleryApi, GalleryCore, GridLayoutRuntime as Grid, type GridLazyLoadOptions, type GridOptions, type IndexMode, Masonry, type MasonryLazyLoadOptions, type MasonryOptions, type MediaEntryLink, type MediaItem, type PanAxisType, type ResponsiveHeightRule, type SlideOwner, Slider, type SliderHandle, type SliderIndexChannel, type SliderOptions, Video, createSliderIndexChannel, flattenEntries, toMediaItems, useFullscreenController };
