import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { c as BreakpointMap, f as FullscreenOpenRequest, O as OpenFullscreenAtArgs } from './responsive-D_xhZmVI.mjs';
import { M as MediaItem } from './plyrTypes-Cq4C3ul5.mjs';
import { a as SliderHandle } from './types-DY058l5M.mjs';
import { M as MediaEntryLink } from './types-_1D0QtfD.mjs';
import './types-Dhh8xfHo.mjs';
import 'plyr';
import './controls-SpWg1Kgt.mjs';
import './text-Cl2tR8oO.mjs';
import './sliderSub-Bo6Y8as_.mjs';

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
type GalleryCore = {
    layout: CoreLayout | null;
    layoutlessRootRef: React.RefObject<HTMLDivElement | null>;
    effectiveBreakpoints: BreakpointMap;
    cellsState: Cell[];
    cellsRef: React.RefObject<Cell[]>;
    normalizedItems: MediaItem[];
    setNormalizedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
    sliderApiRef: React.RefObject<SliderHandle | null>;
    append: (nodes: React.ReactNode | React.ReactNode[]) => number;
    prepend: (nodes: React.ReactNode | React.ReactNode[]) => number;
    insert: (index: number, nodes: React.ReactNode | React.ReactNode[]) => number;
    remove: (index: number) => number;
    replace: (index: number, node: React.ReactNode) => void;
    setItems: (nodes: React.ReactNode[]) => number;
    requestFullscreenOpen: (req: FullscreenOpenRequest) => void;
    fsOpenSub: {
        emit(v: FullscreenOpenRequest): void;
        subscribe(fn: (v: FullscreenOpenRequest) => void): () => void;
    };
    fsEnabled: boolean;
    setFsEnabled: (enabled: boolean) => void;
    isFullscreenOpen: boolean;
    isFullscreenOpenRef: React.RefObject<boolean>;
    setFullscreenOpen: (open: boolean) => void;
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
    openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
};
declare const GalleryCore: typeof GalleryCoreProvider;
declare function useGalleryCore(): GalleryCore;

export { type BaseVisibleIndexEvent, type CoreLayout, type FsVisibleIndexEvent, type FullscreenSource, GalleryCore, type GalleryCoreProps, GalleryCoreProvider, useGalleryCore };
