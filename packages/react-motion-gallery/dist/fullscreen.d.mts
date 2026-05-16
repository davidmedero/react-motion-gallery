import * as react_jsx_runtime from 'react/jsx-runtime';
import { i as FullscreenOptions, j as FullscreenPlugin, B as FullscreenClose, C as FullscreenArrows, D as FullscreenCounter, q as ResponsiveLength, R as ResponsiveCaptionPlacement, G as FsCaptionRenderArgs, H as FSImageRender, m as FullscreenVideoOptions, g as FullscreenLazyLoadOptions, c as FullscreenCloseScrollOptions } from './responsive-BnHorKhC.mjs';
export { o as FsCaptionPlacement, p as FsIntroRequest, F as FullscreenCaptionOptions, a as FullscreenCloseScrollContext, b as FullscreenCloseScrollEnabled, d as FullscreenCloseScrollTiming, e as FullscreenControlsOptions, f as FullscreenCrossfadeOptions, h as FullscreenMobileDetectionContext, k as FullscreenPluginKind, l as FullscreenSliderOptions, n as FullscreenZoomPanOptions } from './responsive-BnHorKhC.mjs';
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
            introDuration: number;
            introEasing: string;
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

export { FullscreenCloseScrollOptions, FullscreenLazyLoadOptions, FullscreenOptions, FullscreenPlugin, FullscreenVideoOptions, useFullscreenController };
