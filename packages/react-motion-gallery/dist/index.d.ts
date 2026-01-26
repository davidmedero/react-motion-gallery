import * as React$1 from 'react';
import React__default, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
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
    isLoading?: boolean;
    skeletonCount?: ResponsiveNumber;
    renderLoading?: (args: {
        layout: "thumbnails";
        count: number;
    }) => React$1.ReactNode;
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

type LoadingOptions = {
    isLoading?: boolean;
    skeletonCount?: ResponsiveNumber;
    renderLoading?: (args: {
        layout: "slider" | "grid" | "masonry" | "entries";
        count: number;
    }) => React.ReactNode;
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
type EntriesOptions = {
    items?: EntryItem[];
    mediaLayout?: EntryMediaLayout;
    render?: {
        card?: (args: EntryCardRenderArgs) => React.ReactNode;
        media?: (args: EntryMediaRenderArgs) => React.ReactNode;
        overlay?: (args: EntryOverlayRenderArgs) => React.ReactNode;
    };
    overlay?: ElementStyle;
    loading?: LoadingOptions;
    intro?: IntroOptions;
};

type FsCounterArgs = {
    index: number;
    count: number;
};
type FsCaptionPlacement = "top" | "right" | "bottom" | "left";
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
    }) => HTMLElement | null;
    renderPrev?: () => HTMLElement | null;
    renderNext?: () => HTMLElement | null;
};
type FullscreenClose = {
    enabled?: boolean;
    style?: React$1.CSSProperties;
    className?: string;
    render?: () => HTMLElement | null;
};
type FullscreenCounter = {
    enabled?: boolean;
    style?: React$1.CSSProperties;
    className?: string;
    render?: (args: FsCounterArgs) => HTMLElement | null;
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

type GridOptions = {
    columns?: ResponsiveNumber;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    rootClassName?: string;
    itemClassName?: string;
    loading?: LoadingOptions;
    intro?: IntroOptions;
};

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
    isLoading?: boolean;
    skeletonCount?: ResponsiveNumber;
    renderLoading?: (args: {
        layout: "slider" | "grid" | "masonry" | "entries";
        count: number;
    }) => React.ReactNode;
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

type Props = {
    children?: ReactNode;
    fullscreen?: FullscreenOptions;
    slider?: SliderOptions;
    layout?: 'slider' | 'grid' | 'masonry' | 'entries';
    grid?: GridOptions;
    masonry?: MasonryOptions;
    entries?: EntriesOptions;
    breakpoints?: BreakpointMap;
    root?: ElementStyle;
    container?: ElementStyle;
};
declare const Gallery: React__default.ForwardRefExoticComponent<Props & React__default.RefAttributes<GalleryApi>>;

type RmgPlyrSourceBuilder = (args: {
    src: string;
    poster?: string;
}) => any;
type RmgPlyrOptionsResolver = any | ((args: {
    src: string;
    poster?: string;
    index: number;
}) => any);
type RmgPlyrVideoProps = {
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
declare function RmgPlyrVideo(props: RmgPlyrVideoProps): react_jsx_runtime.JSX.Element;

export { Gallery, RmgPlyrVideo };
