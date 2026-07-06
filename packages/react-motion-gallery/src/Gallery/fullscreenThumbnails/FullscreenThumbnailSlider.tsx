/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ThumbnailSlider from "../thumbnails";
import { createSliderIndexChannel } from "../slider/sliderSub";
import type {
  ThumbnailSelectMeta,
  ThumbnailsOptions,
} from "../thumbnails/types";
import { createFullscreenThumbnailSyncBridge } from "./syncBridge";
import type { FullscreenThumbnailSliderProps } from "./types";

function clampIndex(index: number, len: number) {
  if (len <= 0 || !Number.isFinite(index)) return 0;
  const whole = Math.trunc(index);
  return Math.max(0, Math.min(len - 1, whole));
}

export function resolveFullscreenThumbnailClosedTransform(
  position: FullscreenThumbnailSliderProps["position"]
) {
  switch (position) {
    case "left":
      return "translateX(-8px)";
    case "right":
      return "translateX(8px)";
    case "top":
      return "translateY(-8px)";
    case "bottom":
    default:
      return "translateY(8px)";
  }
}

type FullscreenThumbnailOptionsArgs = Pick<
  FullscreenThumbnailSliderProps,
  | "position"
  | "containerClassName"
  | "containerStyle"
  | "thumbnailWidth"
  | "thumbnailHeight"
  | "thumbnailsCenter"
  | "thumbnailItemClassName"
  | "thumbnailItemStyle"
  | "gap"
  | "freeScroll"
  | "groupCells"
  | "loop"
  | "skipSnaps"
  | "centerActiveThumb"
  | "fadeOnSync"
  | "selectDuration"
  | "freeScrollDuration"
  | "sliderFriction"
  | "breakpointMap"
  | "rippleEnabled"
  | "rippleClassName"
  | "showArrows"
  | "arrowStyles"
  | "arrowClassName"
  | "prevArrowStyles"
  | "prevArrowClassName"
  | "nextArrowStyles"
  | "nextArrowClassName"
  | "renderArrows"
  | "renderPrevArrow"
  | "renderNextArrow"
  | "thumbnailCrossfade"
  | "virtualization"
> & {
  resolvedContainerWidth?: number | string;
  resolvedContainerHeight?: number | string;
};

export function createFullscreenThumbnailOptions(
  args: FullscreenThumbnailOptionsArgs
): ThumbnailsOptions {
  return {
    layout: {
      position: args.position,
      thumbnail: {
        width: args.thumbnailWidth,
        height: args.thumbnailHeight,
      },
      center: args.thumbnailsCenter,
      container: {
        width: args.resolvedContainerWidth,
        height: args.resolvedContainerHeight,
      },
      gap: args.gap,
    },
    scroll: {
      freeScroll: args.freeScroll,
      groupCells: args.groupCells,
      loop: args.loop,
      skipSnaps: args.skipSnaps,
      centerActiveThumb: args.centerActiveThumb,
      fadeOnSync: args.fadeOnSync,
    },
    motion: {
      selectDuration: args.selectDuration,
      freeScrollDuration: args.freeScrollDuration,
      friction: args.sliderFriction,
    },
    elements: {
      thumbnail: {
        className: args.thumbnailItemClassName,
        style: args.thumbnailItemStyle,
      },
      container: {
        style: args.containerStyle,
        className: args.containerClassName,
      },
    },
    controls: {
      enabled: args.showArrows,
      arrow: {
        style: args.arrowStyles,
        className: args.arrowClassName,
      },
      prev: {
        style: args.prevArrowStyles,
        className: args.prevArrowClassName,
      },
      next: {
        style: args.nextArrowStyles,
        className: args.nextArrowClassName,
      },
      render: args.renderArrows,
      renderPrev: args.renderPrevArrow,
      renderNext: args.renderNextArrow,
      ripple: {
        enabled: args.rippleEnabled,
        className: args.rippleClassName,
      },
    },
    reveal: {
      staggerMs: 0,
      durationMs: 0,
    },
    transitions: {
      loading: {
        enabled: false,
      },
      crossfade: args.thumbnailCrossfade,
    },
    virtualization: args.virtualization,
    breakpointMap: args.breakpointMap,
  };
}

export default function FullscreenThumbnailSlider({
  bridge,
  items,
  position,
  containerClassName,
  containerStyle,
  thumbnailWidth,
  thumbnailHeight,
  thumbnailsCenter,
  thumbnailsContainerWidth,
  thumbnailsContainerHeight,
  fadeDurationMs = 300,
  fadeEasing = "cubic-bezier(.4,0,.22,1)",
  thumbnailItemClassName,
  thumbnailItemStyle,
  gap,
  freeScroll,
  groupCells,
  loop,
  skipSnaps,
  centerActiveThumb,
  fadeOnSync,
  selectDuration,
  freeScrollDuration,
  sliderFriction,
  breakpointMap = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  rippleEnabled,
  rippleClassName,
  showArrows = false,
  arrowStyles,
  arrowClassName,
  prevArrowStyles,
  prevArrowClassName,
  nextArrowStyles,
  nextArrowClassName,
  renderArrows,
  renderPrevArrow,
  renderNextArrow,
  thumbnailCrossfade,
  virtualization,
}: FullscreenThumbnailSliderProps) {
  const { fsSub, mountEl, visible, invisible, direction, registerLayout, clearLayout } =
    bridge;

  const itemCount = items.length;

  const channelRef = useRef(
    createSliderIndexChannel(clampIndex(fsSub.get(), itemCount), "animated")
  );

  const thumbsReadyRef = useRef(false);
  const didInitialSnapThisOpenRef = useRef(false);
  const initialOpenReadyRafRef = useRef<number[]>([]);
  const [initialOpenReady, setInitialOpenReady] = useState(false);

  const syncBridgeRef = useRef(
    createFullscreenThumbnailSyncBridge({
      localChannel: channelRef.current,
      fsSub,
      clampIndex: (index) => clampIndex(index, itemCount),
    })
  );

  function snapToCurrentFsIndex(mode: "instant" | "animated" = "instant") {
    const idx = clampIndex(fsSub.get(), itemCount);
    channelRef.current.set(idx, mode, { silent: false });
  }

  function cancelInitialOpenReadyFrame() {
    for (const frame of initialOpenReadyRafRef.current) {
      cancelAnimationFrame(frame);
    }
    initialOpenReadyRafRef.current = [];
  }

  function scheduleInitialOpenReady() {
    cancelInitialOpenReadyFrame();

    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => {
        initialOpenReadyRafRef.current = [];
        setInitialOpenReady(true);
      });

      initialOpenReadyRafRef.current = [secondFrame];
    });

    initialOpenReadyRafRef.current = [firstFrame];
  }

  useEffect(() => {
    syncBridgeRef.current = createFullscreenThumbnailSyncBridge({
      localChannel: channelRef.current,
      fsSub,
      clampIndex: (index) => clampIndex(index, itemCount),
    });

    const cleanup = syncBridgeRef.current.start();
    return () => cleanup();
  }, [fsSub, itemCount]);

  useEffect(() => {
    registerLayout({
      position,
      className: containerClassName,
      style: containerStyle,
      fadeDurationMs,
      fadeEasing,
    });
  }, [
    registerLayout,
    position,
    containerClassName,
    containerStyle,
    fadeDurationMs,
    fadeEasing,
  ]);

  useEffect(() => {
    return () => {
      cancelInitialOpenReadyFrame();
      clearLayout();
    };
  }, [clearLayout]);

  useEffect(() => {
    if (!visible) {
      cancelInitialOpenReadyFrame();
      didInitialSnapThisOpenRef.current = false;
      setInitialOpenReady(false);
      return;
    }

    if (!didInitialSnapThisOpenRef.current) {
      snapToCurrentFsIndex("instant");
      didInitialSnapThisOpenRef.current = true;
    }

    if (thumbsReadyRef.current) {
      scheduleInitialOpenReady();
    }
  }, [visible, itemCount, fsSub]);

  const renderThumbnailItem = React.useCallback(
    ({ item, index }: { item: (typeof items)[number]; index: number }) => (
      <img
        src={item.thumbSrc}
        alt={item.alt ?? `thumb-${index}`}
        style={{
          width: "inherit",
          height: "inherit",
          objectFit: "contain",
          display: "block",
        }}
        draggable={false}
      />
    ),
    []
  );

  const getThumbnailItemKey = React.useCallback(
    (item: (typeof items)[number], index: number) =>
      item.thumbSrc || item.alt || index,
    []
  );

  const isOpen = visible && !invisible && initialOpenReady;

  const opacity = isOpen ? 1 : 0;
  const transform = isOpen
    ? "translate3d(0, 0, 0)"
    : resolveFullscreenThumbnailClosedTransform(position);
  const pointerEvents: React.CSSProperties["pointerEvents"] =
    isOpen ? "auto" : "none";

  const resolvedContainerWidth = thumbnailsContainerWidth ?? containerStyle?.width;
  const resolvedContainerHeight = thumbnailsContainerHeight ?? containerStyle?.height;

  const wrapperStyle: React.CSSProperties = {
    opacity,
    transform,
    pointerEvents,
    transition: `
      opacity ${fadeDurationMs}ms ${fadeEasing},
      transform ${fadeDurationMs}ms ${fadeEasing}
    `,
  };

  const thumbnailOptions = useMemo<ThumbnailsOptions>(
    () => ({
      ...createFullscreenThumbnailOptions({
        position,
        thumbnailWidth,
        thumbnailHeight,
        thumbnailsCenter,
        resolvedContainerWidth,
        resolvedContainerHeight,
        gap,
        freeScroll,
        groupCells,
        loop,
        skipSnaps,
        centerActiveThumb,
        fadeOnSync,
        selectDuration,
        freeScrollDuration,
        sliderFriction,
        containerStyle,
        containerClassName,
        thumbnailItemClassName,
        thumbnailItemStyle,
        showArrows,
        arrowStyles,
        arrowClassName,
        prevArrowStyles,
        prevArrowClassName,
        nextArrowStyles,
        nextArrowClassName,
        renderArrows,
        renderPrevArrow,
        renderNextArrow,
        rippleEnabled,
        rippleClassName,
        thumbnailCrossfade,
        virtualization,
        breakpointMap,
      }),
      items,
      renderItem: renderThumbnailItem as any,
      getItemKey: getThumbnailItemKey as any,
    }),
    [
      items,
      position,
      thumbnailWidth,
      thumbnailHeight,
      thumbnailsCenter,
      resolvedContainerWidth,
      resolvedContainerHeight,
      gap,
      freeScroll,
      groupCells,
      loop,
      skipSnaps,
      centerActiveThumb,
      fadeOnSync,
      selectDuration,
      freeScrollDuration,
      sliderFriction,
      containerStyle,
      containerClassName,
      thumbnailItemClassName,
      thumbnailItemStyle,
      showArrows,
      arrowStyles,
      arrowClassName,
      prevArrowStyles,
      prevArrowClassName,
      nextArrowStyles,
      nextArrowClassName,
      renderArrows,
      renderPrevArrow,
      renderNextArrow,
      rippleEnabled,
      rippleClassName,
      breakpointMap,
      thumbnailCrossfade,
      virtualization,
      renderThumbnailItem,
      getThumbnailItemKey,
    ]
  );

  if (!mountEl) return null;

  return createPortal(
    <div style={wrapperStyle}>
      <ThumbnailSlider
        indexChannel={channelRef.current}
        direction={direction}
        options={thumbnailOptions}
        onReadyChange={(ready) => {
          thumbsReadyRef.current = ready;
          if (!ready) {
            cancelInitialOpenReadyFrame();
            setInitialOpenReady(false);
            return;
          }

          if (visible && didInitialSnapThisOpenRef.current) {
            scheduleInitialOpenReady();
          }
        }}
        onThumbnailClick={(idx, meta?: ThumbnailSelectMeta) => {
          syncBridgeRef.current.publishThumbnailClick(idx, "animated", {
            source: "thumbnail",
            transition: meta?.transition ?? "scroll",
            crossfade:
              meta?.transition === "crossfade"
                ? {
                    durationMs: meta.crossfade?.durationMs,
                    easing: meta.crossfade?.easing,
                  }
                : undefined,
          });
        }}
      />
    </div>,
    mountEl
  );
}
