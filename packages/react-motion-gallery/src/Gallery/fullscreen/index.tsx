/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import type { APITypes } from "plyr-react";
import { DEFAULT_FULLSCREEN } from "./defaults";
import { createFullscreenSliderSub } from "./fullscreenSliderSub";
import { createGestureShield } from "./gestureShield";
import { handleZoomToggle } from "../zoomPan/zoom/handleZoomToggle";
import { useWindowSize } from "../shared/hooks/useWindowSize";
import type { MediaItem } from "../shared/types/media";
import type {
  FsCaptionPlacement,
  FsIntroRequest,
  FullscreenEffectsOptions,
  FullscreenOptions,
} from "./types";
import type { PanAxisType as AxisType } from "../shared/types/axis";
import type { ScrollBodyType } from "../shared/motion/scrollBody";
import type { AnimationsType } from "../shared/motion/animations";
import type { ScrollBoundsType } from "../shared/motion/scrollBounds";
import type { Vector1DType } from "../shared/motion/vector1d";
import type { FullscreenOpenRequest, IndexMode } from "../api/types";
import type {
  FullscreenThumbnailBridge,
  FullscreenThumbnailSlotLayout,
} from "../fullscreenThumbnails/types";
import type { SliderOptions } from "../slider/types";
import type { FullscreenSliderHandle } from "./FullscreenSlider";
import FullscreenRuntime from "./FullscreenRuntime";
import styles from './Fullscreen.module.css'
import { useGalleryCore } from "../core";

type FullscreenOpenMethod = "fade" | "scale";

function resolveOpenMethod(
  item: MediaItem | undefined,
  requested: FullscreenOpenMethod | undefined,
  originImg: HTMLImageElement | null
): FullscreenOpenMethod {
  const req: FullscreenOpenMethod = requested ?? "scale";

  if (!item || item.kind !== "image") return "fade";

  if (!originImg) return "fade";

  return req;
}

function useOpenEpoch(open: boolean) {
  const [epoch, setEpoch] = useState(0);
  const prev = useRef(open);
  useEffect(() => {
    if (open && !prev.current) setEpoch((e) => e + 1);
    prev.current = open;
  }, [open]);
  return epoch;
}

function sameStyleObject(
  a?: React.CSSProperties,
  b?: React.CSSProperties
) {
  if (a === b) return true;
  if (!a || !b) return !a && !b;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key as keyof React.CSSProperties] !== b[key as keyof React.CSSProperties]) {
      return false;
    }
  }

  return true;
}

function sameFullscreenThumbnailSlotLayout(
  a: FullscreenThumbnailSlotLayout | null,
  b: FullscreenThumbnailSlotLayout
) {
  if (!a) return false;

  return (
    a.position === b.position &&
    a.className === b.className &&
    a.fadeDurationMs === b.fadeDurationMs &&
    a.fadeEasing === b.fadeEasing &&
    sameStyleObject(a.style, b.style)
  );
}

export type UseFullscreenArgs = {
  fullscreen?: FullscreenOptions;
  slider?: SliderOptions;
  sliderObject: any;
  cellsStateLength: number;
};

export function useFullscreenController(args: UseFullscreenArgs) {
  const { fullscreen, sliderObject, cellsStateLength } = args;

  const core = useGalleryCore();

  const {
    layout,
    normalizedItems,
    fsOpenSub,
    setFullscreenOpen,
    sliderApiRef,
    getFullscreenAdapter
  } = core;

  const adapterFor = useCallback(
    (source: "slider" | "grid" | "masonry" | "entries" | "api") => getFullscreenAdapter(source),
    [getFullscreenAdapter]
  );

  const syncBeforeOpen = useCallback(
    (source: "slider" | "grid" | "masonry" | "entries" | "api", index: number) => {
      adapterFor(source)?.syncBeforeOpen?.(index);
    },
    [adapterFor]
  );

  const getClosestSelector = useCallback(
    (source: "slider" | "grid" | "masonry" | "entries" | "api") => {
      return adapterFor(source)?.closestSelector ?? (source === "slider" ? ".rmg__slide" : ".rmg__grid-item");
    },
    [adapterFor]
  );

  const entriesAdapter = adapterFor("entries");
  const entryCtx = entriesAdapter?.getEntryContext?.() ?? {};

  const fallbackEntryMapRef = useRef<any>(null);

  const safeEntriesObject = useMemo(() => {
    return entryCtx.entriesObject ?? { render: {}, mediaLayout: "slider" };
  }, [entryCtx.entriesObject]);

  const safeEntryMapRef = entryCtx.entryMapRef ?? fallbackEntryMapRef;

  const safeEntryMediaLayout =
    entryCtx.entryMediaLayout ??
    safeEntriesObject.mediaLayout ??
    "slider";

  const canMountEntryOverlay =
    layout === "entries" &&
    !!entryCtx.entriesObject &&
    !!entryCtx.entryMapRef;

  const getOwnerSliderHandle = useCallback(
    (index: number) => {
      if (layout === "entries" && safeEntryMediaLayout === "slider") {
        const map = safeEntryMapRef.current;
        const link = map?.[index] ?? null;

        const entrySliderRefs = entryCtx.entrySliderRefs?.current ?? null;
        const entryHandle =
          link && entrySliderRefs ? entrySliderRefs[link.entryIndex] : null;

        return entryHandle ?? null;
      }

      return sliderApiRef.current ?? null;
    },
    [layout, safeEntryMediaLayout, safeEntryMapRef, entryCtx.entrySliderRefs, sliderApiRef]
  );

  const fsSub = useMemo(() => createFullscreenSliderSub(0), []);
  const [slideIndex, setSlideIndex] = useState(0);
  const isClick = useRef(false);
  const isZoomClick = useRef(false);
  const imageRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  const [showFullscreenSlider, setShowFullscreenSlider] = useState(false);
  const fullscreenSliderApi = useRef<FullscreenSliderHandle>(null);
  const isZooming = useRef(false);
  const expandableImageRefs = core.expandableImageRefs;
  const overlayDivRef = useRef<HTMLDivElement | null>(null);
  const duplicateImgRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLElement | null>(null);
  const counterRef = useRef<HTMLElement | null>(null);
  const leftChevronRef = useRef<HTMLElement | null>(null);
  const rightChevronRef = useRef<HTMLElement | null>(null);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [wrappedItems, setWrappedItems] = useState<MediaItem[]>([]);
  const windowSize = useWindowSize();
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const previousZoom = useRef({ x: 0, y: 0 });
  const sliderForFullscreen = useRef<HTMLDivElement | null>(null);
  const slidesForFullscreen = useRef<
    { cells: { element: HTMLElement; index: number }[]; target: number }[]
  >([]);
  const visibleImagesForFullscreen = useRef<number>(1);
  const selectedIndexForFullscreen = useRef<number>(0);
  const sliderXForFullscreen = useRef<number>(0);
  const sliderVelocityForFullscreen = useRef<number>(0);
  const isWrappingForFullscreen = useRef<boolean>(false);
  const fsIndexRef = useRef<number>(fsSub.get());
  const [fsFadeOpening, setFsFadeOpening] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const changingSlides = useRef(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const isZoomedRef = useRef(false);
  const currentImage = useRef<HTMLDivElement | null>(null);
  const axisRef = useRef<AxisType | null>(null);
  const pointerDownRef = useRef(false);
  const interactionModeRef = useRef<"idle" | "drag" | "wheel" | "programmatic">("idle");
  const locX = useRef<Vector1DType | null>(null);
  const locY = useRef<Vector1DType | null>(null);
  const prevX = useRef<Vector1DType | null>(null);
  const prevY = useRef<Vector1DType | null>(null);
  const offX = useRef<Vector1DType | null>(null);
  const offY = useRef<Vector1DType | null>(null);
  const tgtX = useRef<Vector1DType | null>(null);
  const tgtY = useRef<Vector1DType | null>(null);
  const overlayCaptionRef = useRef<HTMLDivElement | null>(null);
  const overlayCaptionRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const fsThumbContainerRef = useRef<HTMLDivElement | null>(null);
  const [fullscreenThumbnailSlot, setFullscreenThumbnailSlot] =
    useState<FullscreenThumbnailSlotLayout | null>(null);
  const [fullscreenThumbnailMountEl, setFullscreenThumbnailMountElState] =
    useState<HTMLDivElement | null>(null);
  const epoch = useOpenEpoch(showFullscreenModal);
  const suppressLoopRef = useRef(false);
  const shieldCleanupRef = useRef<null | (() => void)>(null);
  const shieldRef = useRef<ReturnType<typeof createGestureShield> | null>(null);
  const bodyX = useRef<ScrollBodyType | null>(null);
  const bodyY = useRef<ScrollBodyType | null>(null);
  const boundsX = useRef<ScrollBoundsType | null>(null);
  const boundsY = useRef<ScrollBoundsType | null>(null);
  const isAnimatingRef = useRef(false);
  const animRef = useRef<AnimationsType | null>(null);
  const wrappedModePlyrRefs = useRef<(APITypes | null)[]>([]);
  const singleModePlyrRefs = useRef<(APITypes | null)[]>([]);
  const suppressNextClickRef = useRef(false);
  const cells = useRef<{ element: HTMLElement; index: number }[]>([]);
  const [fsIntroReq, setFsIntroReq] = useState<FsIntroRequest>(null);
  const requestFsCloseRef = useRef<null | (() => void)>(null);

  const fs = useMemo(() => {
    const fullscreenRest = {
      ...(fullscreen ?? {}),
    } as FullscreenOptions & { thumbnails?: unknown };
    delete fullscreenRest.thumbnails;

    const fullscreenEffects = {
      ...(fullscreen?.effects ?? {}),
    } as FullscreenEffectsOptions & {
      thumbnailsFadeDuration?: number;
      thumbnailsFadeEasing?: string;
    };
    delete fullscreenEffects.thumbnailsFadeDuration;
    delete fullscreenEffects.thumbnailsFadeEasing;

    return {
      ...DEFAULT_FULLSCREEN,
      ...fullscreenRest,
      slider: { ...DEFAULT_FULLSCREEN.slider, ...(fullscreen?.slider ?? {}) },
      zoom: { ...DEFAULT_FULLSCREEN.zoom, ...(fullscreen?.zoom ?? {}) },
      effects: { ...DEFAULT_FULLSCREEN.effects, ...fullscreenEffects },
      controls: { ...(fullscreen?.controls ?? {}) },
      caption: { ...DEFAULT_FULLSCREEN.caption, ...(fullscreen?.caption ?? {}) },
    };
  }, [fullscreen]);

  const setScale = useCallback((newScale: number) => {
    scaleRef.current = newScale;
    const prev = isZoomedRef.current;
    const next = newScale > 1.01;
    if (next !== prev) {
      isZoomedRef.current = next;
      setIsZoomed(next);
    }
  }, []);

  function resolveFsCaptionPlacement(
    placement: FsCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ): FsCaptionPlacement | null {
    if (!placement) return null;
    if (breakpoint != null && viewportWidth < breakpoint) return "bottom";
    return placement;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(10000);
  }, []);

  const addShield = useCallback((timeoutMs?: number) => {
    shieldCleanupRef.current?.();
    const teardown = shieldRef.current?.add(timeoutMs);
    shieldCleanupRef.current = teardown ?? null;
  }, []);

  const setFullscreenThumbnailMountEl = useCallback(
    (node: HTMLDivElement | null) => {
      fsThumbContainerRef.current = node;
      setFullscreenThumbnailMountElState(node);
    },
    []
  );

  const registerFullscreenThumbnailLayout = useCallback(
    (nextLayout: FullscreenThumbnailSlotLayout) => {
      setFullscreenThumbnailSlot((current) => {
        if (sameFullscreenThumbnailSlotLayout(current, nextLayout)) {
          return current;
        }

        return nextLayout;
      });
    },
    []
  );

  const clearFullscreenThumbnailLayout = useCallback(() => {
    setFullscreenThumbnailSlot(null);
  }, []);

  const fullscreenDirection: "ltr" | "rtl" =
    sliderObject.direction?.dir === "rtl" ? "rtl" : "ltr";

  const fullscreenThumbnailBridge = useMemo<FullscreenThumbnailBridge>(
    () => ({
      mountEl: fullscreenThumbnailMountEl,
      fsSub,
      visible: showFullscreenModal,
      invisible: closingModal,
      direction: fullscreenDirection,
      registerLayout: registerFullscreenThumbnailLayout,
      clearLayout: clearFullscreenThumbnailLayout,
    }),
    [
      fullscreenThumbnailMountEl,
      fsSub,
      showFullscreenModal,
      closingModal,
      fullscreenDirection,
      registerFullscreenThumbnailLayout,
      clearFullscreenThumbnailLayout,
    ]
  );

  const syncFullscreenSourceFromIndex = useCallback(
    (nextIndex: number) => {
      fsIndexRef.current = nextIndex;

      if (layout === "entries" && safeEntryMediaLayout === "slider") {
        const map = safeEntryMapRef.current;
        const link = map?.[nextIndex] ?? null;

        const entrySliderRefs = entryCtx.entrySliderRefs?.current ?? null;

        const entryHandle =
          link && entrySliderRefs ? entrySliderRefs[link.entryIndex] : null;

        const internals = entryHandle?.getInternals?.();
        if (internals) {
          sliderForFullscreen.current = internals.slider.current;
          slidesForFullscreen.current = internals.slides.current;
          visibleImagesForFullscreen.current = internals.visibleImages.current;
          selectedIndexForFullscreen.current = internals.selectedIndex.current;
          sliderXForFullscreen.current = internals.sliderX.current;
          sliderVelocityForFullscreen.current = internals.sliderVelocity.current;
          isWrappingForFullscreen.current = internals.isWrapping.current;
          return;
        }
      }

      const internals = sliderApiRef.current?.getInternals?.();
      if (!internals) return;

      sliderForFullscreen.current = internals.slider.current;
      slidesForFullscreen.current = internals.slides.current;
      visibleImagesForFullscreen.current = internals.visibleImages.current;
      selectedIndexForFullscreen.current = internals.selectedIndex.current;
      sliderXForFullscreen.current = internals.sliderX.current;
      sliderVelocityForFullscreen.current = internals.sliderVelocity.current;
      isWrappingForFullscreen.current = internals.isWrapping.current;
    },
    [
      layout,
      safeEntryMediaLayout,
      safeEntryMapRef,
      entryCtx.entrySliderRefs,
      sliderApiRef,
    ]
  );

  const openFullscreenAt = useCallback(
    (
      source: FullscreenOpenRequest["source"],
      gridIndex: number,
      originEl?: HTMLElement | null,
      requestedMethod?: FullscreenOpenMethod
    ) => {
      if (!fs.enabled) return;

      syncBeforeOpen(source, gridIndex);

      const cellCount = normalizedItems.length;
      if (!cellCount) return;

      let fullscreenIndex = gridIndex;

      if (layout === "grid" || layout === "masonry") fullscreenIndex = gridIndex;

      const item = normalizedItems[fullscreenIndex];

      let originImg: HTMLImageElement | null = null;

      if (originEl) {
        if (originEl instanceof HTMLImageElement) {
          originImg = originEl;
        } else {
          originImg = originEl.querySelector("img") as HTMLImageElement | null;
        }
      }

      if (!originImg) {
        originImg = (expandableImageRefs.current[gridIndex] ?? null) as HTMLImageElement | null;
      }

      const method = resolveOpenMethod(item, requestedMethod, originImg);

      const introImg = method === "scale" ? originImg : null;

      const sel = getClosestSelector(source);

      isClick.current = true;

      setFullscreenOpen(true);
      fsSub.setLocalIndex(fullscreenIndex);
      setShowFullscreenModal(true);

      setFsIntroReq({
        originalImage: introImg,
        index: fullscreenIndex,
        method,
        closestSelector: sel,
      });

      setSlideIndex(fullscreenIndex);
    },
    [
      fs.enabled,
      normalizedItems,
      syncBeforeOpen,
      layout,
      setFullscreenOpen,
      fsSub,
      expandableImageRefs,
      getClosestSelector,
    ]
  );

  const centerSliderForFullscreen = () => {
    const handle = getOwnerSliderHandle(fsIndexRef.current);
    handle?.centerSlider?.();
  };

  const setSliderIndexForFullscreen = (index: number, mode: IndexMode) => {
    const handle = getOwnerSliderHandle(fsIndexRef.current);
    handle?.setIndex?.(index, mode);
  };

  useEffect(() => {
    if (!fs.enabled) return;

    const unsub = fsOpenSub.subscribe((req) => {
      syncFullscreenSourceFromIndex(req.index);

      const requested = req.requestedMethod;
      const resolved = req.method;

      if (resolved) {
        openFullscreenAt(req.source, req.index, req.image ?? null, resolved);
      } else {
        openFullscreenAt(req.source, req.index, req.image ?? null, requested);
      }

      setFullscreenOpen(true);
    });

    return () => (unsub as any)?.();
  }, [fs.enabled, fsOpenSub, openFullscreenAt, setFullscreenOpen, syncFullscreenSourceFromIndex]);

  useEffect(() => {
    if (showFullscreenModal) return;
    setFullscreenOpen(false);
  }, [showFullscreenModal, setFullscreenOpen]);

  const fullscreenNode =
    fs.enabled ? (
      <FullscreenRuntime
        fsEnabled={fs.enabled}
        fsSub={fsSub}
        showFullscreenModal={showFullscreenModal}
        setShowFullscreenModal={setShowFullscreenModal}
        setShowFullscreenSlider={setShowFullscreenSlider}
        showFullscreenSlider={showFullscreenSlider}
        epoch={epoch}
        isClick={isClick}
        isAnimatingRef={isAnimatingRef}
        overlayDivRef={overlayDivRef}
        duplicateImgRef={duplicateImgRef}
        cells={cells}
        cellsStateLength={cellsStateLength}
        slidesForFullscreen={slidesForFullscreen}
        sliderForFullscreen={sliderForFullscreen}
        visibleImagesForFullscreen={visibleImagesForFullscreen}
        selectedIndexForFullscreen={selectedIndexForFullscreen}
        sliderXForFullscreen={sliderXForFullscreen}
        sliderVelocityForFullscreen={sliderVelocityForFullscreen}
        isWrappingForFullscreen={isWrappingForFullscreen}
        wrappedItems={wrappedItems}
        setClosingModal={setClosingModal}
        closingModal={closingModal}
        closeButtonRef={closeButtonRef}
        counterRef={counterRef}
        leftChevronRef={leftChevronRef}
        rightChevronRef={rightChevronRef}
        centerAlign={sliderObject.align === "center"}
        centerSliderForFullscreen={centerSliderForFullscreen}
        setSliderIndexForFullscreen={setSliderIndexForFullscreen}
        layout={layout}
        expandableImageRefs={expandableImageRefs}
        entryMapRef={safeEntryMapRef}
        entryMediaLayout={safeEntryMediaLayout}
        introFade={fs.effects.introFade}
        introDuration={fs.effects.introDuration}
        introEasing={fs.effects.introEasing}
        fullscreenSliderApi={fullscreenSliderApi}
        slideIndex={slideIndex}
        isZoomClick={isZoomClick}
        isZoomed={isZoomed}
        windowSize={windowSize}
        handleZoomToggle={handleZoomToggle}
        imageRefs={imageRefs}
        scale={scaleRef.current}
        isZooming={isZooming}
        wrappedModePlyrRefs={wrappedModePlyrRefs}
        singleModePlyrRefs={singleModePlyrRefs}
        direction={fullscreenDirection}
        sliderDuration={fs.slider.duration}
        sliderFriction={fs.slider.friction}
        suppressLoopRef={suppressLoopRef}
        fsFadeOpening={fsFadeOpening}
        slideFade={fs.effects.slideFade}
        slideFadeDuration={fs.effects.slideFadeDuration}
        slideFadeEasing={fs.effects.slideFadeEasing}
        normalizedItems={normalizedItems}
        fsThumbContainerRef={fsThumbContainerRef}
        fullscreenThumbnailSlot={fullscreenThumbnailSlot}
        setFullscreenThumbnailMountEl={setFullscreenThumbnailMountEl}
        showFsEntryOverlayMount={showFullscreenModal && canMountEntryOverlay}
        fsIntroReq={fsIntroReq}
        clearFsIntroReq={() => setFsIntroReq(null)}
        styles={styles}
        fs={fs}
        overlayCaptionRef={overlayCaptionRef}
        overlayCaptionRootRef={overlayCaptionRootRef}
        setFsFadeOpening={setFsFadeOpening}
        addShield={addShield}
        resolveFsCaptionPlacement={resolveFsCaptionPlacement}
        requestFsCloseRef={requestFsCloseRef}
        suppressNextClickRef={suppressNextClickRef}
        currentImage={currentImage}
        scaleRef={scaleRef}
        pointerDownRef={pointerDownRef}
        interactionModeRef={interactionModeRef}
        boundsX={boundsX}
        boundsY={boundsY}
        bodyX={bodyX}
        bodyY={bodyY}
        locX={locX}
        locY={locY}
        prevX={prevX}
        prevY={prevY}
        offX={offX}
        offY={offY}
        tgtX={tgtX}
        tgtY={tgtY}
        axisRef={axisRef}
        animRef={animRef}
        setScale={setScale}
        previousZoom={previousZoom}
        panRef={panRef}
        changingSlides={changingSlides}
        setWrappedItems={setWrappedItems}
        fsIndexRef={fsIndexRef}
        entriesObject={safeEntriesObject}
        syncFullscreenSourceFromIndex={syncFullscreenSourceFromIndex}
        setFullscreenOpen={setFullscreenOpen}
      />
    ) : null;

  return {
    fs,
    fullscreenNode,
    fullscreenThumbnailBridge,
    openFullscreenAt,
    isClick,
    expandableImageRefs,
    overlayDivRef,
    duplicateImgRef,
    closeButtonRef,
    counterRef,
    leftChevronRef,
    rightChevronRef,
    sliderForFullscreen,
    slidesForFullscreen,
    visibleImagesForFullscreen,
    selectedIndexForFullscreen,
    sliderXForFullscreen,
    sliderVelocityForFullscreen,
    isWrappingForFullscreen,
    fsThumbContainerRef,
    cells,
    setSlideIndex,
    setShowFullscreenModal,
    setShowFullscreenSlider,
    setFsFadeOpening,
    showFullscreenModal,
    showFullscreenSlider,
    fsFadeOpening,
    closingModal,
  };
}
