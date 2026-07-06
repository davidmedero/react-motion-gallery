import * as react_jsx_runtime from 'react/jsx-runtime';
import { w as FullscreenOptions, x as FullscreenPlugin, B as FullscreenZoomPanBoundsMode, s as FullscreenIntroPathTiming, Z as FullscreenClose, _ as FullscreenArrows, $ as FullscreenCounter, H as ResponsiveLength, R as ResponsiveCaptionPlacement, a0 as FsCaptionRenderArgs, v as FullscreenMountStrategy, q as FullscreenDialogOptions, a1 as FSImageRender, A as FullscreenVideoOptions, t as FullscreenLazyLoadOptions, l as FullscreenCloseScrollOptions, i as FullscreenCloseOptions, p as FullscreenDialogTransitionOptions } from './responsive-Bq9VSmbl.mjs';
export { D as FsCaptionPlacement, G as FsIntroRequest, F as FullscreenCaptionOptions, j as FullscreenCloseScrollContext, k as FullscreenCloseScrollEnabled, m as FullscreenCloseScrollTiming, n as FullscreenControlsOptions, o as FullscreenCrossfadeOptions, r as FullscreenEffectsOptions, u as FullscreenMobileDetectionContext, y as FullscreenPluginKind, z as FullscreenSliderOptions, C as FullscreenZoomPanOptions } from './responsive-Bq9VSmbl.mjs';
import { c as ZoomPanPlugin } from './types-CLMzNXt4.mjs';
import React__default from 'react';
import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
import { h as SliderSkipSnaps, k as SliderVirtualizationOptions, d as CrossFadeWheel, L as FullscreenOpenRequest } from './types-CGPPAn9i.mjs';
export { G as GalleryApi, a as GalleryCoreApi, I as IndexMode } from './types-CGPPAn9i.mjs';
import { MediaItem } from './media.mjs';
import { a as FullscreenThumbnailBridge } from './types-BtQK91-K.mjs';
import './types-DTSXOwzF.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './text-BBcRGVzn.mjs';
import './infiniteScrollTrigger-BluBDW9o.mjs';
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
            virtualization?: SliderVirtualizationOptions;
        };
        zoom: {
            clickZoomLevel: number;
            maxZoomLevel: number;
            panDuration: number;
            panFriction: number;
            plugins?: ZoomPanPlugin[];
            panBounds?: FullscreenZoomPanBoundsMode;
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
        mountStrategy: FullscreenMountStrategy;
        overlaysAboveIntroMedia: boolean;
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
    closeFullscreen: (options?: FullscreenCloseOptions) => Promise<void>;
    transitionDialogTo: (openNext: () => void, options?: FullscreenDialogTransitionOptions) => Promise<void>;
    restoreDialog: (options?: FullscreenDialogTransitionOptions) => void;
    showFullscreenModal: boolean;
    showFullscreenSlider: boolean;
    fsFadeOpening: boolean;
    closingModal: boolean;
};
type UseFullscreenControllerReturn = ReturnType<typeof useFullscreenController>;

export { FullscreenCloseOptions, FullscreenCloseScrollOptions, FullscreenDialogOptions, FullscreenDialogTransitionOptions, FullscreenIntroPathTiming, FullscreenLazyLoadOptions, FullscreenMountStrategy, FullscreenOptions, FullscreenPlugin, FullscreenVideoOptions, FullscreenZoomPanBoundsMode, type UseFullscreenControllerReturn, useFullscreenController };
