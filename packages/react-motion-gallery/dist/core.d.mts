import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { MediaItem } from './media.mjs';
import { a as GalleryCoreApi, m as SliderNodeInput, n as SliderRemoveTarget, j as SliderHandle, H as FullscreenOpenRequest } from './types-BiXSaEk7.mjs';
export { G as GalleryApi, b as GalleryLayoutApi } from './types-BiXSaEk7.mjs';
import { M as MediaEntryLink } from './responsive-MOdk42GH.mjs';
import './force-C5m1QpdF.mjs';
import './types-DXFoG8LC.mjs';
import './transitions-DU3ftmIq.mjs';
import './plyrTypes-DhzgHNfX.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import './text-BBcRGVzn.mjs';
import './skeleton-cache.mjs';
import 'plyr-react';
import './types-DNd5jSkS.mjs';
import 'react-dom/client';

type LayoutlessTarget = {
    host: HTMLElement | null;
    image: HTMLImageElement | null;
    media: HTMLElement | null;
};
type CoreLayout = "slider" | "grid" | "masonry" | "entries";
type Cell = {
    id: string;
    node: React.ReactNode;
};
type FullscreenSource = FullscreenOpenRequest["source"];
type BaseVisibleIndexEvent = {
    index: number;
    reason?: "io";
};
type FsVisibleIndexEvent = {
    index: number;
    reason?: "active";
};
type FullscreenEntryContext = {
    entryMapRef?: React.RefObject<MediaEntryLink[] | null>;
    entryMediaLayout?: "slider" | "grid" | "masonry";
    entriesObject?: any;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
    expandableImageRefs?: React.RefObject<Array<HTMLImageElement | null>>;
};
type FullscreenSourceAdapter = {
    getOwnerSliderHandle?: (index: number) => SliderHandle | null;
    syncBeforeOpen?: (index: number) => void;
    closestSelector?: string;
    getEntryContext?: () => FullscreenEntryContext;
};
type GalleryCoreProps = {
    children?: React.ReactNode;
    layout?: CoreLayout;
    breakpoints?: BreakpointMap;
    fullscreenItems?: MediaItem[] | string[];
    nodes?: React.ReactNode | React.ReactNode[];
};
declare function GalleryCoreProvider(props: GalleryCoreProps): react_jsx_runtime.JSX.Element;
type GalleryCore = GalleryCoreApi & {
    layout: CoreLayout | null;
    layoutlessRootRef: React.RefObject<HTMLDivElement | null>;
    effectiveBreakpoints: BreakpointMap;
    cellsState: Cell[];
    cellsRef: React.RefObject<Cell[]>;
    append(nodes: SliderNodeInput): number;
    prepend(nodes: SliderNodeInput): number;
    insert(index: number, nodes: SliderNodeInput): number;
    remove(indexOrPredicate: SliderRemoveTarget): number;
    replace(index: number, node: React.ReactNode): void;
    setItems(nodes: React.ReactNode[]): number;
    normalizedItems: MediaItem[];
    setNormalizedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
    sliderApiRef: React.RefObject<SliderHandle | null>;
    requestFullscreenOpen: (req: FullscreenOpenRequest) => void;
    fsOpenSub: {
        emit(v: FullscreenOpenRequest): void;
        subscribe(fn: (v: FullscreenOpenRequest) => void): () => void;
    };
    registerFullscreenAdapter: (source: FullscreenSource, a: FullscreenSourceAdapter) => void;
    getFullscreenAdapter: (source: FullscreenSource) => FullscreenSourceAdapter | null;
    expandableImageRefs: React.RefObject<Array<HTMLImageElement | null>>;
    registerExpandableImage: (index: number, node: HTMLElement | null) => void;
    baseVisibleSub: {
        emit(v: BaseVisibleIndexEvent): void;
        subscribe(fn: (v: BaseVisibleIndexEvent) => void): () => void;
    };
    notifyBaseVisibleIndex: (index: number) => void;
    fsVisibleSub: {
        emit(v: FsVisibleIndexEvent): void;
        subscribe(fn: (v: FsVisibleIndexEvent) => void): () => void;
    };
    notifyFsVisibleIndex: (index: number) => void;
    resolveLayoutlessTarget: (index: number) => LayoutlessTarget;
};
declare const GalleryCore: typeof GalleryCoreProvider;
declare function useGalleryCore(): GalleryCore;

export { type BaseVisibleIndexEvent, type CoreLayout, type FsVisibleIndexEvent, type FullscreenSource, GalleryCore, GalleryCoreApi, type GalleryCoreProps, GalleryCoreProvider, useGalleryCore };
