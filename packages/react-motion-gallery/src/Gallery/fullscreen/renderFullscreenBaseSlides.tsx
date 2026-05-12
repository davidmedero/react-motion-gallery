"use client";

import * as React from "react";
import type { MediaItem } from "../shared/types/media";

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
    onSuppressNextClickCapture,
    styles,
    renderImage,
    renderMode = "track",
    interactive = showFullscreenSlider,
    registerCell = true,
  } = props;

  const isNode = item.kind === "node";
  const baseImgStyle: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    touchAction: "manipulation",
    transformOrigin: "0 0",
    transform: "translate(0, 0) scale(1)",
    cursor: interactive ? (isZoomed ? "grab" : "zoom-in") : "default",
    userSelect: "none",
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
        loading={isClone ? "lazy" : "eager"}
        fetchPriority={isClone ? "low" : "high"}
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
        pointerEvents: interactive ? "auto" : "none",
      }}
      className={styles.imgMargin}
    >
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
        onClickCapture={onSuppressNextClickCapture as any}
        style={{
          overflow: "visible",
          touchAction: "none",
          width: "100%",
          height: "100%",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          pointerEvents: interactive ? "auto" : "none",
        }}
      >
        {mediaNode}
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
    onSuppressNextClickCapture,
    styles,
    renderImage,
    canonicalLength,
    renderMode = "track",
  } = opts;

  const canonLen = canonicalLength ?? items.length;

  return items.map((item: MediaItem, index: number) => {
    const canonicalIndex = toCanonicalIndex(index, items.length, canonLen);
    const isClone = isCloneIndex(index, items.length, canonLen);

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
        onSuppressNextClickCapture={onSuppressNextClickCapture}
        styles={styles}
        renderImage={renderImage}
        renderMode={renderMode}
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
