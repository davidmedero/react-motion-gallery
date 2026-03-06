/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot, Root } from "react-dom/client";
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

  // explicit config wins
  if (fs.effects?.introFade) return "fade";

  // slide is video -> fade
  if (isVideoSlide) return "fade";

  // if request says fade, always fade
  if (requested === "fade") return "fade";

  // if slide isn't image or no origin img, you can’t scale
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

  // void overlay.offsetWidth;
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

    // Keep your original placement math
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

  // 1) mount first
  mountOverlayOnce(overlay);

  // 2) arm transition AFTER mount + reflow
  overlay.style.transition = "none";
  void overlay.offsetWidth; // <- real reflow now that it's connected
  overlay.style.transition = `opacity ${durationMs}ms ${easing}`;

  // 3) start fade next frame
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    overlayCaptionRef.current?.classList.add(styles.open);
  });

  // 4) schedule state updates OUTSIDE render/lifecycle (no flushSync)
  //    Microtask is enough to avoid the flushSync warning.
  queueMicrotask(() => {
    setFsFadeOpening(true);
    setShowFullscreenSlider(true);

    // clear opening flag next frame (lets CSS transition run)
    requestAnimationFrame(() => setFsFadeOpening(false));
  });

  window.setTimeout(() => {
    cleanupOverlayCaption(overlayCaptionRootRef, overlayCaptionRef);
  }, durationMs + 30);
}

function runScaleIntro(args: {
  originalImage: HTMLImageElement;
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
  closestSelector?: string;
  duplicateImgRef: RefEl<HTMLElement>;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  setShowFullscreenSlider: (v: boolean) => void;
}) {
  const {
    originalImage,
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
    closestSelector,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setShowFullscreenSlider,
  } = args;

  const slideEl =
    (originalImage.closest(
      closestSelector ??
        (closestSelector === undefined ? ".rmg__grid-item, .rmg__slide" : "")
    ) as HTMLElement) ||
    (originalImage.parentElement as HTMLElement) ||
    originalImage;

  // note: slideEl is only used for your detectVideoSlide in the old code;
  // we keep it here in case you later reintroduce a scale-to-video guard.
  void slideEl;

  const imgRect = originalImage.getBoundingClientRect();

  const natW = Math.max(1, originalImage.naturalWidth || 0);
  const natH = Math.max(1, originalImage.naturalHeight || 0);

  const insetForRect = (r: DOMRect) => {
    const top = r.top;
    const left = r.left;
    const right = vw - (r.left + r.width);
    const bottom = vh - (r.top + r.height);
    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  };

  const fit = getComputedStyle(originalImage).objectFit || "cover";
  const cs0 = getComputedStyle(originalImage);
  const startObjPos = parseObjectPosition(cs0?.objectPosition ?? null);

  const visibleImgRect =
    fit === "contain"
      ? objectFitContentRect(natW, natH, imgRect, "contain", startObjPos)
      : imgRect;

  const startInset = insetForRect(visibleImgRect);

  const clipper = document.createElement("div");
  Object.assign(clipper.style, {
    position: "fixed",
    inset: "0",
    clipPath: startInset,
    willChange: "clip-path",
    transition: "none",
    zIndex: String(introZ),
  } as CSSStyleDeclaration);

  const dup = document.createElement("img");
  dup.src = originalImage.currentSrc || originalImage.src;

  Object.assign(dup.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${natW}px`,
    height: `${natH}px`,
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

  clipper.appendChild(dup);
  const frag = document.createDocumentFragment();
  frag.append(overlay, clipper);
  document.body.appendChild(frag);

  const startT =
    fit === "contain"
      ? containTransformForRect(natW, natH, visibleImgRect, startObjPos)
      : coverTransformForRect(natW, natH, imgRect, startObjPos);

  dup.style.transform =
    `translate3d(${startT.cx}px, ${startT.cy}px, 0)` +
    ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
    ` scale(${startT.scale})`;

  void dup.offsetWidth;
  void clipper.offsetWidth;

  const fitsIntrinsic = natW <= contentRect.width && natH <= contentRect.height;
  const endObjPos = { x: 0.5, y: 0.5 };

  const endT = fitsIntrinsic
    ? {
        cx: contentRect.x + contentRect.width / 2,
        cy: contentRect.y + contentRect.height / 2,
        scale: 1,
      }
    : containTransformForRect(natW, natH, contentRect, endObjPos);

  const finalTransform =
    `translate3d(${endT.cx}px, ${endT.cy}px, 0)` +
    ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
    ` scale(${endT.scale})`;

  function startAnimation() {
    // reset to start before enabling transitions (avoids weird mid-states)
    dup.style.transform =
      `translate3d(${startT.cx}px, ${startT.cy}px, 0)` +
      ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
      ` scale(${startT.scale})`;

    void dup.offsetWidth;
    void clipper.offsetWidth;
    void overlay.offsetWidth;

    clipper.style.transition = `clip-path ${durationMs}ms ${easing}`;
    dup.style.transition = `transform ${durationMs}ms ${easing}`;
    overlay.style.transition = `opacity ${durationMs}ms ${easing}`;

    requestAnimationFrame(() => {
      clipper.style.clipPath = "inset(0px 0px 0px 0px)";
      dup.style.transform = finalTransform;
      dup.style.opacity = "1";
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
      overlayCaptionRef.current?.classList.add(styles.open);
    });
  }

  let started = false;
  let startWaitTimer: number | null = null;
  const startAnimationOnce = () => {
    if (started) return;
    started = true;
    if (startWaitTimer !== null) {
      window.clearTimeout(startWaitTimer);
      startWaitTimer = null;
    }
    startAnimation();
  };

  if (dup.complete && dup.naturalWidth > 0) {
    startAnimationOnce();
  } else {
    const decodePromise =
      typeof (dup as any).decode === "function"
        ? (dup as any).decode().catch(() => {})
        : new Promise<void>(() => {});

    const loadOrErrorPromise = new Promise<void>((resolve) => {
      if (dup.complete) return resolve();
      dup.addEventListener("load", () => resolve(), { once: true });
      dup.addEventListener("error", () => resolve(), { once: true });
    });

    const timeoutPromise = new Promise<void>((resolve) => {
      startWaitTimer = window.setTimeout(() => {
        resolve();
        startAnimationOnce();
      }, maxStartWaitMs);
    });

    Promise.race([decodePromise, loadOrErrorPromise, timeoutPromise]).then(() =>
      startAnimationOnce()
    );
  }

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
      clipper.remove();
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

  // video detection: only run if we have a slide element to inspect; otherwise fallback to item-only
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
    // conservative: if item looks like video, treat as video
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

  // scale requires image; if missing, fall back to fade-ish behavior (safe)
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
    closestSelector,
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
      originalImage: imgRef.current, // can be null now; runFullscreenIntro will choose fade if needed
      index,
      closestSelector: deps.closestSelector ?? ".rmg__slide",
    });
  };
}