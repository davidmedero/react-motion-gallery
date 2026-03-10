import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import React__default from 'react';
import { M as MediaItem } from './media-moIXOhT1.mjs';
import { E as ElementStyle } from './elements-Bd1vm4Uk.mjs';
import { a as FullscreenOpenMethod$1, F as FullscreenOpenRequest } from './sliderSub-DNikv2lm.mjs';
export { G as GalleryApi, I as IndexMode } from './sliderSub-DNikv2lm.mjs';
import { P as PlyrSourceBuilder, a as PlyrOptionsBuilder } from './plyrTypes-CmP9NWvX.mjs';
import { a as FullscreenThumbnailBridge } from './types-CQ6I3EfZ.mjs';
import { S as SliderOptions } from './types-Dqm2ynv2.mjs';
import './responsive-CvE5dTnP.mjs';
import './types-Bi2iBbyG.mjs';

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
    baseStyle: React.CSSProperties;
}) => React.ReactNode;
type FullscreenArrows = {
    enabled?: boolean;
    arrow?: ElementStyle;
    prev?: ElementStyle;
    next?: ElementStyle;
    render?: (args: {
        dir: "prev" | "next";
    }) => React.ReactNode;
    renderPrev?: () => React.ReactNode;
    renderNext?: () => React.ReactNode;
};
type FullscreenClose = {
    enabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
    render?: () => React.ReactNode;
};
type FullscreenCounter = {
    enabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
    render?: (args: FsCounterArgs) => React.ReactNode;
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
    style?: React.CSSProperties;
    placement?: FsCaptionPlacement;
    width?: number;
    height?: number;
    breakpoint?: number;
    render?: (args: FsCaptionRenderArgs) => React.ReactNode;
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
    style?: React.CSSProperties;
    className?: string;
};
type FullscreenLazyLoadKind = "image" | "video";
type FullscreenLazyLoadArgs = {
    kind: FullscreenLazyLoadKind;
    isClone?: boolean;
};
type FullscreenLazyLoadConfig = {
    enabled?: boolean;
    spinner?: boolean | React.ReactNode | ((args: FullscreenLazyLoadArgs) => React.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React.CSSProperties;
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

export { DEFAULT_FULLSCREEN, type FsCaptionPlacement, type FsIntroRequest, type FullscreenOptions, useFullscreenController };
