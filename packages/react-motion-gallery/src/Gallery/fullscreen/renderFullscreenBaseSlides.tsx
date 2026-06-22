"use client";

import * as React from "react";
import type { MediaItem } from "../shared/types/media";
import {
  BREAKPOINT_MAP,
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
} from "../shared/responsive";
import {
  shouldHydrateFullscreenSlide,
  updateFullscreenCellRef,
} from "./slideWindow";

function subtractReservedSpace(base: string, reservedPx: number): string {
  if (!(reservedPx > 0)) return base;
  return `calc(${base} - ${reservedPx}px)`;
}

function isWrappedItems(itemsLen: number, canonicalLen: number) {
  return canonicalLen > 1 && itemsLen === canonicalLen + 2;
}

function toCanonicalIndex(
  renderedIndex: number,
  itemsLen: number,
  canonicalLen: number
) {
  if (!isWrappedItems(itemsLen, canonicalLen)) {
    const len = canonicalLen || itemsLen || 1;
    return ((renderedIndex % len) + len) % len;
  }

  if (renderedIndex === 0) return canonicalLen - 1;
  if (renderedIndex === itemsLen - 1) return 0;
  return renderedIndex - 1;
}

function isCloneIndex(
  renderedIndex: number,
  itemsLen: number,
  canonicalLen: number
) {
  return (
    isWrappedItems(itemsLen, canonicalLen) &&
    (renderedIndex === 0 || renderedIndex === itemsLen - 1)
  );
}

function readVideoPoster(item: MediaItem) {
  const any = item as any;
  const poster = any.poster ?? any.thumb ?? any.thumbSrc ?? "";
  return typeof poster === "string" ? poster : "";
}

function BaseSlide(props: {
  item: MediaItem;
  index: number;
  canonicalIndex: number;
  isClone: boolean;
  imageRef: React.RefObject<HTMLDivElement | null>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  isZoomed: boolean;
  showFullscreenSlider: boolean;
  getTransform: (index: number) => string;
  onPanPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onHoverPointerEnter?: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onHoverPointerMove?: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onHoverPointerLeave?: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onSuppressNextClickCapture: (e: React.SyntheticEvent) => void;
  styles: { imgMargin: string; fullscreenImages: string };
  renderImage?: (args: {
    item: Extract<MediaItem, { kind: "image" }>;
    index: number;
    isZoomed: boolean;
    className: string;
    baseStyle: React.CSSProperties;
  }) => React.ReactNode;
  renderMode?: "track" | "crossfade";
  interactive?: boolean;
  registerCell?: boolean;
  isHorizontal?: boolean;
  isVertical?: boolean;
  reservedBefore?: number;
  reservedAfter?: number;
  mediaViewportWidth?: string;
  mediaViewportHeight?: string;
  hydrateContent?: boolean;
}) {
  const {
    item,
    index,
    canonicalIndex,
    isClone,
    imageRef,
    cells,
    isZoomed,
    showFullscreenSlider,
    getTransform,
    onPanPointerDown,
    onHoverPointerEnter,
    onHoverPointerMove,
    onHoverPointerLeave,
    onSuppressNextClickCapture,
    styles,
    renderImage,
    renderMode = "track",
    interactive = showFullscreenSlider,
    registerCell = true,
    isHorizontal = false,
    isVertical = false,
    reservedBefore = 0,
    reservedAfter = 0,
    mediaViewportWidth = "100%",
    mediaViewportHeight = "100%",
    hydrateContent = true,
  } = props;

  const isInteractive = interactive && hydrateContent;
  const isNode = item.kind === "node";
  const baseImgStyle: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    touchAction: "manipulation",
    transformOrigin: "0 0",
    cursor: isInteractive ? (isZoomed ? "grab" : "zoom-in") : "default",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  const mediaNode = !hydrateContent
    ? null
    : isNode ? (
      <div
        data-rmg-fs-node="true"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          pointerEvents: isInteractive ? "auto" : "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {(item as any).node}
      </div>
    ) : item.kind === "video" ? (
      (() => {
        const poster = readVideoPoster(item);
        return poster ? (
          <img
            alt={(item as any).alt ?? `cell-${canonicalIndex}`}
            data-index={index}
            className={styles.fullscreenImages}
            draggable="false"
            decoding="async"
            loading="lazy"
            src={poster}
            style={{
              ...baseImgStyle,
              display: "block",
              pointerEvents: "none",
            }}
          />
        ) : (
          <div
            data-rmg-fs-video-fallback="true"
            style={{
              width: "100%",
              height: "100%",
              background: "#000",
            }}
          />
        );
      })()
    ) : renderImage ? (
      renderImage({
        item: item as Extract<MediaItem, { kind: "image" }>,
        index: canonicalIndex,
        isZoomed,
        className: styles.fullscreenImages,
        baseStyle: baseImgStyle,
      })
    ) : (
      <img
        alt={(item as any).alt ?? `cell-${index}`}
        data-index={index}
        className={styles.fullscreenImages}
        draggable="false"
        decoding="async"
        loading={showFullscreenSlider && !isClone ? "eager" : "lazy"}
        fetchPriority={showFullscreenSlider && !isClone ? "high" : "low"}
        src={(item as any).src ?? ""}
        srcSet={(item as any).srcSet ?? undefined}
        sizes={(item as any).sizes ?? undefined}
        style={{
          ...baseImgStyle,
          display: "block",
        }}
      />
    );

  return (
    <div
      key={`${(item as any).src ?? "slide"}-${index}`}
      data-rmg-fs-slide="true"
      data-index={index}
      data-rmg-canonical-idx={canonicalIndex}
      data-rmg-clone={isClone ? "true" : "false"}
      data-rmg-fs-render-mode={renderMode}
      ref={(el: HTMLDivElement | null) => {
        if (registerCell) {
          updateFullscreenCellRef(cells, index, el);
        }
      }}
      style={{
        transform: renderMode === "crossfade" ? "none" : getTransform(index),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        inset: renderMode === "crossfade" ? 0 : undefined,
        left: renderMode === "crossfade" ? undefined : 0,
        top: renderMode === "crossfade" ? undefined : 0,
        width: renderMode === "crossfade" ? "100%" : undefined,
        minWidth: "100%",
        height: "100%",
        margin: "auto",
        touchAction: isInteractive ? "none" : "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: isInteractive ? "auto" : "none",
      }}
      className={styles.imgMargin}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          justifyContent: "center",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {reservedBefore > 0 && (
          <div
            aria-hidden
            style={{
              flex: `0 0 ${reservedBefore}px`,
              pointerEvents: "none",
              visibility: "hidden",
            }}
          />
        )}
        <div
          ref={imageRef}
          data-rmg-zoom-pan-root="true"
          data-rmg-fs-media="true"
          data-rmg-fs-media-viewport="true"
          onPointerDown={
            isNode || !isInteractive
              ? undefined
              : (e) => onPanPointerDown(e, imageRef)
          }
          onPointerEnter={
            isNode || !isInteractive || !onHoverPointerEnter
              ? undefined
              : (e) => onHoverPointerEnter(e, imageRef)
          }
          onPointerMove={
            isNode || !isInteractive || !onHoverPointerMove
              ? undefined
              : (e) => onHoverPointerMove(e, imageRef)
          }
          onPointerLeave={
            isNode || !isInteractive || !onHoverPointerLeave
              ? undefined
              : (e) => onHoverPointerLeave(e, imageRef)
          }
          onClickCapture={onSuppressNextClickCapture as any}
          style={{
            overflow: "visible",
            touchAction: "none",
            width: mediaViewportWidth,
            height: mediaViewportHeight,
            minWidth: 0,
            minHeight: isVertical ? 0 : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            userSelect: "none",
            WebkitUserSelect: "none",
            pointerEvents: isInteractive ? "auto" : "none",
          }}
        >
          {mediaNode}
        </div>
        {reservedAfter > 0 && (
          <div
            aria-hidden
            style={{
              flex: `0 0 ${reservedAfter}px`,
              pointerEvents: "none",
              visibility: "hidden",
            }}
          />
        )}
      </div>
    </div>
  );
}

export function renderFullscreenBaseSlides(opts: any) {
  const {
    items,
    getTransform,
    imageRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    onPanPointerDown,
    onHoverPointerEnter,
    onHoverPointerMove,
    onHoverPointerLeave,
    onSuppressNextClickCapture,
    styles,
    renderImage,
    canonicalLength,
    activeCanonicalIndex,
    renderMode = "track",
    fsViewportOverlayPlacement,
    fsViewportOverlayWidth,
    fsViewportOverlayHeight,
    fsViewportOverlayBreakpoint,
    breakpointMap,
    viewportWidth,
    viewportHeight,
    resolveFsCaptionPlacement,
  } = opts;

  const canonLen = canonicalLength ?? items.length;
  const vw = effectiveViewportWidth(
    viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 0)
  );
  const vh = effectiveViewportHeight(
    viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 0)
  );
  const effectiveViewportOverlayPlacement =
    typeof resolveFsCaptionPlacement === "function"
      ? resolveFsCaptionPlacement(
          fsViewportOverlayPlacement,
          fsViewportOverlayBreakpoint,
          vw
        )
      : null;
  const activeBreakpointMap = breakpointMap ?? BREAKPOINT_MAP;
  const viewportOverlaySideWidth = resolveLengthFromResponsive(
    fsViewportOverlayWidth,
    280,
    vw,
    vw,
    activeBreakpointMap
  );
  const viewportOverlayTopBottomHeight = resolveLengthFromResponsive(
    fsViewportOverlayHeight,
    200,
    vw,
    vh,
    activeBreakpointMap
  );
  const isHorizontal =
    effectiveViewportOverlayPlacement === "left" ||
    effectiveViewportOverlayPlacement === "right";
  const isVertical =
    effectiveViewportOverlayPlacement === "top" ||
    effectiveViewportOverlayPlacement === "bottom";
  const reservedLeft =
    effectiveViewportOverlayPlacement === "left" && fsViewportOverlayWidth != null
      ? viewportOverlaySideWidth
      : 0;
  const reservedRight =
    effectiveViewportOverlayPlacement === "right" && fsViewportOverlayWidth != null
      ? viewportOverlaySideWidth
      : 0;
  const reservedTop =
    effectiveViewportOverlayPlacement === "top" && fsViewportOverlayHeight != null
      ? viewportOverlayTopBottomHeight
      : 0;
  const reservedBottom =
    effectiveViewportOverlayPlacement === "bottom" && fsViewportOverlayHeight != null
      ? viewportOverlayTopBottomHeight
      : 0;
  const reservedBefore = isHorizontal ? reservedLeft : reservedTop;
  const reservedAfter = isHorizontal ? reservedRight : reservedBottom;
  const mediaViewportWidth = subtractReservedSpace(
    "100%",
    reservedLeft + reservedRight
  );
  const mediaViewportHeight = subtractReservedSpace(
    "100%",
    reservedTop + reservedBottom
  );

  return items.map((item: MediaItem, index: number) => {
    const canonicalIndex = toCanonicalIndex(index, items.length, canonLen);
    const isClone = isCloneIndex(index, items.length, canonLen);
    const hydrateContent = shouldHydrateFullscreenSlide({
      renderedIndex: index,
      itemsLength: items.length,
      canonicalLength: canonLen,
      activeCanonicalIndex,
      renderMode,
    });

    if (!hydrateContent) return null;

    return (
      <BaseSlide
        key={`${(item as any).src ?? "slide"}-${index}`}
        item={item}
        index={index}
        canonicalIndex={canonicalIndex}
        isClone={isClone}
        imageRef={imageRefs.current[index]}
        cells={cells}
        isZoomed={isZoomed}
        showFullscreenSlider={showFullscreenSlider}
        getTransform={getTransform}
        onPanPointerDown={onPanPointerDown}
        onHoverPointerEnter={onHoverPointerEnter}
        onHoverPointerMove={onHoverPointerMove}
        onHoverPointerLeave={onHoverPointerLeave}
        onSuppressNextClickCapture={onSuppressNextClickCapture}
        styles={styles}
        renderImage={renderImage}
        renderMode={renderMode}
        interactive={renderMode === "track" && showFullscreenSlider}
        registerCell={renderMode === "track"}
        isHorizontal={isHorizontal}
        isVertical={isVertical}
        reservedBefore={reservedBefore}
        reservedAfter={reservedAfter}
        mediaViewportWidth={mediaViewportWidth}
        mediaViewportHeight={mediaViewportHeight}
        hydrateContent={hydrateContent}
      />
    );
  });
}

export function renderFullscreenBaseCrossfadeSlides(opts: any) {
  return renderFullscreenBaseSlides({
    ...opts,
    renderMode: "crossfade",
    showFullscreenSlider: true,
  });
}
