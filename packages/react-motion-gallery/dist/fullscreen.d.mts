import * as react_jsx_runtime from 'react/jsx-runtime';
import { k as FullscreenOptions, l as FullscreenPlugin, h as FullscreenIntroPathTiming, D as FullscreenClose, G as FullscreenArrows, H as FullscreenCounter, s as ResponsiveLength, R as ResponsiveCaptionPlacement, J as FsCaptionRenderArgs, K as FSImageRender, o as FullscreenVideoOptions, i as FullscreenLazyLoadOptions, c as FullscreenCloseScrollOptions } from './responsive-MOdk42GH.mjs';
export { q as FsCaptionPlacement, r as FsIntroRequest, F as FullscreenCaptionOptions, a as FullscreenCloseScrollContext, b as FullscreenCloseScrollEnabled, d as FullscreenCloseScrollTiming, e as FullscreenControlsOptions, f as FullscreenCrossfadeOptions, g as FullscreenEffectsOptions, j as FullscreenMobileDetectionContext, m as FullscreenPluginKind, n as FullscreenSliderOptions, p as FullscreenZoomPanOptions } from './responsive-MOdk42GH.mjs';
import React__default from 'react';
import { MediaItem } from './media.mjs';
import { g as SliderSkipSnaps, d as CrossFadeWheel, H as FullscreenOpenRequest } from './types-BiXSaEk7.mjs';
export { G as GalleryApi, a as GalleryCoreApi, I as IndexMode } from './types-BiXSaEk7.mjs';
import { a as FullscreenThumbnailBridge } from './types-DNd5jSkS.mjs';
import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';
import './types-DXFoG8LC.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-DU3ftmIq.mjs';
import './plyrTypes-DhzgHNfX.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import './text-BBcRGVzn.mjs';
import './skeleton-cache.mjs';
import 'plyr-react';
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
