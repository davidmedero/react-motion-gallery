/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
} from 'react'
import type { FullscreenSliderSub } from './fullscreenSliderSub'
import { parseObjectPosition } from '../shared/transitions/objectPosition';
import { containTransformForRect, coverTransformForRect, objectFitContentRect } from '../shared/transitions/objectFitTransform';
import { MediaItem } from '../shared/types/media';
import { IndexMode } from '../api/types';
import { MediaEntryLink } from '../entries';
import { FullscreenOptions } from './types';
import { DefaultCloseIcon } from './DefaultCloseIcon';
import { DefaultChevronIcon } from './DefaultChevronIcon';
import { DefaultCounterText } from './DefaultCounterText';

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
  visibleImagesRef: RefObject<number>
  selectedIndex: RefObject<number>
  sliderX: RefObject<number>
  sliderVelocity: RefObject<number>
  isWrapping: RefObject<boolean>
  wrappedItems: MediaItem[]
  centerAlign: boolean
  centerSlider?: () => void;
  setSliderIndex: (i: number, mode: IndexMode) => void;
  onForceResetZoom: () => void;
  layout?: 'slider' | 'grid' | 'masonry' | 'entries';
  expandableImageRefs: RefObject<RefObject<HTMLImageElement | null>[]>
  entryMapRef?: RefObject<MediaEntryLink[] | null>;
  entryMediaLayout?: string;
  introFade?: boolean;
  introDuration?: number;
  introEasing?: string;
  requestFsCloseRef: React.RefObject<null | (() => void)>;
  fs: FullscreenOptions;
  styles: Record<string, string>;
  direction: 'ltr' | 'rtl';
  setFullscreenOpen: (open: boolean) => void;
}

function freezeRect(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  el.style.width = `${Math.max(1, Math.round(r.width))}px`
  el.style.height = `${Math.max(1, Math.round(r.height))}px`
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
  } as CSSStyleDeclaration)
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

function findThumbInfoEnsuringVisible(
  wrapIndex: number,
  sliderRef: RefObject<HTMLDivElement | null>,
  slidesRef: RefObject<{ cells: { element: HTMLElement; index: number }[]; target: number }[]>,
  centerSlider: (() => void) | undefined,
  setSliderIndex: (i: number, mode: IndexMode) => void
): ThumbInfo | null {
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

  const cropRect = targetCell.getBoundingClientRect()

  const imgEl = targetCell.querySelector('img') as HTMLImageElement | null
  const cs = imgEl ? getComputedStyle(imgEl) : null
  const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
  const renderedRect = imgEl?.getBoundingClientRect() ?? null
  const renderedW = renderedRect ? renderedRect.width : 0
  const renderedH = renderedRect ? renderedRect.height : 0

  return {
    cropRect,
    imgEl,
    objPos,
    renderedW,
    renderedH,
    renderedRect
  }
}

type ThumbInfo = {
  cropRect: DOMRect
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

async function scrollEntrySectionIntoView(entryIndex: number): Promise<void> {
  if (typeof window === 'undefined') return

  const section = document.querySelector<HTMLElement>(
    `[data-rmg-entry-owner="${entryIndex}"]`
  )

  if (!section) return

  if (isElementOnScreen(section, 0.5)) return

  const rect = section.getBoundingClientRect()
  const currentScroll = window.scrollY || document.documentElement.scrollTop || 0

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || rect.height
  const targetTop =
    rect.top + currentScroll - (viewportHeight - rect.height) / 2

  window.scrollTo({
    top: targetTop,
    behavior: 'instant',
  })
}

async function scrollElementIntoCenterView(el: HTMLElement | null): Promise<void> {
  if (!el) return;

  if (isElementOnScreen(el, 0.5)) return;

  const rect = el.getBoundingClientRect();
  const scrollY =
    window.scrollY ||
    document.documentElement.scrollTop ||
    0;

  const viewportHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    rect.height;

  const targetTop =
    rect.top + scrollY - (viewportHeight - rect.height) / 2;

  window.scrollTo({
    top: targetTop,
    behavior: 'instant',
  });
}

type VideoProxyCloseArgs = {
  fsSliderEl: HTMLElement;
  nodeIdx: number;
  thumbCropRect: DOMRect;
  endObjPos: { x: number; y: number };
  captionClone: HTMLElement | null;

  safeTeardown: () => void;
  onCaptionCloneGone?: () => void;
  DURATION_MS: number;
  EASING: string;
};

async function animateVideoCloseProxy({
  fsSliderEl,
  nodeIdx,
  thumbCropRect,
  endObjPos,
  captionClone,
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
    freezeRect(wrapperEl);
    wrapperEl.style.visibility = 'hidden';
    wrapperEl.style.opacity = '0';
    const poster = wrapperEl.querySelector('.plyr__poster') as HTMLElement | null;
    if (poster) poster.style.opacity = '0';
    const controls = wrapperEl.querySelector('.plyr__controls') as HTMLElement | null;
    if (controls) controls.style.opacity = '0';
  }

  if (fsVideo) {
    try { fsVideo.pause(); } catch {}
    fsVideo.muted = true;
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
  } as CSSStyleDeclaration);

  movingProxy.style.transform =
    `translate3d(${startT.cx}px, ${startT.cy}px, 0)` +
    ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
    ` scale(${startT.scale})`;

  const clipper = createClipper({DURATION_MS, EASING});
  clipper.style.clipPath = insetForRect(fsRect);
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
    clipper.style.clipPath = insetForRect(thumbCropRect);
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
  entryMapRef,
  entryMediaLayout,
  introFade,
  introDuration = 300,
  introEasing = 'cubic-bezier(.4,0,.22,1)',
  requestFsCloseRef,
  fs,
  styles,
  direction,
  setFullscreenOpen
}) => {

  const DURATION_MS = introDuration
  const EASING = introEasing

  const modalRef = React.useRef<HTMLDivElement | null>(null);
  const pointerDownX = React.useRef<number>(0)
  const pointerDownY = React.useRef<number>(0)

  const shieldRef = React.useRef<HTMLDivElement | null>(null);

  function mountShield() {
    if (shieldRef.current) return;

    const shield = document.createElement('div');
    shield.setAttribute('data-rmg-fs-shield', 'true');

    Object.assign(shield.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483606',
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

  useEffect(() => {
    return () => unmountShield();
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

    activeCaptionEl.style.visibility = 'hidden'

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

  function fadeNonActiveSlides(fsSlider: HTMLElement, nodeIdx: number, targetImg: HTMLImageElement | null, isVideoSlide: boolean) {
    if (isVideoSlide) {
      fsSlider.querySelectorAll<HTMLElement>('[data-index]').forEach(el => {
        if (el.dataset.index === String(nodeIdx)) return;
        el.style.transition = 'opacity 0.3s cubic-bezier(.4,0,.22,1)';
        el.style.opacity = '0';
      });
      return;
    }

    fsSlider.querySelectorAll<HTMLElement>('[data-rmg-fs-slide="true"]').forEach(slide => {
      if (targetImg && slide.contains(targetImg)) return;
      slide.style.transition = 'opacity 0.3s cubic-bezier(.4,0,.22,1)';
      slide.style.opacity = '0';
    });
  }

  function fadeOverlay() {
    const ov = overlayDivRef.current;
    if (!ov) return;
    ov.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
    ov.style.opacity = '0';
    ov.style.pointerEvents = 'none';
  }

  function isVideoItem(m: MediaItem | null | undefined): boolean {
    if (!m) return false;
    return (m as any).kind === 'video' || /\.(mp4|webm|ogg)$/i.test((m as any).src || '');
  }

  function fadeCloseAndTeardown() {
    fadeChrome()

    fadeOverlay()

    const fsSlider = withinFs<HTMLElement>('.fullscreen_slider');
    if (fsSlider) {
      fsSlider.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
      fsSlider.style.opacity = '0';
    }

    const modal = withinFs<HTMLElement>('.fs_modal');
    if (modal) {
      modal.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
    }

    window.setTimeout(() => {
      safeTeardown();
    }, DURATION_MS + 40);
  }

  async function proceedToClose() {
    if (!open) return;

    mountShield();
    isAnimating.current = false;
    isClick.current = false;
    cells.current = [];
    setClosingModal(true);

    const originals = wrappedItems.slice(1, wrappedItems.length - 1);
    if (!originals.length) {
      safeTeardown();
      return;
    }

    const fsIdx = fsSub.get();
    const normalizedFsIndex = normalizeFsIndex(fsIdx, originals.length);

    const isGridish =
      layout === "grid" ||
      layout === "masonry" ||
      entryMediaLayout === "grid" ||
      entryMediaLayout === "masonry";

    const computeThumbCropRectFromImg = (img: HTMLImageElement): { cropRect: DOMRect; objPos: { x: number; y: number } } => {
      const box = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
      const fit = (cs?.objectFit ?? "cover") as "contain" | "cover";

      if (fit !== "contain") return { cropRect: box, objPos };

      const natW = Math.max(1, img.naturalWidth || 0);
      const natH = Math.max(1, img.naturalHeight || 0);
      const cropRect = objectFitContentRect(natW, natH, box, "contain", objPos);
      return { cropRect, objPos };
    };

    const animateCloseToThumb = async (args: {
      thumbCropRect: DOMRect;
      endObjPos: { x: number; y: number };
      isVideoSlide: boolean;
    }) => {
      const fsSlider = withinFs<HTMLElement>(".fullscreen_slider");
      if (!fsSlider) {
        safeTeardown();
        return;
      }

      const nodeIdx = nodeIdxFromFs(normalizedFsIndex, cellCount);

      const targetImg =
        !args.isVideoSlide
          ? fsSlider.querySelector<HTMLImageElement>(`img[data-index="${nodeIdx}"]`) ?? null
          : null;

      if (!targetImg && !args.isVideoSlide) {
        safeTeardown();
        return;
      }

      fadeNonActiveSlides(fsSlider, nodeIdx, targetImg, args.isVideoSlide);

      let captionClone: HTMLElement | null = cloneFsCaptionForNode(fsSlider, nodeIdx);
      if (captionClone) {
        captionClone.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
        void captionClone.offsetWidth;
        captionClone.style.opacity = "0";
      }

      // video path
      if (args.isVideoSlide) {
        await animateVideoCloseProxy({
          fsSliderEl: fsSlider,
          nodeIdx,
          thumbCropRect: args.thumbCropRect,
          endObjPos: args.endObjPos ?? { x: 0.5, y: 0.5 },
          captionClone,
          safeTeardown,
          DURATION_MS,
          EASING,
        });
        return;
      }

      // image path (PROXY: do NOT move the real img)
      const realImg = targetImg!;
      const fsCS = getComputedStyle(realImg);
      const fsObjPos = parseObjectPosition(fsCS?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
      const fsFit = ((fsCS?.objectFit || "contain") as "contain" | "cover");

      const curRect = realImg.getBoundingClientRect();
      const natW = Math.max(1, realImg.naturalWidth || Math.round(curRect.width) || 1);
      const natH = Math.max(1, realImg.naturalHeight || Math.round(curRect.height) || 1);

      const startT =
        fsFit === "contain"
          ? containTransformForRect(natW, natH, curRect, fsObjPos)
          : coverTransformForRect(natW, natH, curRect, fsObjPos);

      const endT = coverTransformForRect(natW, natH, args.thumbCropRect, args.endObjPos);

      const proxy = realImg.cloneNode(true) as HTMLImageElement;
      proxy.decoding = "async";
      (proxy as any).loading = "eager";
      proxy.draggable = false;

      const realPrev = {
        visibility: realImg.style.visibility,
        opacity: realImg.style.opacity,
        transition: realImg.style.transition,
        willChange: realImg.style.willChange,
      };
      realImg.style.transition = "none";
      realImg.style.willChange = "opacity";
      realImg.style.visibility = "hidden";
      realImg.style.opacity = "0";

      Object.assign(proxy.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: `${natW}px`,
        height: `${natH}px`,
        maxWidth: "none",
        maxHeight: "none",
        transformOrigin: "50% 50%",
        willChange: "transform",
        zIndex: "2147483601",
        pointerEvents: "none",
        transition: "none",
        opacity: "1",
      } as CSSStyleDeclaration);

      proxy.style.transform =
        `translate3d(${startT.cx}px, ${startT.cy}px, 0)` +
        ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
        ` scale(${startT.scale})`;

      const clipper = createClipper({ DURATION_MS, EASING });
      clipper.appendChild(proxy);

      void proxy.offsetWidth;
      void clipper.offsetWidth;

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;

        if (captionClone) {
          try { captionClone.remove(); } catch {}
          captionClone = null;
        }

        proxy.removeEventListener("transitionend", onEnd as any);

        try { document.body.removeChild(clipper); } catch {}
        try { proxy.remove(); } catch {}

        safeTeardown();
      };

      const onEnd = (ev: TransitionEvent) => {
        if (ev.propertyName !== "transform") return;
        finish();
      };

      requestAnimationFrame(() => {
        clipper.style.clipPath = insetForRect(args.thumbCropRect);
        proxy.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
        proxy.style.transform =
          `translate3d(${endT.cx}px, ${endT.cy}px, 0)` +
          ` translate3d(${-natW / 2}px, ${-natH / 2}px, 0)` +
          ` scale(${endT.scale})`;

        proxy.addEventListener("transitionend", onEnd as any, { once: true });

        window.setTimeout(() => finish(), DURATION_MS + 80);
      });
    };

    let canonicalIdx = normalizedFsIndex;
    let localSlideIdx = normalizedFsIndex;

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

    if (!isGridish) {
      if (!slider.current || !slides.current?.length) return;

      if (layout === "entries" && entryMapRef?.current) {
        const link = entryMapRef.current[canonicalIdx];
        if (link) {
          localSlideIdx = link.mediaIndex;
          await scrollEntrySectionIntoView(link.entryIndex);
        }
      }
    } else {
      const el = document.querySelector<HTMLElement>(`[data-rmg-idx="${canonicalIdx}"]`);
      await scrollElementIntoCenterView(el);

      if (layout === "entries" && entryMapRef?.current) {
        const link = entryMapRef.current[canonicalIdx];
        if (link) {
          await scrollEntrySectionIntoView(link.entryIndex);
        }
      }
    }

    const url = originals[canonicalIdx];
    const isVideoSlide = isVideoItem(url);

    if (introFade || isVideoSlide) {
      await syncBaseToCanonical();
      fadeCloseAndTeardown();
      return;
    }

    fadeChrome();
    fadeOverlay();

    if (!isGridish) {
      if (!slider.current || !slides.current?.length) {
        safeTeardown();
        return;
      }

      const viewport = getViewportEl(slider.current);
      if (!viewport) {
        safeTeardown();
        return;
      }

      const targetCellEl = findRenderedCellForIndex(slider.current, viewport, localSlideIdx);
      if (!targetCellEl) {
        safeTeardown();
        return;
      }

      const shouldMove = !isCellVisible(targetCellEl, viewport, true);

      const measureAndAnimate = async () => {
        const thumbInfo = findThumbInfoEnsuringVisible(
          localSlideIdx,
          slider,
          slides,
          centerSlider,
          setSliderIndex
        );

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
        });
      };

      if (shouldMove) {
        if (!moveBaseSliderToSlide(
          localSlideIdx,
          slides,
          centerSlider,
          setSliderIndex
        )) {
          safeTeardown();
          return;
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => { void measureAndAnimate(); });
        });
      } else {
        await measureAndAnimate();
      }

      return;
    }

    if (!expandableImageRefs?.current) {
      safeTeardown();
      return;
    }

    const slot: any = (expandableImageRefs.current as any)[canonicalIdx] ?? null;

    const slotCurrent: any =
      slot && typeof slot === "object" && "current" in slot ? slot.current : slot;

    let destImg: HTMLImageElement | null = null;

    if (slotCurrent?.tagName === "IMG") {
      destImg = slotCurrent as HTMLImageElement;
    } else if (slotCurrent) {
      const host = slotCurrent as HTMLElement;
      destImg = host.querySelector?.("img") as HTMLImageElement | null;
    }

    if (!destImg) {
      const host = document.querySelector<HTMLElement>(`[data-rmg-idx="${canonicalIdx}"]`);
      destImg = (host?.querySelector("img") as HTMLImageElement | null) ?? null;
    }

    if (!destImg) {
      safeTeardown();
      return;
    }

    const { cropRect: thumbCropRect, objPos: endObjPos } = computeThumbCropRectFromImg(destImg);

    await animateCloseToThumb({
      thumbCropRect,
      endObjPos,
      isVideoSlide: false,
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
    unmountShield();

    if (!introFade) {
      const fsSlider = withinFs<HTMLElement>('.fullscreen_slider');
      if (fsSlider) fsSlider.style.opacity = '0';

      const modal = withinFs<HTMLElement>('.fs_modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
    }

    overlayDivRef.current?.remove()
    overlayDivRef.current = null

    onForceResetZoom()
    onClose()
    setShowFullscreenSlider(false)
    setClosingModal(false)
  }

  const closeEnabled = fs?.controls?.close?.enabled !== false;

  const close = () => void proceedToClose();

  const userNode =
    typeof fs?.controls?.close?.render === "function"
      ? fs?.controls?.close.render()
      : null;

  const allowFsArrows =
    fs?.controls?.arrows?.enabled !== false && cellCount > 1;

  const isRtl = direction === "rtl" || false;

  const arrows = fs?.controls?.arrows;

  const renderArrowNode = (dir: "prev" | "next", side: "left" | "right") => {
    const explicit =
      dir === "prev"
        ? typeof arrows?.renderPrev === "function" ? arrows.renderPrev() : null
        : typeof arrows?.renderNext === "function" ? arrows.renderNext() : null;

    if (explicit != null) return explicit;

    if (typeof arrows?.render === "function") {
      const node = arrows.render({ dir });
      if (node != null) return node;
    }

    return <DefaultChevronIcon side={side} />;
  };

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
      ref={modalRef}
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
        zIndex: 9999,
        display: 'block',
        touchAction: 'none',
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
      {allowFsArrows && (
        <>
          {/* LEFT */}
          <button
            ref={leftChevronRef as any}
            type="button"
            aria-label={getArrowAction("left", isRtl) === "prev" ? "Previous" : "Next"}
            onClick={() => runArrowAction(fsSub as any, getArrowAction("left", isRtl))}
            className={mergeClassNames(
              styles?.leftChevron,
              classFromElementStyle(arrows?.arrow as any),
              classFromElementStyle(arrows?.prev as any),
              open ? styles.open : ""
            )}
            style={{
              ...(styleFromElementStyle(arrows?.arrow as any) ?? {}),
              ...(styleFromElementStyle(arrows?.prev as any) ?? {}),
            }}
          >
            {renderArrowNode(getArrowAction("left", isRtl), "left")}
          </button>

          {/* RIGHT */}
          <button
            ref={rightChevronRef as any}
            type="button"
            aria-label={getArrowAction("right", isRtl) === "prev" ? "Previous" : "Next"}
            onClick={() => runArrowAction(fsSub as any, getArrowAction("right", isRtl))}
            className={mergeClassNames(
              styles?.rightChevron,
              classFromElementStyle(arrows?.arrow as any),
              classFromElementStyle(arrows?.next as any),
              open ? styles.open : ""
            )}
            style={{
              ...(styleFromElementStyle(arrows?.arrow as any) ?? {}),
              ...(styleFromElementStyle(arrows?.next as any) ?? {}),
            }}
          >
            {renderArrowNode(getArrowAction("right", isRtl), "right")}
          </button>
        </>
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
