import * as react_jsx_runtime from 'react/jsx-runtime';
import { s as FullscreenOptions, t as FullscreenPlugin, p as FullscreenIntroPathTiming, U as FullscreenClose, V as FullscreenArrows, W as FullscreenCounter, A as ResponsiveLength, R as ResponsiveCaptionPlacement, X as FsCaptionRenderArgs, Y as FSImageRender, w as FullscreenVideoOptions, q as FullscreenLazyLoadOptions, k as FullscreenCloseScrollOptions } from './responsive-BgOmwHgG.mjs';
export { y as FsCaptionPlacement, z as FsIntroRequest, F as FullscreenCaptionOptions, i as FullscreenCloseScrollContext, j as FullscreenCloseScrollEnabled, l as FullscreenCloseScrollTiming, m as FullscreenControlsOptions, n as FullscreenCrossfadeOptions, o as FullscreenEffectsOptions, r as FullscreenMobileDetectionContext, u as FullscreenPluginKind, v as FullscreenSliderOptions, x as FullscreenZoomPanOptions } from './responsive-BgOmwHgG.mjs';
import { c as ZoomPanPlugin } from './types-CLMzNXt4.mjs';
import React__default from 'react';
import { MediaItem } from './media.mjs';
import { h as SliderSkipSnaps, d as CrossFadeWheel, J as FullscreenOpenRequest } from './types-D9WBOrx6.mjs';
export { G as GalleryApi, a as GalleryCoreApi, I as IndexMode } from './types-D9WBOrx6.mjs';
import { a as FullscreenThumbnailBridge } from './types-bZ-lDlKM.mjs';
import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
import './types-uhDRb0mo.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './text-BBcRGVzn.mjs';
import 'react-dom/client';

type FullscreenOpenMethod = "fade" | "scale";
type UseFullscreenArgs = {
    fullscreen?: FullscreenOptions;
    plugins?: FullscreenPlugin[];
};
declare function useFullscreenController(args: UseFullscreenArgs): {
    fs: {
        slider: {
            gap: ResponsiveNumber;
            duration: number;
            friction: number;
            direction: "ltr" | "rtl";
            skipSnaps: SliderSkipSnaps;
            strictSnaps: boolean;
        };
        zoom: {
            clickZoomLevel: number;
            maxZoomLevel: number;
            panDuration: number;
            panFriction: number;
            plugins?: ZoomPanPlugin[];
        };
        effects: {
            crossfade: {
                controls: boolean;
                drag: boolean;
                wheel?: CrossFadeWheel;
                durationMs: number;
                easing: string;
            };
            introDuration: FullscreenIntroPathTiming<number> | {
                readonly transform: 300;
                readonly fade: 500;
            };
            introEasing: FullscreenIntroPathTiming<string>;
            introFade: boolean;
            introStickyNavSelector?: string;
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
            width?: ResponsiveLength;
            height?: ResponsiveLength;
            placement?: ResponsiveCaptionPlacement;
            breakpoint?: number;
            render?: (args: FsCaptionRenderArgs) => React__default.ReactNode;
            layout?: "overlay" | "slide";
            overlayCrossfadeTarget: "content" | "overlay";
            overlayCrossfadeDurationMs: number;
            overlayCrossfadeEasing: string;
            zoomFade: boolean;
            zoomFadeDurationMs: number;
            zoomFadeEasing: string;
            zoomInTransform: string;
            zoomOutTransform: string;
        };
        enabled: boolean;
        items?: MediaItem[] | string[];
        renderImage?: FSImageRender;
        video?: FullscreenVideoOptions;
        lazyLoad?: FullscreenLazyLoadOptions;
        closeScroll: boolean | FullscreenCloseScrollOptions;
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

export { FullscreenCloseScrollOptions, FullscreenIntroPathTiming, FullscreenLazyLoadOptions, FullscreenOptions, FullscreenPlugin, FullscreenVideoOptions, useFullscreenController };
