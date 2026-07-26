"use client";

import * as React from "react";
import type { MediaItem } from "../shared/types/media";
import { readViewportWidth } from "../shared/hooks/useViewportWidth";
import {
  BREAKPOINT_MAP,
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
} from "../shared/responsive";

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
  activeCanonicalIndex?: number | null;
  isClone: boolean;
  openingCanonicalIndex?: number | null;
  openingInProgress?: boolean;
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
  isHorizontal: boolean;
  reservedBefore: number;
  reservedAfter: number;
  mediaViewportWidth: string;
  mediaViewportHeight: string;
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
}) {
  const {
    item,
    index,
    canonicalIndex,
    activeCanonicalIndex,
    isClone,
    openingCanonicalIndex,
    openingInProgress,
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
    isHorizontal,
    reservedBefore,
    reservedAfter,
    mediaViewportWidth,
    mediaViewportHeight,
    styles,
    renderImage,
    renderMode = "track",
    interactive = showFullscreenSlider,
    registerCell = true,
  } = props;

  const isNode = item.kind === "node";
  const isOpeningTarget =
    !!openingInProgress &&
    !isClone &&
    canonicalIndex === openingCanonicalIndex;
  const isPriorityImage =
    !isClone &&
    (!openingInProgress ||
      canonicalIndex === activeCanonicalIndex ||
      isOpeningTarget);
  const suspendDuringOpening =
    renderMode === "track" && !!openingInProgress && !isOpeningTarget;
  const baseImgStyle: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    touchAction: "manipulation",
    transformOrigin: "0 0",
    cursor: interactive ? (isZoomed ? "grab" : "zoom-in") : "default",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  const mediaNode =
    isNode ? (
      <div
        data-rmg-fs-node="true"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          pointerEvents: interactive ? "auto" : "none",
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
            loading={isPriorityImage ? "eager" : "lazy"}
            fetchPriority={isPriorityImage ? "high" : "low"}
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
        loading={isPriorityImage ? "eager" : "lazy"}
        fetchPriority={isPriorityImage ? "high" : "low"}
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
      data-rmg-fs-opening-suspended={
        suspendDuringOpening ? "true" : undefined
      }
      ref={(el: HTMLDivElement | null) => {
        if (
          registerCell &&
          el &&
          !cells.current.some((c) => c.element === el)
        ) {
          cells.current.push({
            element: el as unknown as HTMLElement,
            index,
          });
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
        touchAction: interactive ? "none" : "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: interactive ? "auto" : "none",
        contentVisibility: suspendDuringOpening ? "hidden" : "visible",
      }}
      className={styles.imgMargin}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
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
            isNode || !interactive
              ? undefined
              : (e) => onPanPointerDown(e, imageRef)
          }
          onPointerEnter={
            isNode || !interactive || !onHoverPointerEnter
              ? undefined
              : (e) => onHoverPointerEnter(e, imageRef)
          }
          onPointerMove={
            isNode || !interactive || !onHoverPointerMove
              ? undefined
              : (e) => onHoverPointerMove(e, imageRef)
          }
          onPointerLeave={
            isNode || !interactive || !onHoverPointerLeave
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            userSelect: "none",
            WebkitUserSelect: "none",
            pointerEvents: interactive ? "auto" : "none",
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
    openingCanonicalIndex,
    openingInProgress,
    renderMode = "track",
    renderWindow,
  } = opts;

  const canonLen = canonicalLength ?? items.length;
  const vw = effectiveViewportWidth(
    opts.viewportWidth ??
      (typeof window !== "undefined" ? readViewportWidth() : 0)
  );
  const vh = effectiveViewportHeight(
    opts.viewportHeight ??
      (typeof window !== "undefined" ? window.innerHeight : 0)
  );
  const effectiveViewportOverlayPlacement =
    typeof opts.resolveFsCaptionPlacement === "function"
      ? opts.resolveFsCaptionPlacement(
          opts.fsViewportOverlayPlacement,
          opts.fsViewportOverlayBreakpoint,
          vw
        )
      : null;
  const viewportOverlaySideWidth = resolveLengthFromResponsive(
    opts.fsViewportOverlayWidth,
    280,
    vw,
    vw,
    opts.breakpointMap ?? BREAKPOINT_MAP
  );
  const viewportOverlayTopBottomHeight = resolveLengthFromResponsive(
    opts.fsViewportOverlayHeight,
    200,
    vw,
    vh,
    opts.breakpointMap ?? BREAKPOINT_MAP
  );
  const reservedLeftWidth =
    effectiveViewportOverlayPlacement === "left" &&
    opts.fsViewportOverlayWidth != null
      ? viewportOverlaySideWidth
      : 0;
  const reservedRightWidth =
    effectiveViewportOverlayPlacement === "right" &&
    opts.fsViewportOverlayWidth != null
      ? viewportOverlaySideWidth
      : 0;
  const reservedTopHeight =
    effectiveViewportOverlayPlacement === "top" &&
    opts.fsViewportOverlayHeight != null
      ? viewportOverlayTopBottomHeight
      : 0;
  const reservedBottomHeight =
    effectiveViewportOverlayPlacement === "bottom" &&
    opts.fsViewportOverlayHeight != null
      ? viewportOverlayTopBottomHeight
      : 0;
  const isHorizontal =
    effectiveViewportOverlayPlacement === "left" ||
    effectiveViewportOverlayPlacement === "right";
  const reservedBefore = isHorizontal ? reservedLeftWidth : reservedTopHeight;
  const reservedAfter = isHorizontal ? reservedRightWidth : reservedBottomHeight;
  const mediaViewportWidth = subtractReservedSpace(
    "100%",
    reservedLeftWidth + reservedRightWidth
  );
  const mediaViewportHeight = subtractReservedSpace(
    "100%",
    reservedTopHeight + reservedBottomHeight
  );

  const windowItems =
    renderWindow && renderWindow.length > 0
      ? renderWindow
      : items.map((_: MediaItem, index: number) => ({ renderedIndex: index }));

  return windowItems.map((windowItem: any) => {
    const index = windowItem.renderedIndex;
    const item = items[index] as MediaItem | undefined;
    if (!item) return null;

    const canonicalIndex =
      windowItem.canonicalIndex ??
      toCanonicalIndex(index, items.length, canonLen);
    const isClone =
      windowItem.isClone ?? isCloneIndex(index, items.length, canonLen);
    const slideGetTransform =
      windowItem.getTransform ??
      (windowItem.transform ? () => windowItem.transform : getTransform);
    const key =
      windowItem.key ??
      (windowItem.virtualIndex != null
        ? `virtual-${windowItem.virtualIndex}-${canonicalIndex}`
        : `${(item as any).src ?? "slide"}-${index}`);

    return (
      <BaseSlide
        key={key}
        item={item}
        index={index}
        canonicalIndex={canonicalIndex}
        activeCanonicalIndex={activeCanonicalIndex}
        isClone={isClone}
        openingCanonicalIndex={openingCanonicalIndex}
        openingInProgress={openingInProgress}
        imageRef={imageRefs.current[index]}
        cells={cells}
        isZoomed={isZoomed}
        showFullscreenSlider={showFullscreenSlider}
        onPanPointerDown={onPanPointerDown}
        onHoverPointerEnter={onHoverPointerEnter}
        onHoverPointerMove={onHoverPointerMove}
        onHoverPointerLeave={onHoverPointerLeave}
        onSuppressNextClickCapture={onSuppressNextClickCapture}
        isHorizontal={isHorizontal}
        reservedBefore={reservedBefore}
        reservedAfter={reservedAfter}
        mediaViewportWidth={mediaViewportWidth}
        mediaViewportHeight={mediaViewportHeight}
        styles={styles}
        renderImage={renderImage}
        renderMode={renderMode}
        getTransform={slideGetTransform}
        interactive={renderMode === "track" && showFullscreenSlider}
        registerCell={renderMode === "track"}
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
