/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useLayoutEffect,
} from 'react'
import type { FullscreenSliderSub } from './fullscreenSliderSub'
import { parseObjectPosition } from '../shared/transitions/objectPosition';
import { containTransformForRect, coverTransformForRect, objectFitContentRect } from '../shared/transitions/objectFitTransform';
import { MediaItem } from '../shared/types/media';
import { FullscreenOpenMethod, IndexMode } from '../api/types';
import { MediaEntryLink } from '../entries';
import {
  FullscreenCloseScrollOptions,
  FullscreenCloseScrollTiming,
  FullscreenIntroPathTiming,
  FullscreenMobileDetectionContext,
  FullscreenOptions,
} from './types';
import { DefaultCloseIcon } from './controls/DefaultCloseIcon';
import { DefaultCounterText } from './controls/DefaultCounterText';
import { scrollEntrySectionIntoView, waitForEntryOwnerReady, isEntryOwnerReady } from './entryOwnerReady';
import { getPrimaryImgEl } from '../zoomPan/core/dom';
import {
  resolveFullscreenIntroDurationMs,
  resolveFullscreenIntroEasing,
} from './introTiming';

interface FullscreenModalProps {
  fsSub: FullscreenSliderSub
  open: boolean
  onClose: () => void
  isClick: RefObject<boolean>
  isAnimating: RefObject<boolean>
  overlayDivRef: RefObject<HTMLDivElement | null>
  closeButtonRef: RefObject<HTMLElement | null>
  counterRef: RefObject<HTMLElement | null>
  leftChevronRef: RefObject<HTMLElement | null>
  rightChevronRef: RefObject<HTMLElement | null>
  children: React.ReactNode
  cells: RefObject<{ element: HTMLElement; index: number }[]>
  setShowFullscreenSlider: Dispatch<SetStateAction<boolean>>
  cellCount: number
  setClosingModal: Dispatch<SetStateAction<boolean>>
  slides: RefObject<{ cells: { element: HTMLElement; index: number }[]; target: number }[]>
  slider: RefObject<HTMLDivElement | null>
  wrappedItems: MediaItem[]
  centerSlider?: () => void;
  setSliderIndex: (i: number, mode: IndexMode) => void;
  onForceResetZoom: () => void;
  layout?: 'slider' | 'grid' | 'masonry' | 'entries' | null;
  expandableImageRefs: RefObject<RefObject<HTMLImageElement | null>[]>
  resolveLayoutlessTarget: (index: number) => {
    host: HTMLElement | null;
    image: HTMLImageElement | null;
    media: HTMLElement | null;
  };
  entryMapRef?: RefObject<MediaEntryLink[] | null>;
  entryMediaLayout?: string;
  transitionFade?: boolean;
  transitionDuration?: FullscreenIntroPathTiming<number>;
  transitionEasing?: FullscreenIntroPathTiming<string>;
  requestFsCloseRef: React.RefObject<null | (() => void)>;
  cancelFsCloseRef: React.RefObject<null | (() => void)>;
  fs: FullscreenOptions;
  styles: Record<string, string>;
  syncFullscreenSourceFromIndex: (nextIndex: number) => void;
  baseZ?: number;
  rootRef?: React.RefObject<HTMLDivElement | null>;
  introMethod?: "fade" | "scale" | null;
  setLatchedIntroMethod: React.Dispatch<React.SetStateAction<FullscreenOpenMethod | null>>;
  latchedIntroIndex: number;
}

type TrackedStyleProp =
  | 'opacity'
  | 'visibility'
  | 'transition'
  | 'pointerEvents'
  | 'willChange'
  | 'width'
  | 'height'

type TrackStyleMutation = (
  el: HTMLElement | null,
  prop: TrackedStyleProp,
  value: string
) => void

type TrackMutedMutation = (el: HTMLMediaElement | null, value: boolean) => void

const CLOSE_POINTER_GUARD_MS = 80;
const CLOSE_SCROLL_MOBILE_MAX_VIEWPORT_WIDTH = 767;

export function shouldUseFadeClose(args: {
  transitionFade?: boolean;
  isVideoSlide: boolean;
  introMethod?: FullscreenOpenMethod | null;
  isLatchedIntroIndex?: boolean;
  hasTransformTarget?: boolean;
}) {
  if (args.transitionFade || args.isVideoSlide) return true;
  if (args.introMethod === 'fade' && args.isLatchedIntroIndex) return true;
  if (args.hasTransformTarget === false) return true;
  if (args.hasTransformTarget) return false;
  return args.introMethod === 'fade';
}

export function isLikelyFullscreenCloseScrollMobile(
  context: FullscreenMobileDetectionContext
) {
  const shortestSideCandidates = [
    Math.min(context.visualViewportWidth, context.visualViewportHeight),
    Math.min(context.viewportWidth, context.viewportHeight),
  ].filter((value) => Number.isFinite(value) && value > 0);
  const narrowViewport =
    shortestSideCandidates.length > 0
      ? Math.min(...shortestSideCandidates) <= CLOSE_SCROLL_MOBILE_MAX_VIEWPORT_WIDTH
      : false;

  return (
    narrowViewport &&
    context.hoverNone &&
    (context.coarsePointer || context.maxTouchPoints > 0)
  );
}

function safeMatchMedia(query: string) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function readCloseScrollMobileContext(): FullscreenMobileDetectionContext {
  const win = typeof window !== "undefined" ? window : undefined;
  const visualViewport = win?.visualViewport;
  const doc = typeof document !== "undefined" ? document.documentElement : undefined;
  const nav = typeof navigator !== "undefined" ? navigator : undefined;

  return {
    viewportWidth: win?.innerWidth || doc?.clientWidth || 0,
    viewportHeight: win?.innerHeight || doc?.clientHeight || 0,
    visualViewportWidth: visualViewport?.width ?? win?.innerWidth ?? doc?.clientWidth ?? 0,
    visualViewportHeight: visualViewport?.height ?? win?.innerHeight ?? doc?.clientHeight ?? 0,
    coarsePointer: safeMatchMedia("(pointer: coarse)"),
    hoverNone: safeMatchMedia("(hover: none)"),
    maxTouchPoints: nav?.maxTouchPoints ?? 0,
    userAgent: nav?.userAgent ?? "",
  };
}

type ResolvedCloseScrollPolicy = {
  enabled: boolean;
  timing: FullscreenCloseScrollTiming;
  isMobile: boolean;
};

export function resolveFullscreenCloseScrollPolicy(args: {
  closeScroll: FullscreenOptions["closeScroll"];
  index: number;
  layout?: "slider" | "grid" | "masonry" | "entries" | null;
  target: HTMLElement | null;
  mobileContext?: FullscreenMobileDetectionContext;
}): ResolvedCloseScrollPolicy {
  const raw = args.closeScroll;

  if (raw == null || raw === false) {
    return { enabled: false, timing: "before-close", isMobile: false };
  }

  const options: FullscreenCloseScrollOptions =
    typeof raw === "object" ? raw : {};
  const mobileContext = args.mobileContext ?? readCloseScrollMobileContext();
  const isMobile =
    typeof options.mobileDetection === "function"
      ? !!options.mobileDetection(mobileContext)
      : isLikelyFullscreenCloseScrollMobile(mobileContext);
  const context = {
    ...mobileContext,
    index: args.index,
    layout: args.layout,
    target: args.target,
    isMobile,
  };

  const enabledValue =
    typeof raw === "object" ? options.enabled ?? true : raw;
  let enabled: boolean;

  if (typeof enabledValue === "function") {
    enabled = !!enabledValue(context);
  } else if (enabledValue === "desktop-only") {
    enabled = !isMobile;
  } else if (enabledValue === "mobile-only") {
    enabled = isMobile;
  } else {
    enabled = !!enabledValue;
  }

  return {
    enabled,
    timing: options.timing === "after-close" ? "after-close" : "before-close",
    isMobile,
  };
}

export function resolveCloseShieldReleaseMs(durationMs: number) {
  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  return Math.min(duration, CLOSE_POINTER_GUARD_MS);
}

function freezeRect(el: HTMLElement, trackStyleMutation: TrackStyleMutation) {
  const r = el.getBoundingClientRect()
  trackStyleMutation(el, 'width', `${Math.max(1, Math.round(r.width))}px`)
  trackStyleMutation(el, 'height', `${Math.max(1, Math.round(r.height))}px`)
}

const px = (n: number) => `${Math.round(n)}px`

function getViewportEl(track: HTMLDivElement | null): HTMLElement | null {
  if (!track) return null
  return (track.parentElement as HTMLElement) ?? track
}

function findSlideIndexForCell(
  wrapIndex: number,
  slides: { cells: { element: HTMLElement; index: number }[]; target: number }[] | undefined
) {
  if (!slides?.length) return -1
  const matchSlide = slides.find((slide) => slide.cells.some((cell) => cell.index === wrapIndex))
  return matchSlide ? slides.indexOf(matchSlide) : -1
}

function findRenderedCellForIndex(
  track: HTMLDivElement,
  viewportEl: HTMLElement,
  wrapIndex: number
): HTMLElement | null {
  const all = Array.from(
    track.querySelectorAll<HTMLElement>(
      `:scope > [data-rmg-slide="true"][data-rmg-idx="${wrapIndex}"]`
    )
  );

  if (!all.length) return null;

  const matches = all.sort((a, b) => {
    const ac = a.getAttribute("data-rmg-clone") === "true" ? 1 : 0;
    const bc = b.getAttribute("data-rmg-clone") === "true" ? 1 : 0;
    return ac - bc;
  });

  return (
    matches.find((el) => isCellVisible(el, viewportEl, false)) ??
    matches.find((el) => isCellVisible(el, viewportEl, true)) ??
    matches[0] ??
    null
  );
}

function isCellVisible(
  cellEl: HTMLElement,
  viewportEl: HTMLElement,
  allowPartial = true
): boolean {
  const c = viewportEl.getBoundingClientRect()
  const r = cellEl.getBoundingClientRect()
  const fully = r.left >= c.left && r.right <= c.right && r.top >= c.top && r.bottom <= c.bottom
  const intersects = r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom
  return allowPartial ? intersects : fully
}

function waitForAnimationFrames(count: number): Promise<void> {
  const remaining = Math.max(1, Math.round(count));

  return new Promise((resolve) => {
    const tick = (framesLeft: number) => {
      if (framesLeft <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(() => tick(framesLeft - 1));
    };

    tick(remaining);
  });
}

type ObjectFitMode = "contain" | "cover";
type ObjectPosition = { x: number; y: number };
type RectTransform = { cx: number; cy: number; scale: number };

const FULL_VIEWPORT_INSET = "inset(0px 0px 0px 0px)";

function parseScaleCssValue(value: string | null | undefined): number | null {
  const parsed = Number.parseFloat(value?.trim() ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function scaleRectAroundPoint(
  rect: DOMRect,
  centerX: number,
  centerY: number,
  factor: number
) {
  const left = centerX + (rect.left - centerX) * factor;
  const top = centerY + (rect.top - centerY) * factor;
  return new DOMRect(left, top, rect.width * factor, rect.height * factor);
}

function getRenderedScaleForSlide(slideEl: HTMLElement, rect: DOMRect): number | null {
  const widthScale = slideEl.offsetWidth > 0 ? rect.width / slideEl.offsetWidth : NaN;
  const heightScale = slideEl.offsetHeight > 0 ? rect.height / slideEl.offsetHeight : NaN;

  if (Number.isFinite(widthScale) && widthScale > 0) return widthScale;
  if (Number.isFinite(heightScale) && heightScale > 0) return heightScale;
  return null;
}

function getScaleSettledRect(el: HTMLElement | null): DOMRect | null {
  if (!el) return null;

  const currentRect = el.getBoundingClientRect();
  const slideEl = el.matches('[data-rmg-slide="true"]')
    ? el
    : (el.closest('[data-rmg-slide="true"]') as HTMLElement | null);

  if (!slideEl) return currentRect;

  const targetScale = parseScaleCssValue(
    getComputedStyle(slideEl).getPropertyValue('--rmg-scale')
  );

  if (!targetScale || Math.abs(targetScale - 1) < 0.0001) {
    return currentRect;
  }

  const slideRect = slideEl.getBoundingClientRect();
  const currentScale = getRenderedScaleForSlide(slideEl, slideRect);

  if (!currentScale || currentScale <= 0) return currentRect;

  const factor = targetScale / currentScale;
  if (Math.abs(factor - 1) < 0.0001) return currentRect;

  const centerX = slideRect.left + slideRect.width / 2;
  const centerY = slideRect.top + slideRect.height / 2;

  return scaleRectAroundPoint(currentRect, centerX, centerY, factor);
}

function resolveObjectFitMode(
  value: string | null | undefined,
  fallback: ObjectFitMode
): ObjectFitMode {
  return value === "contain" ? "contain" : value === "cover" ? "cover" : fallback;
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
  clipper.setAttribute("data-rmg-fs-close-clipper", "true");
  Object.assign(clipper.style, {
    position: "fixed",
    inset: "0",
    clipPath: startInset,
    willChange: "clip-path",
    transition: "none",
    pointerEvents: "none",
    zIndex: String(zIndex),
    contain: "layout paint style",
    isolation: "isolate",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
  } as CSSStyleDeclaration);
  clipper.style.setProperty("-webkit-clip-path", startInset);
  return clipper;
}

function setClipperInset(clipper: HTMLElement | null, inset: string) {
  if (!clipper) return;
  clipper.style.clipPath = inset;
  clipper.style.setProperty("-webkit-clip-path", inset);
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

function rectContainsRect(outer: DOMRect, inner: DOMRect, epsilon = 0.5) {
  return (
    inner.left >= outer.left - epsilon &&
    inner.top >= outer.top - epsilon &&
    inner.right <= outer.right + epsilon &&
    inner.bottom <= outer.bottom + epsilon
  );
}

function rectMatchesNaturalAspect(
  rect: DOMRect,
  natW: number,
  natH: number,
  epsilon = 0.01
) {
  if (rect.width <= 0 || rect.height <= 0 || natW <= 0 || natH <= 0) {
    return false;
  }

  return Math.abs(rect.width / rect.height - natW / natH) <= epsilon;
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

function clipsOverflow(style: CSSStyleDeclaration | null | undefined) {
  if (!style) return false;

  return [style.overflow, style.overflowX, style.overflowY].some((value) => {
    const normalized = value?.trim().toLowerCase() ?? "";
    return normalized === "hidden" || normalized === "clip";
  });
}

function findOverflowClipAncestorRectsFromEl(
  el: HTMLElement | null,
  maxCount = 2
) {
  const rects: DOMRect[] = [];
  let current = el?.parentElement ?? null;

  while (
    current &&
    current !== document.body &&
    current !== document.documentElement &&
    rects.length < maxCount
  ) {
    if (clipsOverflow(getComputedStyle(current))) {
      const rect = getScaleSettledRect(current) ?? current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.push(rect);
      }
    }
    current = current.parentElement;
  }

  return rects;
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

type ClipperArgs = {
  DURATION_MS: number;
  EASING: string;
};

function createClipper({ DURATION_MS, EASING }: ClipperArgs): HTMLDivElement {
  const clipper = document.createElement('div')
  Object.assign(clipper.style, {
    position: 'fixed',
    inset: '0',
    clipPath: 'inset(0px 0px 0px 0px)',
    willChange: 'clip-path',
    pointerEvents: 'none',
    transition: `clip-path ${DURATION_MS}ms ${EASING}`,
    zIndex: '9998',
    background: 'transparent',
    contain: 'layout paint style',
    isolation: 'isolate',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  } as CSSStyleDeclaration)
  clipper.style.setProperty('-webkit-clip-path', 'inset(0px 0px 0px 0px)')
  document.body.appendChild(clipper)
  void clipper.offsetWidth
  return clipper
}

function insetForRect(r: DOMRect): string {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const top = r.top
  const left = r.left
  const right = vw - (r.left + r.width)
  const bottom = vh - (r.top + r.height)
  return `inset(${px(top)} ${px(right)} ${px(bottom)} ${px(left)})`
}

async function findThumbInfoEnsuringVisible(
  wrapIndex: number,
  sliderRef: RefObject<HTMLDivElement | null>,
  slidesRef: RefObject<{ cells: { element: HTMLElement; index: number }[]; target: number }[]>,
  centerSlider: (() => void) | undefined,
  setSliderIndex: (i: number, mode: IndexMode) => void
): Promise<ThumbInfo | null> {
  const slider = sliderRef.current
  if (!slider || !slidesRef.current?.length) return null

  const viewport = getViewportEl(slider)
  if (!viewport) return null

  let targetCell = findRenderedCellForIndex(slider, viewport, wrapIndex)
  if (!targetCell) return null

  const fullyVisible = isCellVisible(targetCell, viewport, /*allowPartial*/ false)

  if (!fullyVisible) {
    const moved = moveBaseSliderToSlide(
      wrapIndex,
      slidesRef,
      centerSlider,
      setSliderIndex
    )

    if (moved) {
      void slider.offsetWidth
      targetCell = findRenderedCellForIndex(slider, viewport, wrapIndex) ?? targetCell
    }
  }

  const cropRect = getScaleSettledRect(targetCell) ?? targetCell.getBoundingClientRect()

  const imgEl = targetCell.querySelector('img') as HTMLImageElement | null
  const cs = imgEl ? getComputedStyle(imgEl) : null
  const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
  const renderedRect = getScaleSettledRect(imgEl) ?? imgEl?.getBoundingClientRect() ?? null
  const renderedW = renderedRect ? renderedRect.width : 0
  const renderedH = renderedRect ? renderedRect.height : 0

  return {
    cropRect,
    cellEl: targetCell,
    imgEl,
    objPos,
    renderedW,
    renderedH,
    renderedRect
  }
}

type ThumbInfo = {
  cropRect: DOMRect
  cellEl: HTMLElement
  imgEl: HTMLImageElement | null
  objPos: { x: number; y: number }
  renderedW: number
  renderedH: number
  renderedRect: DOMRect | null
}

function moveBaseSliderToSlide(
  wrapIndex: number,
  slidesRef: RefObject<{ cells: { element: HTMLElement; index: number }[]; target: number }[]>,
  centerSlider: (() => void) | undefined,
  setSliderIndex: (i: number, mode: IndexMode) => void
) {
  const slides = slidesRef.current
  const newIndex = findSlideIndexForCell(wrapIndex, slides)
  if (newIndex < 0) return false

  setSliderIndex(newIndex, 'instant')

  centerSlider?.()
  return true
}

async function captureVideoFrame(video: HTMLVideoElement): Promise<HTMLImageElement | null> {
  try {
    const w = video.videoWidth || Math.round(video.getBoundingClientRect().width) || 1
    const h = video.videoHeight || Math.round(video.getBoundingClientRect().height) || 1
    if (!w || !h) return null
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, w, h)
    const dataURL = canvas.toDataURL('image/png')
    const img = new Image()
    img.decoding = 'async'
    img.src = dataURL
    await img.decode().catch(() => {})
    return img
  } catch {
    return null
  }
}

function extractPlyrPoster(wrapperEl: HTMLElement | null): string | null {
  if (!wrapperEl) return null
  const v = wrapperEl.querySelector('video') as HTMLVideoElement | null
  if (v?.poster) return v.poster
  const posterEl = wrapperEl.querySelector('.plyr__poster') as HTMLElement | null
  if (posterEl) {
    const bg = getComputedStyle(posterEl).backgroundImage
    const match = bg && /url\(["']?(.*?)["']?\)/.exec(bg)
    if (match?.[1]) return match[1]
  }
  return null
}

async function makeVideoProxy(
  movingVideo: HTMLVideoElement,
  wrapperEl: HTMLElement | null
): Promise<HTMLImageElement> {
  const frame = await captureVideoFrame(movingVideo)
  if (frame) return frame

  const posterURL = extractPlyrPoster(wrapperEl)
  const img = new Image()
  img.decoding = 'async'
  if (posterURL) {
    img.src = posterURL
    try { await img.decode() } catch {}
  } else {
    const w = movingVideo.videoWidth || 1
    const h = movingVideo.videoHeight || 1
    const c = document.createElement('canvas')
    c.width = Math.max(1, w)
    c.height = Math.max(1, h)
    img.src = c.toDataURL('image/png')
  }
  return img
}

function getVideoObjPos(videoEl: HTMLVideoElement | null): { x: number; y: number } {
  if (!videoEl) return { x: 0.5, y: 0.5 };
  const cs = getComputedStyle(videoEl);
  return parseObjectPosition(cs?.objectPosition ?? null);
}

function styleProxyImage(
  img: HTMLImageElement,
  objPos: { x: number; y: number }
) {
  img.decoding = 'async';
  (img as any).loading = 'eager';
  img.draggable = false;
  img.style.pointerEvents = 'none';
  img.style.objectFit = 'cover';
  img.style.objectPosition = `${Math.round(objPos.x * 100)}% ${Math.round(objPos.y * 100)}%`;
}

function isElementOnScreen(el: HTMLElement, visibleThreshold = 0.4): boolean {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight

  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
  if (visibleHeight <= 0) return false

  return visibleHeight >= rect.height * visibleThreshold
}

type OcclusionVisibilityOptions = {
  ignoredElements?: Array<Element | null | undefined>;
};

function getViewportIntersectionRect(rect: DOMRect): DOMRect | null {
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const left = Math.max(0, rect.left);
  const top = Math.max(0, rect.top);
  const right = Math.min(vw, rect.right);
  const bottom = Math.min(vh, rect.bottom);

  if (right <= left || bottom <= top) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

function isIgnoredOcclusionElement(
  el: Element,
  ignoredElements: Array<Element | null | undefined>
) {
  if (el instanceof HTMLElement && el.getAttribute("data-rmg-fs-shield") === "true") {
    return true;
  }

  return ignoredElements.some(
    (ignored) => ignored === el || !!ignored?.contains(el)
  );
}

function isPaintedOcclusionElement(el: Element) {
  const isSvgElement =
    typeof SVGElement !== "undefined" && el instanceof SVGElement;
  if (!(el instanceof HTMLElement) && !isSvgElement) return true;

  const style = getComputedStyle(el);
  if (style.display === "none") return false;
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;

  const opacity = Number.parseFloat(style.opacity || "1");
  return !Number.isFinite(opacity) || opacity > 0.01;
}

function isTargetOrTargetOwner(el: Element, target: HTMLElement) {
  if (el === target || target.contains(el)) return true;
  if (el === document.body || el === document.documentElement) return false;
  return el.contains(target);
}

function firstRelevantElementFromPoint(
  x: number,
  y: number,
  ignoredElements: Array<Element | null | undefined>
): Element | null {
  const stack =
    typeof document.elementsFromPoint === "function"
      ? document.elementsFromPoint(x, y)
      : [document.elementFromPoint?.(x, y)].filter(Boolean);

  for (const el of stack) {
    if (!el) continue;
    if (isIgnoredOcclusionElement(el, ignoredElements)) continue;
    if (!isPaintedOcclusionElement(el)) continue;
    return el;
  }

  return null;
}

function sampleRectPoints(rect: DOMRect) {
  const xs = rect.width < 4
    ? [rect.left + rect.width / 2]
    : [
        rect.left + rect.width * 0.02,
        rect.left + rect.width * 0.5,
        rect.left + rect.width * 0.98,
      ];
  const ys = rect.height < 4
    ? [rect.top + rect.height / 2]
    : [
        rect.top + rect.height * 0.02,
        rect.top + rect.height * 0.5,
        rect.top + rect.height * 0.98,
      ];

  return ys.flatMap((y) => xs.map((x) => ({ x, y })));
}

export function isElementVisiblyOnScreen(
  el: HTMLElement,
  visibleThreshold = 0.4,
  options: OcclusionVisibilityOptions = {}
): boolean {
  if (!isElementOnScreen(el, visibleThreshold)) return false;
  if (!isPaintedOcclusionElement(el)) return false;

  const viewportRect = getViewportIntersectionRect(el.getBoundingClientRect());
  if (!viewportRect) return false;

  const hasHitTestApi =
    typeof document.elementsFromPoint === "function" ||
    typeof document.elementFromPoint === "function";
  if (!hasHitTestApi) return true;

  return sampleRectPoints(viewportRect).some(({ x, y }) => {
    const top = firstRelevantElementFromPoint(
      x,
      y,
      options.ignoredElements ?? []
    );
    return !!top && isTargetOrTargetOwner(top, el);
  });
}

export function resolveCenteredScrollTop(args: {
  rectTop: number;
  rectHeight: number;
  scrollY: number;
  viewportHeight: number;
  viewportOffsetTop?: number;
  maxScrollY?: number;
}): number {
  const rectTop = Number.isFinite(args.rectTop) ? args.rectTop : 0;
  const rectHeight = Number.isFinite(args.rectHeight) ? Math.max(0, args.rectHeight) : 0;
  const scrollY = Number.isFinite(args.scrollY) ? args.scrollY : 0;
  const viewportHeight =
    Number.isFinite(args.viewportHeight) && args.viewportHeight > 0
      ? args.viewportHeight
      : rectHeight;
  const viewportOffsetTop =
    Number.isFinite(args.viewportOffsetTop) ? Math.max(0, args.viewportOffsetTop ?? 0) : 0;
  const maxScrollY =
    Number.isFinite(args.maxScrollY) && args.maxScrollY != null
      ? Math.max(0, args.maxScrollY)
      : Number.POSITIVE_INFINITY;

  const centeredTop =
    scrollY + rectTop - viewportOffsetTop - (viewportHeight - rectHeight) / 2;

  return Math.min(Math.max(0, centeredTop), maxScrollY);
}

function readWindowScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function readMaxWindowScrollY() {
  const scrollingEl = document.scrollingElement ?? document.documentElement;
  const layoutViewportHeight =
    window.innerHeight || document.documentElement.clientHeight || 0;
  const bodyScrollHeight = document.body?.scrollHeight ?? 0;
  const scrollHeight = Math.max(scrollingEl.scrollHeight, bodyScrollHeight);

  return Math.max(0, scrollHeight - layoutViewportHeight);
}

function forceInstantWindowScrollTo(top: number) {
  const root = document.documentElement;
  const body = document.body;
  const prevRootScrollBehavior = root.style.scrollBehavior;
  const prevBodyScrollBehavior = body?.style.scrollBehavior ?? "";

  root.style.scrollBehavior = "auto";
  if (body) body.style.scrollBehavior = "auto";

  try {
    window.scrollTo(window.scrollX || 0, top);
  } finally {
    root.style.scrollBehavior = prevRootScrollBehavior;
    if (body) body.style.scrollBehavior = prevBodyScrollBehavior;
  }
}

async function waitForWindowScrollSettle(targetTop: number): Promise<void> {
  let previousY = readWindowScrollY();
  let stableFrames = 0;

  for (let i = 0; i < 8; i += 1) {
    await waitForAnimationFrames(1);

    const currentY = readWindowScrollY();
    const nearTarget = Math.abs(currentY - targetTop) <= 1;
    const barelyMoved = Math.abs(currentY - previousY) <= 0.5;

    if (nearTarget || barelyMoved) {
      stableFrames += 1;
      if (stableFrames >= 2) break;
    } else {
      stableFrames = 0;
    }

    previousY = currentY;
  }

  await waitForAnimationFrames(1);
}

async function scrollElementIntoCenterView(el: HTMLElement | null): Promise<boolean> {
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const scrollY = readWindowScrollY();
  const visualViewport = window.visualViewport;
  const viewportHeight =
    visualViewport?.height ||
    window.innerHeight ||
    document.documentElement.clientHeight ||
    rect.height;
  const viewportOffsetTop = visualViewport?.offsetTop ?? 0;
  const maxScrollY = readMaxWindowScrollY();

  const targetTop = resolveCenteredScrollTop({
    rectTop: rect.top,
    rectHeight: rect.height,
    scrollY,
    viewportHeight,
    viewportOffsetTop,
    maxScrollY,
  });

  if (Math.abs(targetTop - scrollY) > 1) {
    forceInstantWindowScrollTo(targetTop);
    await waitForWindowScrollSettle(targetTop);
    return true;
  }

  return false;
}

type VideoProxyCloseArgs = {
  fsSliderEl: HTMLElement;
  nodeIdx: number;
  thumbCropRect: DOMRect;
  endClipRect?: DOMRect;
  endObjPos: { x: number; y: number };
  captionClone: HTMLElement | null;
  trackStyleMutation: TrackStyleMutation;
  trackMutedMutation: TrackMutedMutation;

  safeTeardown: () => void;
  onCaptionCloneGone?: () => void;
  DURATION_MS: number;
  EASING: string;
};

async function animateVideoCloseProxy({
  fsSliderEl,
  nodeIdx,
  thumbCropRect,
  endClipRect,
  endObjPos,
  captionClone,
  trackStyleMutation,
  trackMutedMutation,
  safeTeardown,
  onCaptionCloneGone,
  DURATION_MS,
  EASING
}: VideoProxyCloseArgs): Promise<void> {
  const wrapperEl =
    (fsSliderEl.querySelector(`.rmg__player[data-index="${nodeIdx}"]`) as HTMLElement | null) ||
    (fsSliderEl.querySelector('.rmg__player') as HTMLElement | null) ||
    null;

  const fsVideo = wrapperEl?.querySelector('video') as HTMLVideoElement | null;

  const fsRect =
    wrapperEl?.getBoundingClientRect?.() ||
    fsVideo?.getBoundingClientRect?.();

  if (!fsRect) {
    safeTeardown();
    return;
  }

  if (wrapperEl) {
    freezeRect(wrapperEl, trackStyleMutation);
    trackStyleMutation(wrapperEl, 'visibility', 'hidden');
    trackStyleMutation(wrapperEl, 'opacity', '0');
    const poster = wrapperEl.querySelector('.plyr__poster') as HTMLElement | null;
    trackStyleMutation(poster, 'opacity', '0');
    const controls = wrapperEl.querySelector('.plyr__controls') as HTMLElement | null;
    trackStyleMutation(controls, 'opacity', '0');
  }

  if (fsVideo) {
    try { fsVideo.pause(); } catch {}
    trackMutedMutation(fsVideo, true);
  }

  const vidForProxy =
    fsVideo || (wrapperEl?.querySelector('video') as HTMLVideoElement | null);

  if (!vidForProxy) {
    safeTeardown();
    return;
  }

  const proxyImg = await makeVideoProxy(vidForProxy, wrapperEl);

  styleProxyImage(proxyImg, endObjPos);

  const natW = proxyImg.naturalWidth || 1;
  const natH = proxyImg.naturalHeight || 1;

  const startObjPos = getVideoObjPos(fsVideo);

  const startT = coverTransformForRect(natW, natH, fsRect, startObjPos);
  const endT = coverTransformForRect(natW, natH, thumbCropRect, endObjPos);

  const movingProxy = proxyImg as unknown as HTMLElement;

  Object.assign(movingProxy.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${natW}px`,
    height: `${natH}px`,
    maxWidth: 'none',
    maxHeight: 'none',
    transformOrigin: '50% 50%',
    willChange: 'transform',
    zIndex: '2147483601',
    opacity: '1',
    transition: 'none',
    backfaceVisibility: 'hidden',
    contain: 'paint',
    isolation: 'isolate',
  } as CSSStyleDeclaration);

  movingProxy.style.transform =
    `translate3d(${startT.cx}px, ${startT.cy}px, 0)` +
    ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
    ` scale(${startT.scale})`;

  const clipper = createClipper({DURATION_MS, EASING});
  setClipperInset(clipper, insetForRect(fsRect));
  clipper.appendChild(movingProxy);

  void movingProxy.offsetWidth;
  void clipper.offsetWidth;

  const cleanup = () => {
    if (captionClone) {
      try { captionClone.remove(); } catch {}
      onCaptionCloneGone?.();
    }
    try { document.body.removeChild(clipper); } catch {}
    try { (movingProxy as HTMLElement).remove(); } catch {}
    safeTeardown();
  };

  const onEnd = (ev: TransitionEvent) => {
    if (ev.propertyName !== 'transform') return;
    (movingProxy as HTMLElement).removeEventListener('transitionend', onEnd as any);
    cleanup();
  };

  requestAnimationFrame(() => {
    setClipperInset(clipper, insetForRect(endClipRect ?? thumbCropRect));
    (movingProxy as HTMLElement).style.transition = `transform ${DURATION_MS}ms ${EASING}`;
    (movingProxy as HTMLElement).style.transform =
      `translate3d(${endT.cx}px, ${endT.cy}px, 0)` +
      ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
      ` scale(${endT.scale})`;

    (movingProxy as HTMLElement).addEventListener('transitionend', onEnd as any, { once: true });

    window.setTimeout(() => {
      (movingProxy as HTMLElement).removeEventListener('transitionend', onEnd as any);
      cleanup();
    }, DURATION_MS + 120);
  });
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  children,
  fsSub,
  open,
  onClose,
  isClick,
  isAnimating,
  overlayDivRef,
  closeButtonRef,
  counterRef,
  leftChevronRef,
  rightChevronRef,
  cells,
  setShowFullscreenSlider,
  cellCount,
  setClosingModal,
  slides,
  slider,
  wrappedItems,
  centerSlider,
  setSliderIndex,
  onForceResetZoom,
  layout,
  expandableImageRefs,
  resolveLayoutlessTarget,
  entryMapRef,
  entryMediaLayout,
  transitionFade,
  transitionDuration,
  transitionEasing,
  requestFsCloseRef,
  cancelFsCloseRef,
  fs,
  styles,
  syncFullscreenSourceFromIndex,
  baseZ,
  rootRef,
  introMethod,
  setLatchedIntroMethod,
  latchedIntroIndex
}) => {

  const TRANSFORM_DURATION_MS = resolveFullscreenIntroDurationMs(
    transitionDuration,
    'transform'
  );
  const TRANSFORM_EASING = resolveFullscreenIntroEasing(
    transitionEasing,
    'transform'
  );
  const FADE_DURATION_MS = resolveFullscreenIntroDurationMs(
    transitionDuration,
    'fade'
  );
  const FADE_EASING = resolveFullscreenIntroEasing(transitionEasing, 'fade');

  const modalRef = React.useRef<HTMLDivElement | null>(null);
  const pointerDownX = React.useRef<number>(0)
  const pointerDownY = React.useRef<number>(0)

  const computedBaseZ = baseZ ?? 9999;

  const setModalRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      modalRef.current = node;
      if (rootRef) {
        (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [rootRef]
  );

  const shieldRef = React.useRef<HTMLDivElement | null>(null);
  const trackedCloseMutationsRef = React.useRef<
    Array<
      | { kind: 'style'; el: HTMLElement; prop: TrackedStyleProp; prevValue: string }
      | {
          kind: 'style-property';
          el: HTMLElement;
          prop: string;
          prevValue: string;
          prevPriority: string;
        }
      | { kind: 'muted'; el: HTMLMediaElement; prevValue: boolean }
    >
  >([]);
  const trackedCloseKeysRef = React.useRef<WeakMap<object, Set<string>>>(new WeakMap());
  const closeInProgressRef = React.useRef(false);
  const closeAnimationStartedRef = React.useRef(false);
  const postCloseScrollActionRef = React.useRef<null | (() => void | Promise<void>)>(null);

  const restoreTrackedCloseMutations = React.useCallback(() => {
    for (let i = trackedCloseMutationsRef.current.length - 1; i >= 0; i -= 1) {
      const mutation = trackedCloseMutationsRef.current[i];
      if (mutation.kind === 'style') {
        (mutation.el.style as any)[mutation.prop] = mutation.prevValue;
        continue;
      }
      if (mutation.kind === 'style-property') {
        if (mutation.prevValue) {
          mutation.el.style.setProperty(
            mutation.prop,
            mutation.prevValue,
            mutation.prevPriority
          );
        } else {
          mutation.el.style.removeProperty(mutation.prop);
        }
        continue;
      }
      mutation.el.muted = mutation.prevValue;
    }

    trackedCloseMutationsRef.current = [];
    trackedCloseKeysRef.current = new WeakMap();
  }, []);

  function mountShield() {
    if (shieldRef.current) return;

    const shield = document.createElement('div');
    shield.setAttribute('data-rmg-fs-shield', 'true');

    Object.assign(shield.style, {
      position: 'fixed',
      inset: '0',
      zIndex: String(computedBaseZ + 5),
      background: 'transparent',
      pointerEvents: 'auto',
      touchAction: 'none',
      cursor: 'default',
    } as CSSStyleDeclaration);

    const stop = (e: Event) => {
      e.preventDefault?.();
      e.stopPropagation?.();
    };

    shield.addEventListener('pointerdown', stop, { capture: true });
    shield.addEventListener('pointerup', stop, { capture: true });
    shield.addEventListener('pointermove', stop, { capture: true });
    shield.addEventListener('click', stop, { capture: true });
    shield.addEventListener('dblclick', stop, { capture: true });
    shield.addEventListener('contextmenu', stop, { capture: true });
    shield.addEventListener('touchstart', stop, { capture: true, passive: false } as any);
    shield.addEventListener('touchmove', stop, { capture: true, passive: false } as any);
    shield.addEventListener('touchend', stop, { capture: true, passive: false } as any);
    shield.addEventListener('wheel', stop, { capture: true, passive: false } as any);

    shield.addEventListener(
      'keydown',
      stop,
      { capture: true } as any
    );

    document.body.appendChild(shield);
    shieldRef.current = shield;
  }

  function unmountShield() {
    const shield = shieldRef.current;
    if (!shield) return;
    try { shield.remove(); } catch {}
    shieldRef.current = null;
  }

  function setModalClosingHitTestState(closing: boolean) {
    const modal = modalRef.current;
    if (!modal) return;

    if (closing) {
      modal.setAttribute('data-rmg-fs-closing', 'true');
      return;
    }

    modal.removeAttribute('data-rmg-fs-closing');
  }

  useEffect(() => {
    return () => {
      restoreTrackedCloseMutations();
      if (cancelFsCloseRef.current) cancelFsCloseRef.current = null;
      closeInProgressRef.current = false;
      closeAnimationStartedRef.current = false;
      postCloseScrollActionRef.current = null;
      unmountShield();
    };
  }, [cancelFsCloseRef, restoreTrackedCloseMutations]);

  type ElementStyleLike = { className?: string; style?: React.CSSProperties } | null | undefined;

  function mergeClassNames(...parts: Array<string | undefined | null | false>) {
    return parts.filter(Boolean).join(" ");
  }

  function styleFromElementStyle(es?: ElementStyleLike) {
    return (es?.style ?? undefined) as React.CSSProperties | undefined;
  }

  function classFromElementStyle(es?: ElementStyleLike) {
    return es?.className ?? "";
  }
 
  function getArrowAction(side: "left" | "right", isRtl: boolean): "prev" | "next" {
    // visual-left button means "previous" in LTR, but "next" in RTL
    if (side === "left") return isRtl ? "next" : "prev";
    return isRtl ? "prev" : "next";
  }

  function runArrowAction(fsSub: FullscreenSliderSub, action: "prev" | "next") {
    if (action === "next") fsSub.requestNext();
    else fsSub.requestPrev();
  }

  function withinFs<T extends Element = HTMLElement>(sel: string): T | null {
    const root = modalRef.current;
    return root ? (root.querySelector(sel) as T | null) : null;
  }

  function trackStyleMutation(el: HTMLElement | null, prop: TrackedStyleProp, value: string) {
    if (!el) return;

    let keys = trackedCloseKeysRef.current.get(el);
    if (!keys) {
      keys = new Set<string>();
      trackedCloseKeysRef.current.set(el, keys);
    }

    const key = `style:${prop}`;
    if (!keys.has(key)) {
      keys.add(key);
      trackedCloseMutationsRef.current.push({
        kind: 'style',
        el,
        prop,
        prevValue: ((el.style as any)[prop] ?? '') as string,
      });
    }

    if (((el.style as any)[prop] ?? '') === value) return;
    (el.style as any)[prop] = value;
  }

  function trackStylePropertyMutation(
    el: HTMLElement | null,
    prop: string,
    value: string,
    priority = ''
  ) {
    if (!el) return;

    let keys = trackedCloseKeysRef.current.get(el);
    if (!keys) {
      keys = new Set<string>();
      trackedCloseKeysRef.current.set(el, keys);
    }

    const key = `style-property:${prop}`;
    if (!keys.has(key)) {
      keys.add(key);
      trackedCloseMutationsRef.current.push({
        kind: 'style-property',
        el,
        prop,
        prevValue: el.style.getPropertyValue(prop),
        prevPriority: el.style.getPropertyPriority(prop),
      });
    }

    if (
      el.style.getPropertyValue(prop) === value &&
      el.style.getPropertyPriority(prop) === priority
    ) {
      return;
    }

    el.style.setProperty(prop, value, priority);
  }

  function trackMutedMutation(el: HTMLMediaElement | null, value: boolean) {
    if (!el) return;

    let keys = trackedCloseKeysRef.current.get(el);
    if (!keys) {
      keys = new Set<string>();
      trackedCloseKeysRef.current.set(el, keys);
    }

    const key = 'media:muted';
    if (!keys.has(key)) {
      keys.add(key);
      trackedCloseMutationsRef.current.push({
        kind: 'muted',
        el,
        prevValue: el.muted,
      });
    }

    if (el.muted === value) return;
    el.muted = value;
  }

  const clearRootCloseStyles = React.useCallback(() => {
    const modal = modalRef.current;
    if (modal) {
      modal.style.transition = '';
      modal.style.willChange = '';
    }

    const fsSlider = modal?.querySelector<HTMLElement>('.fullscreen_slider') ?? null;
    if (fsSlider) {
      fsSlider.style.willChange = '';
    }
  }, []);

  function normalizeFsIndex(fsIdx: number, count: number) {
    const len = Math.max(1, count);
    return ((fsIdx % len) + len) % len;
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      proceedToClose();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true } as any);
  }, [open]);

  useLayoutEffect(() => {
    restoreTrackedCloseMutations();
    if (!open) {
      clearRootCloseStyles();
    }
  }, [open, restoreTrackedCloseMutations, clearRootCloseStyles]);

  function nodeIdxFromFs(fsIdx: number, cellCount: number) {
    if (cellCount <= 1) return 0;

    const canonicalIdx = normalizeFsIndex(fsIdx, cellCount);
    const fallback = canonicalIdx + 1;
    const fsSlider = withinFs<HTMLElement>('.fullscreen_slider');
    if (!fsSlider) return fallback;

    const matches = Array.from(
      fsSlider.querySelectorAll<HTMLElement>(
        `[data-rmg-fs-slide="true"][data-rmg-canonical-idx="${canonicalIdx}"]`
      )
    );
    if (!matches.length) return fallback;

    const viewport = modalRef.current ?? fsSlider;
    const viewportRect = viewport.getBoundingClientRect();
    const centerX = (viewportRect.left + viewportRect.right) / 2;
    const centerY = (viewportRect.top + viewportRect.bottom) / 2;

    let bestMatch: HTMLElement | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const slide of matches) {
      const rect = slide.getBoundingClientRect();
      const slideCenterX = (rect.left + rect.right) / 2;
      const slideCenterY = (rect.top + rect.bottom) / 2;
      const distance =
        Math.abs(slideCenterX - centerX) +
        Math.abs(slideCenterY - centerY);

      if (distance < bestDistance) {
        bestMatch = slide;
        bestDistance = distance;
      }
    }

    const renderedAttr = bestMatch?.getAttribute('data-index');
    const renderedIndex = renderedAttr != null ? parseInt(renderedAttr, 10) : NaN;
    return Number.isFinite(renderedIndex) ? renderedIndex : fallback;
  }

  function cloneFsCaptionForNode(
    fsRoot: HTMLElement | null,
    nodeIdx: number
  ): HTMLElement | null {
    if (!fsRoot) return null

    const activeMediaEl =
      fsRoot.querySelector<HTMLElement>(`[data-index="${nodeIdx}"]`) ?? null

    const activeSlideEl = activeMediaEl
      ? (activeMediaEl.closest('[data-rmg-fs-slide="true"]') as HTMLElement | null)
      : null

    const activeCaptionEl =
      activeSlideEl?.querySelector<HTMLElement>('[data-rmg-fs-caption="true"]') ?? null

    if (!activeCaptionEl) return null

    const r = activeCaptionEl.getBoundingClientRect()

    const captionClone = activeCaptionEl.cloneNode(true) as HTMLElement
    Object.assign(captionClone.style, {
      position: 'fixed',
      left: `${Math.round(r.left)}px`,
      top: `${Math.round(r.top)}px`,
      width: `${Math.round(r.width)}px`,
      height: `${Math.round(r.height)}px`,
      margin: '0',
      transform: 'none',
      zIndex: '2147483602',
      pointerEvents: 'none',
    } as CSSStyleDeclaration)

    document.body.appendChild(captionClone)

    trackStyleMutation(activeCaptionEl, 'visibility', 'hidden')

    return captionClone
  }

  function fadeChrome() {
    const els = [
      leftChevronRef.current,
      rightChevronRef.current,
      counterRef.current,
      closeButtonRef.current,
    ];

    els.forEach((el) => {
      if (!el) return;
      el.classList.remove(styles.open);
    });
  }

  function fadeNonActiveSlides(
    fsSlider: HTMLElement,
    nodeIdx: number,
    targetImg: HTMLImageElement | null,
    isVideoSlide: boolean,
    durationMs: number,
    easing: string
  ) {
    if (isVideoSlide) {
      fsSlider.querySelectorAll<HTMLElement>('[data-index]').forEach(el => {
        if (el.dataset.index === String(nodeIdx)) return;
        trackStyleMutation(el, 'transition', `opacity ${durationMs}ms ${easing}`);
        trackStyleMutation(el, 'opacity', '0');
      });
      return;
    }

    fsSlider.querySelectorAll<HTMLElement>('[data-rmg-fs-slide="true"]').forEach(slide => {
      if (targetImg && slide.contains(targetImg)) return;
      trackStyleMutation(slide, 'transition', `opacity ${durationMs}ms ${easing}`);
      trackStyleMutation(slide, 'opacity', '0');
    });
  }

  function fadeOverlay(durationMs: number, easing: string) {
    const ov = overlayDivRef.current;
    if (!ov) return;
    const computedOpacity = Number.parseFloat(getComputedStyle(ov).opacity);
    const startOpacity = Number.isFinite(computedOpacity) ? computedOpacity : 1;

    ov.style.transition = 'none';
    ov.style.opacity = String(startOpacity);
    void ov.offsetWidth;
    ov.style.transition = `opacity ${durationMs}ms ${easing}`;

    requestAnimationFrame(() => {
      ov.style.opacity = '0';
      ov.style.pointerEvents = 'none';
    });
  }

  function fadeElementOpacityTo(
    el: HTMLElement | null,
    targetOpacity: number,
    opts: { durationMs: number; easing: string; pointerEvents?: string }
  ) {
    if (!el) return;

    const computedOpacity = Number.parseFloat(getComputedStyle(el).opacity);
    const startOpacity = Number.isFinite(computedOpacity) ? computedOpacity : 1;

    el.style.transition = 'none';
    el.style.opacity = String(startOpacity);
    void el.offsetWidth;
    el.style.transition = `opacity ${opts.durationMs}ms ${opts.easing}`;
    el.style.willChange = 'opacity';

    requestAnimationFrame(() => {
      el.style.opacity = String(targetOpacity);
      if (opts.pointerEvents != null) {
        el.style.pointerEvents = opts.pointerEvents;
      }
    });
  }

  function isVideoItem(m: MediaItem | null | undefined): boolean {
    if (!m) return false;
    return (m as any).kind === 'video' || /\.(mp4|webm|ogg)$/i.test((m as any).src || '');
  }

  function startClosePrep() {
    if (closeInProgressRef.current) return false;

    closeInProgressRef.current = true;
    closeAnimationStartedRef.current = false;
    postCloseScrollActionRef.current = null;

    cancelFsCloseRef.current = () => {
      if (!closeInProgressRef.current) return;
      safeTeardown();
    };

    mountShield();
    setModalClosingHitTestState(true);
    isAnimating.current = false;
    isClick.current = false;
    cells.current = [];

    return true;
  }

  function startCloseAnimation() {
    if (closeAnimationStartedRef.current) return false;
    closeAnimationStartedRef.current = true;
    setClosingModal(true);
    return true;
  }

  function fadeCloseAndTeardown() {
    startCloseAnimation();
    fadeChrome()

    fadeOverlay(FADE_DURATION_MS, FADE_EASING)

    const modal = modalRef.current;
    let finished = false;
    let releaseShieldTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      modal?.removeEventListener('transitionend', onTransitionEnd as any);
      if (releaseShieldTimer !== undefined) window.clearTimeout(releaseShieldTimer);
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      if (cancelFsCloseRef.current === cancelClose) cancelFsCloseRef.current = null;
      safeTeardown();
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== modal || event.propertyName !== 'opacity') return;
      finish();
    };

    const cancelClose = () => {
      if (finished) return;
      finished = true;
      modal?.removeEventListener('transitionend', onTransitionEnd as any);
      if (releaseShieldTimer !== undefined) window.clearTimeout(releaseShieldTimer);
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      if (cancelFsCloseRef.current === cancelClose) cancelFsCloseRef.current = null;
      safeTeardown();
    };

    cancelFsCloseRef.current = cancelClose;

    const fsSlider = withinFs<HTMLElement>('.fullscreen_slider');
    if (fsSlider) {
      fadeElementOpacityTo(fsSlider, 0, {
        durationMs: FADE_DURATION_MS,
        easing: FADE_EASING,
      });
    }

    if (modal) {
      modal.addEventListener('transitionend', onTransitionEnd as any, { once: true });
      fadeElementOpacityTo(modal, 0, {
        durationMs: FADE_DURATION_MS,
        easing: FADE_EASING,
        pointerEvents: 'none',
      });
    }

    // Only swallow immediate post-close input; the fading modal is pointer-events:none.
    // Full cleanup still runs via transitionend/fallback.
    releaseShieldTimer = window.setTimeout(() => {
      unmountShield();
    }, resolveCloseShieldReleaseMs(FADE_DURATION_MS));

    fallbackTimer = window.setTimeout(() => {
      finish();
    }, FADE_DURATION_MS + 40);
  }

  async function proceedToClose() {
    if (!open) return;
    if (!startClosePrep()) return;

    const originals = wrappedItems.slice(1, -1);
    if (!originals.length) {
      safeTeardown();
      return;
    }

    const fsIdx = fsSub.get();
    const normalizedFsIndex = normalizeFsIndex(fsIdx, originals.length);

    const isGridish =
      !layout ||
      layout === "grid" ||
      layout === "masonry" ||
      entryMediaLayout === "grid" ||
      entryMediaLayout === "masonry";

    const resolveExpandableSlot = (slot: unknown): {
      host: HTMLElement | null;
      image: HTMLImageElement | null;
    } => {
      if (!slot) return { host: null, image: null };

      if (slot instanceof HTMLImageElement) {
        return {
          host:
            (slot.closest(
              '[data-rmg-idx], .rmg__grid-item, .rmg__masonry-item, .rmg__slide'
            ) as HTMLElement | null) ??
            slot.parentElement,
          image: slot,
        };
      }

      if (slot instanceof HTMLElement) {
        return {
          host: slot,
          image: (slot.querySelector("img") as HTMLImageElement | null) ?? null,
        };
      }

      return { host: null, image: null };
    };

    const resolveExpandableSlotAtIndex = (index: number) => {
      const slot: any = (expandableImageRefs.current as any)?.[index] ?? null;
      const slotCurrent: any =
        slot && typeof slot === "object" && "current" in slot ? slot.current : slot;
      return resolveExpandableSlot(slotCurrent);
    };

    const resolveRegisteredCellHost = (index: number) =>
      cells.current?.find((cell) => cell.index === index)?.element ?? null;

    const resolveGridishTransformDestImg = (index: number) => {
      const slotInfo = resolveExpandableSlotAtIndex(index);
      const layoutlessTarget = resolveLayoutlessTarget(index);

      let destImg: HTMLImageElement | null = slotInfo.image ?? layoutlessTarget.image;

      if (!destImg) {
        const host =
          resolveRegisteredCellHost(index) ??
          document.querySelector<HTMLElement>(`[data-rmg-idx="${index}"]`);
        destImg = (host?.querySelector("img") as HTMLImageElement | null) ?? null;
      }

      return destImg;
    };

    const computeThumbCropRectFromImg = (img: HTMLImageElement): { cropRect: DOMRect; objPos: { x: number; y: number } } => {
      const box = getScaleSettledRect(img) ?? img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
      const fit = (cs?.objectFit ?? "cover") as "contain" | "cover";

      if (fit !== "contain") return { cropRect: box, objPos };

      const natW = Math.max(1, img.naturalWidth || 0);
      const natH = Math.max(1, img.naturalHeight || 0);
      const cropRect = objectFitContentRect(natW, natH, box, "contain", objPos);
      return { cropRect, objPos };
    };

    const computeVisibleThumbClipRect = (args: {
      thumbCropRect: DOMRect;
      destImg?: HTMLImageElement | null;
    }) => {
      const sourceRect = args.destImg
        ? (getScaleSettledRect(args.destImg) ?? args.destImg.getBoundingClientRect())
        : args.thumbCropRect;
      const navEl = findStickyNav(fs.effects?.StickyNavSelector, sourceRect);
      const navRect = navEl?.getBoundingClientRect();

      if (!navRect) return args.thumbCropRect;

      return (
        intersectRectWithTopOccluder(args.thumbCropRect, navRect.bottom) ??
        args.thumbCropRect
      );
    };

    const animateCloseToThumb = async (args: {
      thumbCropRect: DOMRect;
      endObjPos: { x: number; y: number };
      isVideoSlide: boolean;
      destImg?: HTMLImageElement | null;
    }) => {
      const fsSlider = withinFs<HTMLElement>(".fullscreen_slider");
      if (!fsSlider) {
        safeTeardown();
        return;
      }

      const nodeIdx = nodeIdxFromFs(normalizedFsIndex, cellCount);
      const targetSlide =
        !args.isVideoSlide
          ? fsSlider.querySelector<HTMLElement>(
              `[data-rmg-fs-slide="true"][data-index="${nodeIdx}"]`
            ) ?? null
          : null;
      const targetMedia =
        !args.isVideoSlide
          ? targetSlide?.querySelector<HTMLElement>('[data-rmg-fs-media="true"]') ?? null
          : null;

      const targetImg =
        !args.isVideoSlide
          ? getPrimaryImgEl(targetMedia)
          : null;

      if (!targetImg && !args.isVideoSlide) {
        safeTeardown();
        return;
      }

      const endClipRect = computeVisibleThumbClipRect({
        thumbCropRect: args.thumbCropRect,
        destImg: args.destImg,
      });

      startCloseAnimation();
      fadeChrome();
      fadeOverlay(TRANSFORM_DURATION_MS, TRANSFORM_EASING);
      fadeNonActiveSlides(
        fsSlider,
        nodeIdx,
        targetImg,
        args.isVideoSlide,
        TRANSFORM_DURATION_MS,
        TRANSFORM_EASING
      );

      let captionClone: HTMLElement | null = cloneFsCaptionForNode(fsSlider, nodeIdx);
      if (captionClone) {
        captionClone.style.transition = `opacity ${TRANSFORM_DURATION_MS}ms ${TRANSFORM_EASING}`;
        void captionClone.offsetWidth;
        captionClone.style.opacity = "0";
      }

      // video path
      if (args.isVideoSlide) {
        await animateVideoCloseProxy({
          fsSliderEl: fsSlider,
          nodeIdx,
          thumbCropRect: args.thumbCropRect,
          endClipRect,
          endObjPos: args.endObjPos ?? { x: 0.5, y: 0.5 },
          captionClone,
          trackStyleMutation,
          trackMutedMutation,
          safeTeardown,
          DURATION_MS: TRANSFORM_DURATION_MS,
          EASING: TRANSFORM_EASING,
        });
        return;
      }

      // image path (move the real fullscreen image)
      const movingEl = targetImg!;
      const restoreIntoParent = movingEl.parentNode || null;
      const restoreNextSibling = movingEl.nextSibling || null;

      const fsCS = getComputedStyle(movingEl);
      const fsObjPos = parseObjectPosition(fsCS?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
      const fsFit = ((fsCS?.objectFit || "contain") as "contain" | "cover");

      const curRect = movingEl.getBoundingClientRect();
      const natW = Math.max(1, movingEl.naturalWidth || Math.round(curRect.width) || 1);
      const natH = Math.max(1, movingEl.naturalHeight || Math.round(curRect.height) || 1);

      const startT =
        fsFit === "contain"
          ? containTransformForRect(natW, natH, curRect, fsObjPos)
          : coverTransformForRect(natW, natH, curRect, fsObjPos);

      const endT = coverTransformForRect(natW, natH, args.thumbCropRect, args.endObjPos);

      const overflowRects = findOverflowClipAncestorRectsFromEl(
        args.destImg ?? null,
        2
      ).filter((rect) => !rectContainsRect(rect, args.thumbCropRect));
      const parentOverflowRect = overflowRects[0] ?? null;
      const grandparentOverflowRect = overflowRects[1] ?? null;
      const canSkipImageClipper =
        fsFit === "contain" &&
        endClipRect === args.thumbCropRect &&
        overflowRects.length === 0 &&
        rectMatchesNaturalAspect(args.thumbCropRect, natW, natH);
      const closeLayerRoot = modalRef.current;
      const closeMediaZ = closeLayerRoot ? 1 : computedBaseZ + 1;

      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;

      const imageClipper = createViewportClipper(
        canSkipImageClipper
          ? FULL_VIEWPORT_INSET
          : insetForViewportRect(curRect, vw, vh),
        closeMediaZ
      );

      const parentClipper = parentOverflowRect
        ? createViewportClipper(FULL_VIEWPORT_INSET, closeMediaZ)
        : null;

      const grandparentClipper = grandparentOverflowRect
        ? createViewportClipper(FULL_VIEWPORT_INSET, closeMediaZ)
        : null;

      const prevStyle = {
        position: movingEl.style.position,
        left: movingEl.style.left,
        top: movingEl.style.top,
        width: movingEl.style.width,
        height: movingEl.style.height,
        maxWidth: movingEl.style.maxWidth,
        maxHeight: movingEl.style.maxHeight,
        transformOrigin: movingEl.style.transformOrigin,
        transform: movingEl.style.transform,
        transition: movingEl.style.transition,
        willChange: movingEl.style.willChange,
        backfaceVisibility: movingEl.style.backfaceVisibility,
        contain: movingEl.style.contain,
        isolation: movingEl.style.isolation,
        zIndex: movingEl.style.zIndex,
        pointerEvents: movingEl.style.pointerEvents,
      };

      Object.assign(movingEl.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: `${natW}px`,
        height: `${natH}px`,
        maxWidth: 'none',
        maxHeight: 'none',
        transformOrigin: '50% 50%',
        willChange: 'transform',
        transition: 'none',
        zIndex: '1',
        pointerEvents: 'none',
        backfaceVisibility: 'hidden',
        contain: 'paint',
        isolation: 'isolate',
      } as CSSStyleDeclaration);

      imageClipper.appendChild(movingEl);

      if (parentClipper) {
        parentClipper.appendChild(imageClipper);

        if (grandparentClipper) {
          grandparentClipper.appendChild(parentClipper);
        }
      } else if (grandparentClipper) {
        grandparentClipper.appendChild(imageClipper);
      }

      const outermostClipper = grandparentClipper ?? parentClipper ?? imageClipper;

      (closeLayerRoot ?? document.body).appendChild(outermostClipper);

      movingEl.style.transform =
        `translate3d(${startT.cx}px, ${startT.cy}px, 0)` +
        ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
        ` scale(${startT.scale})`;

      void outermostClipper.offsetWidth;

      if (!canSkipImageClipper) {
        imageClipper.style.transition = `clip-path ${TRANSFORM_DURATION_MS}ms ${TRANSFORM_EASING}`;
      }
      if (parentClipper) {
        parentClipper.style.transition = `clip-path ${TRANSFORM_DURATION_MS}ms ${TRANSFORM_EASING}`;
      }
      if (grandparentClipper) {
        grandparentClipper.style.transition = `clip-path ${TRANSFORM_DURATION_MS}ms ${TRANSFORM_EASING}`;
      }
      movingEl.style.transition = `transform ${TRANSFORM_DURATION_MS}ms ${TRANSFORM_EASING}`;

      requestAnimationFrame(() => {
        if (!canSkipImageClipper) {
          setClipperInset(imageClipper, insetForViewportRect(endClipRect, vw, vh));
        }
        if (parentClipper && parentOverflowRect) {
          setClipperInset(parentClipper, insetForViewportRect(parentOverflowRect, vw, vh));
        }
        if (grandparentClipper && grandparentOverflowRect) {
          setClipperInset(grandparentClipper, insetForViewportRect(grandparentOverflowRect, vw, vh));
        }

        movingEl.style.transform =
          `translate3d(${endT.cx}px, ${endT.cy}px, 0)` +
          ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
          ` scale(${endT.scale})`;
      });

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;

        movingEl.removeEventListener('transitionend', onEnd as any);

        try {
          if (restoreIntoParent) {
            if (restoreNextSibling) {
              restoreIntoParent.insertBefore(movingEl, restoreNextSibling);
            } else {
              restoreIntoParent.appendChild(movingEl);
            }
          }
        } catch {}

        Object.assign(movingEl.style, prevStyle);

        try { outermostClipper.remove(); } catch {}

        safeTeardown();
      };

      const onEnd = (ev: TransitionEvent) => {
        if (ev.propertyName !== 'transform') return;
        finish();
      };

      movingEl.addEventListener('transitionend', onEnd as any, { once: true });
      window.setTimeout(() => finish(), TRANSFORM_DURATION_MS + 80);
    };

    let canonicalIdx = normalizedFsIndex;
    let localSlideIdx = normalizedFsIndex;
    let gridishTransformDestImg: HTMLImageElement | null = null;

    async function syncBaseToCanonical() {
      if (!slider.current || !slides.current?.length) return;

      if (!moveBaseSliderToSlide(
        localSlideIdx,
        slides,
        centerSlider,
        setSliderIndex
      )) return;

      // let layout settle (helps when you immediately tear down FS)
      void slider.current.offsetWidth;
    }

    const waitForEntriesOwnerReady = async (
      options: { scrollPage?: boolean } = {}
    ) => {
      if (layout !== "entries" || !entryMapRef?.current) return;

      const link = entryMapRef.current[canonicalIdx];
      if (!link) return;

      localSlideIdx = link.mediaIndex;
      const shouldScrollPage = options.scrollPage !== false;

      if (shouldScrollPage) {
        await scrollEntrySectionIntoView(link.entryIndex);
      } else if (!isEntryOwnerReady(link.entryIndex)) {
        syncFullscreenSourceFromIndex(canonicalIdx);
        return;
      }

      const ready = await waitForEntryOwnerReady(link.entryIndex);
      if (!ready) return;

      // waitForEntryOwnerReady resolves when React sets data-rmg-entry-ready="1", which is
      // when CSS transitions START — not when they finish. Directly force the skeleton and
      // content to their final visual state (no transition) so the FLIP starts on a clean,
      // fully-revealed entry.
      const revealSection = document.querySelector<HTMLElement>(`[data-rmg-entry-owner="${link.entryIndex}"]`);
      if (revealSection) {
        for (const child of Array.from(revealSection.children)) {
          const el = child as HTMLElement;
          trackStyleMutation(el, 'transition', 'none');
          if (el.hasAttribute('data-rmg-entry-skeleton')) {
            trackStyleMutation(el, 'opacity', '0');
          } else {
            trackStyleMutation(el, 'opacity', '1');
          }
        }
        // One RAF so the browser paints the forced state before the FLIP animation starts.
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }

      syncFullscreenSourceFromIndex(canonicalIdx);
    };

    let closeSpinnerEl: HTMLElement | null = null;
    if (!isGridish && layout === 'entries' && entryMapRef?.current) {
      const link = entryMapRef.current[canonicalIdx];
      if (link) {
        const section = document.querySelector<HTMLElement>(`[data-rmg-entry-owner="${link.entryIndex}"]`);
        // Suppress reveal transitions so the entry appears instantly before the close
        // animation starts — avoids the skeleton being visible or content still fading
        // in while the FLIP runs.
        trackStylePropertyMutation(section, '--rmg-entry-reveal-duration', '0ms');
        trackStylePropertyMutation(section, '--rmg-entry-reveal-delay', '0ms');
        trackStylePropertyMutation(section, '--rmg-entry-skeleton-exit-duration', '0ms');

        if (!isEntryOwnerReady(link.entryIndex)) {
          const el = document.createElement('div');
          el.className = styles.spinner;
          el.style.position = 'fixed';
          el.style.zIndex = String(computedBaseZ + 10);
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          document.body.appendChild(el);
          closeSpinnerEl = el;
        }
      }
    }

    const url = originals[canonicalIdx];
    const isVideoSlide = isVideoItem(url);
    const normalizedLatchedIntroIndex = normalizeFsIndex(
      latchedIntroIndex,
      originals.length
    );
    const isLatchedIntroIndex = normalizedLatchedIntroIndex === canonicalIdx;
    let nonGridishThumbInfo: ThumbInfo | null = null;
    let nonGridishHasTransformTarget = false;

    if (!isGridish) {
      let entryCloseScrollPolicy: ResolvedCloseScrollPolicy | null = null;
      let entryCloseScrollTarget: HTMLElement | null = null;

      if (layout === "entries" && entryMapRef?.current) {
        const link = entryMapRef.current[canonicalIdx];
        if (link) {
          entryCloseScrollTarget = document.querySelector<HTMLElement>(
            `[data-rmg-entry-owner="${link.entryIndex}"]`
          );
          entryCloseScrollPolicy = resolveFullscreenCloseScrollPolicy({
            closeScroll: fs.closeScroll,
            index: canonicalIdx,
            layout,
            target: entryCloseScrollTarget,
          });

          if (
            entryCloseScrollPolicy.enabled &&
            entryCloseScrollPolicy.timing === "after-close" &&
            entryCloseScrollTarget
          ) {
            postCloseScrollActionRef.current = () =>
              scrollElementIntoCenterView(entryCloseScrollTarget);
          }
        }
      }

      const shouldScrollEntryBeforeClose =
        !!entryCloseScrollPolicy?.enabled &&
        entryCloseScrollPolicy.timing === "before-close";

      await waitForEntriesOwnerReady({ scrollPage: shouldScrollEntryBeforeClose });

      if (closeSpinnerEl) {
        closeSpinnerEl.style.setProperty('opacity', '0', 'important');
        const captured = closeSpinnerEl;
        setTimeout(() => { try { captured.remove(); } catch {} }, 200);
        closeSpinnerEl = null;
      }

      if (!isVideoSlide && slider.current && slides.current?.length) {
        nonGridishThumbInfo = await findThumbInfoEnsuringVisible(
          localSlideIdx,
          slider,
          slides,
          centerSlider,
          setSliderIndex
        );

        const visibilityTarget =
          nonGridishThumbInfo?.imgEl ?? nonGridishThumbInfo?.cellEl ?? null;
        nonGridishHasTransformTarget = !!(
          visibilityTarget &&
          isElementVisiblyOnScreen(visibilityTarget, 0.05, {
            ignoredElements: [
              modalRef.current,
              overlayDivRef.current,
              shieldRef.current,
            ],
          })
        );
      }
    } else {
      const layoutlessTarget = resolveLayoutlessTarget(canonicalIdx);
      const slotInfo = resolveExpandableSlotAtIndex(canonicalIdx);
      const el =
        layoutlessTarget.host ??
        layoutlessTarget.media ??
        slotInfo.host ??
        resolveRegisteredCellHost(canonicalIdx) ??
        document.querySelector<HTMLElement>(`[data-rmg-idx="${canonicalIdx}"]`) ??
        null;

      const closeScrollPolicy = resolveFullscreenCloseScrollPolicy({
        closeScroll: fs.closeScroll,
        index: canonicalIdx,
        layout,
        target: el,
      });
      const shouldScrollBeforeClose =
        closeScrollPolicy.enabled && closeScrollPolicy.timing === "before-close";
      const shouldScrollAfterClose =
        closeScrollPolicy.enabled && closeScrollPolicy.timing === "after-close";

      if (shouldScrollAfterClose && el) {
        postCloseScrollActionRef.current = () => scrollElementIntoCenterView(el);
      }

      if (shouldScrollBeforeClose) {
        await scrollElementIntoCenterView(el);
      }

      await waitForEntriesOwnerReady({ scrollPage: shouldScrollBeforeClose });

      gridishTransformDestImg = resolveGridishTransformDestImg(canonicalIdx);
      if (
        gridishTransformDestImg &&
        !isElementVisiblyOnScreen(gridishTransformDestImg, 0.05, {
          ignoredElements: [
            modalRef.current,
            overlayDivRef.current,
            shieldRef.current,
          ],
        })
      ) {
        gridishTransformDestImg = null;
      }
    }

    const hasTransformTarget =
      !isVideoSlide &&
      (isGridish ? !!gridishTransformDestImg : nonGridishHasTransformTarget);

    if (
      shouldUseFadeClose({
        transitionFade,
        isVideoSlide,
        introMethod,
        isLatchedIntroIndex,
        hasTransformTarget,
      })
    ) {
      await syncBaseToCanonical();
      fadeCloseAndTeardown();
      return;
    }

    if (!isGridish) {
      if (!slider.current || !slides.current?.length) {
        safeTeardown();
        return;
      }

      const measureAndAnimate = async () => {
        const thumbInfo =
          nonGridishThumbInfo ??
          (await findThumbInfoEnsuringVisible(
            localSlideIdx,
            slider,
            slides,
            centerSlider,
            setSliderIndex
          ));

        if (!thumbInfo) {
          safeTeardown();
          return;
        }

        let thumbCropRect = thumbInfo.cropRect;
        let endObjPos = thumbInfo.objPos ?? { x: 0.5, y: 0.5 };

        if (thumbInfo.imgEl) {
          const { cropRect, objPos } = computeThumbCropRectFromImg(thumbInfo.imgEl);
          thumbCropRect = cropRect;
          endObjPos = objPos;
        }

        await animateCloseToThumb({
          thumbCropRect,
          endObjPos,
          isVideoSlide: false,
          destImg: thumbInfo.imgEl,
        });
      };

      await measureAndAnimate();
      return;
    }

    if (!expandableImageRefs?.current) {
      safeTeardown();
      return;
    }

    const destImg = gridishTransformDestImg ?? resolveGridishTransformDestImg(canonicalIdx);

    if (!destImg) {
      safeTeardown();
      return;
    }

    const { cropRect: thumbCropRect, objPos: endObjPos } = computeThumbCropRectFromImg(destImg);

    await animateCloseToThumb({
      thumbCropRect,
      endObjPos,
      isVideoSlide: false,
      destImg,
    });
  }

  useEffect(() => {
    requestFsCloseRef.current = () => {
      void proceedToClose();
    };

    return () => {
      if (requestFsCloseRef.current) requestFsCloseRef.current = null;
    };
  }, [requestFsCloseRef, proceedToClose]);

  function safeTeardown() {
    const postCloseScrollAction = postCloseScrollActionRef.current;
    postCloseScrollActionRef.current = null;

    if (cancelFsCloseRef.current) cancelFsCloseRef.current = null;
    closeInProgressRef.current = false;
    closeAnimationStartedRef.current = false;
    unmountShield();
    setModalClosingHitTestState(false);

    const fsSlider = withinFs<HTMLElement>('.fullscreen_slider');
    if (fsSlider) {
      fsSlider.style.removeProperty('transition');
    }

    const modal = modalRef.current;
    if (modal) {
      modal.style.removeProperty('transition');
    }

    if (!transitionFade) {
      if (fsSlider) fsSlider.style.opacity = '0';

      if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
    }

    overlayDivRef.current?.remove()
    overlayDivRef.current = null

    restoreTrackedCloseMutations()
    onForceResetZoom()
    onClose()
    setShowFullscreenSlider(false)
    setClosingModal(false)
    setLatchedIntroMethod(null)

    if (postCloseScrollAction && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        void postCloseScrollAction();
      });
    }
  }

  const closeEnabled = fs?.controls?.close?.enabled !== false;

  const close = () => void proceedToClose();

  const userNode =
    typeof fs?.controls?.close?.render === "function"
      ? fs?.controls?.close.render()
      : null;

  function canonicalFromFsIndex(fsIndex: number, originalsLen: number) {
    return normalizeFsIndex(fsIndex, originalsLen);
  }

  const originalsLen = Math.max(0, wrappedItems.length - 2);
  const canonicalIdx = canonicalFromFsIndex(fsSub.get(), Math.max(1, originalsLen));

  const counterEnabled = fs?.controls?.counter?.enabled !== false;
  const showCounter = counterEnabled && cellCount > 1;

  const userCounterNode =
    typeof fs?.controls?.counter?.render === "function"
      ? fs.controls.counter.render({ index: canonicalIdx, count: cellCount })
      : null;

  return (
    <div
      ref={setModalRef}
      data-rmg-fs-root="true"
      onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
        pointerDownX.current = e.clientX
        pointerDownY.current = e.clientY
      }}
      className='fs_modal'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        zIndex: computedBaseZ,
        ['--rmg-fs-z' as any]: computedBaseZ,
        display: 'block',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        contain: 'layout style size',
        overflow: 'hidden',
      }}
    >
      {closeEnabled && (
        <button
          ref={closeButtonRef as any}
          type="button"
          aria-label="Close"
          onClick={() => close()}
          className={[
            styles?.closeBtn,
            fs?.controls?.close?.className ?? "",
            open ? styles.open : "",
          ].filter(Boolean).join(" ")}
          style={{
            ...fs?.controls?.close?.style,
          }}
        >
          {userNode ?? <DefaultCloseIcon />}
        </button>
      )}
      {showCounter && (
        <div
          ref={counterRef as any}
          className={[
            styles?.counter,
            fs?.controls?.counter?.className ?? "",
            open ? styles.open : "",
          ].filter(Boolean).join(" ")}
          style={{
            ...(fs?.controls?.counter?.style ?? {}),
          }}
        >
          {userCounterNode ?? (
            <DefaultCounterText index={canonicalIdx} count={cellCount} />
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default FullscreenModal
