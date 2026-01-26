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

import type {
  FsCaptionPlacement,
  FullscreenOptions,
  FsCaptionRenderArgs,
} from "../fullscreen/types";
import type { ElementStyle } from "../shared/types/elements";

type RefEl<T extends HTMLElement> = React.RefObject<T | null>;

export type FullscreenIntroArgs = {
  /** Source image element that was clicked/tapped. */
  origImg: HTMLImageElement;

  /** Index of the item you’re opening fullscreen to. */
  index: number;

  /** The resolved/normalized items the fullscreen slider will use. */
  normalizedItems: any[];

  /** Current RTL state (already resolved). */
  isRtl: boolean;

  /** CSS module map (needs: fullscreenOverlay, fsOverlayCaption, open, closeBtn, leftChevron, rightChevron, counter, etc.) */
  styles: Record<string, string>;

  /** Fullscreen options (single unified source of truth). */
  fs: FullscreenOptions;

  /** Refs used by the rest of fullscreen system */
  overlayDivRef: RefEl<HTMLDivElement>;
  duplicateImgRef: RefEl<HTMLElement>;
  overlayCaptionRef: RefEl<HTMLDivElement>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  closeButtonRef: RefEl<HTMLElement>;
  counterRef: RefEl<HTMLElement>;
  leftChevronRef: RefEl<HTMLElement>;
  rightChevronRef: RefEl<HTMLElement>;

  /**
   * If you have a thumbnails container in fullscreen, pass it so we can reserve content space
   * during the intro transform.
   */
  fsThumbContainerRef?: RefEl<HTMLElement>;

  /** State toggles in your fullscreen host */
  setShowFullscreenSlider: (v: boolean) => void;
  setFsFadeOpening: (v: boolean) => void;

  /** Optional: prevent gestures / pointer leak during intro */
  addShield?: (timeoutMs?: number) => void;

  /**
   * Your existing resolver:
   * - returns final placement (or null to mean “no caption area reserved”)
   */
  resolveFsCaptionPlacement: (
    placement: any,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;

  /**
   * Used to find a “slide element” to compute cover transforms.
   * Defaults: grid/masonry -> .rmg__grid-item, slider -> .rmg__slide
   */
  closestSelector?: string;
};

function elementStyleFromCfg(
  cfg?: { className?: string; style?: React.CSSProperties } | null
): ElementStyle | undefined {
  if (!cfg) return undefined;
  const out: ElementStyle = {};
  if (cfg.className) out.className = cfg.className;
  if (cfg.style) out.style = cfg.style as any;
  return out;
}

function applyElementStyle(el: HTMLElement | null, cfg?: ElementStyle) {
  if (!el || !cfg) return;

  if (cfg.className) {
    cfg.className
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((c) => el.classList.add(c));
  }

  if (cfg.style) {
    Object.assign(el.style, cfg.style);
  }
}

function ensureButtonLike(el: HTMLElement) {
  if (el.tagName.toLowerCase() === "button") {
    (el as HTMLButtonElement).type ||= "button";
    return;
  }

  el.setAttribute("role", "button");
  el.tabIndex = 0;

  if (!el.dataset.rmgKeybind) {
    el.dataset.rmgKeybind = "1";
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        el.click();
      }
    });
  }
}

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

/**
 * Unified fullscreen intro for Slider / Grid / Masonry / Entries.
 * - Uses ONLY `fs: FullscreenOptions` for behavior.
 * - Computes clip-path + duplicate image transform intro (or fade intro).
 * - Builds close/arrows/counter elements (or uses your renderers).
 * - Optionally renders a temporary “overlay caption” during the intro.
 */
export function runFullscreenIntro(args: FullscreenIntroArgs) {
  const {
    origImg,
    index,
    normalizedItems,
    isRtl,
    styles,
    fs,
    overlayDivRef,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    closeButtonRef,
    counterRef,
    leftChevronRef,
    rightChevronRef,
    fsThumbContainerRef,
    setShowFullscreenSlider,
    setFsFadeOpening,
    addShield,
    resolveFsCaptionPlacement,
    closestSelector,
  } = args;

  if (!origImg) return;

  const DURATION_MS = fs.effects?.introDuration ?? 300;
  const EASING = fs.effects?.introEasing ?? "cubic-bezier(.4,0,.22,1)";

  addShield?.(400);

  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  const slideEl =
    (origImg.closest(
      closestSelector ??
        // sensible default:
        (closestSelector === undefined ? ".rmg__grid-item, .rmg__slide" : "")
    ) as HTMLElement) ||
    (origImg.parentElement as HTMLElement) ||
    origImg;

  const slideRect = slideEl.getBoundingClientRect();
  const imgRect = origImg.getBoundingClientRect();

  const natW = Math.max(1, origImg.naturalWidth || 0);
  const natH = Math.max(1, origImg.naturalHeight || 0);

  const insetForRect = (r: DOMRect) => {
    const top = r.top;
    const left = r.left;
    const right = vw - (r.left + r.width);
    const bottom = vh - (r.top + r.height);
    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  };

  const fit = getComputedStyle(origImg).objectFit || "cover";
  const cs0 = getComputedStyle(origImg);
  const startObjPos = parseObjectPosition(cs0?.objectPosition ?? null);

  const visibleImgRect =
    fit === "contain"
      ? objectFitContentRect(natW, natH, imgRect, "contain", startObjPos)
      : imgRect;

  const startInset = insetForRect(visibleImgRect);

  // --- Overlay (fade layer behind fullscreen) ---
  const overlay = document.createElement("div");
  overlay.className = styles.fullscreenOverlay;
  overlayDivRef.current = overlay;

  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.transition = "none";

  document.body.appendChild(overlay);
  void overlay.offsetWidth;
  overlay.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;

  // --- Reserve content area for caption + thumbnails ---
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

  const thumbPos = fs.thumbnails?.layout?.position;
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

  // --- Optional overlay caption (temporary, during intro) ---
  if (typeof fs.caption?.render === "function") {
    try {
      const overlayCaption = document.createElement("div");
      overlayCaption.className = styles.fsOverlayCaption;
      overlayCaptionRef.current = overlayCaption;

      // base styles (same as your existing versions)
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
        // if placement resolves to null, don’t reserve space; still allow overlay caption
        base.bottom = "0";
        base.left = "0";
        base.right = "0";
        base.height = "auto";
      }

      Object.assign(overlayCaption.style, base);

      // user overrides
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

  // --- Controls (close / arrows / counter) ---
  const imageCount = normalizedItems.length;

  const closeEnabled = fs.controls?.close?.enabled !== false;
  const counterEnabled = fs.controls?.counter?.enabled !== false;
  const allowFsArrows =
    fs.controls?.arrows?.enabled !== false && imageCount > 1;

  const defaultClose = () => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = styles.closeBtn;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "35");
    svg.setAttribute("height", "35");
    svg.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "white");
    path.setAttribute("stroke", "#4f4f4f");
    path.setAttribute("stroke-width", "0.5");
    path.setAttribute(
      "d",
      "M12.96 4.46l-1.42-1.42-3.54 3.55-3.54-3.55-1.42 1.42 3.55 3.54-3.55 3.54 1.42 1.42 3.54-3.55 3.54 3.55 1.42-1.42-3.55-3.54 3.55-3.54z"
    );

    svg.appendChild(path);
    btn.appendChild(svg);
    return btn;
  };

  const defaultChevron = (side: "left" | "right") => {
    const ns = "http://www.w3.org/2000/svg";
    const action =
      side === "left" ? (isRtl ? "next" : "prev") : isRtl ? "prev" : "next";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = side === "left" ? styles.leftChevron : styles.rightChevron;
    btn.dataset.action = action;
    btn.setAttribute("aria-label", action === "prev" ? "Previous" : "Next");

    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("focusable", "false");
    svg.style.display = "block";

    const poly = document.createElementNS(ns, "polygon");
    poly.setAttribute(
      "points",
      "4.586,3.414 9.172,8 4.586,12.586 6,14 12,8 6,2"
    );
    poly.setAttribute("fill", "white");
    poly.setAttribute("stroke", "#4f4f4f");
    poly.setAttribute("stroke-width", "0.5");

    if (side === "left") {
      const g = document.createElementNS(ns, "g");
      g.appendChild(poly);
      svg.appendChild(g);
    } else {
      svg.appendChild(poly);
    }

    btn.appendChild(svg);
    return btn;
  };

  const makeArrowEl = (dir: "prev" | "next", side: "left" | "right") => {
    const explicit =
      dir === "prev"
        ? typeof fs.controls?.arrows?.renderPrev === "function"
          ? fs.controls.arrows.renderPrev()
          : null
        : typeof fs.controls?.arrows?.renderNext === "function"
        ? fs.controls.arrows.renderNext()
        : null;

    if (explicit instanceof HTMLElement) return explicit;

    if (typeof fs.controls?.arrows?.render === "function") {
      const el = fs.controls.arrows.render({ dir });
      if (el instanceof HTMLElement) return el;
    }

    return defaultChevron(side);
  };

  const defaultCounter = (cur: number, total: number) => {
    const el = document.createElement("div");
    el.className = styles.counter;
    el.textContent = `${cur + 1} / ${total}`;
    return el;
  };

  const closeExplicit =
    typeof fs.controls?.close?.render === "function"
      ? fs.controls.close.render()
      : null;

  const closeBtn = closeEnabled
    ? closeExplicit instanceof HTMLElement
      ? closeExplicit
      : defaultClose()
    : null;

  if (closeBtn) {
    ensureButtonLike(closeBtn);
    if (!closeBtn.getAttribute("aria-label"))
      closeBtn.setAttribute("aria-label", "Close");
  }

  const leftAction: "prev" | "next" = isRtl ? "next" : "prev";
  const rightAction: "prev" | "next" = isRtl ? "prev" : "next";

  const leftCh = makeArrowEl(leftAction, "left");
  const rightCh = makeArrowEl(rightAction, "right");

  if (leftCh) ensureButtonLike(leftCh);
  if (rightCh) ensureButtonLike(rightCh);

  [leftCh, rightCh].forEach((btn, i) => {
    if (!btn) return;
    const action = i === 0 ? leftAction : rightAction;
    btn.dataset.action = action;
    if (!btn.getAttribute("aria-label")) {
      btn.setAttribute("aria-label", action === "prev" ? "Previous" : "Next");
    }
  });

  const ctrExplicit =
    typeof fs.controls?.counter?.render === "function"
      ? fs.controls.counter.render({ index, count: imageCount })
      : null;

  const ctr = counterEnabled
    ? ctrExplicit instanceof HTMLElement
      ? ctrExplicit
      : defaultCounter(index, imageCount)
    : null;

  // Apply style overrides
  // - arrows already use ElementStyle in your types
  // - close/counter are (style,className), so adapt them to ElementStyle
  applyElementStyle(closeBtn, elementStyleFromCfg(fs.controls?.close ?? null));
  applyElementStyle(leftCh, fs.controls?.arrows?.arrow);
  applyElementStyle(rightCh, fs.controls?.arrows?.arrow);
  applyElementStyle(leftCh, fs.controls?.arrows?.prev);
  applyElementStyle(rightCh, fs.controls?.arrows?.next);
  applyElementStyle(ctr, elementStyleFromCfg(fs.controls?.counter ?? null));

  // Ensure base classes exist for transitions
  if (leftCh) leftCh.classList.add(styles.leftChevron);
  if (rightCh) rightCh.classList.add(styles.rightChevron);

  closeButtonRef.current = closeBtn;
  leftChevronRef.current = leftCh;
  rightChevronRef.current = rightCh;
  (counterRef as any).current = ctr;

  // Mount controls into body (same pattern as your current code)
  [closeBtn, leftCh, rightCh, ctr].forEach((el) => {
    if (el) {
      el.style.display = "none";
      document.body.appendChild(el);
    }
  });

  if (closeBtn) {
    closeBtn.style.display = "block";
    closeBtn.classList.remove(styles.open);
  }

  if (leftCh) {
    leftCh.style.display = allowFsArrows ? "block" : "none";
    leftCh.classList.remove(styles.open);
  }

  if (rightCh) {
    rightCh.style.display = allowFsArrows ? "block" : "none";
    rightCh.classList.remove(styles.open);
  }

  if (ctr) {
    ctr.style.display = imageCount > 1 ? "block" : "none";
    ctr.classList.remove(styles.open);
  }

  // --- Decide fade vs clip+transform intro ---
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
    dup.src = (origImg as HTMLImageElement).currentSrc || origImg.src;

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
    // Append overlay + clipper in one go (reduces paint jitter)
    const frag = document.createDocumentFragment();
    frag.append(overlay, clipper);
    document.body.appendChild(frag);

    const startT =
      fit === "contain"
        ? containTransformForRect(natW, natH, visibleImgRect, startObjPos)
        : coverTransformForRect(natW, natH, slideRect, startObjPos);

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
      // reset to start (important if decode resolves after layout changes)
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

    const ready = (dup as any).decode
      ? (dup as HTMLImageElement).decode().catch(() => {})
      : new Promise<void>((resolve) => {
          if (dup!.complete) return resolve();
          dup!.addEventListener("load", () => resolve(), { once: true });
          dup!.addEventListener("error", () => resolve(), { once: true });
        });

    ready.then(() => startAnimation());

    // Open controls immediately (while animation runs)
    requestAnimationFrame(() => {
      const many = imageCount > 1;
      const addOpen = (el: Element) => el.classList.add(styles.open);

      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";

      if (closeBtn) addOpen(closeBtn);

      if (many) {
        if (allowFsArrows) {
          if (leftCh) addOpen(leftCh);
          if (rightCh) addOpen(rightCh);
        }
        if (ctr) addOpen(ctr);
      }
    });

    const onEnd = async (ev: TransitionEvent) => {
      if (ev.propertyName !== "transform") return;
      dup!.removeEventListener("transitionend", onEnd);

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

  // --- Fade intro path ---
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

  // cleanup overlay caption shortly after fade in
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

  // Open controls (fade path)
  requestAnimationFrame(() => {
    const many = imageCount > 1;
    const addOpen = (el: Element) => el.classList.add(styles.open);

    if (closeBtn) addOpen(closeBtn);

    if (many) {
      if (allowFsArrows) {
        if (leftCh) addOpen(leftCh);
        if (rightCh) addOpen(rightCh);
      }
      if (ctr) addOpen(ctr);
    }
  });
}

/**
 * Small helper for Slider call-sites that currently have `(e, imgRef, index)`.
 * You can keep your click handler identical and just call this factory.
 */
export function createSliderFullscreenIntroRunner(deps: Omit<
  FullscreenIntroArgs,
  "origImg" | "index"
>) {
  return function runFromSliderEvent(
    _e: React.PointerEvent<any>,
    imgRef: React.RefObject<HTMLImageElement | null>,
    index: number
  ) {
    const origImg = imgRef.current;
    if (!origImg) return;

    runFullscreenIntro({
      ...deps,
      origImg,
      index,
      closestSelector: deps.closestSelector ?? ".rmg__slide",
    });
  };
}