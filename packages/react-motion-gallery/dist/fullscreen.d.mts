import * as react_jsx_runtime from 'react/jsx-runtime';
import { W as FullscreenOptions, X as FullscreenPlugin, h as SliderSkipSnaps, d as CrossFadeWheel, T as FullscreenIntroPathTiming, aG as FullscreenClose, aH as FullscreenArrows, aI as FullscreenCounter, af as ResponsiveLength, ae as ResponsiveCaptionPlacement, aJ as FsCaptionRenderArgs, O as FullscreenDialogOptions, aK as FSImageRender, _ as FullscreenVideoOptions, U as FullscreenLazyLoadOptions, J as FullscreenCloseScrollOptions, a3 as FullscreenThumbnailBridge, aF as FullscreenOpenRequest } from './responsive-DRmZH1Q2.mjs';
export { a0 as FsCaptionPlacement, a1 as FsIntroRequest, F as FullscreenCaptionOptions, D as FullscreenCloseScrollContext, H as FullscreenCloseScrollEnabled, K as FullscreenCloseScrollTiming, L as FullscreenControlsOptions, N as FullscreenCrossfadeOptions, Q as FullscreenEffectsOptions, V as FullscreenMobileDetectionContext, Y as FullscreenPluginKind, Z as FullscreenSliderOptions, $ as FullscreenZoomPanOptions, G as GalleryApi, a as GalleryCoreApi, I as IndexMode } from './responsive-DRmZH1Q2.mjs';
import { c as ZoomPanPlugin } from './types-CLMzNXt4.mjs';
import React__default from 'react';
import { MediaItem } from './media.mjs';
import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
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
            transitionDuration: FullscreenIntroPathTiming<number> | {
                readonly transform: 300;
                readonly fade: 500;
            };
            transitionEasing: FullscreenIntroPathTiming<string>;
            transitionFade: boolean;
            StickyNavSelector?: string;
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
        dialog?: FullscreenDialogOptions;
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

export { FullscreenCloseScrollOptions, FullscreenDialogOptions, FullscreenIntroPathTiming, FullscreenLazyLoadOptions, FullscreenOptions, FullscreenPlugin, FullscreenVideoOptions, useFullscreenController };
