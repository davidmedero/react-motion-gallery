import * as React$1 from 'react';
import { M as MediaItem, P as PlyrSourceBuilder, a as PlyrOptionsBuilder } from './plyrTypes-Cq4C3ul5.mjs';
import { a as ZoomPanOptions } from './types-Dhh8xfHo.mjs';

type ElementStyle = {
    className?: string;
    style?: React.CSSProperties;
};

type LoadingTimingOptions = {
    exitMs?: number;
    minVisibleMs?: number;
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
    zoomFade?: boolean;
    zoomFadeDurationMs?: number;
    zoomFadeEasing?: string;
    zoomInTransform?: string;
    zoomOutTransform?: string;
};
type FullscreenEffectsOptions = {
    introDuration?: number;
    introEasing?: string;
    introFade?: boolean;
    introStickyNavSelector?: string;
    controlsFade?: boolean;
    dragFade?: boolean;
    slideFadeDuration?: number;
    slideFadeEasing?: string;
};
type FullscreenSliderOptions = {
    duration?: number;
    friction?: number;
    direction?: "ltr" | "rtl";
};
type FullscreenZoomPanOptions = ZoomPanOptions;
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

declare const BREAKPOINT_MAP: Record<string, number>;
type BreakpointMap = Record<string, number>;
type ResponsiveNumber = number | Record<string, number>;
type ResponsiveLengthValue = number | string;
type ResponsiveLength = ResponsiveLengthValue | Record<string, ResponsiveLengthValue>;
type ResponsiveCaptionPlacement = FsCaptionPlacement | Array<FsCaptionPlacement> | Record<string, FsCaptionPlacement>;

export { BREAKPOINT_MAP as B, type ElementStyle as E, type FullscreenOptions as F, type GalleryApi as G, type IndexMode as I, type LoadingTimingOptions as L, type OpenFullscreenAtArgs as O, type ResponsiveNumber as R, type FsCaptionPlacement as a, type FsIntroRequest as b, type BreakpointMap as c, type ResponsiveLength as d, type ResponsiveCaptionPlacement as e, type FullscreenOpenRequest as f, type FullscreenClose as g, type FullscreenArrows as h, type FullscreenCounter as i, type FsCaptionRenderArgs as j, type FSImageRender as k, type FullscreenVideoOptions as l, type FullscreenLazyLoadOptions as m };
