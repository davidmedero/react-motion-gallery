import { T as ThumbnailPosition } from './types-DXFoG8LC.mjs';
import * as React$1 from 'react';
import { MediaItem } from './media.mjs';
import { E as ElementStyle, g as SliderSkipSnaps, C as CrossFade, J as FullscreenOpenMethod } from './types-BiXSaEk7.mjs';
import { P as PlyrSourceBuilder, a as PlyrOptionsBuilder } from './plyrTypes-DhzgHNfX.mjs';
import { a as ZoomPanOptions } from './types-Dhh8xfHo.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { R as ResponsiveTextBarHeight, a as ResponsiveTextBarWidth, b as ResponsiveTextLineHeight, c as ResponsiveTextLineCount, d as ResponsiveTextLastBarWidth, T as TextSkeletonResponsiveBy } from './text-BBcRGVzn.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
import { APITypes } from 'plyr-react';
import { c as FullscreenThumbnailSlotLayout } from './types-DNd5jSkS.mjs';
import { Root } from 'react-dom/client';
import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';

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
    nearMargin?: string;
    viewMargin?: string;
    threshold?: number;
    waitForDecode?: boolean;
    decodeTimeoutMs?: number;
    skeletonWrap?: ElementStyle;
    cache?: SkeletonCacheOptions;
};
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
    overlay?: EntryOverlayStyle;
    loading?: EntriesLoadingOptions;
    intro?: IntroOptions;
    entryList?: ElementStyle;
    entryRow?: ElementStyle;
};
type SlideOwner = {
    entryIndex: number;
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
    introFade: boolean;
    introDuration?: FullscreenIntroPathTiming<number>;
    introEasing?: FullscreenIntroPathTiming<string>;
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
    introDuration?: FullscreenIntroPathTiming<number>;
    introEasing?: FullscreenIntroPathTiming<string>;
    introFade?: boolean;
    introStickyNavSelector?: string;
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
type ResponsivePosition = ThumbnailPosition | Array<ThumbnailPosition> | Record<string, ThumbnailPosition>;
type ResponsiveCaptionPlacement = FsCaptionPlacement | Array<FsCaptionPlacement> | Record<string, FsCaptionPlacement>;

export type { EntrySkeletonResolverArgs as A, EntriesLoadingOptions as B, EntrySkeletonRenderArgs as C, FullscreenClose as D, EntriesOptions as E, FullscreenCaptionOptions as F, FullscreenArrows as G, FullscreenCounter as H, IntroOptions as I, FsCaptionRenderArgs as J, FSImageRender as K, ResponsivePosition as L, MediaEntryLink as M, PanAxisType as P, ResponsiveCaptionPlacement as R, SlideOwner as S, FullscreenCloseScrollContext as a, FullscreenCloseScrollEnabled as b, FullscreenCloseScrollOptions as c, FullscreenCloseScrollTiming as d, FullscreenControlsOptions as e, FullscreenCrossfadeOptions as f, FullscreenEffectsOptions as g, FullscreenIntroPathTiming as h, FullscreenLazyLoadOptions as i, FullscreenMobileDetectionContext as j, FullscreenOptions as k, FullscreenPlugin as l, FullscreenPluginKind as m, FullscreenSliderOptions as n, FullscreenVideoOptions as o, FullscreenZoomPanOptions as p, FsCaptionPlacement as q, FsIntroRequest as r, ResponsiveLength as s, ResponsiveLengthValue as t, EntryItem as u, EntryMediaRenderArgs as v, EntryOverlayRenderArgs as w, EntryOverlayStyle as x, EntryMediaLayout as y, EntryCardRenderArgs as z };
