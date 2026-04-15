import * as react_jsx_runtime from 'react/jsx-runtime';
import { F as FullscreenOptions, g as FullscreenClose, h as FullscreenArrows, i as FullscreenCounter, d as ResponsiveLength, e as ResponsiveCaptionPlacement, j as FsCaptionRenderArgs, k as FSImageRender, l as FullscreenVideoOptions, m as FullscreenLazyLoadOptions, f as FullscreenOpenRequest } from './responsive-D_xhZmVI.mjs';
export { a as FsCaptionPlacement, b as FsIntroRequest, G as GalleryApi, I as IndexMode } from './responsive-D_xhZmVI.mjs';
import React__default from 'react';
import { M as MediaItem } from './plyrTypes-Cq4C3ul5.mjs';
import { a as FullscreenThumbnailBridge } from './types-ROPjU8Nl.mjs';
import './types-Dhh8xfHo.mjs';
import 'plyr';
import './types-CHUayqcj.mjs';
import './controls-SpWg1Kgt.mjs';

type FullscreenOpenMethod = "fade" | "scale";
type UseFullscreenArgs = {
    fullscreen?: FullscreenOptions;
};
declare function useFullscreenController(args: UseFullscreenArgs): {
    fs: {
        slider: {
            duration: number;
            friction: number;
            direction: "ltr" | "rtl";
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
            introStickyNavSelector?: string;
            controlsFade: boolean;
            dragFade: boolean;
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
            width?: ResponsiveLength;
            height?: ResponsiveLength;
            placement?: ResponsiveCaptionPlacement;
            breakpoint?: number;
            render?: (args: FsCaptionRenderArgs) => React__default.ReactNode;
            layout?: "overlay" | "slide";
            overlayCrossfadeTarget: "content" | "overlay";
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
        readonly controlsFade: false;
        readonly dragFade: false;
        readonly slideFadeDuration: 120;
        readonly slideFadeEasing: "cubic-bezier(.4,0,.22,1)";
    };
    readonly slider: {
        readonly duration: 25;
        readonly friction: 0.68;
        readonly direction: "ltr";
    };
    readonly zoom: {
        readonly clickZoomLevel: number;
        readonly maxZoomLevel: number;
        readonly panDuration: number;
        readonly panFriction: number;
    };
    readonly caption: {
        readonly overlayCrossfadeTarget: "content";
        readonly zoomFade: true;
        readonly zoomFadeDurationMs: 300;
        readonly zoomFadeEasing: "cubic-bezier(.4,0,.22,1)";
        readonly zoomInTransform: "";
        readonly zoomOutTransform: "";
    };
};

export { DEFAULT_FULLSCREEN, FullscreenOptions, useFullscreenController };
