/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Root } from "react-dom/client";
import type { APITypes } from "../video/plyrTypes";
import { DEFAULT_FULLSCREEN } from "./defaults";
import { createFullscreenSliderSub } from "./fullscreenSliderSub";
import { createGestureShield } from "./gestureShield";
import { useWindowSize } from "../shared/hooks/useWindowSize";
import type {
  FsCaptionPlacement,
  FsIntroRequest,
  FullscreenCloseOptions,
  FullscreenDialogTransitionOptions,
  FullscreenEffectsOptions,
  FullscreenOptions,
  FullscreenPlugin,
  FullscreenPluginOptions,
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
import type { FullscreenSliderHandle } from "./FullscreenSlider";
import type { MediaItem } from "../shared/types/media";
import styles from './Fullscreen.module.css'
import { useOptionalGalleryCore } from "../core";
import { resolveFullscreenControllerOpenMethod } from "./openMethod";
import { BREAKPOINT_MAP, BreakpointMap, resolveCaptionPlacementFromResponsive, ResponsiveCaptionPlacement } from "../shared/responsive";
import { resolveFullscreenSliderGap } from "./transforms";
import { mergeFullscreenIntroPathTiming } from "./introTiming";
import {
  beginFullscreenDialogSwitch,
  cancelFullscreenDialogSwitch,
  finishFullscreenDialogSwitch,
  getActiveFullscreenDialogSwitch,
  waitForFullscreenDialogSwitchClaim,
  type FullscreenDialogSwitch,
} from "./dialogSwitch";
import { resolveFullscreenDialogSwitchTransitionOptions } from "./dialogTransitionTiming";
type FullscreenOpenMethod = "fade" | "scale";

type PendingFullscreenReopen = {
  source: FullscreenOpenRequest["source"];
  index: number;
  originEl: HTMLElement | null;
  requestedMethod?: FullscreenOpenMethod;
};

type DialogTransitionState = {
  hidden: boolean;
  durationMs?: number;
  easing?: string;
};

const DEFAULT_DIALOG_TRANSITION_STATE: DialogTransitionState = {
  hidden: false,
};

function waitForMs(durationMs: number) {
  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  if (duration <= 0 || typeof window === "undefined") return Promise.resolve();

  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function resolveImageFromSlot(slot: unknown): HTMLImageElement | null {
  if (!slot) return null;
  if (slot instanceof HTMLImageElement) return slot;
  if (slot instanceof HTMLElement) {
    return slot.querySelector("img") as HTMLImageElement | null;
  }
  return null;
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
  plugins?: FullscreenPlugin[];
};

const EMPTY_FULLSCREEN_PLUGINS: FullscreenPlugin[] = [];

function mergeFullscreenOptionLayer(
  base: FullscreenOptions,
  layer?: FullscreenPluginOptions
): FullscreenOptions {
  if (!layer) return base;

  const merged: FullscreenOptions = {
    ...base,
    ...layer,
  };

  if (base.slider || layer.slider) {
    merged.slider = { ...(base.slider ?? {}), ...(layer.slider ?? {}) };
  }

  if (base.zoom || layer.zoom) {
    merged.zoom = { ...(base.zoom ?? {}), ...(layer.zoom ?? {}) };
  }

  if (base.controls || layer.controls) {
    merged.controls = { ...(base.controls ?? {}), ...(layer.controls ?? {}) };
  }

  if (base.dialog || layer.dialog) {
    merged.dialog = {
      ...(base.dialog ?? {}),
      ...(layer.dialog ?? {}),
      header:
        base.dialog?.header || layer.dialog?.header
          ? { ...(base.dialog?.header ?? {}), ...(layer.dialog?.header ?? {}) }
          : undefined,
      media:
        base.dialog?.media || layer.dialog?.media
          ? { ...(base.dialog?.media ?? {}), ...(layer.dialog?.media ?? {}) }
          : undefined,
      caption:
        base.dialog?.caption || layer.dialog?.caption
          ? { ...(base.dialog?.caption ?? {}), ...(layer.dialog?.caption ?? {}) }
          : undefined,
    };
  }

  if (base.caption || layer.caption) {
    merged.caption = { ...(base.caption ?? {}), ...(layer.caption ?? {}) };
  }

  if (base.video || layer.video) {
    merged.video = { ...(base.video ?? {}), ...(layer.video ?? {}) };
  }

  if (base.lazyLoad || layer.lazyLoad) {
    merged.lazyLoad = {
      ...(base.lazyLoad ?? {}),
      ...(layer.lazyLoad ?? {}),
      images:
        base.lazyLoad?.images || layer.lazyLoad?.images
          ? { ...(base.lazyLoad?.images ?? {}), ...(layer.lazyLoad?.images ?? {}) }
          : undefined,
      videos:
        base.lazyLoad?.videos || layer.lazyLoad?.videos
          ? { ...(base.lazyLoad?.videos ?? {}), ...(layer.lazyLoad?.videos ?? {}) }
          : undefined,
    };
  }

  if (
    base.closeScroll &&
    layer.closeScroll &&
    typeof base.closeScroll === "object" &&
    typeof layer.closeScroll === "object"
  ) {
    merged.closeScroll = {
      ...base.closeScroll,
      ...layer.closeScroll,
    };
  }

  if (base.effects || layer.effects) {
    merged.effects = {
      ...(base.effects ?? {}),
      ...(layer.effects ?? {}),
      introDuration: mergeFullscreenIntroPathTiming(
        base.effects?.introDuration,
        layer.effects?.introDuration
      ),
      introEasing: mergeFullscreenIntroPathTiming(
        base.effects?.introEasing,
        layer.effects?.introEasing
      ),
      crossfade:
        base.effects?.crossfade || layer.effects?.crossfade
          ? { ...(base.effects?.crossfade ?? {}), ...(layer.effects?.crossfade ?? {}) }
          : undefined,
    };
  }

  return merged;
}

function mergeFullscreenPluginOptions(
  fullscreen: FullscreenOptions | undefined,
  plugins: FullscreenPlugin[]
) {
  return plugins.reduce<FullscreenOptions>(
    (merged, plugin) => mergeFullscreenOptionLayer(merged, plugin.options),
    fullscreen ?? {}
  );
}

export function useFullscreenController(args: UseFullscreenArgs) {
  const { fullscreen, plugins = EMPTY_FULLSCREEN_PLUGINS } = args;

  const core = useOptionalGalleryCore();
  if (!core) throw new Error("useFullscreenController() must be used inside <GalleryCore />");

  const {
    layout,
    resolveLayoutlessTarget,
    normalizedItems,
    fsOpenSub,
    setFullscreenOpen,
    sliderApiRef,
    getFullscreenAdapter,
    effectiveBreakpoints
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
      return (
        adapterFor(source)?.closestSelector ??
        (source === "slider"
          ? ".rmg__slide"
          : source === "masonry"
            ? ".rmg__masonry-item"
            : source === "api"
              ? '[data-rmg-idx], [data-rmg-layoutless-item], article, figure, section, button, [role="button"], a[href], .rmg__grid-item, .rmg__masonry-item, .rmg__slide'
              : ".rmg__grid-item")
      );
    },
    [adapterFor]
  );

  const entriesAdapter = adapterFor("entries");
  const entryCtx = entriesAdapter?.getEntryContext?.() ?? {};

  const fallbackEntryMapRef = useRef<any>(null);
  const fallbackEntryRootRef = useRef<HTMLDivElement | null>(null);

  const safeEntriesObject = useMemo(() => {
    return entryCtx.entriesObject ?? { render: {}, mediaLayout: "slider" };
  }, [entryCtx.entriesObject]);

  const safeEntryMapRef = entryCtx.entryMapRef ?? fallbackEntryMapRef;
  const safeEntryRootRef = entryCtx.entryListRef ?? fallbackEntryRootRef;

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
  const overlayCaptionRootRef = useRef<Root | null>(null);
  const fsThumbContainerRef = useRef<HTMLDivElement | null>(null);
  const [fullscreenThumbnailSlot, setFullscreenThumbnailSlot] =
    useState<FullscreenThumbnailSlotLayout | null>(null);
  const [fullscreenThumbnailMountEl, setFullscreenThumbnailMountElState] =
    useState<HTMLDivElement | null>(null);
  const suppressLoopRef = useRef(false);
  const shieldCleanupRef = useRef<null | (() => void)>(null);
  const shieldRef = useRef<ReturnType<typeof createGestureShield> | null>(null);
  const bodyX = useRef<ScrollBodyType | null>(null);
  const bodyY = useRef<ScrollBodyType | null>(null);
  const boundsX = useRef<ScrollBoundsType | null>(null);
  const boundsY = useRef<ScrollBoundsType | null>(null);
  const isAnimatingRef = useRef(false);
  const animRef = useRef<AnimationsType | null>(null);
  const [wrappedItems, setWrappedItems] = useState<MediaItem[]>([]);
  const singleModePlyrRefs = useRef<(APITypes | null)[]>([]);
  const wrappedModePlyrRefs = useRef<(APITypes | null)[]>([]);
  const suppressNextClickRef = useRef(false);
  const cells = useRef<{ element: HTMLElement; index: number }[]>([]);
  const [fsIntroReq, setFsIntroReq] = useState<FsIntroRequest>(null);
  const requestFsCloseRef = useRef<null | (() => void)>(null);
  const cancelFsCloseRef = useRef<null | (() => void)>(null);
  const pendingReopenRef = useRef<PendingFullscreenReopen | null>(null);
  const closeResolversRef = useRef<Array<() => void>>([]);
  const dialogSwitchThumbnailHoldTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dialogTransitionState, setDialogTransitionState] =
    useState<DialogTransitionState>(DEFAULT_DIALOG_TRANSITION_STATE);
  const [dialogTransitionSwitch, setDialogTransitionSwitch] =
    useState<FullscreenDialogSwitch | null>(null);
  const [dialogSwitchThumbnailsHidden, setDialogSwitchThumbnailsHidden] =
    useState(false);

  const runtimePlugin = useMemo(
    () => plugins.find((plugin) => plugin?.RuntimeHost),
    [plugins]
  );
  const RuntimeHost = runtimePlugin?.RuntimeHost;
  const hasFullscreenRuntime = !!RuntimeHost;
  const configuredFullscreen = useMemo(
    () => mergeFullscreenPluginOptions(fullscreen, plugins),
    [fullscreen, plugins]
  );

  const fs = useMemo(() => {
    const fullscreenRest = {
      ...(configuredFullscreen ?? {}),
    } as FullscreenOptions & { thumbnails?: unknown };
    delete fullscreenRest.thumbnails;

    const fullscreenEffects = {
      ...(configuredFullscreen?.effects ?? {}),
    } as FullscreenEffectsOptions & {
      thumbnailsFadeDuration?: number;
      thumbnailsFadeEasing?: string;
    };
    delete fullscreenEffects.thumbnailsFadeDuration;
    delete fullscreenEffects.thumbnailsFadeEasing;

    return {
      ...DEFAULT_FULLSCREEN,
      ...fullscreenRest,
      slider: { ...DEFAULT_FULLSCREEN.slider, ...(configuredFullscreen?.slider ?? {}) },
      zoom: { ...DEFAULT_FULLSCREEN.zoom, ...(configuredFullscreen?.zoom ?? {}) },
      effects: {
        ...DEFAULT_FULLSCREEN.effects,
        ...fullscreenEffects,
        crossfade: {
          ...DEFAULT_FULLSCREEN.effects.crossfade,
          ...(fullscreenEffects.crossfade ?? {}),
        },
      },
      controls: { ...(configuredFullscreen?.controls ?? {}) },
      caption: { ...DEFAULT_FULLSCREEN.caption, ...(configuredFullscreen?.caption ?? {}) },
    };
  }, [configuredFullscreen]);

  const resolveDialogTransitionOptions = useCallback(
    (options?: FullscreenDialogTransitionOptions) => {
      return resolveFullscreenDialogSwitchTransitionOptions({
        options,
        dialog: fs.dialog,
        effects: fs.effects,
      });
    },
    [
      fs.dialog,
      fs.effects,
    ]
  );

  const resolveCloseWaiters = useCallback(() => {
    const waiters = closeResolversRef.current.splice(0);
    waiters.forEach((resolve) => resolve());
  }, []);

  const clearDialogSwitchThumbnailHold = useCallback(() => {
    if (dialogSwitchThumbnailHoldTimerRef.current) {
      clearTimeout(dialogSwitchThumbnailHoldTimerRef.current);
      dialogSwitchThumbnailHoldTimerRef.current = null;
    }
  }, []);

  const holdDialogSwitchThumbnails = useCallback(
    (durationMs: number) => {
      clearDialogSwitchThumbnailHold();
      setDialogSwitchThumbnailsHidden(true);

      const duration = Number.isFinite(durationMs)
        ? Math.max(0, durationMs)
        : 0;

      dialogSwitchThumbnailHoldTimerRef.current = setTimeout(() => {
        dialogSwitchThumbnailHoldTimerRef.current = null;
        setDialogSwitchThumbnailsHidden(false);
      }, duration);
    },
    [clearDialogSwitchThumbnailHold]
  );

  const silentlyUnmountDialogSwitch = useCallback(
    (switchState: FullscreenDialogSwitch) => {
      clearDialogSwitchThumbnailHold();
      setDialogTransitionState(DEFAULT_DIALOG_TRANSITION_STATE);
      setDialogTransitionSwitch(null);
      setDialogSwitchThumbnailsHidden(false);
      setClosingModal(false);
      setShowFullscreenSlider(false);
      setFsFadeOpening(false);

      if (overlayCaptionRootRef.current) {
        overlayCaptionRootRef.current.unmount();
        overlayCaptionRootRef.current = null;
      }

      overlayCaptionRef.current?.remove();
      overlayCaptionRef.current = null;

      const introCropRoot = duplicateImgRef.current?.closest(
        '[data-rmg-fs-transform-crop="true"]'
      );
      if (introCropRoot) {
        introCropRoot.remove();
      } else {
        duplicateImgRef.current?.remove();
      }
      duplicateImgRef.current = null;

      if (overlayDivRef.current === switchState.overlay) {
        overlayDivRef.current = null;
      }

      setShowFullscreenModal(false);
    },
    [clearDialogSwitchThumbnailHold]
  );

  const closeFullscreen = useCallback(
    (options?: FullscreenCloseOptions) => {
      if (!showFullscreenModal && !closingModal) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        closeResolversRef.current.push(resolve);

        if (options?.immediate) {
          clearDialogSwitchThumbnailHold();
          setDialogTransitionState(DEFAULT_DIALOG_TRANSITION_STATE);
          setDialogTransitionSwitch(null);
          setDialogSwitchThumbnailsHidden(false);
          cancelFsCloseRef.current?.();
          setClosingModal(false);
          setShowFullscreenSlider(false);
          setShowFullscreenModal(false);
          return;
        }

        const requestClose = requestFsCloseRef.current;
        if (requestClose) {
          requestClose();
          return;
        }

        setShowFullscreenModal(false);
      });
    },
    [clearDialogSwitchThumbnailHold, closingModal, showFullscreenModal]
  );

  const transitionDialogTo = useCallback(
    async (
      openNext: () => void,
      options?: FullscreenDialogTransitionOptions
    ) => {
      if (!showFullscreenModal && !closingModal) {
        openNext();
        return;
      }

      const transition = resolveDialogTransitionOptions(options);
      const switchState = beginFullscreenDialogSwitch({
        overlay: overlayDivRef.current,
        durationMs: transition.durationMs,
        easing: transition.easing,
      });

      setDialogSwitchThumbnailsHidden(true);

      try {
        openNext();
      } catch (error) {
        clearDialogSwitchThumbnailHold();
        cancelFullscreenDialogSwitch(switchState);
        setDialogSwitchThumbnailsHidden(false);
        throw error;
      }

      const claimed = await waitForFullscreenDialogSwitchClaim(
        switchState,
        Math.max(80, transition.durationMs)
      );

      if (!claimed) {
        clearDialogSwitchThumbnailHold();
        cancelFullscreenDialogSwitch(switchState);
        setDialogSwitchThumbnailsHidden(false);
        return;
      }

      setDialogTransitionState({
        hidden: true,
        durationMs: transition.durationMs,
        easing: transition.easing,
      });

      await waitForMs(transition.durationMs);
      silentlyUnmountDialogSwitch(switchState);
      finishFullscreenDialogSwitch(switchState);
    },
    [
      clearDialogSwitchThumbnailHold,
      closingModal,
      resolveDialogTransitionOptions,
      showFullscreenModal,
      silentlyUnmountDialogSwitch,
    ]
  );

  const restoreDialog = useCallback(
    (options?: FullscreenDialogTransitionOptions) => {
      const transition = resolveDialogTransitionOptions(options);
      setDialogTransitionState({
        hidden: false,
        durationMs: transition.durationMs,
        easing: transition.easing,
      });
    },
    [resolveDialogTransitionOptions]
  );

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
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number,
    breakpointMap: BreakpointMap = BREAKPOINT_MAP
  ): FsCaptionPlacement | null {
    if (placement == null) return null;

    if (
      typeof placement === "object" ||
      Array.isArray(placement)
    ) {
      return resolveCaptionPlacementFromResponsive(
        placement,
        "bottom",
        viewportWidth,
        breakpointMap
      );
    }

    // legacy simple-string mode
    if (breakpoint == null) {
      return placement;
    }

    return viewportWidth >= breakpoint ? placement : "bottom";
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(10000);
  }, []);

  useEffect(() => {
    if (!fs.enabled) return;
    runtimePlugin?.preload?.();
  }, [fs.enabled, runtimePlugin]);

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

  const fullscreenDirection = fs.slider.direction ?? "ltr";
  const fullscreenSliderGap = useMemo(
    () =>
      normalizedItems.length > 1
        ? resolveFullscreenSliderGap(
            fs.slider.gap,
            windowSize.width,
            effectiveBreakpoints
          )
        : 0,
    [fs.slider.gap, windowSize.width, effectiveBreakpoints, normalizedItems.length]
  );

  const fullscreenThumbnailBridge = useMemo<FullscreenThumbnailBridge>(
    () => ({
      mountEl: fullscreenThumbnailMountEl,
      fsSub,
      visible: showFullscreenModal,
      invisible:
        closingModal ||
        dialogTransitionState.hidden ||
        dialogSwitchThumbnailsHidden,
      direction: fullscreenDirection,
      registerLayout: registerFullscreenThumbnailLayout,
      clearLayout: clearFullscreenThumbnailLayout,
    }),
    [
      fullscreenThumbnailMountEl,
      fsSub,
      showFullscreenModal,
      closingModal,
      dialogTransitionState.hidden,
      dialogSwitchThumbnailsHidden,
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
      if (!fs.enabled || !hasFullscreenRuntime) return;

      if (cancelFsCloseRef.current || closingModal) {
        pendingReopenRef.current = {
          source,
          index: gridIndex,
          originEl: originEl ?? null,
          requestedMethod,
        };
        return;
      }

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
        originImg =
          resolveImageFromSlot(expandableImageRefs.current[gridIndex] ?? null) ??
          resolveLayoutlessTarget(gridIndex).image;
      }

      const method = resolveFullscreenControllerOpenMethod(
        item,
        requestedMethod,
        !!fs.effects?.introFade
      );

      const introImg = method === "scale" ? originImg : null;
      const activeDialogSwitch = getActiveFullscreenDialogSwitch();

      const sel = getClosestSelector(source);
      const introReq = {
        originalImage: introImg,
        index: fullscreenIndex,
        method,
        closestSelector: sel,
      };

      isClick.current = true;

      if (activeDialogSwitch) {
        setDialogTransitionState({
          hidden: false,
          durationMs: activeDialogSwitch.durationMs,
          easing: activeDialogSwitch.easing,
        });
        setDialogTransitionSwitch(activeDialogSwitch);
      } else {
        setDialogTransitionSwitch(null);
      }

      setFullscreenOpen(true);
      fsSub.setLocalIndex(fullscreenIndex);
      setShowFullscreenModal(true);
      setFsIntroReq(introReq);
      setSlideIndex(fullscreenIndex);
    },
    [
      fs,
      normalizedItems,
      syncBeforeOpen,
      layout,
      closingModal,
      setFullscreenOpen,
      fsSub,
      expandableImageRefs,
      resolveLayoutlessTarget,
      getClosestSelector,
      hasFullscreenRuntime,
    ]
  );

  useEffect(() => {
    if (!fs.enabled) return;

    const off = fsSub.onEvent((evt) => {
      if (evt.type !== "internalIndex") return;
      if (!Number.isFinite(evt.index)) return;

      syncFullscreenSourceFromIndex(evt.index);
      setSlideIndex(evt.index);
    });

    return () => off();
  }, [fs.enabled, fsSub, syncFullscreenSourceFromIndex]);

  useEffect(() => {
    if (!fs.enabled) {
      pendingReopenRef.current = null;
      return;
    }

    if (showFullscreenModal || closingModal) return;

    const pending = pendingReopenRef.current;
    if (!pending) return;

    pendingReopenRef.current = null;

    const raf = window.requestAnimationFrame(() => {
      openFullscreenAt(
        pending.source,
        pending.index,
        pending.originEl,
        pending.requestedMethod
      );
    });

    return () => window.cancelAnimationFrame(raf);
  }, [fs.enabled, showFullscreenModal, closingModal, openFullscreenAt]);

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
    });

    return () => (unsub as any)?.();
  }, [fs.enabled, fsOpenSub, openFullscreenAt, syncFullscreenSourceFromIndex]);

  useEffect(() => {
    if (showFullscreenModal || closingModal) return;
    clearDialogSwitchThumbnailHold();
    setDialogTransitionState(DEFAULT_DIALOG_TRANSITION_STATE);
    setDialogTransitionSwitch(null);
    setDialogSwitchThumbnailsHidden(false);
    resolveCloseWaiters();
    setFullscreenOpen(false);
  }, [
    clearDialogSwitchThumbnailHold,
    closingModal,
    resolveCloseWaiters,
    showFullscreenModal,
    setFullscreenOpen,
  ]);

  useEffect(() => {
    return () => {
      clearDialogSwitchThumbnailHold();
      resolveCloseWaiters();
    };
  }, [clearDialogSwitchThumbnailHold, resolveCloseWaiters]);

  useEffect(() => {
    core.setFsEnabled(fs.enabled && hasFullscreenRuntime);
  }, [core, fs.enabled, hasFullscreenRuntime]);

  const fullscreenNode =
    fs.enabled && RuntimeHost ? (
      <RuntimeHost
        fsEnabled={fs.enabled}
        fsSub={fsSub}
        showFullscreenModal={showFullscreenModal}
        setShowFullscreenModal={setShowFullscreenModal}
        setShowFullscreenSlider={setShowFullscreenSlider}
        showFullscreenSlider={showFullscreenSlider}
        isClick={isClick}
        isAnimatingRef={isAnimatingRef}
        overlayDivRef={overlayDivRef}
        duplicateImgRef={duplicateImgRef}
        cells={cells}
        slidesForFullscreen={slidesForFullscreen}
        sliderForFullscreen={sliderForFullscreen}
        isWrappingForFullscreen={isWrappingForFullscreen}
        setClosingModal={setClosingModal}
        closingModal={closingModal}
        closeButtonRef={closeButtonRef}
        counterRef={counterRef}
        leftChevronRef={leftChevronRef}
        rightChevronRef={rightChevronRef}
        centerSliderForFullscreen={centerSliderForFullscreen}
        setSliderIndexForFullscreen={setSliderIndexForFullscreen}
        layout={layout}
        expandableImageRefs={expandableImageRefs}
        resolveLayoutlessTarget={resolveLayoutlessTarget}
        entryMapRef={safeEntryMapRef}
        entryRootRef={safeEntryRootRef}
        entryMediaLayout={safeEntryMediaLayout}
        introFade={fs.effects.introFade}
        introDuration={fs.effects.introDuration}
        introEasing={fs.effects.introEasing}
        fullscreenSliderApi={fullscreenSliderApi}
        slideIndex={slideIndex}
        isZoomClick={isZoomClick}
        isZoomed={isZoomed}
        windowSize={windowSize}
        imageRefs={imageRefs}
        wrappedItems={wrappedItems}
        setWrappedItems={setWrappedItems}
        scale={scaleRef.current}
        isZooming={isZooming}
        singleModePlyrRefs={singleModePlyrRefs}
        wrappedModePlyrRefs={wrappedModePlyrRefs}
        direction={fullscreenDirection}
        sliderGap={fullscreenSliderGap}
        sliderDuration={fs.slider.duration}
        sliderFriction={fs.slider.friction}
        sliderSkipSnaps={fs.slider.skipSnaps}
        sliderStrictSnaps={fs.slider.strictSnaps}
        suppressLoopRef={suppressLoopRef}
        fsFadeOpening={fsFadeOpening}
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
        cancelFsCloseRef={cancelFsCloseRef}
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
        fsIndexRef={fsIndexRef}
        entriesObject={safeEntriesObject}
        syncFullscreenSourceFromIndex={syncFullscreenSourceFromIndex}
        setFullscreenOpen={setFullscreenOpen}
        runtimePlugins={plugins}
        dialogHidden={dialogTransitionState.hidden}
        dialogTransitionDurationMs={dialogTransitionState.durationMs}
        dialogTransitionEasing={dialogTransitionState.easing}
        dialogTransitionSwitch={dialogTransitionSwitch}
        onDialogSwitchClaim={holdDialogSwitchThumbnails}
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
    closeFullscreen,
    transitionDialogTo,
    restoreDialog,
    showFullscreenModal,
    showFullscreenSlider,
    fsFadeOpening,
    closingModal,
  };
}

export type UseFullscreenControllerReturn = ReturnType<
  typeof useFullscreenController
>;
