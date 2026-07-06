/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot, Root } from "react-dom/client";
import { findPrimaryTrackableImage } from "../shared/lazy/imageLifecycle";
import { parseObjectPosition } from "../shared/transitions/objectPosition";
import {
  containTransformForRect,
  coverTransformForRect,
  objectFitContentRect,
} from "../shared/transitions/objectFitTransform";
import type { FullscreenThumbnailSlotLayout } from "../fullscreenThumbnails/types";
import type {
  FsCaptionPlacement,
  FullscreenOptions,
  FsCaptionRenderArgs,
} from "../fullscreen/types";
import { FullscreenOpenMethod } from "../api/types";
import {
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
  ResponsiveCaptionPlacement,
  ResponsiveLength,
} from "../shared/responsive";
import { readViewportWidth } from "../shared/hooks/useViewportWidth";
import {
  resolveFullscreenIntroDurationMs,
  resolveFullscreenIntroEasing,
} from "./introTiming";
import { claimFullscreenDialogSwitch } from "./dialogSwitch";
import {
  FULLSCREEN_INTRO_MEDIA_Z_INDEX_OFFSET,
} from "./layering";
import {
  mountIntroPendingSpinner,
  shouldRenderIntroPendingSpinner,
} from "./introPendingSpinner";

type RefEl<T extends HTMLElement> = React.RefObject<T | null>;
type ObjectFitMode = "contain" | "cover";
type ObjectPosition = { x: number; y: number };
type RectTransform = { cx: number; cy: number; scale: number };
type FullscreenImageState = {
  fit: ObjectFitMode;
  objPos: ObjectPosition;
  natW: number;
  natH: number;
  rect: DOMRect;
};

type FullscreenCaptionState = {
  rect: DOMRect;
  computedStyle: CSSStyleDeclaration;
};

export type FullscreenIntroArgs = {
  originalImage: HTMLImageElement | null;
  method?: FullscreenOpenMethod;
  index: number;
  normalizedItems: any[];
  styles: Record<string, string>;
  fs: FullscreenOptions;
  overlayDivRef: RefEl<HTMLDivElement>;
  duplicateImgRef: RefEl<HTMLElement>;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  fsThumbContainerRef?: RefEl<HTMLElement>;
  fullscreenThumbnailPosition?: FullscreenThumbnailSlotLayout["position"] | null;
  setShowFullscreenSlider: (v: boolean) => void;
  setFsFadeOpening: (v: boolean) => void;
  onDialogSwitchClaim?: (durationMs: number) => void;
  addShield?: (timeoutMs?: number) => void;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
  viewportOverlay?: {
    placement?: ResponsiveCaptionPlacement;
    width?: ResponsiveLength;
    height?: ResponsiveLength;
    breakpoint?: number;
  };
  closestSelector?: string;
  baseZ?: number;
  fullscreenRootRef?: RefEl<HTMLElement>;
};

function detectVideoSlide(item: any, slideEl: HTMLElement) {
  return (
    item?.type === "video" ||
    item?.kind === "video" ||
    item?.mediaType === "video" ||
    !!item?.videoSrc ||
    !!item?.sources?.video ||
    !!item?.plyrSource ||
    !!(slideEl as any)?.dataset?.rmgVideo
  );
}

function mountOverlayOnce(overlay: HTMLDivElement) {
  if (overlay.isConnected) return;
  document.body.appendChild(overlay);
}

function resolveIntroMethod(args: {
  requested?: FullscreenOpenMethod;
  item: any;
  fs: FullscreenOptions;
  isVideoSlide: boolean;
}): "fade" | "scale" {
  const { requested, item, fs, isVideoSlide } = args;

  if (fs.effects?.introFade) return "fade";
  if (isVideoSlide) return "fade";
  if (requested === "fade") return "fade";
  if (item?.kind !== "image" && item?.type !== "image") return "fade";

  return "scale";
}

function createOverlay(
  styles: Record<string, string>,
  overlayDivRef: RefEl<HTMLDivElement>,
  durationMs: number,
  easing: string
) {
  const overlay = document.createElement("div");
  overlay.className = styles.fullscreenOverlay;
  overlayDivRef.current = overlay;

  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.transition = "none";
  overlay.style.transition = `opacity ${durationMs}ms ${easing}`;

  return overlay;
}

function queryFullscreenRoot<T extends HTMLElement>(
  root: HTMLElement | null | undefined,
  selector: string
): T | null {
  return (root ?? document).querySelector<T>(selector);
}

function clearFullscreenTrackOpacityTransition(
  fullscreenRoot?: HTMLElement | null
) {
  const track = queryFullscreenRoot<HTMLElement>(
    fullscreenRoot,
    ".fullscreen_slider"
  );
  if (!track) return;

  track.style.removeProperty("transition");
}

function forceFullscreenTrackOpacityStart(
  durationMs: number,
  easing: string,
  fullscreenRoot?: HTMLElement | null
) {
  const track = queryFullscreenRoot<HTMLElement>(
    fullscreenRoot,
    ".fullscreen_slider"
  );
  if (!track) return;

  track.style.transition = "none";
  track.style.opacity = "0";
  void track.offsetWidth;
  track.style.transition = `opacity ${durationMs}ms ${easing}`;
}

function computeContentRect(args: {
  vw: number;
  vh: number;
  fs: FullscreenOptions;
  viewportOverlay?: FullscreenIntroArgs["viewportOverlay"];
  fsThumbContainerRef?: RefEl<HTMLElement>;
  fullscreenThumbnailPosition?: FullscreenThumbnailSlotLayout["position"] | null;
  resolveFsCaptionPlacement: FullscreenIntroArgs["resolveFsCaptionPlacement"];
}) {
  const {
    vw,
    vh,
    fs,
    viewportOverlay,
    fsThumbContainerRef,
    fullscreenThumbnailPosition,
    resolveFsCaptionPlacement,
  } = args;
  const resolvedViewportWidth = effectiveViewportWidth(vw);
  const resolvedViewportHeight = effectiveViewportHeight(vh);

  const effectivePlacement = resolveFsCaptionPlacement(
    fs.caption?.placement,
    fs.caption?.breakpoint,
    resolvedViewportWidth
  );

  const DEFAULT_SIDE = 280;
  const DEFAULT_TOP_BOTTOM = 200;

  const sideWidth = resolveLengthFromResponsive(
    fs.caption?.width,
    DEFAULT_SIDE,
    resolvedViewportWidth,
    resolvedViewportWidth
  );

  const topBottomHeight = resolveLengthFromResponsive(
    fs.caption?.height,
    DEFAULT_TOP_BOTTOM,
    resolvedViewportWidth,
    resolvedViewportHeight
  );

  const explicitOverlayWidth =
    fs.caption?.width == null
      ? undefined
      : resolveLengthFromResponsive(
          fs.caption.width,
          DEFAULT_SIDE,
          resolvedViewportWidth,
          resolvedViewportWidth
        );

  const explicitOverlayHeight =
    fs.caption?.height == null
      ? undefined
      : resolveLengthFromResponsive(
          fs.caption.height,
          DEFAULT_TOP_BOTTOM,
          resolvedViewportWidth,
          resolvedViewportHeight
        );

  const effectiveViewportOverlayPlacement = resolveFsCaptionPlacement(
    viewportOverlay?.placement,
    viewportOverlay?.breakpoint,
    resolvedViewportWidth
  );

  const explicitViewportOverlayWidth =
    viewportOverlay?.width == null
      ? undefined
      : resolveLengthFromResponsive(
          viewportOverlay.width,
          DEFAULT_SIDE,
          resolvedViewportWidth,
          resolvedViewportWidth
        );

  const explicitViewportOverlayHeight =
    viewportOverlay?.height == null
      ? undefined
      : resolveLengthFromResponsive(
          viewportOverlay.height,
          DEFAULT_TOP_BOTTOM,
          resolvedViewportWidth,
          resolvedViewportHeight
        );

  let contentLeft = 0;
  let contentRight = resolvedViewportWidth;
  let contentTop = 0;
  let contentBottom = resolvedViewportHeight;

  if (fs.caption?.layout !== "overlay") {
    if (effectivePlacement === "right") contentRight = Math.max(0, resolvedViewportWidth - sideWidth);
    else if (effectivePlacement === "left") contentLeft = Math.min(resolvedViewportWidth, sideWidth);
    else if (effectivePlacement === "top") contentTop = Math.min(resolvedViewportHeight, topBottomHeight);
    else if (effectivePlacement === "bottom")
      contentBottom = Math.max(0, resolvedViewportHeight - topBottomHeight);
  } else if (explicitOverlayWidth != null || explicitOverlayHeight != null) {
    if (explicitOverlayWidth != null) {
      if (effectivePlacement === "right") contentRight = Math.max(0, resolvedViewportWidth - explicitOverlayWidth);
      else if (effectivePlacement === "left") contentLeft = Math.min(resolvedViewportWidth, explicitOverlayWidth);
    }

    if (explicitOverlayHeight != null) {
      if (effectivePlacement === "top") contentTop = Math.min(resolvedViewportHeight, explicitOverlayHeight);
      else if (effectivePlacement === "bottom")
        contentBottom = Math.max(0, resolvedViewportHeight - explicitOverlayHeight);
    }
  }

  if (explicitViewportOverlayWidth != null) {
    if (effectiveViewportOverlayPlacement === "right") {
      contentRight = Math.max(0, contentRight - explicitViewportOverlayWidth);
    } else if (effectiveViewportOverlayPlacement === "left") {
      contentLeft = Math.min(contentRight, contentLeft + explicitViewportOverlayWidth);
    }
  }

  if (explicitViewportOverlayHeight != null) {
    if (effectiveViewportOverlayPlacement === "top") {
      contentTop = Math.min(contentBottom, contentTop + explicitViewportOverlayHeight);
    } else if (effectiveViewportOverlayPlacement === "bottom") {
      contentBottom = Math.max(contentTop, contentBottom - explicitViewportOverlayHeight);
    }
  }

  const thumbPos = fullscreenThumbnailPosition ?? null;
  if (fsThumbContainerRef?.current && thumbPos) {
    const H = fsThumbContainerRef.current.offsetHeight;
    const W = fsThumbContainerRef.current.offsetWidth;

    if (thumbPos === "top") contentTop += H;
    else if (thumbPos === "bottom") contentBottom -= H;
    else if (thumbPos === "left") contentLeft += W;
    else if (thumbPos === "right") contentRight -= W;
  }

  const rect = new DOMRect(
    contentLeft,
    contentTop,
    Math.max(1, contentRight - contentLeft),
    Math.max(1, contentBottom - contentTop)
  );

  return { rect, effectivePlacement, thumbPos, sideWidth, topBottomHeight };
}

function readFullscreenDialogMediaRect(
  fullscreenRoot: HTMLElement | null
): DOMRect | null {
  if (!fullscreenRoot) return null;

  const mediaPane = fullscreenRoot.querySelector<HTMLElement>(
    '[data-rmg-fs-dialog-media="true"]'
  );
  if (!mediaPane) return null;

  const rect = mediaPane.getBoundingClientRect();
  if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return null;
  if (rect.width <= 0 || rect.height <= 0) return null;

  return new DOMRect(rect.left, rect.top, rect.width, rect.height);
}

function mountOverlayCaption(args: {
  overlay: HTMLDivElement;
  styles: Record<string, string>;
  fs: FullscreenOptions;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  normalizedItems: any[];
  index: number;
  introZ: number;
}) {
  const {
    overlay,
    styles,
    fs,
    overlayCaptionRef,
    overlayCaptionRootRef,
    normalizedItems,
    index,
    introZ,
  } = args;

  if (typeof fs.caption?.render !== "function") return;
  if (fs.caption?.layout === "overlay") return;

  try {
    const overlayCaption = document.createElement("div");
    overlayCaption.className = styles.fsOverlayCaption;
    overlayCaptionRef.current = overlayCaption;

    Object.assign(overlayCaption.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "0px",
      height: "0px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "left",
      padding: "0.75rem 1rem",
      color: "#fff",
      fontSize: "0.875rem",
      boxSizing: "border-box",
      pointerEvents: "none",
      opacity: "0",
      zIndex: String(introZ + 1),
    } satisfies Partial<CSSStyleDeclaration>);

    if (fs.caption?.className) {
      fs.caption.className
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((c) => overlayCaption.classList.add(c));
    }

    if (fs.caption?.style) {
      Object.assign(overlayCaption.style, fs.caption.style);
    }

    overlay.appendChild(overlayCaption);

    const root = createRoot(overlayCaption);
    overlayCaptionRootRef.current = root;

    const item = normalizedItems[index];
    root.render(
      <div
        data-rmg-fs-caption-content="true"
        style={{ width: "100%" }}
      >
        {fs.caption.render({ item, index, isZoomed: false } satisfies FsCaptionRenderArgs)}
      </div>
    );
  } catch (err) {
    console.error("[RMG] Failed to render overlay caption", err);
  }
}

function applyMeasuredCaptionRect(args: {
  overlayCaption: HTMLDivElement;
  captionState: FullscreenCaptionState;
}) {
  const { overlayCaption, captionState } = args;
  const { rect, computedStyle } = captionState;

  overlayCaption.style.left = `${rect.left}px`;
  overlayCaption.style.top = `${rect.top}px`;
  overlayCaption.style.width = `${rect.width}px`;
  overlayCaption.style.height = `${rect.height}px`;
  overlayCaption.style.opacity = "1";

  // Mirror a few layout-critical properties from the real caption box.
  overlayCaption.style.display = computedStyle.display;
  overlayCaption.style.alignItems = computedStyle.alignItems;
  overlayCaption.style.justifyContent = computedStyle.justifyContent;
  overlayCaption.style.padding = computedStyle.padding;
  overlayCaption.style.textAlign = computedStyle.textAlign;
  overlayCaption.style.boxSizing = computedStyle.boxSizing;
}

function cleanupOverlayCaption(
  overlayCaptionRootRef: React.RefObject<Root | null>,
  overlayCaptionRef: RefEl<HTMLDivElement>
) {
  if (overlayCaptionRootRef.current) {
    overlayCaptionRootRef.current.unmount();
    overlayCaptionRootRef.current = null;
  }
  if (overlayCaptionRef.current) {
    overlayCaptionRef.current.remove();
    overlayCaptionRef.current = null;
  }
}

function resolveObjectFitMode(
  value: string | null | undefined,
  fallback: ObjectFitMode
): ObjectFitMode {
  return value === "contain" ? "contain" : value === "cover" ? "cover" : fallback;
}

function computeRectTransform(args: {
  fit: ObjectFitMode;
  natW: number;
  natH: number;
  rect: DOMRect;
  objPos: ObjectPosition;
}) {
  const { fit, natW, natH, rect, objPos } = args;
  return fit === "cover"
    ? coverTransformForRect(natW, natH, rect, objPos)
    : containTransformForRect(natW, natH, rect, objPos);
}

function computeFallbackEndTransform(
  natW: number,
  natH: number,
  contentRect: DOMRect
): RectTransform {
  const fitsIntrinsic = natW <= contentRect.width && natH <= contentRect.height;
  const endObjPos = { x: 0.5, y: 0.5 };

  return fitsIntrinsic
    ? {
        cx: contentRect.x + contentRect.width / 2,
        cy: contentRect.y + contentRect.height / 2,
        scale: 1,
      }
    : containTransformForRect(natW, natH, contentRect, endObjPos);
}

const OPEN_PROXY_MAX_LONG_EDGE = 1024;
const OPEN_INTRO_TARGET_IMAGE_WAIT_MS = 120;

function resolveOpeningProxyRaster(args: {
  sourceNatW: number;
  sourceNatH: number;
  startRect: DOMRect;
  contentRect: DOMRect;
  targetImageState: FullscreenImageState | null;
}) {
  const {
    sourceNatW,
    sourceNatH,
    startRect,
    contentRect,
    targetImageState,
  } = args;
  const basisW = Math.max(1, targetImageState?.natW ?? sourceNatW);
  const basisH = Math.max(1, targetImageState?.natH ?? sourceNatH);
  const basisLong = Math.max(basisW, basisH);
  const targetRect = targetImageState?.rect ?? contentRect;
  const visualLong = Math.max(
    startRect.width,
    startRect.height,
    targetRect.width,
    targetRect.height,
    1
  );
  const rasterLong = Math.max(1, Math.min(visualLong, OPEN_PROXY_MAX_LONG_EDGE));
  const rasterScale = rasterLong / basisLong;

  return {
    proxyRasterW: Math.max(1, Math.round(basisW * rasterScale)),
    proxyRasterH: Math.max(1, Math.round(basisH * rasterScale)),
  };
}

function readMountedFullscreenImageState(
  index: number,
  fullscreenRoot?: HTMLElement | null
): FullscreenImageState | null {
  const targetImg = readMountedFullscreenImage(index, fullscreenRoot);

  if (!targetImg) return null;

  const rect = targetImg.getBoundingClientRect();
  const natW = readImageIntrinsicDimension(targetImg, "width");
  const natH = readImageIntrinsicDimension(targetImg, "height");

  if (rect.width <= 0 || rect.height <= 0 || natW <= 0 || natH <= 0) {
    return null;
  }

  const cs = getComputedStyle(targetImg);
  const fit = resolveObjectFitMode(cs?.objectFit, "contain");
  const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };

  return {
    fit,
    objPos,
    natW,
    natH,
    rect,
  };
}

function readPositiveNumber(value: unknown) {
  const next =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : NaN;

  return Number.isFinite(next) && next > 0 ? next : 0;
}

function readImageIntrinsicDimension(
  img: HTMLImageElement,
  dimension: "width" | "height"
) {
  const natural =
    dimension === "width" ? img.naturalWidth : img.naturalHeight;
  if (natural > 0) return natural;

  const attr = readPositiveNumber(img.getAttribute(dimension));
  if (attr > 0) return attr;

  return 0;
}

function readMountedFullscreenImage(
  index: number,
  fullscreenRoot?: HTMLElement | null
): HTMLImageElement | null {
  const targetSlide = queryFullscreenRoot<HTMLElement>(
    fullscreenRoot,
    `[data-rmg-fs-slide="true"][data-rmg-canonical-idx="${index}"][data-rmg-clone="false"]`
  );
  const targetMedia =
    targetSlide?.querySelector<HTMLElement>('[data-rmg-fs-media="true"]') ?? null;

  return findPrimaryTrackableImage(targetMedia);
}

function readMountedFullscreenCaptionState(
  index: number,
  fullscreenRoot?: HTMLElement | null
): FullscreenCaptionState | null {
  const targetSlide = queryFullscreenRoot<HTMLElement>(
    fullscreenRoot,
    `[data-rmg-fs-slide="true"][data-rmg-canonical-idx="${index}"][data-rmg-clone="false"]`
  );

  if (!targetSlide) return null;

  const captionEl =
    targetSlide.querySelector<HTMLElement>('[data-rmg-fs-caption="true"]') ??
    targetSlide.querySelector<HTMLElement>('[data-rmg-fs-caption-content="true"]')?.parentElement ??
    null;

  if (!captionEl) return null;

  const rect = captionEl.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return {
    rect,
    computedStyle: getComputedStyle(captionEl),
  };
}

function waitForMountedFullscreenCaption(
  index: number,
  maxWaitMs: number,
  fullscreenRoot?: HTMLElement | null
): Promise<FullscreenCaptionState | null> {
  const immediate = readMountedFullscreenCaptionState(index, fullscreenRoot);
  if (immediate) return Promise.resolve(immediate);
  if (maxWaitMs <= 0) return Promise.resolve(null);

  return new Promise((resolve) => {
    const startedAt = performance.now();
    let rafId = 0;
    let settled = false;

    const resolveOnce = (value: FullscreenCaptionState | null) => {
      if (settled) return;
      settled = true;
      if (rafId) cancelAnimationFrame(rafId);
      resolve(value);
    };

    const tick = () => {
      const next = readMountedFullscreenCaptionState(index, fullscreenRoot);
      if (next) {
        resolveOnce(next);
        return;
      }

      if (performance.now() - startedAt >= maxWaitMs) {
        resolveOnce(null);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });
}

function waitForMountedFullscreenImageState(
  index: number,
  maxWaitMs: number,
  fullscreenRoot?: HTMLElement | null
): Promise<FullscreenImageState | null> {
  const immediate = readMountedFullscreenImageState(index, fullscreenRoot);
  if (immediate) return Promise.resolve(immediate);
  if (maxWaitMs <= 0) return Promise.resolve(null);

  return new Promise((resolve) => {
    const startedAt =
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    let rafId = 0;
    let settled = false;

    const readNow = () =>
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
        ? performance.now()
        : Date.now();

    const resolveOnce = (value: FullscreenImageState | null) => {
      if (settled) return;
      settled = true;
      if (rafId) cancelAnimationFrame(rafId);
      resolve(value);
    };

    const tick = () => {
      const next = readMountedFullscreenImageState(index, fullscreenRoot);
      if (next) {
        resolveOnce(next);
        return;
      }

      if (readNow() - startedAt >= maxWaitMs) {
        resolveOnce(null);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });
}

function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForAnimationFrames(count: number): Promise<void> {
  const frames = Math.max(1, Math.round(count));
  for (let i = 0; i < frames; i += 1) {
    await waitForAnimationFrame();
  }
}

function isFullscreenImageHandoffReady(img: HTMLImageElement) {
  if (!img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
    return false;
  }

  const rect = img.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const style = getComputedStyle(img);
  if (style.display === "none" || style.visibility === "hidden") return false;

  const opacity = Number.parseFloat(style.opacity || "1");
  return !Number.isFinite(opacity) || opacity >= 0.98;
}

async function waitForFullscreenImageHandoff(args: {
  index: number;
  fullscreenRoot?: HTMLElement | null;
  maxWaitMs: number;
}) {
  const { index, fullscreenRoot, maxWaitMs } = args;
  const startedAt = performance.now();
  let decodeTarget: HTMLImageElement | null = null;
  let decodePromise: Promise<"resolved" | "rejected"> | null = null;
  let decodeCompletedFor: HTMLImageElement | null = null;

  while (performance.now() - startedAt < maxWaitMs) {
    const img = readMountedFullscreenImage(index, fullscreenRoot);

    if (img && isFullscreenImageHandoffReady(img)) {
      if (typeof img.decode === "function" && decodeCompletedFor !== img) {
        if (decodeTarget !== img) {
          decodeTarget = img;
          decodePromise = img.decode().then(
            () => "resolved" as const,
            () => "rejected" as const
          );
        }

        const remainingMs = Math.max(0, maxWaitMs - (performance.now() - startedAt));
        if (remainingMs > 0 && decodePromise) {
          const decodeResult = await Promise.race([
            new Promise<"timeout">((resolve) =>
              window.setTimeout(() => resolve("timeout"), remainingMs)
            ),
            decodePromise,
          ]);

          if (decodeResult === "timeout") {
            break;
          }

          decodeCompletedFor = img;
        }
      }

      await waitForAnimationFrames(2);
      return;
    }

    await waitForAnimationFrame();
  }

  await waitForAnimationFrames(2);
}

function isMountedFullscreenImageHandoffReady(
  index: number,
  fullscreenRoot?: HTMLElement | null
) {
  const img = readMountedFullscreenImage(index, fullscreenRoot);
  return !!img && isFullscreenImageHandoffReady(img);
}

function insetForViewportRect(rect: DOMRect, vw: number, vh: number) {
  const top = rect.top;
  const left = rect.left;
  const right = vw - (rect.left + rect.width);
  const bottom = vh - (rect.top + rect.height);
  return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
}

function isVisibleTopStickyNavCandidate(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;

  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number.parseFloat(style.opacity || "1") <= 0) return false;
  if (style.position !== "sticky" && style.position !== "fixed") return false;

  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false;
  if (rect.top > Math.min(window.innerHeight * 0.25, 120)) return false;

  return true;
}

function rectsOverlapOnX(a: DOMRect, b: DOMRect) {
  return Math.min(a.right, b.right) > Math.max(a.left, b.left);
}

function findStickyNav(
  selector?: string | null,
  sourceRect?: DOMRect | null
): HTMLElement | null {
  const query = selector?.trim();
  const fallbackSelectors = [
    ".rmg-intro-sticky-nav",
    '[data-rmg-intro-sticky-nav="true"]',
    'header[role="banner"]',
    "header",
  ];
  const candidates = query
    ? Array.from(document.querySelectorAll(query))
    : fallbackSelectors.flatMap((fallbackSelector) =>
        Array.from(document.querySelectorAll(fallbackSelector))
      );

  let bestMatch: HTMLElement | null = null;
  let bestBottom = -Infinity;

  for (const candidate of candidates) {
    if (!isVisibleTopStickyNavCandidate(candidate)) continue;

    const rect = candidate.getBoundingClientRect();
    if (sourceRect && !rectsOverlapOnX(rect, sourceRect)) continue;

    if (rect.bottom > bestBottom) {
      bestBottom = rect.bottom;
      bestMatch = candidate;
    }
  }

  if (bestMatch || query) {
    return bestMatch;
  }

  for (const candidate of Array.from(document.body.querySelectorAll("*"))) {
    if (!isVisibleTopStickyNavCandidate(candidate)) continue;

    const rect = candidate.getBoundingClientRect();
    if (sourceRect && !rectsOverlapOnX(rect, sourceRect)) continue;

    if (rect.bottom > bestBottom) {
      bestBottom = rect.bottom;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

function intersectRectWithTopOccluder(
  rect: DOMRect,
  occluderBottom: number
): DOMRect | null {
  const viewportHeight = Math.max(
    window.innerHeight || 0,
    document.documentElement?.clientHeight || 0
  );
  const clampedOccluderBottom = Math.min(
    Math.max(occluderBottom, 0),
    viewportHeight
  );
  const left = rect.left;
  const right = rect.right;
  const top = Math.max(rect.top, clampedOccluderBottom);
  const bottom = rect.bottom;

  if (bottom <= top || right <= left) {
    return null;
  }

  return new DOMRect(left, top, right - left, bottom - top);
}

function createViewportClipper(startInset: string, zIndex: number) {
  const clipper = document.createElement("div");
  Object.assign(clipper.style, {
    position: "fixed",
    inset: "0",
    clipPath: startInset,
    willChange: "clip-path",
    transition: "none",
    pointerEvents: "none",
    zIndex: String(zIndex),
  } as CSSStyleDeclaration);
  return clipper;
}

function clipsOverflow(style: CSSStyleDeclaration | null | undefined) {
  if (!style) return false;

  return [style.overflow, style.overflowX, style.overflowY].some((value) => {
    const normalized = value?.trim().toLowerCase() ?? "";
    return normalized === "hidden" || normalized === "clip";
  });
}

function findOverflowClipAncestorRects(
  image: HTMLImageElement,
  maxCount = 2
): DOMRect[] {
  const rects: DOMRect[] = [];
  let current = image.parentElement;

  while (
    current &&
    current !== document.body &&
    current !== document.documentElement &&
    rects.length < maxCount
  ) {
    if (clipsOverflow(getComputedStyle(current))) {
      const rect = current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.push(rect);
      }
    }

    current = current.parentElement;
  }

  return rects;
}

function runFadeIntro(args: {
  overlay: HTMLDivElement;
  fullscreenRoot?: HTMLElement | null;
  styles: Record<string, string>;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  setShowFullscreenSlider: (v: boolean) => void;
  setFsFadeOpening: (v: boolean) => void;
  durationMs: number;
  easing: string;
  onIntroStart?: () => void;
}) {
  const {
    overlay,
    fullscreenRoot,
    styles,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setShowFullscreenSlider,
    setFsFadeOpening,
    durationMs,
    easing,
    onIntroStart,
  } = args;

  mountOverlayOnce(overlay);

  overlay.style.transition = "none";
  void overlay.offsetWidth;
  overlay.style.transition = `opacity ${durationMs}ms ${easing}`;

  requestAnimationFrame(() => {
    onIntroStart?.();
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "none";
    overlayCaptionRef.current?.classList.add(styles.open);
  });

  queueMicrotask(() => {
    flushSync(() => {
      setFsFadeOpening(true);
      setShowFullscreenSlider(true);
    });

    forceFullscreenTrackOpacityStart(durationMs, easing, fullscreenRoot);

    requestAnimationFrame(() => {
      flushSync(() => setFsFadeOpening(false));
    });
  });

  window.setTimeout(() => {
    cleanupOverlayCaption(overlayCaptionRootRef, overlayCaptionRef);
  }, durationMs + 30);
}

function applyFallbackCaptionRect(args: {
  overlayCaption: HTMLDivElement;
  fs: FullscreenOptions;
  contentRect: DOMRect;
  vw: number;
  vh: number;
}) {
  const { overlayCaption, fs, contentRect, vw, vh } = args;
  const resolvedViewportWidth = effectiveViewportWidth(vw);
  const resolvedViewportHeight = effectiveViewportHeight(vh);

  const sideWidth = resolveLengthFromResponsive(
    fs.caption?.width,
    280,
    resolvedViewportWidth,
    resolvedViewportWidth
  );

  const topBottomHeight = resolveLengthFromResponsive(
    fs.caption?.height,
    200,
    resolvedViewportWidth,
    resolvedViewportHeight
  );

  const placement =
    fs.caption?.placement == null
      ? "bottom"
      : typeof fs.caption.placement === "string"
        ? fs.caption.placement
        : "bottom";

  if (placement === "right") {
    overlayCaption.style.left = `${contentRect.right}px`;
    overlayCaption.style.top = `${contentRect.top}px`;
    overlayCaption.style.width = `${sideWidth}px`;
    overlayCaption.style.height = `${contentRect.height}px`;
  } else if (placement === "left") {
    overlayCaption.style.left = `${contentRect.left - sideWidth}px`;
    overlayCaption.style.top = `${contentRect.top}px`;
    overlayCaption.style.width = `${sideWidth}px`;
    overlayCaption.style.height = `${contentRect.height}px`;
  } else if (placement === "top") {
    overlayCaption.style.left = `${contentRect.left}px`;
    overlayCaption.style.top = `${contentRect.top - topBottomHeight}px`;
    overlayCaption.style.width = `${contentRect.width}px`;
    overlayCaption.style.height = `${topBottomHeight}px`;
  } else {
    overlayCaption.style.left = `${contentRect.left}px`;
    overlayCaption.style.top = `${contentRect.bottom}px`;
    overlayCaption.style.width = `${contentRect.width}px`;
    overlayCaption.style.height = `${topBottomHeight}px`;
  }

  overlayCaption.style.opacity = "1";
}

function runScaleIntro(args: {
  originalImage: HTMLImageElement;
  index: number;
  overlay: HTMLDivElement;
  fullscreenRoot?: HTMLElement | null;
  styles: Record<string, string>;
  fs: FullscreenOptions;
  contentRect: DOMRect;
  vw: number;
  vh: number;
  introZ: number;
  durationMs: number;
  easing: string;
  duplicateImgRef: RefEl<HTMLElement>;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  setShowFullscreenSlider: (v: boolean) => void;
  onIntroStart?: () => void;
}) {
  const {
    originalImage,
    index,
    overlay,
    fullscreenRoot,
    styles,
    fs,
    contentRect,
    vw,
    vh,
    introZ,
    durationMs,
    easing,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setShowFullscreenSlider,
    onIntroStart,
  } = args;

  clearFullscreenTrackOpacityTransition(fullscreenRoot);

  const imgRect = originalImage.getBoundingClientRect();

  const sourceNatW = Math.max(1, originalImage.naturalWidth || 0);
  const sourceNatH = Math.max(1, originalImage.naturalHeight || 0);

  const fit = resolveObjectFitMode(getComputedStyle(originalImage).objectFit || "cover", "cover");
  const cs0 = getComputedStyle(originalImage);
  const startObjPos = parseObjectPosition(cs0?.objectPosition ?? null);

  const baseVisibleImgRect =
    fit === "contain"
      ? objectFitContentRect(sourceNatW, sourceNatH, imgRect, "contain", startObjPos)
      : imgRect;
  const navEl = findStickyNav(fs.effects?.introStickyNavSelector, imgRect);
  const navRect = navEl?.getBoundingClientRect();
  const occlusionAdjustedRect =
    navRect != null
      ? intersectRectWithTopOccluder(baseVisibleImgRect, navRect.bottom)
      : null;
  const startVisibleImgRect = occlusionAdjustedRect ?? baseVisibleImgRect;

  const imageClipper = createViewportClipper(
    insetForViewportRect(startVisibleImgRect, vw, vh),
    introZ
  );

  const overflowRects = findOverflowClipAncestorRects(originalImage, 2);
  const parentOverflowRect = overflowRects[0] ?? null;
  const grandparentOverflowRect = overflowRects[1] ?? null;

  const parentClipper = parentOverflowRect
    ? createViewportClipper(insetForViewportRect(parentOverflowRect, vw, vh), introZ)
    : null;

  const grandparentClipper = grandparentOverflowRect
    ? createViewportClipper(insetForViewportRect(grandparentOverflowRect, vw, vh), introZ)
    : null;

  const dup = document.createElement("img");
  dup.src = originalImage.currentSrc || originalImage.src;
  dup.decoding = "sync";
  dup.loading = "eager";

  Object.assign(dup.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${sourceNatW}px`,
    height: `${sourceNatH}px`,
    maxWidth: "none",
    maxHeight: "none",
    transformOrigin: "50% 50%",
    willChange: "transform",
    transition: "none",
    opacity: "0",
    display: "block",
    zIndex: String(introZ),
    backfaceVisibility: "hidden",
  } as CSSStyleDeclaration);

  duplicateImgRef.current = dup;

  imageClipper.appendChild(dup);

  if (parentClipper) {
    parentClipper.appendChild(imageClipper);

    if (grandparentClipper) {
      grandparentClipper.appendChild(parentClipper);
    }
  } else if (grandparentClipper) {
    grandparentClipper.appendChild(imageClipper);
  }

  const outermostClipper = grandparentClipper ?? parentClipper ?? imageClipper;

  const frag = document.createDocumentFragment();
  frag.append(overlay, outermostClipper);
  document.body.appendChild(frag);

  const applyTransform = (transform: RectTransform, natW: number, natH: number) => {
    dup.style.transform =
      `translate3d(${transform.cx}px, ${transform.cy}px, 0)` +
      ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
      ` scale(${transform.scale})`;
  };

  const computeTransforms = (targetImageState: FullscreenImageState | null) => {
    const startTransformRect = fit === "contain" ? baseVisibleImgRect : imgRect;
    const {
      proxyRasterW,
      proxyRasterH,
    } = resolveOpeningProxyRaster({
      sourceNatW,
      sourceNatH,
      startRect: startTransformRect,
      contentRect,
      targetImageState,
    });

    dup.style.width = `${proxyRasterW}px`;
    dup.style.height = `${proxyRasterH}px`;

    const startT = computeRectTransform({
      fit,
      natW: proxyRasterW,
      natH: proxyRasterH,
      rect: startTransformRect,
      objPos: startObjPos ?? { x: 0.5, y: 0.5 },
    });

    const endT = targetImageState
      ? computeRectTransform({
          fit: targetImageState.fit,
          natW: proxyRasterW,
          natH: proxyRasterH,
          rect: targetImageState.rect,
          objPos: targetImageState.objPos,
        })
      : computeFallbackEndTransform(proxyRasterW, proxyRasterH, contentRect);

    return {
      startT,
      endT,
      proxyRasterW,
      proxyRasterH,
    };
  };

  function startAnimation(targetImageState: FullscreenImageState | null) {
    onIntroStart?.();

    const {
      startT,
      endT,
      proxyRasterW,
      proxyRasterH,
    } = computeTransforms(targetImageState);

    applyTransform(startT, proxyRasterW, proxyRasterH);
    dup.style.opacity = "1";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";

    void dup.offsetWidth;
    void imageClipper.offsetWidth;
    void parentClipper?.offsetWidth;
    void grandparentClipper?.offsetWidth;
    void overlay.offsetWidth;

    requestAnimationFrame(() => {
      imageClipper.style.transition = `clip-path ${durationMs}ms ${easing}`;
      if (parentClipper) {
        parentClipper.style.transition = `clip-path ${durationMs}ms ${easing}`;
      }
      if (grandparentClipper) {
        grandparentClipper.style.transition = `clip-path ${durationMs}ms ${easing}`;
      }
      dup.style.transition = `transform ${durationMs}ms ${easing}`;
      overlay.style.transition = `opacity ${durationMs}ms ${easing}`;

      requestAnimationFrame(() => {
        imageClipper.style.clipPath = "inset(0px 0px 0px 0px)";
        if (parentClipper) {
          parentClipper.style.clipPath = "inset(0px 0px 0px 0px)";
        }
        if (grandparentClipper) {
          grandparentClipper.style.clipPath = "inset(0px 0px 0px 0px)";
        }
        applyTransform(endT, proxyRasterW, proxyRasterH);
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "none";
      });
    });
  }

  let started = false;

  const startAnimationOnce = (targetImageState: FullscreenImageState | null) => {
    if (started) return;
    started = true;
    startAnimation(targetImageState);
  };

  const fullscreenCaptionPromise = waitForMountedFullscreenCaption(
    index,
    120,
    fullscreenRoot
  );
  const fullscreenImageStatePromise = waitForMountedFullscreenImageState(
    index,
    OPEN_INTRO_TARGET_IMAGE_WAIT_MS,
    fullscreenRoot
  );

  void fullscreenImageStatePromise.then((targetImageState) => {
    startAnimationOnce(targetImageState);
  });

  void fullscreenCaptionPromise.then((captionState) => {
    requestAnimationFrame(() => {
      const liveOverlayCaption = overlayCaptionRef.current;
      if (!liveOverlayCaption) return;

      if (captionState) {
        applyMeasuredCaptionRect({
          overlayCaption: liveOverlayCaption,
          captionState,
        });
      } else {
        applyFallbackCaptionRect({
          overlayCaption: liveOverlayCaption,
          fs,
          contentRect,
          vw,
          vh,
        });
      }

      liveOverlayCaption.classList.add(styles.open);
    });
  });

  const onEnd = async (ev: TransitionEvent) => {
    if (ev.propertyName !== "transform") return;
    dup.removeEventListener("transitionend", onEnd);

    await waitForAnimationFrames(2);

    clearFullscreenTrackOpacityTransition(fullscreenRoot);
    flushSync(() => setShowFullscreenSlider(true));

    await waitForFullscreenImageHandoff({
      index,
      fullscreenRoot,
      maxWaitMs: Math.max(300, Math.min(1000, durationMs + 500)),
    });

    requestAnimationFrame(() => {
      cleanupOverlayCaption(overlayCaptionRootRef, overlayCaptionRef);
      outermostClipper.remove();
      dup.remove();
      (duplicateImgRef as any).current = null;
    });
  };

  dup.addEventListener("transitionend", onEnd, { once: true });
}

export function runFullscreenIntro(args: FullscreenIntroArgs) {
  const {
    originalImage,
    method: requestedMethod,
    index,
    normalizedItems,
    styles,
    fs,
    overlayDivRef,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    fsThumbContainerRef,
    fullscreenThumbnailPosition,
    setShowFullscreenSlider,
    setFsFadeOpening,
    onDialogSwitchClaim,
    addShield,
    resolveFsCaptionPlacement,
    viewportOverlay,
    closestSelector,
    baseZ,
    fullscreenRootRef,
  } = args;

  const item = normalizedItems[index];

  const computedBaseZ = baseZ ?? 9999;
  const INTRO_DUP_Z = computedBaseZ + FULLSCREEN_INTRO_MEDIA_Z_INDEX_OFFSET;
  const fullscreenRoot = fullscreenRootRef?.current ?? null;

  const transformDurationMs = resolveFullscreenIntroDurationMs(
    fs.effects?.introDuration,
    "transform"
  );
  const transformEasing = resolveFullscreenIntroEasing(
    fs.effects?.introEasing,
    "transform"
  );
  const fadeDurationMs = resolveFullscreenIntroDurationMs(
    fs.effects?.introDuration,
    "fade"
  );
  const fadeEasing = resolveFullscreenIntroEasing(
    fs.effects?.introEasing,
    "fade"
  );

  const dialogSwitch = claimFullscreenDialogSwitch();
  if (dialogSwitch) {
    onDialogSwitchClaim?.(dialogSwitch.durationMs);

    if (dialogSwitch.overlay?.isConnected) {
      overlayDivRef.current = dialogSwitch.overlay;
    }

    setFsFadeOpening(false);
    setShowFullscreenSlider(true);
    return;
  }

  addShield?.(400);

  const vw = readViewportWidth();
  const vh = window.innerHeight;

  let isVideoSlide = false;
  if (originalImage) {
    const slideEl =
      (originalImage.closest(
        closestSelector ??
          (closestSelector === undefined
            ? ".rmg__grid-item, .rmg__masonry-item, .rmg__slide"
            : "")
      ) as HTMLElement) ||
      (originalImage.parentElement as HTMLElement) ||
      originalImage;

    isVideoSlide = detectVideoSlide(item, slideEl);
  } else {
    isVideoSlide =
      item?.type === "video" || item?.kind === "video" || item?.mediaType === "video";
  }

  const introMethod = resolveIntroMethod({
    requested: requestedMethod,
    item,
    fs,
    isVideoSlide,
  });

  const willRunScaleIntro = introMethod === "scale" && !!originalImage;
  const overlay = createOverlay(
    styles,
    overlayDivRef,
    willRunScaleIntro ? transformDurationMs : fadeDurationMs,
    willRunScaleIntro ? transformEasing : fadeEasing
  );

  overlay.style.setProperty("--rmg-fs-z", String(computedBaseZ));

  const computedContentRect = computeContentRect({
    vw,
    vh,
    fs,
    viewportOverlay,
    fsThumbContainerRef,
    fullscreenThumbnailPosition,
    resolveFsCaptionPlacement,
  }).rect;

  const dialogContentRect =
    fs.dialog && fs.dialog.enabled !== false
      ? readFullscreenDialogMediaRect(fullscreenRoot)
      : null;
  const contentRect = dialogContentRect ?? computedContentRect;

  const introPendingSpinnerHandle =
    fs.mountStrategy === "open"
      ? undefined
      : mountIntroPendingSpinner({
          styles,
          contentRect,
          enabled:
            !isMountedFullscreenImageHandoffReady(index, fullscreenRoot) &&
            shouldRenderIntroPendingSpinner({ fs, isVideoSlide }),
        });
  const hideIntroPendingSpinner = () => {
    introPendingSpinnerHandle?.hide();
  };

  mountOverlayCaption({
    overlay,
    styles,
    fs,
    overlayCaptionRef,
    overlayCaptionRootRef,
    normalizedItems,
    index,
    introZ: INTRO_DUP_Z,
  });

  if (introMethod === "fade") {
    runFadeIntro({
      overlay,
      fullscreenRoot,
      styles,
      overlayCaptionRef,
      overlayCaptionRootRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      durationMs: fadeDurationMs,
      easing: fadeEasing,
      onIntroStart: hideIntroPendingSpinner,
    });
    return;
  }

  if (!originalImage) {
    runFadeIntro({
      overlay,
      fullscreenRoot,
      styles,
      overlayCaptionRef,
      overlayCaptionRootRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      durationMs: fadeDurationMs,
      easing: fadeEasing,
      onIntroStart: hideIntroPendingSpinner,
    });
    return;
  }

  runScaleIntro({
    originalImage,
    index,
    overlay,
    fullscreenRoot,
    styles,
    fs,
    contentRect,
    vw,
    vh,
    introZ: INTRO_DUP_Z,
    durationMs: transformDurationMs,
    easing: transformEasing,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setShowFullscreenSlider,
    onIntroStart: hideIntroPendingSpinner,
  });
}

export function createSliderFullscreenIntroRunner(
  deps: Omit<FullscreenIntroArgs, "originalImage" | "index">
) {
  return function runFromSliderEvent(
    _e: React.PointerEvent<any>,
    imgRef: React.RefObject<HTMLImageElement | null>,
    index: number
  ) {
    runFullscreenIntro({
      ...deps,
      originalImage: imgRef.current,
      index,
      closestSelector: deps.closestSelector ?? ".rmg__slide",
    });
  };
}
