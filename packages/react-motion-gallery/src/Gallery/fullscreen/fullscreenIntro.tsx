/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
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
  addShield?: (timeoutMs?: number) => void;
  resolveFsCaptionPlacement: (
    placement: any,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
  closestSelector?: string;
  baseZ?: number;
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
  originImg: HTMLImageElement | null;
  isVideoSlide: boolean;
}): "fade" | "scale" {
  const { requested, item, fs, originImg, isVideoSlide } = args;

  if (fs.effects?.introFade) return "fade";

  if (isVideoSlide) return "fade";

  if (requested === "fade") return "fade";

  if (!originImg) return "fade";
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

function computeContentRect(args: {
  vw: number;
  vh: number;
  fs: FullscreenOptions;
  fsThumbContainerRef?: RefEl<HTMLElement>;
  fullscreenThumbnailPosition?: FullscreenThumbnailSlotLayout["position"] | null;
  resolveFsCaptionPlacement: FullscreenIntroArgs["resolveFsCaptionPlacement"];
}) {
  const {
    vw,
    vh,
    fs,
    fsThumbContainerRef,
    fullscreenThumbnailPosition,
    resolveFsCaptionPlacement,
  } = args;

  const effectivePlacement = resolveFsCaptionPlacement(
    fs.caption?.placement,
    fs.caption?.breakpoint,
    vw
  );

  const DEFAULT_SIDE = 280;
  const DEFAULT_TOP_BOTTOM = 200;

  const sideWidth = fs.caption?.width ?? DEFAULT_SIDE;
  const topBottomHeight = fs.caption?.height ?? DEFAULT_TOP_BOTTOM;

  let contentLeft = 0;
  let contentRight = vw;
  let contentTop = 0;
  let contentBottom = vh;

  if (effectivePlacement === "right") contentRight = Math.max(0, vw - sideWidth);
  else if (effectivePlacement === "left")
    contentLeft = Math.min(vw, sideWidth);
  else if (effectivePlacement === "top")
    contentTop = Math.min(vh, topBottomHeight);
  else if (effectivePlacement === "bottom")
    contentBottom = Math.max(0, vh - topBottomHeight);

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

function mountOverlayCaption(args: {
  overlay: HTMLDivElement;
  styles: Record<string, string>;
  fs: FullscreenOptions;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  normalizedItems: any[];
  index: number;
  introZ: number;
  viewport: { vw: number; vh: number };
  effectivePlacement: FsCaptionPlacement | null;
  thumbPos: FullscreenThumbnailSlotLayout["position"] | null;
  sideWidth: number;
  topBottomHeight: number;
  contentRect: DOMRect;
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
    viewport,
    effectivePlacement,
    thumbPos,
    sideWidth,
    topBottomHeight,
    contentRect,
  } = args;

  if (typeof fs.caption?.render !== "function") return;

  try {
    const overlayCaption = document.createElement("div");
    overlayCaption.className = styles.fsOverlayCaption;
    overlayCaptionRef.current = overlayCaption;

    const { vw, vh } = viewport;

    const base: Partial<CSSStyleDeclaration> = {
      position: "fixed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "left",
      padding: "0.75rem 1rem",
      color: "#fff",
      fontSize: "0.875rem",
      boxSizing: "border-box",
      pointerEvents: "none",
      transition:
        "opacity 220ms cubic-bezier(.4,0,.22,1), transform 220ms cubic-bezier(.4,0,.22,1)",
      zIndex: String(introZ + 1),
    };

    const contentLeft = contentRect.x;
    const contentRight = contentRect.x + contentRect.width;
    const contentTop = contentRect.y;
    const contentBottom = contentRect.y + contentRect.height;

    if (effectivePlacement === "right") {
      base.top = thumbPos === "top" ? `${contentTop}px` : "0";
      base.bottom = "0";
      base.left = `${contentRight}px`;
      base.width = `${sideWidth}px`;
      base.height = thumbPos === "bottom" ? `${contentBottom}px` : "auto";
    } else if (effectivePlacement === "left") {
      base.top = thumbPos === "top" ? `${contentTop}px` : "0";
      base.bottom = "0";
      base.left = "0";
      base.width = `${sideWidth}px`;
      base.height = thumbPos === "bottom" ? `${contentBottom}px` : "auto";
    } else if (effectivePlacement === "top") {
      base.top = `${Math.max(0, contentTop - topBottomHeight)}px`;
      base.left = `${contentLeft}px`;
      base.right = `${Math.max(0, vw - contentRight)}px`;
      base.height = `${topBottomHeight}px`;
    } else if (effectivePlacement === "bottom") {
      const bottomOffset = Math.max(0, vh - contentBottom - topBottomHeight);
      base.bottom = `${bottomOffset}px`;
      base.left = `${contentLeft}px`;
      base.right = `${Math.max(0, vw - contentRight)}px`;
      base.height = `${topBottomHeight}px`;
    } else {
      base.bottom = "0";
      base.left = "0";
      base.right = "0";
      base.height = "auto";
    }

    Object.assign(overlayCaption.style, base);

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
      <>{fs.caption.render({ item, index, isZoomed: false } satisfies FsCaptionRenderArgs)}</>
    );
  } catch (err) {
    console.error("[RMG] Failed to render overlay caption", err);
  }
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

function computeFallbackEndTransform(natW: number, natH: number, contentRect: DOMRect): RectTransform {
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

function readMountedFullscreenImageState(index: number): FullscreenImageState | null {
  const targetSlide = document.querySelector<HTMLElement>(
    `[data-rmg-fs-slide="true"][data-rmg-canonical-idx="${index}"][data-rmg-clone="false"]`
  );
  const targetMedia =
    targetSlide?.querySelector<HTMLElement>('[data-rmg-fs-media="true"]') ?? null;
  const targetImg = findPrimaryTrackableImage(targetMedia);

  if (!targetImg) return null;

  const rect = targetImg.getBoundingClientRect();
  const natW = targetImg.naturalWidth || 0;
  const natH = targetImg.naturalHeight || 0;

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

function waitForMountedFullscreenImage(
  index: number,
  maxWaitMs: number
): Promise<FullscreenImageState | null> {
  const immediate = readMountedFullscreenImageState(index);
  if (immediate) return Promise.resolve(immediate);
  if (maxWaitMs <= 0) return Promise.resolve(null);

  return new Promise((resolve) => {
    const startedAt = performance.now();
    let rafId = 0;
    let settled = false;

    const resolveOnce = (value: FullscreenImageState | null) => {
      if (settled) return;
      settled = true;
      if (rafId) cancelAnimationFrame(rafId);
      resolve(value);
    };

    const tick = () => {
      const next = readMountedFullscreenImageState(index);
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

function waitForImageStartReady(img: HTMLImageElement): Promise<void> {
  if (img.complete) return Promise.resolve();

  const loadOrErrorPromise = new Promise<void>((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });

  const decode =
    typeof (img as HTMLImageElement & { decode?: () => Promise<void> }).decode === "function"
      ? (img as HTMLImageElement & { decode: () => Promise<void> }).decode().catch(() => {})
      : null;

  return decode ? Promise.race([loadOrErrorPromise, decode]) : loadOrErrorPromise;
}

function insetForViewportRect(rect: DOMRect, vw: number, vh: number) {
  const top = rect.top;
  const left = rect.left;
  const right = vw - (rect.left + rect.width);
  const bottom = vh - (rect.top + rect.height);
  return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
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

function findClosestOverflowClipParentRect(image: HTMLImageElement) {
  let current = image.parentElement;

  while (current && current !== document.body && current !== document.documentElement) {
    if (clipsOverflow(getComputedStyle(current))) {
      const rect = current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return rect;
    }

    current = current.parentElement;
  }

  return null;
}

function runFadeIntro(args: {
  overlay: HTMLDivElement;
  styles: Record<string, string>;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  setShowFullscreenSlider: (v: boolean) => void;
  setFsFadeOpening: (v: boolean) => void;
  durationMs: number;
  easing: string;
}) {
  const {
    overlay,
    styles,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setShowFullscreenSlider,
    setFsFadeOpening,
    durationMs,
    easing,
  } = args;

  mountOverlayOnce(overlay);

  overlay.style.transition = "none";
  void overlay.offsetWidth;
  overlay.style.transition = `opacity ${durationMs}ms ${easing}`;

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    overlayCaptionRef.current?.classList.add(styles.open);
  });

  queueMicrotask(() => {
    setFsFadeOpening(true);
    setShowFullscreenSlider(true);

    requestAnimationFrame(() => setFsFadeOpening(false));
  });

  window.setTimeout(() => {
    cleanupOverlayCaption(overlayCaptionRootRef, overlayCaptionRef);
  }, durationMs + 30);
}

function runScaleIntro(args: {
  originalImage: HTMLImageElement;
  index: number;
  overlay: HTMLDivElement;
  styles: Record<string, string>;
  fs: FullscreenOptions;
  contentRect: DOMRect;
  vw: number;
  vh: number;
  introZ: number;
  durationMs: number;
  easing: string;
  maxStartWaitMs: number;
  duplicateImgRef: RefEl<HTMLElement>;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  setShowFullscreenSlider: (v: boolean) => void;
}) {
  const {
    originalImage,
    index,
    overlay,
    styles,
    fs,
    contentRect,
    vw,
    vh,
    introZ,
    durationMs,
    easing,
    maxStartWaitMs,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setShowFullscreenSlider,
  } = args;

  const imgRect = originalImage.getBoundingClientRect();

  const sourceNatW = Math.max(1, originalImage.naturalWidth || 0);
  const sourceNatH = Math.max(1, originalImage.naturalHeight || 0);

  const fit = resolveObjectFitMode(getComputedStyle(originalImage).objectFit || "cover", "cover");
  const cs0 = getComputedStyle(originalImage);
  const startObjPos = parseObjectPosition(cs0?.objectPosition ?? null);

  const visibleImgRect =
    fit === "contain"
      ? objectFitContentRect(sourceNatW, sourceNatH, imgRect, "contain", startObjPos)
      : imgRect;

  const imageClipper = createViewportClipper(
    insetForViewportRect(visibleImgRect, vw, vh),
    introZ
  );
  const overflowClipParentRect = findClosestOverflowClipParentRect(originalImage);
  const parentClipper = overflowClipParentRect
    ? createViewportClipper(insetForViewportRect(overflowClipParentRect, vw, vh), introZ)
    : null;
  const clipperRoot = parentClipper ?? imageClipper;

  const dup = document.createElement("img");
  dup.src = originalImage.currentSrc || originalImage.src;

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
  } as CSSStyleDeclaration);

  duplicateImgRef.current = dup;

  imageClipper.appendChild(dup);
  parentClipper?.appendChild(imageClipper);
  const frag = document.createDocumentFragment();
  frag.append(overlay, clipperRoot);
  document.body.appendChild(frag);

  const applyTransform = (transform: RectTransform, natW: number, natH: number) => {
    dup.style.transform =
      `translate3d(${transform.cx}px, ${transform.cy}px, 0)` +
      ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
      ` scale(${transform.scale})`;
  };

  const computeTransforms = (targetImageState: FullscreenImageState | null) => {
    const proxyNatW = targetImageState?.natW ?? sourceNatW;
    const proxyNatH = targetImageState?.natH ?? sourceNatH;

    dup.style.width = `${proxyNatW}px`;
    dup.style.height = `${proxyNatH}px`;

    const startT = computeRectTransform({
      fit,
      natW: proxyNatW,
      natH: proxyNatH,
      rect: fit === "contain" ? visibleImgRect : imgRect,
      objPos: startObjPos ?? { x: 0.5, y: 0.5 },
    });

    const endT = targetImageState
      ? computeRectTransform({
          fit: targetImageState.fit,
          natW: targetImageState.natW,
          natH: targetImageState.natH,
          rect: targetImageState.rect,
          objPos: targetImageState.objPos,
        })
      : computeFallbackEndTransform(proxyNatW, proxyNatH, contentRect);

    return { startT, endT, proxyNatW, proxyNatH };
  };

  function startAnimation(targetImageState: FullscreenImageState | null) {
    const { startT, endT, proxyNatW, proxyNatH } = computeTransforms(targetImageState);

    applyTransform(startT, proxyNatW, proxyNatH);

    void dup.offsetWidth;
    void imageClipper.offsetWidth;
    void parentClipper?.offsetWidth;
    void overlay.offsetWidth;

    imageClipper.style.transition = `clip-path ${durationMs}ms ${easing}`;
    if (parentClipper) {
      parentClipper.style.transition = `clip-path ${durationMs}ms ${easing}`;
    }
    dup.style.transition = `transform ${durationMs}ms ${easing}`;
    overlay.style.transition = `opacity ${durationMs}ms ${easing}`;

    requestAnimationFrame(() => {
      imageClipper.style.clipPath = "inset(0px 0px 0px 0px)";
      if (parentClipper) {
        parentClipper.style.clipPath = "inset(0px 0px 0px 0px)";
      }
      applyTransform(endT, proxyNatW, proxyNatH);
      dup.style.opacity = "1";
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
      overlayCaptionRef.current?.classList.add(styles.open);
    });
  }

  let started = false;
  let startWaitTimer: number | null = null;
  const startAnimationOnce = (targetImageState: FullscreenImageState | null) => {
    if (started) return;
    started = true;
    if (startWaitTimer !== null) {
      window.clearTimeout(startWaitTimer);
      startWaitTimer = null;
    }
    startAnimation(targetImageState);
  };

  const startReadyPromise = waitForImageStartReady(dup);
  const fullscreenImagePromise = waitForMountedFullscreenImage(index, maxStartWaitMs);
  const timeoutPromise = new Promise<FullscreenImageState | null>((resolve) => {
    startWaitTimer = window.setTimeout(() => resolve(null), maxStartWaitMs);
  });

  Promise.race([
    Promise.all([startReadyPromise, fullscreenImagePromise]).then(([, targetImageState]) => targetImageState),
    timeoutPromise,
  ]).then((targetImageState) => startAnimationOnce(targetImageState));

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
  });

  const onEnd = async (ev: TransitionEvent) => {
    if (ev.propertyName !== "transform") return;
    dup.removeEventListener("transitionend", onEnd);
    if (startWaitTimer !== null) {
      window.clearTimeout(startWaitTimer);
      startWaitTimer = null;
    }

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    setShowFullscreenSlider(true);

    requestAnimationFrame(() => {
      cleanupOverlayCaption(overlayCaptionRootRef, overlayCaptionRef);
      clipperRoot.remove();
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
    addShield,
    resolveFsCaptionPlacement,
    closestSelector,
    baseZ,
  } = args;

  const item = normalizedItems[index];

  const computedBaseZ = baseZ ?? 9999;
  const INTRO_DUP_Z = computedBaseZ - 1;

  const DURATION_MS = fs.effects?.introDuration ?? 300;
  const EASING = fs.effects?.introEasing ?? "cubic-bezier(.4,0,.22,1)";
  const INTRO_START_MAX_WAIT_MS = 120;

  addShield?.(400);

  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  let isVideoSlide = false;
  if (originalImage) {
    const slideEl =
      (originalImage.closest(
        closestSelector ??
          (closestSelector === undefined ? ".rmg__grid-item, .rmg__slide" : "")
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
    originImg: originalImage,
    isVideoSlide,
  });

  const overlay = createOverlay(styles, overlayDivRef, DURATION_MS, EASING);

  const {
    rect: contentRect,
    effectivePlacement,
    thumbPos,
    sideWidth,
    topBottomHeight,
  } = computeContentRect({
    vw,
    vh,
    fs,
    fsThumbContainerRef,
    fullscreenThumbnailPosition,
    resolveFsCaptionPlacement,
  });

  mountOverlayCaption({
    overlay,
    styles,
    fs,
    overlayCaptionRef,
    overlayCaptionRootRef,
    normalizedItems,
    index,
    introZ: INTRO_DUP_Z,
    viewport: { vw, vh },
    effectivePlacement,
    thumbPos,
    sideWidth,
    topBottomHeight,
    contentRect,
  });

  if (introMethod === "fade") {
    runFadeIntro({
      overlay,
      styles,
      overlayCaptionRef,
      overlayCaptionRootRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      durationMs: DURATION_MS,
      easing: EASING,
    });
    return;
  }

  if (!originalImage) {
    runFadeIntro({
      overlay,
      styles,
      overlayCaptionRef,
      overlayCaptionRootRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      durationMs: DURATION_MS,
      easing: EASING,
    });
    return;
  }

  runScaleIntro({
    originalImage,
    index,
    overlay,
    styles,
    fs,
    contentRect,
    vw,
    vh,
    introZ: INTRO_DUP_Z,
    durationMs: DURATION_MS,
    easing: EASING,
    maxStartWaitMs: INTRO_START_MAX_WAIT_MS,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setShowFullscreenSlider,
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
