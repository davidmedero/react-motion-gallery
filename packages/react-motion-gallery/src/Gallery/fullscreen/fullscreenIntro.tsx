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

type RefEl<T extends HTMLElement> = React.RefObject<T | null>;

export type FullscreenIntroArgs = {
  originalImage: HTMLImageElement;
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

export function runFullscreenIntro(args: FullscreenIntroArgs) {
  const {
    originalImage,
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
  } = args;

  if (!originalImage) return;

  const DURATION_MS = fs.effects?.introDuration ?? 300;
  const EASING = fs.effects?.introEasing ?? "cubic-bezier(.4,0,.22,1)";
  const INTRO_START_MAX_WAIT_MS = 120;

  addShield?.(400);

  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  const slideEl =
    (originalImage.closest(
      closestSelector ??
        (closestSelector === undefined ? ".rmg__grid-item, .rmg__slide" : "")
    ) as HTMLElement) ||
    (originalImage.parentElement as HTMLElement) ||
    originalImage;

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

  const overlay = document.createElement("div");
  overlay.className = styles.fullscreenOverlay;
  overlayDivRef.current = overlay;

  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.transition = "none";

  void overlay.offsetWidth;
  overlay.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;

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

  if (effectivePlacement === "right") {
    contentRight = Math.max(0, vw - sideWidth);
  } else if (effectivePlacement === "left") {
    contentLeft = Math.min(vw, sideWidth);
  } else if (effectivePlacement === "top") {
    contentTop = Math.min(vh, topBottomHeight);
  } else if (effectivePlacement === "bottom") {
    contentBottom = Math.max(0, vh - topBottomHeight);
  }

  const thumbPos = fullscreenThumbnailPosition;
  if (fsThumbContainerRef?.current && thumbPos) {
    const H = fsThumbContainerRef.current.offsetHeight;
    const W = fsThumbContainerRef.current.offsetWidth;

    if (thumbPos === "top") contentTop += H;
    else if (thumbPos === "bottom") contentBottom -= H;
    else if (thumbPos === "left") contentLeft += W;
    else if (thumbPos === "right") contentRight -= W;
  }

  const contentRect = new DOMRect(
    contentLeft,
    contentTop,
    Math.max(1, contentRight - contentLeft),
    Math.max(1, contentBottom - contentTop)
  );

  if (typeof fs.caption?.render === "function") {
    try {
      const overlayCaption = document.createElement("div");
      overlayCaption.className = styles.fsOverlayCaption;
      overlayCaptionRef.current = overlayCaption;

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
        zIndex: "9999",
      };

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
        const bottomOffset = Math.max(
          0,
          vh - contentBottom - topBottomHeight
        );
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
      const captionNode = fs.caption.render({
        item,
        index,
        isZoomed: false,
      } satisfies FsCaptionRenderArgs);

      root.render(<>{captionNode}</>);
    } catch (err) {
      console.error("[RMG] Failed to render overlay caption", err);
    }
  }

  const item = normalizedItems[index];
  const isVideoSlide = detectVideoSlide(item, slideEl);
  const forceFadeIntro = !!fs.effects?.introFade || isVideoSlide;

  let clipper: HTMLDivElement | null = null;
  let dup: HTMLImageElement | null = null;

  if (!forceFadeIntro) {
    clipper = document.createElement("div");
    Object.assign(clipper.style, {
      position: "fixed",
      inset: "0",
      clipPath: startInset,
      willChange: "clip-path",
      transition: "none",
      zIndex: "9998",
    } as CSSStyleDeclaration);

    dup = document.createElement("img");
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
      zIndex: "9998",
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
      dup!.style.transform =
        `translate3d(${startT.cx}px, ${startT.cy}px, 0)` +
        ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
        ` scale(${startT.scale})`;

      void dup!.offsetWidth;
      void clipper!.offsetWidth;
      void overlay.offsetWidth;

      clipper!.style.transition = `clip-path ${DURATION_MS}ms ${EASING}`;
      dup!.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
      overlay.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;

      requestAnimationFrame(() => {
        clipper!.style.clipPath = "inset(0px 0px 0px 0px)";
        dup!.style.transform = finalTransform;
        dup!.style.opacity = "1";
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        if (overlayCaptionRef.current) {
          overlayCaptionRef.current.classList.add(styles.open);
        }
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

    if (dup!.complete && dup!.naturalWidth > 0) {
      startAnimationOnce();
    } else {
      const decodePromise =
        typeof dup!.decode === "function"
          ? dup!.decode().catch(() => {})
          : new Promise<void>(() => {});

      const loadOrErrorPromise = new Promise<void>((resolve) => {
        if (dup!.complete) return resolve();
        dup!.addEventListener("load", () => resolve(), { once: true });
        dup!.addEventListener("error", () => resolve(), { once: true });
      });

      const timeoutPromise = new Promise<void>((resolve) => {
        startWaitTimer = window.setTimeout(() => {
          resolve();
          startAnimationOnce();
        }, INTRO_START_MAX_WAIT_MS);
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
      dup!.removeEventListener("transitionend", onEnd);
      if (startWaitTimer !== null) {
        window.clearTimeout(startWaitTimer);
        startWaitTimer = null;
      }

      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );

      setShowFullscreenSlider(true);

      requestAnimationFrame(() => {
        if (overlayCaptionRootRef.current) {
          overlayCaptionRootRef.current.unmount();
          overlayCaptionRootRef.current = null;
        }
        if (overlayCaptionRef.current) {
          overlayCaptionRef.current.remove();
          overlayCaptionRef.current = null;
        }
        clipper!.remove();
        dup!.remove();
        (duplicateImgRef as any).current = null;
      });
    };

    dup.addEventListener("transitionend", onEnd, { once: true });
    return;
  }

  mountOverlayOnce(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    if (overlayCaptionRef.current) {
      overlayCaptionRef.current.classList.add(styles.open);
    }
  });

  flushSync(() => {
    setShowFullscreenSlider(true);
    setFsFadeOpening(true);
  });

  requestAnimationFrame(() => {
    setFsFadeOpening(false);
  });

  window.setTimeout(() => {
    if (overlayCaptionRootRef.current) {
      overlayCaptionRootRef.current.unmount();
      overlayCaptionRootRef.current = null;
    }
    if (overlayCaptionRef.current) {
      overlayCaptionRef.current.remove();
      overlayCaptionRef.current = null;
    }
  }, DURATION_MS + 30);
}

export function createSliderFullscreenIntroRunner(deps: Omit<
  FullscreenIntroArgs,
  "originalImage" | "index"
>) {
  return function runFromSliderEvent(
    _e: React.PointerEvent<any>,
    imgRef: React.RefObject<HTMLImageElement | null>,
    index: number
  ) {
    const originalImage = imgRef.current;
    if (!originalImage) return;

    runFullscreenIntro({
      ...deps,
      originalImage,
      index,
      closestSelector: deps.closestSelector ?? ".rmg__slide",
    });
  };
}
