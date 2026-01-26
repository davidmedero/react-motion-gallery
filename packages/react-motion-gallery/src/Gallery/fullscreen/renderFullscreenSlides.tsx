"use client";

import * as React from "react";
import type { APITypes } from "plyr-react";
import { detectProvider, PlyrProp } from "../video/plyr";
import { installDblclickGuardWhenReady } from "../video/plyrGuards";
import { Plyr } from "../video/LazyPlyr";
import { MediaItem } from "../shared/types/media";
import { FsCaptionPlacement, FsCaptionRenderArgs } from "./types";

type RenderFullscreenSlidesArgs = {
  // data
  items: MediaItem[];
  plyrList: PlyrProp[];

  // positioning
  getTransform: (index: number) => string;

  // refs
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
  playerRefs: React.RefObject<(APITypes | null)[]>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;

  // zoom/pan integration
  isZoomed: boolean;
  showFullscreenSlider: boolean;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;

  onPanPointerDown: (e: React.PointerEvent<HTMLDivElement>, imageRef: React.RefObject<HTMLDivElement | null>) => void;
  onSuppressNextClickCapture: (e: React.SyntheticEvent) => void;

  // caption
  renderCaption?: (args: FsCaptionRenderArgs) => React.ReactNode;
  captionClassName?: string;
  captionStyle?: React.CSSProperties;
  fsCaptionPlacement?: FsCaptionPlacement;
  fsCaptionWidth?: number;
  fsCaptionHeight?: number;
  fsCaptionBreakpoint?: number;

  resolveFsCaptionPlacement: (
    placement: FsCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;

  // styling module class (was styles.imgMargin + styles.fullscreenImages)
  styles: {
    imgMargin: string;
    fullscreenImages: string;
  };

  // optional image renderer
  renderImage?: (args: {
    item: Extract<MediaItem, { kind: "image" }>;
    index: number;
    isZoomed: boolean;
    className: string;
    baseStyle: React.CSSProperties;
  }) => React.ReactNode;
};

export function renderFullscreenSlides(opts: RenderFullscreenSlidesArgs) {
  const {
    items,
    plyrList,
    getTransform,
    imageRefs,
    playerRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    onPanPointerDown,
    onSuppressNextClickCapture,
    renderCaption,
    captionClassName,
    captionStyle,
    fsCaptionPlacement,
    fsCaptionWidth,
    fsCaptionHeight,
    fsCaptionBreakpoint,
    resolveFsCaptionPlacement,
    styles,
    renderImage,
  } = opts;

  const vw =
    typeof window !== "undefined" ? document.documentElement.clientWidth : 1024;

  const effectivePlacement = resolveFsCaptionPlacement(
    fsCaptionPlacement,
    fsCaptionBreakpoint,
    vw
  );

  const isHorizontal =
    effectivePlacement === "left" || effectivePlacement === "right";
  const isVertical =
    effectivePlacement === "top" || effectivePlacement === "bottom";

  const captionFirst = effectivePlacement === "left" || effectivePlacement === "top";

  const DEFAULT_SIDE = 280;
  const DEFAULT_TOP_BOTTOM = 200;

  const sideWidth = fsCaptionWidth ?? DEFAULT_SIDE;
  const topBottomHeight = fsCaptionHeight ?? DEFAULT_TOP_BOTTOM;

  return items.map((item, index) => {
    const imageRef = imageRefs.current[index];
    const plyr = plyrList[index];

    const captionNode = renderCaption ? renderCaption({ item, index, isZoomed }) : null;

    const provider =
      item.kind === "video" ? detectProvider(plyr?.source) : "other";

    return (
      <div
        key={`${item.src}-${index}`}
        data-rmg-fs-slide="true"
        data-index={index}
        ref={(el: HTMLDivElement | null) => {
          if (el && !cells.current.some((c) => c.element === el)) {
            cells.current.push({ element: el as unknown as HTMLElement, index });
          }
        }}
        style={{
          transform: getTransform(index),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: 0,
          minWidth: "100%",
          height: "100%",
          margin: "auto",
          touchAction: "none",
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
          }}
        >
          {/* Caption (if placed before image) */}
          {captionNode && captionFirst && (
            <div
              className={captionClassName}
              data-rmg-fs-caption="true"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: isHorizontal ? `0 0 ${sideWidth}px` : "0 0 auto",
                alignSelf: "stretch",
                textAlign: "left",
                pointerEvents: showFullscreenSlider ? "auto" : "none",
                padding: "0.75rem 1rem",
                color: "#fff",
                fontSize: "0.875rem",
                width: isHorizontal ? sideWidth : "100%",
                height: isVertical ? topBottomHeight : "auto",
                boxSizing: "border-box",
                ...captionStyle,
              }}
            >
              {captionNode}
            </div>
          )}

          <div
            ref={imageRef}
            onPointerDown={(e) => onPanPointerDown(e, imageRef)}
            onClickCapture={onSuppressNextClickCapture as any}
            style={{
              overflow: "visible",
              touchAction: "none",
              height: isVertical
                ? `calc(100% - ${captionNode ? topBottomHeight : 0}px)`
                : "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.kind === "video" ? (
              <div
                data-index={index}
                style={{ ...defaultPlayerStyle, ...(fsVideoStyle ?? {}) }}
                className={["rmg__player", fsVideoClassName].filter(Boolean).join(" ")}
                data-rmg-plyr="true"
                data-rmg-plyr-index={String(index)}
                data-rmg-plyr-provider={provider}
              >
                <Plyr
                  source={plyr!.source}
                  options={plyr!.options}
                  ref={(player: APITypes | null) => {
                    playerRefs.current[index] = player;
                    installDblclickGuardWhenReady(player);
                  }}
                />
              </div>
            ) : renderImage ? (
              renderImage({
                item: item as any,
                index,
                isZoomed,
                className: styles.fullscreenImages,
                baseStyle: {
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  touchAction: "manipulation",
                  transformOrigin: "0 0",
                  transform: "translate(0, 0) scale(1)",
                  cursor: isZoomed ? "grab" : "zoom-in",
                  userSelect: "none",
                },
              })
            ) : (
              <img
                src={item.src}
                alt={item.alt ?? `cell-${index}`}
                srcSet={item.srcSet}
                sizes={item.sizes}
                data-index={index}
                className={styles.fullscreenImages}
                draggable="false"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  touchAction: "manipulation",
                  transformOrigin: "0 0",
                  transform: "translate(0, 0) scale(1)",
                  cursor: isZoomed ? "grab" : "zoom-in",
                  userSelect: "none",
                }}
              />
            )}
          </div>

          {/* Caption (if placed after image) */}
          {captionNode && !captionFirst && (
            <div
              className={captionClassName}
              data-rmg-fs-caption="true"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: isHorizontal ? `0 0 ${sideWidth}px` : "0 0 auto",
                alignSelf: "stretch",
                textAlign: "left",
                pointerEvents: showFullscreenSlider ? "auto" : "none",
                padding: "0.75rem 1rem",
                color: "#fff",
                fontSize: "0.875rem",
                width: isHorizontal ? sideWidth : "100%",
                height: isVertical ? topBottomHeight : "100%",
                boxSizing: "border-box",
                ...captionStyle,
              }}
            >
              {captionNode}
            </div>
          )}
        </div>
      </div>
    );
  });
}