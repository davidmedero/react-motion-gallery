import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React$1 from 'react';
import React__default, { RefObject } from 'react';
import { APITypes } from 'plyr-react';

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

type ElementStyle = {
    className?: string;
    style?: React.CSSProperties;
};

type ThumbnailPosition = "top" | "right" | "bottom" | "left";
type ResponsivePosition = ThumbnailPosition | Array<ThumbnailPosition> | Record<string, ThumbnailPosition>;
type ThumbnailLoadingOptions = {
    enabled?: boolean;
    force?: boolean;
    skeletonCount?: ResponsiveNumber;
    renderLoading?: () => React$1.ReactNode;
};
type ThumbnailIntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React$1.HTMLAttributes<HTMLDivElement>;
    }, inner: React$1.ReactNode) => React$1.ReactNode;
    staggerMs?: number;
    transform?: number;
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
    position?: ResponsivePosition;
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
    render?: (args: ArrowRenderArgs & {
        dir: "prev" | "next";
    }) => React$1.ReactNode;
    renderPrev?: (args: ArrowRenderArgs) => React$1.ReactNode;
    renderNext?: (args: ArrowRenderArgs) => React$1.ReactNode;
    ripple?: ThumbnailsRipple;
};
type ThumbnailsTransitions = {
    loading?: ThumbnailLoadingOptions;
    intro?: ThumbnailIntroOptions;
};
type ThumbnailsOptions = {
    children?: React$1.ReactNode;
    layout?: ThumbnailsLayout;
    elements?: ThumbnailsElements;
    scroll?: ThumbnailsScroll;
    controls?: ThumbnailsControls;
    motion?: ThumbnailsMotion;
    transitions?: ThumbnailsTransitions;
    breakpointMap?: BreakpointMap;
};

declare const BREAKPOINT_MAP: Record<string, number>;
type BreakpointMap = Record<string, number>;
type ResponsiveNumber = number | string | Array<number | string> | Record<string, number | string>;

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
    thumb?: string;
    caption?: React.ReactNode;
};
declare const toMediaItems: (urls: string[]) => MediaItem[];

type IndexMode = "instant" | "animated";
interface GalleryApi {
    rootNode(): HTMLElement | null;
    containerNode(): HTMLElement | null;
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
};
type SliderSkeletonSpec = {
    className?: string;
    layout?: SliderSkeletonNode;
    defaults?: {
        backgroundColor?: string;
        highlightColor?: string;
        radius?: SkeletonLength$3;
        shimmer?: SkeletonShimmer$3;
    };
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
type SliderSize = {
    height?: string;
    heightRules?: ResponsiveHeightRule[];
    initialHeight?: number | string;
    initialHeightRules?: ResponsiveHeightRule[];
    aspectRatio?: number | `${number}/${number}` | `${number} / ${number}`;
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
type SliderOptions = {
    layout?: SliderLayout;
    direction?: SliderDirection;
    size?: SliderSize;
    align?: "start" | "center";
    scroll?: SliderScroll;
    elements?: SliderElements;
    lazyLoad?: boolean;
    controls?: SliderControls;
    thumbnails?: ThumbnailsOptions;
    auto?: SliderAuto;
    transitions?: SliderTransitions;
    motion?: SliderMotion;
    effects?: SliderEffects;
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
    onOpenFullscreen?: (args: {
        index: number;
        img: HTMLImageElement;
        event?: Event;
    }) => void;
};
declare function Entries(props: EntriesProps): react_jsx_runtime.JSX.Element;

type FullscreenOpenRequest = {
    source: "slider";
    index: number;
    img: HTMLImageElement | null;
    event?: Event;
} | {
    source: "grid" | "masonry" | "entries";
    index: number;
    img: HTMLImageElement | null;
    event?: Event;
};
type CoreLayout = "slider" | "grid" | "masonry" | "entries";
type Cell = {
    id: string;
    node: React$1.ReactNode;
};
type FullscreenSource = FullscreenOpenRequest["source"];
type FullscreenEntryContext = {
    entryMapRef?: React$1.RefObject<MediaEntryLink[] | null>;
    entryMediaLayout?: "slider" | "grid" | "masonry";
    entriesObject?: any;
    entrySliderRefs?: React$1.RefObject<Array<SliderHandle | null>>;
    expandableImgRefs?: React$1.RefObject<Array<HTMLImageElement | null>>;
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
    expandableImgRefs: React$1.RefObject<Array<HTMLImageElement | null>>;
    registerExpandableImg: (index: number, node: HTMLElement | null) => void;
};
declare const GalleryCore: typeof GalleryCoreProvider;

type FsCounterArgs = {
    index: number;
    count: number;
};
type FsCaptionPlacement = "top" | "right" | "bottom" | "left";
type FsIntroRequest = null | {
    origImg: HTMLImageElement;
    index: number;
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
type PlyrSourceBuilder = (item: MediaItem, index: number) => Plyr.SourceInfo;
type PlyrOptionsResolver = Plyr.Options | ((item: MediaItem, index: number) => Plyr.Options);
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
    thumbnailsFadeDuration?: number;
    thumbnailsFadeEasing?: string;
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
    options?: PlyrOptionsResolver;
    style?: React$1.CSSProperties;
    className?: string;
};
type FullscreenOptions = {
    enabled?: boolean;
    items?: MediaItem[] | string[];
    renderImage?: FSImageRender;
    video?: FullscreenVideoOptions;
    thumbnails?: ThumbnailsOptions;
    controls?: FullscreenControlsOptions;
    caption?: FullscreenCaptionOptions;
    slider?: FullscreenSliderOptions;
    zoom?: FullscreenZoomPanOptions;
    effects?: FullscreenEffectsOptions;
};

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
            thumbnailsFadeDuration: number;
            thumbnailsFadeEasing: string;
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
        thumbnails: {
            children?: React__default.ReactNode;
            layout?: ThumbnailsLayout;
            elements?: ThumbnailsElements;
            scroll?: ThumbnailsScroll;
            controls?: ThumbnailsControls;
            motion?: ThumbnailsMotion;
            transitions?: ThumbnailsTransitions;
            breakpointMap?: BreakpointMap;
        };
        enabled: boolean;
        items?: MediaItem[] | string[];
        renderImage?: FSImageRender;
        video?: FullscreenVideoOptions;
    };
    fullscreenNode: react_jsx_runtime.JSX.Element | null;
    openFullscreenAt: (source: FullscreenOpenRequest["source"], gridIndex: number, originEl?: HTMLElement | null) => void;
    isClick: React__default.RefObject<boolean>;
    expandableImgRefs: React__default.RefObject<(HTMLImageElement | null)[]>;
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

declare const Slider: React$1.ForwardRefExoticComponent<SliderOptions & {
    children?: React$1.ReactNode;
    breakpoints?: BreakpointMap;
    expandableImgRefs?: React$1.RefObject<Array<HTMLImageElement | null>>;
} & React$1.RefAttributes<SliderHandle>>;

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
type GridOptions = {
    columns?: ResponsiveNumber;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    rootClassName?: string;
    itemClassName?: string;
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
    poster?: string;
}) => any;
type RmgPlyrOptionsResolver = any | ((args: {
    src: string;
    poster?: string;
    index: number;
}) => any);
type VideoProps = {
    src: string;
    poster?: string;
    alt?: string;
    source?: any;
    sourceBuilder?: RmgPlyrSourceBuilder;
    options?: RmgPlyrOptionsResolver;
    className?: string;
    style?: React$1.CSSProperties;
    posterClassName?: string;
    posterStyle?: React$1.CSSProperties;
    onApi?: (api: APITypes | null) => void;
    registerApiByIndex?: (index: number, api: APITypes | null) => void;
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
    readonly lazyLoad: false;
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
    readonly thumbnails: Required<Pick<ThumbnailsOptions, "scroll" | "layout" | "motion">>;
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
        readonly thumbnailsFadeDuration: 300;
        readonly thumbnailsFadeEasing: "cubic-bezier(.4,0,.22,1)";
    };
    readonly thumbnails: {};
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

export { BREAKPOINT_MAP, DEFAULT_ENTRIES, DEFAULT_FULLSCREEN, DEFAULT_GRID, DEFAULT_MASONRY, DEFAULT_SLIDER, type ElementStyle, Entries, type EntriesOptions, type FsCaptionPlacement, type FsIntroRequest, type FullscreenOptions, type GalleryApi, GalleryCore, GridLayoutRuntime as Grid, type GridOptions, type IndexMode, Masonry, type MasonryOptions, type MediaEntryLink, type MediaItem, type PanAxisType, type ResponsiveHeightRule, type SlideOwner, Slider, type SliderHandle, type SliderOptions, Video, flattenEntries, toMediaItems, useFullscreenController };
