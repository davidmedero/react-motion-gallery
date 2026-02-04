import { isVideoSlideElement, getPrimaryImgEl, baseFitSizeC, getCurrentTransform, mergePlyrOptions, defaultPlyrOptions, buildPlyrProps, defaultPlyrSource, detectProvider, Plyr, installDblclickGuardWhenReady, zoomTo, findImgAtPoint, readDataIndex, distance, midpoint } from './chunk-BK66FVWK.mjs';
import { FullscreenAxis, PanAxis, ThumbnailSlider } from './chunk-2KIKS4C5.mjs';
import { runFullscreenIntro, parseObjectPosition, objectFitContentRect, containTransformForRect, coverTransformForRect } from './chunk-IUGZ6H6B.mjs';
import { Limit, createBaseLimit, ScrollTarget, Vector1D, TranslateFullscreen, Counter, ScrollLooper, ScrollBody, Animations, EventStore, createDragTracker, isMouseEvent, factorAbs, mathSign, ScrollBounds, PercentOfView } from './chunk-PBZSDTG5.mjs';
import { createIndexChannel } from './chunk-A2O3PMPN.mjs';
import './chunk-AD5YPMDD.mjs';
import * as React8 from 'react';
import React8__default, { forwardRef, useRef, useCallback, useEffect, Children, useImperativeHandle, useMemo } from 'react';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { createRoot } from 'react-dom/client';

function DefaultCloseIcon({
  size = 35,
  className
}) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      className,
      width: size,
      height: size,
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
      focusable: "false",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "white",
          stroke: "#4f4f4f",
          strokeWidth: 0.5,
          d: "M12.96 4.46l-1.42-1.42-3.54 3.55-3.54-3.55-1.42 1.42 3.55 3.54-3.55 3.54 1.42 1.42 3.54-3.55 3.54 3.55 1.42-1.42-3.55-3.54 3.55-3.54z"
        }
      )
    }
  );
}
function DefaultChevronIcon({ side }) {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", width: "100%", height: "100%", focusable: "false", "aria-hidden": "true", style: { display: "block" }, children: /* @__PURE__ */ jsx(
    "polygon",
    {
      points: "4.586,3.414 9.172,8 4.586,12.586 6,14 12,8 6,2",
      fill: "white",
      stroke: "#4f4f4f",
      strokeWidth: "0.5"
    }
  ) });
}
function DefaultCounterText({ index, count }) {
  return /* @__PURE__ */ jsxs("span", { children: [
    index + 1,
    " / ",
    count
  ] });
}
function freezeRect(el) {
  const r = el.getBoundingClientRect();
  el.style.width = `${Math.max(1, Math.round(r.width))}px`;
  el.style.height = `${Math.max(1, Math.round(r.height))}px`;
}
var px = (n) => `${Math.round(n)}px`;
function getViewportEl(track) {
  if (!track) return null;
  return track.parentElement ?? track;
}
function getTotalCellsWidth(slides) {
  if (!slides) return 0;
  let totalWidth = 0;
  slides.forEach((slide) => {
    slide.cells.forEach((cell) => {
      totalWidth += cell.element.offsetWidth;
    });
  });
  return totalWidth;
}
function isCellVisible(cellEl, viewportEl, allowPartial = true) {
  const c = viewportEl.getBoundingClientRect();
  const r = cellEl.getBoundingClientRect();
  const fully = r.left >= c.left && r.right <= c.right && r.top >= c.top && r.bottom <= c.bottom;
  const intersects = r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom;
  return allowPartial ? intersects : fully;
}
function createClipper({ DURATION_MS, EASING }) {
  const clipper = document.createElement("div");
  Object.assign(clipper.style, {
    position: "fixed",
    inset: "0",
    clipPath: "inset(0px 0px 0px 0px)",
    willChange: "clip-path",
    pointerEvents: "none",
    transition: `clip-path ${DURATION_MS}ms ${EASING}`,
    zIndex: "9998",
    background: "transparent"
  });
  document.body.appendChild(clipper);
  void clipper.offsetWidth;
  return clipper;
}
function insetForRect(r) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = r.top;
  const left = r.left;
  const right = vw - (r.left + r.width);
  const bottom = vh - (r.top + r.height);
  return `inset(${px(top)} ${px(right)} ${px(bottom)} ${px(left)})`;
}
function findThumbInfoEnsuringVisible(wrapIndex, centerAlign, sliderRef, slidesRef, selectedIndex, sliderX, sliderVelocity, centerSlider, isWrappingRef, visibleImagesRef, setSliderIndex) {
  const slider = sliderRef.current;
  const slides = slidesRef.current;
  if (!slider || !slides?.length) return null;
  const matchSlide = slides.find((s) => s.cells.some((c) => c.index === wrapIndex));
  if (!matchSlide) return null;
  const slideIdx = slides.indexOf(matchSlide);
  const targetCell = matchSlide.cells.find((c) => c.index === wrapIndex)?.element ?? matchSlide.cells[0]?.element ?? null;
  if (!targetCell) return null;
  const viewport = getViewportEl(slider);
  if (!viewport) return null;
  const fullyVisible = isCellVisible(
    targetCell,
    viewport,
    /*allowPartial*/
    false
  );
  if (!fullyVisible) {
    moveBaseSliderToSlide(
      centerAlign,
      sliderRef,
      slidesRef,
      selectedIndex,
      sliderX,
      sliderVelocity,
      centerSlider,
      slideIdx,
      setSliderIndex
    );
    void slider.offsetWidth;
  }
  const isWrapping = !!isWrappingRef.current;
  const visibleImages = visibleImagesRef.current;
  const cloneOffset = isWrapping ? visibleImages || 0 : 0;
  const domSlideIdx = isWrapping ? slideIdx + cloneOffset : slideIdx;
  const cropRect = targetCell.getBoundingClientRect();
  const imgEl = targetCell.querySelector("img");
  const cs = imgEl ? getComputedStyle(imgEl) : null;
  const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
  const renderedRect = imgEl?.getBoundingClientRect() ?? null;
  const renderedW = renderedRect ? renderedRect.width : 0;
  const renderedH = renderedRect ? renderedRect.height : 0;
  return {
    slideIdx,
    domSlideIdx,
    cropRect,
    imgEl,
    objPos,
    renderedW,
    renderedH,
    renderedRect
  };
}
function moveBaseSliderToSlide(centerAlign, sliderRef, slidesRef, selectedIndex, sliderX, sliderVelocity, centerSlider, newIndex, setSliderIndex) {
  const slider = sliderRef.current;
  const slides = slidesRef.current;
  if (!slider || !slides) return;
  const viewport = getViewportEl(slider);
  if (!viewport) return;
  const totalWidth = getTotalCellsWidth(slides);
  const containerWidth = viewport.clientWidth;
  const firstCellWidthOfSlide = slides[newIndex].cells[0].element.clientWidth;
  const center = centerAlign ? (containerWidth - firstCellWidthOfSlide) / 2 : 0;
  const matchSlide = slides[newIndex];
  selectedIndex.current = newIndex;
  setSliderIndex(newIndex, "instant");
  sliderX.current = totalWidth <= containerWidth ? 0 : -matchSlide.target + center;
  sliderVelocity.current = 0;
  slider.style.transform = `translate3d(${px(sliderX.current)},0,0)`;
  centerSlider?.();
}
async function captureVideoFrame(video) {
  try {
    const w = video.videoWidth || Math.round(video.getBoundingClientRect().width) || 1;
    const h = video.videoHeight || Math.round(video.getBoundingClientRect().height) || 1;
    if (!w || !h) ;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    const dataURL = canvas.toDataURL("image/png");
    const img = new Image();
    img.decoding = "async";
    img.src = dataURL;
    await img.decode().catch(() => {
    });
    return img;
  } catch {
    return null;
  }
}
function extractPlyrPoster(wrapperEl) {
  if (!wrapperEl) return null;
  const v = wrapperEl.querySelector("video");
  if (v?.poster) return v.poster;
  const posterEl = wrapperEl.querySelector(".plyr__poster");
  if (posterEl) {
    const bg = getComputedStyle(posterEl).backgroundImage;
    const match = bg && /url\(["']?(.*?)["']?\)/.exec(bg);
    if (match?.[1]) return match[1];
  }
  return null;
}
async function makeVideoProxy(movingVideo, wrapperEl) {
  const frame = await captureVideoFrame(movingVideo);
  if (frame) return frame;
  const posterURL = extractPlyrPoster(wrapperEl);
  const img = new Image();
  img.decoding = "async";
  if (posterURL) {
    img.src = posterURL;
    try {
      await img.decode();
    } catch {
    }
  } else {
    const w = movingVideo.videoWidth || 1;
    const h = movingVideo.videoHeight || 1;
    const c = document.createElement("canvas");
    c.width = Math.max(1, w);
    c.height = Math.max(1, h);
    img.src = c.toDataURL("image/png");
  }
  return img;
}
function getVideoObjPos(videoEl) {
  if (!videoEl) return { x: 0.5, y: 0.5 };
  const cs = getComputedStyle(videoEl);
  return parseObjectPosition(cs?.objectPosition ?? null);
}
function styleProxyImage(img, objPos) {
  img.decoding = "async";
  img.loading = "eager";
  img.draggable = false;
  img.style.pointerEvents = "none";
  img.style.objectFit = "cover";
  img.style.objectPosition = `${Math.round(objPos.x * 100)}% ${Math.round(objPos.y * 100)}%`;
}
function isElementOnScreen(el, visibleThreshold = 0.4) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  if (visibleHeight <= 0) return false;
  return visibleHeight >= rect.height * visibleThreshold;
}
async function scrollEntrySectionIntoView(entryIndex) {
  if (typeof window === "undefined") return;
  const section = document.querySelector(
    `[data-rmg-entry-owner="${entryIndex}"]`
  );
  if (!section) return;
  if (isElementOnScreen(section, 0.5)) return;
  const rect = section.getBoundingClientRect();
  const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || rect.height;
  const targetTop = rect.top + currentScroll - (viewportHeight - rect.height) / 2;
  window.scrollTo({
    top: targetTop,
    behavior: "instant"
  });
}
async function scrollElementIntoCenterView(el) {
  if (!el) return;
  if (isElementOnScreen(el, 0.5)) return;
  const rect = el.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || rect.height;
  const targetTop = rect.top + scrollY - (viewportHeight - rect.height) / 2;
  window.scrollTo({
    top: targetTop,
    behavior: "instant"
  });
}
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
}) {
  const wrapperEl = fsSliderEl.querySelector(`.rmg__player[data-index="${nodeIdx}"]`) || fsSliderEl.querySelector(".rmg__player") || null;
  const fsVideo = wrapperEl?.querySelector("video");
  const fsRect = wrapperEl?.getBoundingClientRect?.() || fsVideo?.getBoundingClientRect?.();
  if (!fsRect) {
    safeTeardown();
    return;
  }
  if (wrapperEl) {
    freezeRect(wrapperEl);
    wrapperEl.style.visibility = "hidden";
    wrapperEl.style.opacity = "0";
    const poster = wrapperEl.querySelector(".plyr__poster");
    if (poster) poster.style.opacity = "0";
    const controls = wrapperEl.querySelector(".plyr__controls");
    if (controls) controls.style.opacity = "0";
  }
  if (fsVideo) {
    try {
      fsVideo.pause();
    } catch {
    }
    fsVideo.muted = true;
  }
  const vidForProxy = fsVideo || wrapperEl?.querySelector("video");
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
  const movingProxy = proxyImg;
  Object.assign(movingProxy.style, {
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
    opacity: "1",
    transition: "none"
  });
  movingProxy.style.transform = `translate3d(${startT.cx}px, ${startT.cy}px, 0) translate3d(${-natW / 2}px, ${-natH / 2}px, 0) scale(${startT.scale})`;
  const clipper = createClipper({ DURATION_MS, EASING });
  clipper.style.clipPath = insetForRect(fsRect);
  clipper.appendChild(movingProxy);
  void movingProxy.offsetWidth;
  void clipper.offsetWidth;
  const cleanup = () => {
    if (captionClone) {
      try {
        captionClone.remove();
      } catch {
      }
      onCaptionCloneGone?.();
    }
    try {
      document.body.removeChild(clipper);
    } catch {
    }
    try {
      movingProxy.remove();
    } catch {
    }
    safeTeardown();
  };
  const onEnd = (ev) => {
    if (ev.propertyName !== "transform") return;
    movingProxy.removeEventListener("transitionend", onEnd);
    cleanup();
  };
  requestAnimationFrame(() => {
    clipper.style.clipPath = insetForRect(thumbCropRect);
    movingProxy.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
    movingProxy.style.transform = `translate3d(${endT.cx}px, ${endT.cy}px, 0) translate3d(${-natW / 2}px, ${-natH / 2}px, 0) scale(${endT.scale})`;
    movingProxy.addEventListener("transitionend", onEnd, { once: true });
    window.setTimeout(() => {
      movingProxy.removeEventListener("transitionend", onEnd);
      cleanup();
    }, DURATION_MS + 120);
  });
}
var FullscreenModal = ({
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
  imageCount,
  setClosingModal,
  slides,
  slider,
  visibleImagesRef,
  selectedIndex,
  sliderX,
  sliderVelocity,
  isWrapping,
  wrappedItems,
  centerAlign,
  centerSlider,
  setSliderIndex,
  onForceResetZoom,
  layout,
  expandableImgRefs,
  entryMapRef,
  entryMediaLayout,
  introFade,
  introDuration = 300,
  introEasing = "cubic-bezier(.4,0,.22,1)",
  requestFsCloseRef,
  fs,
  styles,
  direction
}) => {
  const DURATION_MS = introDuration;
  const EASING = introEasing;
  const modalRef = React8__default.useRef(null);
  const pointerDownX = React8__default.useRef(0);
  const pointerDownY = React8__default.useRef(0);
  const shieldRef = React8__default.useRef(null);
  function mountShield() {
    if (shieldRef.current) return;
    const shield = document.createElement("div");
    shield.setAttribute("data-rmg-fs-shield", "true");
    Object.assign(shield.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483606",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "none",
      cursor: "default"
    });
    const stop = (e) => {
      e.preventDefault?.();
      e.stopPropagation?.();
    };
    shield.addEventListener("pointerdown", stop, { capture: true });
    shield.addEventListener("pointerup", stop, { capture: true });
    shield.addEventListener("pointermove", stop, { capture: true });
    shield.addEventListener("click", stop, { capture: true });
    shield.addEventListener("dblclick", stop, { capture: true });
    shield.addEventListener("contextmenu", stop, { capture: true });
    shield.addEventListener("touchstart", stop, { capture: true, passive: false });
    shield.addEventListener("touchmove", stop, { capture: true, passive: false });
    shield.addEventListener("touchend", stop, { capture: true, passive: false });
    shield.addEventListener("wheel", stop, { capture: true, passive: false });
    shield.addEventListener(
      "keydown",
      stop,
      { capture: true }
    );
    document.body.appendChild(shield);
    shieldRef.current = shield;
  }
  function unmountShield() {
    const shield = shieldRef.current;
    if (!shield) return;
    try {
      shield.remove();
    } catch {
    }
    shieldRef.current = null;
  }
  useEffect(() => {
    return () => unmountShield();
  }, []);
  function mergeClassNames(...parts) {
    return parts.filter(Boolean).join(" ");
  }
  function styleFromElementStyle(es) {
    return es?.style ?? void 0;
  }
  function classFromElementStyle(es) {
    return es?.className ?? "";
  }
  function getArrowAction(side, isRtl2) {
    if (side === "left") return isRtl2 ? "next" : "prev";
    return isRtl2 ? "prev" : "next";
  }
  function runArrowAction(fsSub2, action) {
    if (action === "next") fsSub2.requestNext();
    else fsSub2.requestPrev();
  }
  function withinFs(sel) {
    const root = modalRef.current;
    return root ? root.querySelector(sel) : null;
  }
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      proceedToClose();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [open]);
  function nodeIdxFromFs(fsIdx, imageCount2) {
    const fsSlider = withinFs(".fullscreen_slider");
    if (!fsSlider) return Math.max(0, Math.min(imageCount2 + 1, fsIdx + 1));
    let currentTranslateX = 0;
    const transform = getComputedStyle(fsSlider).transform;
    if (transform !== "none") {
      const matrix = new DOMMatrixReadOnly(transform);
      currentTranslateX = matrix.m41;
    }
    if (imageCount2 === 1) return 0;
    if (fsIdx === 0 && Math.abs(currentTranslateX) >= fsSlider.getBoundingClientRect().width) return imageCount2 + 1;
    if (fsIdx === 0) return 1;
    if (fsIdx === imageCount2 + 1) return imageCount2 + 1;
    return Math.max(1, Math.min(imageCount2, fsIdx + 1));
  }
  function cloneFsCaptionForNode(fsRoot, nodeIdx) {
    if (!fsRoot) return null;
    const activeMediaEl = fsRoot.querySelector(`[data-index="${nodeIdx}"]`) ?? null;
    const activeSlideEl = activeMediaEl ? activeMediaEl.closest('[data-rmg-fs-slide="true"]') : null;
    const activeCaptionEl = activeSlideEl?.querySelector('[data-rmg-fs-caption="true"]') ?? null;
    if (!activeCaptionEl) return null;
    const r = activeCaptionEl.getBoundingClientRect();
    const captionClone = activeCaptionEl.cloneNode(true);
    Object.assign(captionClone.style, {
      position: "fixed",
      left: `${Math.round(r.left)}px`,
      top: `${Math.round(r.top)}px`,
      width: `${Math.round(r.width)}px`,
      height: `${Math.round(r.height)}px`,
      margin: "0",
      transform: "none",
      zIndex: "2147483602",
      pointerEvents: "none"
    });
    document.body.appendChild(captionClone);
    activeCaptionEl.style.visibility = "hidden";
    return captionClone;
  }
  function fadeChrome() {
    const els = [
      leftChevronRef.current,
      rightChevronRef.current,
      counterRef.current,
      closeButtonRef.current
    ];
    els.forEach((el) => {
      if (!el) return;
      el.classList.remove(styles.open);
    });
  }
  function fadeNonActiveSlides(fsSlider, nodeIdx, targetImg, isVideoSlide) {
    if (isVideoSlide) {
      fsSlider.querySelectorAll("[data-index]").forEach((el) => {
        if (el.dataset.index === String(nodeIdx)) return;
        el.style.transition = "opacity 0.3s cubic-bezier(.4,0,.22,1)";
        el.style.opacity = "0";
      });
      return;
    }
    fsSlider.querySelectorAll('[data-rmg-fs-slide="true"]').forEach((slide) => {
      if (targetImg && slide.contains(targetImg)) return;
      slide.style.transition = "opacity 0.3s cubic-bezier(.4,0,.22,1)";
      slide.style.opacity = "0";
    });
  }
  function fadeOverlay() {
    const ov = overlayDivRef.current;
    if (!ov) return;
    ov.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
    ov.style.opacity = "0";
    ov.style.pointerEvents = "none";
  }
  function isVideoItem(m) {
    if (!m) return false;
    return m.kind === "video" || /\.(mp4|webm|ogg)$/i.test(m.src || "");
  }
  function fadeCloseAndTeardown() {
    fadeChrome();
    fadeOverlay();
    const fsSlider = withinFs(".fullscreen_slider");
    if (fsSlider) {
      fsSlider.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
      fsSlider.style.opacity = "0";
    }
    const modal = withinFs(".fs_modal");
    if (modal) {
      modal.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
      modal.style.opacity = "0";
      modal.style.pointerEvents = "none";
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
    const isGridish = layout === "grid" || layout === "masonry" || entryMediaLayout === "grid" || entryMediaLayout === "masonry";
    const computeThumbCropRectFromImg = (img) => {
      const box = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 };
      const fit = cs?.objectFit ?? "cover";
      if (fit !== "contain") return { cropRect: box, objPos };
      const natW = Math.max(1, img.naturalWidth || 0);
      const natH = Math.max(1, img.naturalHeight || 0);
      const cropRect = objectFitContentRect(natW, natH, box, "contain", objPos);
      return { cropRect, objPos };
    };
    const animateCloseToThumb = async (args) => {
      const fsSlider = withinFs(".fullscreen_slider");
      if (!fsSlider) {
        safeTeardown();
        return;
      }
      const nodeIdx = nodeIdxFromFs(fsSub.get(), imageCount);
      const targetImg = !args.isVideoSlide ? fsSlider.querySelector(`img[data-index="${nodeIdx}"]`) ?? null : null;
      if (!targetImg && !args.isVideoSlide) {
        safeTeardown();
        return;
      }
      fadeNonActiveSlides(fsSlider, nodeIdx, targetImg, args.isVideoSlide);
      let captionClone = cloneFsCaptionForNode(fsSlider, nodeIdx);
      if (captionClone) {
        captionClone.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
        void captionClone.offsetWidth;
        captionClone.style.opacity = "0";
      }
      if (args.isVideoSlide) {
        await animateVideoCloseProxy({
          fsSliderEl: fsSlider,
          nodeIdx,
          thumbCropRect: args.thumbCropRect,
          endObjPos: args.endObjPos ?? { x: 0.5, y: 0.5 },
          captionClone,
          safeTeardown,
          DURATION_MS,
          EASING
        });
        return;
      }
      const movingEl = targetImg;
      if (!movingEl) {
        safeTeardown();
        return;
      }
      const restoreIntoParent = movingEl.parentNode || null;
      const restoreNextSibling = movingEl.nextSibling || null;
      const fsCS = targetImg ? getComputedStyle(targetImg) : null;
      const fsObjPos = parseObjectPosition(fsCS?.objectPosition ?? null);
      const imgEl = movingEl;
      const fsFit = getComputedStyle(targetImg).objectFit || "contain";
      const curRect = movingEl.getBoundingClientRect();
      const natW = imgEl.naturalWidth || curRect.width || 1;
      const natH = imgEl.naturalHeight || curRect.height || 1;
      const startT = fsFit === "contain" ? containTransformForRect(natW, natH, curRect, fsObjPos) : coverTransformForRect(natW, natH, curRect, fsObjPos);
      const endT = coverTransformForRect(natW, natH, args.thumbCropRect, args.endObjPos);
      const clipper = createClipper({ DURATION_MS, EASING });
      const previous = {
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
        zIndex: movingEl.style.zIndex,
        opacity: movingEl.style.opacity
      };
      Object.assign(movingEl.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: `${natW}px`,
        height: `${natH}px`,
        maxWidth: "none",
        maxHeight: "none",
        transformOrigin: "50% 50%",
        willChange: "transform",
        zIndex: "1",
        opacity: "1",
        transition: "none"
      });
      movingEl.style.transform = `translate3d(${startT.cx}px, ${startT.cy}px, 0) translate3d(${-natW / 2}px, ${-natH / 2}px, 0) scale(${startT.scale})`;
      clipper.appendChild(movingEl);
      void movingEl.offsetWidth;
      void clipper.offsetWidth;
      const targetInset = insetForRect(args.thumbCropRect);
      requestAnimationFrame(() => {
        clipper.style.clipPath = targetInset;
        movingEl.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
        movingEl.style.transform = `translate3d(${endT.cx}px, ${endT.cy}px, 0) translate3d(${-natW / 2}px, ${-natH / 2}px, 0) scale(${endT.scale})`;
      });
      const finish = () => {
        if (captionClone) {
          try {
            captionClone.remove();
          } catch {
          }
          captionClone = null;
        }
        movingEl.removeEventListener("transitionend", onEnd);
        try {
          if (restoreIntoParent) {
            if (restoreNextSibling) restoreIntoParent.insertBefore(movingEl, restoreNextSibling);
            else restoreIntoParent.appendChild(movingEl);
          }
        } catch {
        }
        try {
          document.body.removeChild(clipper);
        } catch {
        }
        Object.assign(movingEl.style, previous);
        safeTeardown();
      };
      const onEnd = (ev) => {
        if (ev.propertyName !== "transform") return;
        finish();
      };
      movingEl.addEventListener("transitionend", onEnd, { once: true });
      window.setTimeout(() => finish(), DURATION_MS + 80);
    };
    let canonicalIdx2 = 0;
    let localSlideIdx = 0;
    if (!isGridish) {
      if (!slider.current || !slides.current?.length) return;
      const fsIndex = fsIdx;
      if (isWrapping.current) {
        if (slider.current && fsIndex >= slider.current.children.length - (visibleImagesRef.current || 0) * 2 && layout !== "entries") {
          canonicalIdx2 = 0;
        } else {
          canonicalIdx2 = fsIndex;
        }
      } else {
        const maxMedia = Math.max(0, originals.length - 1);
        canonicalIdx2 = Math.min(Math.max(0, fsIndex), maxMedia);
      }
      localSlideIdx = canonicalIdx2;
      if (layout === "entries" && entryMapRef?.current) {
        const link = entryMapRef.current[canonicalIdx2];
        if (link) {
          localSlideIdx = link.mediaIndex;
          await scrollEntrySectionIntoView(link.entryIndex);
        }
      }
    } else {
      canonicalIdx2 = Math.max(0, Math.min(originals.length - 1, fsIdx));
      localSlideIdx = canonicalIdx2;
      const el = document.querySelector(`[data-rmg-idx="${canonicalIdx2}"]`);
      await scrollElementIntoCenterView(el);
      if (layout === "entries" && entryMapRef?.current) {
        const link = entryMapRef.current[canonicalIdx2];
        if (link) {
          await scrollEntrySectionIntoView(link.entryIndex);
        }
      }
    }
    const url = originals[canonicalIdx2];
    const isVideoSlide = isVideoItem(url);
    if (introFade || isVideoSlide) {
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
      const slideArr = slides.current;
      let matchSlide = slideArr.find((s) => s.cells.some((c) => c.index === localSlideIdx));
      let newIndex = matchSlide ? slideArr.indexOf(matchSlide) : -1;
      if (newIndex < 0) {
        newIndex = slideArr.length - 1;
        matchSlide = slideArr[slideArr.length - 1];
      }
      if (!matchSlide) {
        safeTeardown();
        return;
      }
      const targetCellEl = matchSlide.cells.find((c) => c.index === localSlideIdx)?.element ?? matchSlide.cells[0]?.element ?? null;
      const shouldMove = !!(viewport && targetCellEl) && !isCellVisible(targetCellEl, viewport, true);
      const measureAndAnimate = async () => {
        const thumbInfo = findThumbInfoEnsuringVisible(
          localSlideIdx,
          centerAlign,
          slider,
          slides,
          selectedIndex,
          sliderX,
          sliderVelocity,
          centerSlider,
          isWrapping,
          visibleImagesRef,
          setSliderIndex
        );
        if (!thumbInfo) {
          safeTeardown();
          return;
        }
        let thumbCropRect2 = thumbInfo.cropRect;
        let endObjPos2 = thumbInfo.objPos ?? { x: 0.5, y: 0.5 };
        if (thumbInfo.imgEl) {
          const { cropRect, objPos } = computeThumbCropRectFromImg(thumbInfo.imgEl);
          thumbCropRect2 = cropRect;
          endObjPos2 = objPos;
        }
        await animateCloseToThumb({
          thumbCropRect: thumbCropRect2,
          endObjPos: endObjPos2,
          isVideoSlide: false
        });
      };
      if (shouldMove) {
        moveBaseSliderToSlide(
          centerAlign,
          slider,
          slides,
          selectedIndex,
          sliderX,
          sliderVelocity,
          centerSlider,
          newIndex,
          setSliderIndex
        );
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            void measureAndAnimate();
          });
        });
      } else {
        await measureAndAnimate();
      }
      return;
    }
    if (!expandableImgRefs?.current) {
      safeTeardown();
      return;
    }
    const origImgRef = expandableImgRefs.current?.[canonicalIdx2] ?? null;
    if (!origImgRef) {
      safeTeardown();
      return;
    }
    const { cropRect: thumbCropRect, objPos: endObjPos } = computeThumbCropRectFromImg(origImgRef);
    await animateCloseToThumb({
      thumbCropRect,
      endObjPos,
      isVideoSlide: false
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
      const fsSlider = withinFs(".fullscreen_slider");
      if (fsSlider) fsSlider.style.opacity = "0";
      const modal = withinFs(".fs_modal");
      if (modal) {
        modal.style.opacity = "0";
        modal.style.pointerEvents = "none";
      }
    }
    overlayDivRef.current?.remove();
    overlayDivRef.current = null;
    onForceResetZoom();
    onClose();
    setShowFullscreenSlider(false);
    setClosingModal(false);
  }
  const closeEnabled = fs?.controls?.close?.enabled !== false;
  const close = () => void proceedToClose();
  const userNode = typeof fs?.controls?.close?.render === "function" ? fs?.controls?.close.render() : null;
  const allowFsArrows = fs?.controls?.arrows?.enabled !== false && imageCount > 1;
  const isRtl = direction === "rtl" || false;
  const arrows = fs?.controls?.arrows;
  const renderArrowNode = (dir, side) => {
    const explicit = dir === "prev" ? typeof arrows?.renderPrev === "function" ? arrows.renderPrev() : null : typeof arrows?.renderNext === "function" ? arrows.renderNext() : null;
    if (explicit != null) return explicit;
    if (typeof arrows?.render === "function") {
      const node = arrows.render({ dir });
      if (node != null) return node;
    }
    return /* @__PURE__ */ jsx(DefaultChevronIcon, { side });
  };
  function canonicalFromFsIndex(fsIndex, originalsLen2) {
    return Math.max(0, Math.min(originalsLen2 - 1, fsIndex));
  }
  const originalsLen = Math.max(0, wrappedItems.length - 2);
  const canonicalIdx = canonicalFromFsIndex(fsSub.get(), Math.max(1, originalsLen));
  const counterEnabled = fs?.controls?.counter?.enabled !== false;
  const showCounter = counterEnabled && imageCount > 1;
  const userCounterNode = typeof fs?.controls?.counter?.render === "function" ? fs.controls.counter.render({ index: canonicalIdx, count: imageCount }) : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: modalRef,
      onPointerDown: (e) => {
        pointerDownX.current = e.clientX;
        pointerDownY.current = e.clientY;
      },
      className: "fs_modal",
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        zIndex: 9999,
        display: "block",
        touchAction: "none",
        contain: "layout style size",
        overflow: "hidden"
      },
      children: [
        closeEnabled && /* @__PURE__ */ jsx(
          "button",
          {
            ref: closeButtonRef,
            type: "button",
            "aria-label": "Close",
            onClick: () => close(),
            className: [
              styles?.closeBtn,
              fs?.controls?.close?.className ?? "",
              open ? styles.open : ""
            ].filter(Boolean).join(" "),
            style: {
              ...fs?.controls?.close?.style
            },
            children: userNode ?? /* @__PURE__ */ jsx(DefaultCloseIcon, {})
          }
        ),
        allowFsArrows && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              ref: leftChevronRef,
              type: "button",
              "aria-label": getArrowAction("left", isRtl) === "prev" ? "Previous" : "Next",
              onClick: () => runArrowAction(fsSub, getArrowAction("left", isRtl)),
              className: mergeClassNames(
                styles?.leftChevron,
                classFromElementStyle(arrows?.arrow),
                classFromElementStyle(arrows?.prev),
                open ? styles.open : ""
              ),
              style: {
                ...styleFromElementStyle(arrows?.arrow) ?? {},
                ...styleFromElementStyle(arrows?.prev) ?? {}
              },
              children: renderArrowNode(getArrowAction("left", isRtl), "left")
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              ref: rightChevronRef,
              type: "button",
              "aria-label": getArrowAction("right", isRtl) === "prev" ? "Previous" : "Next",
              onClick: () => runArrowAction(fsSub, getArrowAction("right", isRtl)),
              className: mergeClassNames(
                styles?.rightChevron,
                classFromElementStyle(arrows?.arrow),
                classFromElementStyle(arrows?.next),
                open ? styles.open : ""
              ),
              style: {
                ...styleFromElementStyle(arrows?.arrow) ?? {},
                ...styleFromElementStyle(arrows?.next) ?? {}
              },
              children: renderArrowNode(getArrowAction("right", isRtl), "right")
            }
          )
        ] }),
        showCounter && /* @__PURE__ */ jsx(
          "div",
          {
            ref: counterRef,
            className: [
              styles?.counter,
              fs?.controls?.counter?.className ?? "",
              open ? styles.open : ""
            ].filter(Boolean).join(" "),
            style: {
              ...fs?.controls?.counter?.style ?? {}
            },
            children: userCounterNode ?? /* @__PURE__ */ jsx(DefaultCounterText, { index: canonicalIdx, count: imageCount })
          }
        ),
        children
      ]
    }
  );
};

// src/Gallery/fullscreen/FullscreenSlider.module.css
var FullscreenSlider_default = {};
var clamp01 = (n) => Math.max(0, Math.min(1, n));
var easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
function DragTracker(axis, ownerWindow) {
  return createDragTracker({
    ownerWindow,
    axis
  });
}
var FullscreenSlider = forwardRef(
  ({
    sub,
    children,
    imageCount,
    slideIndex,
    isClick,
    isZoomed,
    windowSize,
    show,
    handleZoomToggle,
    imageRefs,
    cells,
    isPinching,
    isTouchPinching,
    showFullscreenSlider,
    isZooming,
    plyrRefs,
    plyrRef,
    closingModal,
    counterRef,
    leftChevronRef,
    rightChevronRef,
    closeButtonRef,
    overlayDivRef,
    direction,
    isWrapping,
    sliderDuration,
    sliderFriction,
    suppressLoopRef,
    fadeOpening,
    introFade,
    slideFade = false,
    slideFadeDuration = 120,
    slideFadeEasing = "cubic-bezier(.4,0,.22,1)",
    normalizedItems,
    introDuration = 300,
    introEasing = "cubic-bezier(.4,0,.22,1)",
    resetAllZoomDom,
    requestFsCloseRef
  }, ref) => {
    const isRtl = direction === "rtl" ? true : false;
    const rtlCls = isRtl ? FullscreenSlider_default.rtl : "";
    const sign = isRtl ? -1 : 1;
    const viewportRef = useRef(null);
    const slider = useRef(null);
    const axisRef = useRef(null);
    const locationRef = useRef(null);
    const previousLocationRef = useRef(null);
    const offsetLocationRef = useRef(null);
    const targetRef = useRef(null);
    const bodyRef = useRef(null);
    const translateRef = useRef(null);
    const animRef = useRef(null);
    const isAnimatingRef = useRef(false);
    const pointerDownRef = useRef(false);
    const yTemp = useRef(0);
    const dragThreshold = 5;
    const FADE_DISTANCE = 300;
    const selectedIndex = useRef(0);
    const hasPositioned = useRef(false);
    const perSlideRef = useRef(0);
    const contentSizeRef = useRef(0);
    const loopLimitRef = useRef(null);
    const scrollSnapsRef = useRef([]);
    const scrollContentSizeRef = useRef(0);
    const scrollLimitRef = useRef(null);
    const scrollTargetRef = useRef(null);
    const scrollToRef = useRef(null);
    const slides = useRef([]);
    const indexCurrentRef = useRef(null);
    const indexPreviousRef = useRef(null);
    const isPointerDown = useRef(false);
    const isVerticalScroll = useRef(false);
    const isScrolling = useRef(false);
    const isClosing = useRef(false);
    const clickedImgMargin = useRef(false);
    const dragStartY = useRef(0);
    const dragYForClose = useRef(0);
    const x = useRef(0);
    const y = useRef(0);
    const velocityX = useRef(0);
    const dragX = useRef(0);
    const previousDragX = useRef(0);
    const dragMoveTime = useRef(null);
    const activeTouchCount = useRef(0);
    const wasPinch = useRef(false);
    const appliedYRef = useRef(0);
    const dragMode = useRef("none");
    function useLatest(value) {
      const r = useRef(value);
      useEffect(() => {
        r.current = value;
      }, [value]);
      return r;
    }
    const isZoomedRef = useLatest(isZoomed);
    const recenterWithAnchor = useCallback(() => {
      const track = slider.current;
      if (!track || !locationRef.current || !previousLocationRef.current || !offsetLocationRef.current || !targetRef.current) {
        return;
      }
      const per = track.clientWidth || 1;
      perSlideRef.current = per;
      const len2 = slides.current.length || 1;
      const W = per * len2;
      contentSizeRef.current = W;
      loopLimitRef.current = Limit(-W, 0);
      const snaps = Array.from({ length: len2 }, (_, i) => -per * i);
      scrollSnapsRef.current = snaps;
      const fsLimit = createBaseLimit(-W, 0);
      scrollLimitRef.current = fsLimit;
      if (loopLimitRef.current) {
        scrollTargetRef.current = ScrollTarget(
          true,
          snaps,
          W,
          loopLimitRef.current,
          targetRef.current
        );
      }
      const idx = indexCurrentRef.current?.get() ?? selectedIndex.current ?? 0;
      const nx = -per * idx;
      setAllX(nx);
      setTranslateX(nx, 0);
      animRef.current?.resetBlend();
    }, []);
    useEffect(() => {
      const el = slider.current;
      if (!el) return;
      const update = () => {
        recenterWithAnchor();
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [show, recenterWithAnchor]);
    useEffect(() => {
      const childrenArray = Children.toArray(children);
      slides.current = [];
      if (imageCount > 1) {
        for (let i = 1; i < childrenArray.length - 1; i++) {
          slides.current.push({ cells: [cells.current[i]] });
        }
      } else {
        for (let i = 0; i < childrenArray.length; i++) {
          slides.current.push({ cells: [cells.current[i]] });
        }
      }
    }, [children]);
    function commitIndexChange(idx) {
      selectedIndex.current = idx;
      indexCurrentRef.current?.set(idx);
      sub.setLocalIndex(idx);
      updateCounterFromIndex(idx);
      resetAllZoomDom();
    }
    const GLOBAL_DRAG_ATTR = "data-rmg-global-drag";
    const GLOBAL_DRAG_STYLE_ID = "rmg-global-drag-style";
    function ensureGlobalDragStyle() {
      if (document.getElementById(GLOBAL_DRAG_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = GLOBAL_DRAG_STYLE_ID;
      style.textContent = `
        html[${GLOBAL_DRAG_ATTR}] * { cursor: grabbing !important; }
        html[${GLOBAL_DRAG_ATTR}] { cursor: grabbing !important; }
      `;
      document.head.appendChild(style);
    }
    function setGlobalGrabbing(on) {
      const html = document.documentElement;
      if (!html) return;
      if (on) html.setAttribute(GLOBAL_DRAG_ATTR, "");
      else html.removeAttribute(GLOBAL_DRAG_ATTR);
    }
    function useGlobalGrabbingGuards() {
      const guardsRef = useRef(null);
      const start = () => {
        if (guardsRef.current) return;
        ensureGlobalDragStyle();
        setGlobalGrabbing(true);
        guardsRef.current = EventStore().add(window, "mouseup", stop, true).add(window, "pointerup", stop, true).add(window, "touchend", stop, { passive: true }).add(window, "touchcancel", stop, { passive: true }).add(window, "blur", stop, true).add(document, "visibilitychange", () => {
          if (document.hidden) stop();
        });
      };
      const stop = () => {
        guardsRef.current?.clear();
        guardsRef.current = null;
        setGlobalGrabbing(false);
      };
      useEffect(() => stop, []);
      return { start, stop };
    }
    const { start: startGrabbing, stop: stopGrabbing } = useGlobalGrabbingGuards();
    const slideFadeBusyRef = useRef(false);
    const SLIDE_FADE_MS = slideFadeDuration;
    const SLIDE_FADE_EASING = slideFadeEasing;
    function jumpToIndexInstant(idx) {
      const per = perSlide();
      const nx = -per * idx;
      animRef.current?.stop();
      bodyRef.current?.useDuration(0).useFriction(1);
      setAllX(nx);
      setTranslateX(nx, 0);
      commitIndexChange(idx);
    }
    function fadeToIndex(idx) {
      if (!slideFade) return;
      const track = slider.current;
      if (!track) return;
      if (!showFullscreenSlider) return;
      slideFadeBusyRef.current = true;
      const prevTransition = track.style.transition;
      const prevOpacity = track.style.opacity;
      track.style.transition = `opacity ${SLIDE_FADE_MS}ms ${SLIDE_FADE_EASING}`;
      const computed = window.getComputedStyle(track).opacity;
      track.style.opacity = computed;
      track.offsetWidth;
      track.style.opacity = "0";
      const t1 = window.setTimeout(() => {
        jumpToIndexInstant(idx);
        track.offsetWidth;
        track.style.opacity = "1";
        const t2 = window.setTimeout(() => {
          track.style.transition = prevTransition;
          if (!prevTransition) track.style.opacity = prevOpacity;
          slideFadeBusyRef.current = false;
          window.clearTimeout(t2);
        }, SLIDE_FADE_MS + 40);
        window.clearTimeout(t1);
      }, SLIDE_FADE_MS + 20);
    }
    function perSlide() {
      return perSlideRef.current || slider.current?.clientWidth || 1;
    }
    function slideCount() {
      return slides.current.length || 1;
    }
    function commitXY(canonicalX, ny) {
      const nx = Math.round(canonicalX) * sign;
      translateRef.current?.to(nx, ny);
      if (overlayDivRef.current) {
        const progress = clamp01(Math.abs(ny) / FADE_DISTANCE);
        const o = 1 - easeOutCubic(progress);
        overlayDivRef.current.style.opacity = String(o);
      }
    }
    useEffect(() => {
      if (closingModal) {
        animRef.current?.stop();
        pointerDownRef.current = false;
      }
    }, [closingModal]);
    useEffect(() => {
      if (!slider.current || hasPositioned.current) return;
      if (counterRef.current) {
        counterRef.current.textContent = `${!isWrapping.current ? slideIndex + 1 : slideIndex} / ${imageCount}`;
      }
      if (slideIndex === 1 && isWrapping.current === true || slideIndex === 0 && !isWrapping.current) {
        selectedIndex.current = 0;
        sub.setLocalIndex(0);
        setTimeout(() => {
          if (!slider.current) return;
          const startX = 0;
          x.current = startX;
          y.current = 0;
          if (locationRef.current && previousLocationRef.current && offsetLocationRef.current && targetRef.current) {
            locationRef.current.set(startX);
            previousLocationRef.current.set(startX);
            offsetLocationRef.current.set(startX);
            targetRef.current.set(startX);
            setTranslateX(startX, 0);
          } else {
            const sx = Math.round(startX) * sign;
            slider.current.style.transform = `translate3d(${sx}px, 0, 0)`;
          }
        }, 100);
        hasPositioned.current = true;
        return;
      }
      let actualIndex = slideIndex - 1;
      actualIndex = (actualIndex % imageCount + imageCount) % imageCount;
      if (actualIndex === 0) actualIndex = imageCount;
      const finalIndex = isWrapping.current === true ? actualIndex : slideIndex;
      selectedIndex.current = finalIndex;
      sub.setLocalIndex(finalIndex);
      setTimeout(() => {
        if (!slider.current) return;
        const per = perSlideRef.current || slider.current.clientWidth;
        const startX = -per * finalIndex;
        x.current = startX;
        y.current = 0;
        if (locationRef.current && previousLocationRef.current && offsetLocationRef.current && targetRef.current) {
          locationRef.current.set(startX);
          previousLocationRef.current.set(startX);
          offsetLocationRef.current.set(startX);
          targetRef.current.set(startX);
          setTranslateX(startX, 0);
        } else {
          const sx = Math.round(startX) * sign;
          slider.current.style.transform = `translate3d(${sx}px, 0, 0)`;
        }
      }, 100);
      hasPositioned.current = true;
    }, [show, slides.current]);
    const ySnapTweenId = { current: 0 };
    function snapBackY(ms = 300) {
      const startId = ++ySnapTweenId.current;
      const fromY = yTemp.current || 0;
      const start = performance.now();
      const step = (now) => {
        if (startId !== ySnapTweenId.current || isPointerDown.current) return;
        const t = Math.min(1, (now - start) / ms);
        const k = easeOutCubic(t);
        yTemp.current = fromY + (0 - fromY) * k;
        const xNow = offsetLocationRef.current.get();
        y.current = yTemp.current;
        commitXY(xNow, y.current);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function disableOverlayTransition() {
      if (overlayDivRef.current) overlayDivRef.current.style.transition = "opacity 0s";
    }
    function restoreOverlayTransition() {
      if (overlayDivRef.current) overlayDivRef.current.style.transition = "";
    }
    function scrollToIndex(requested, opts = {}) {
      const { jump = false, direction: direction2 } = opts;
      const indexCurrent = indexCurrentRef.current;
      const fsScrollTo = scrollToRef.current;
      const body = bodyRef.current;
      if (!fsScrollTo || !body || !indexCurrent) return;
      const len2 = slideCount();
      const from = ((selectedIndex.current || 0) % len2 + len2) % len2;
      const to = ((requested || 0) % len2 + len2) % len2;
      const crossesSeam = len2 > 1 && (from === 0 && to === len2 - 1 || from === len2 - 1 && to === 0);
      if (crossesSeam && isZoomedRef.current && imageCount > 1 && selectedIndex.current === 0) {
        const refs = imageRefs;
        const firstRealImg = refs[1]?.current?.querySelector("img");
        const firstCloneImg = refs[imageCount + 1]?.current?.querySelector("img");
        if (firstRealImg && firstCloneImg) {
          const extractScale = (el) => {
            if (!el) return 1;
            const tr = el.style.transform || "";
            const m = tr.match(/scale\(([^)]+)\)/);
            if (!m) return 1;
            const v = parseFloat(m[1]);
            return Number.isFinite(v) ? v : 1;
          };
          const readTransform = (el) => {
            let transform = el.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(el);
              transform = cs.transform !== "none" ? cs.transform : "";
            }
            return transform || "";
          };
          const realScale = extractScale(firstRealImg);
          const cloneScale = extractScale(firstCloneImg);
          if (realScale > 1.01 && cloneScale <= 1.01) {
            const transform = readTransform(firstRealImg);
            firstCloneImg.style.transition = "none";
            firstCloneImg.style.transform = transform;
            firstCloneImg.offsetWidth;
          }
          if (cloneScale > 1.01 && realScale <= 1.01) {
            const transform = readTransform(firstCloneImg);
            firstRealImg.style.transition = "none";
            firstRealImg.style.transform = transform;
            firstRealImg.offsetWidth;
          }
        }
      }
      const targetIndex = indexCurrent.clone().set(requested).get();
      if (jump) {
        body.useDuration(0);
      } else {
        body.useBaseDuration().useBaseFriction();
      }
      const dir = typeof direction2 === "number" ? direction2 : 0;
      fsScrollTo.index(targetIndex, dir);
    }
    function previous() {
      isVerticalScroll.current = false;
      isScrolling.current = false;
      isPinching.current = false;
      isTouchPinching.current = false;
      if (isZoomedRef.current && imageCount > 1 && selectedIndex.current === 0) {
        const refs = imageRefs;
        const firstRealImg = refs[1]?.current?.querySelector("img");
        const firstCloneImg = refs[imageCount + 1]?.current?.querySelector("img");
        if (firstRealImg && firstCloneImg) {
          const extractScale = (el) => {
            if (!el) return 1;
            const tr = el.style.transform || "";
            const m = tr.match(/scale\(([^)]+)\)/);
            if (!m) return 1;
            const v = parseFloat(m[1]);
            return Number.isFinite(v) ? v : 1;
          };
          const realScale = extractScale(firstRealImg);
          const cloneScale = extractScale(firstCloneImg);
          if (realScale > 1.01 && cloneScale <= 1.01) {
            let transform = firstRealImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstRealImg);
              transform = cs.transform !== "none" ? cs.transform : "";
            }
            firstCloneImg.style.transition = "none";
            firstCloneImg.style.transform = transform;
            firstCloneImg.offsetWidth;
          }
          if (cloneScale > 1.01 && realScale <= 1.01) {
            let transform = firstCloneImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstCloneImg);
              transform = cs.transform !== "none" ? cs.transform : "";
            }
            firstRealImg.style.transition = "none";
            firstRealImg.style.transform = transform;
            firstRealImg.offsetWidth;
          }
        }
      }
      const len2 = slideCount();
      const cur = selectedIndex.current || 0;
      const nextIdx = ((cur - 1) % len2 + len2) % len2;
      if (slideFade) {
        fadeToIndex(nextIdx);
        return;
      }
      const fsScrollTo = scrollToRef.current;
      const body = bodyRef.current;
      if (!fsScrollTo || !body) return;
      const step = perSlide();
      body.useBaseDuration().useBaseFriction();
      fsScrollTo.distance(step, true);
    }
    function next() {
      isVerticalScroll.current = false;
      isScrolling.current = false;
      isPinching.current = false;
      isTouchPinching.current = false;
      if (isZoomedRef.current && imageCount > 1 && selectedIndex.current === 0) {
        const refs = imageRefs;
        const firstRealImg = refs[1]?.current?.querySelector("img");
        const firstCloneImg = refs[imageCount + 1]?.current?.querySelector("img");
        if (firstRealImg && firstCloneImg) {
          const extractScale = (el) => {
            if (!el) return 1;
            const tr = el.style.transform || "";
            const m = tr.match(/scale\(([^)]+)\)/);
            if (!m) return 1;
            const v = parseFloat(m[1]);
            return Number.isFinite(v) ? v : 1;
          };
          const realScale = extractScale(firstRealImg);
          const cloneScale = extractScale(firstCloneImg);
          if (realScale > 1.01 && cloneScale <= 1.01) {
            let transform = firstRealImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstRealImg);
              transform = cs.transform !== "none" ? cs.transform : "";
            }
            firstCloneImg.style.transition = "none";
            firstCloneImg.style.transform = transform;
            firstCloneImg.offsetWidth;
          }
          if (cloneScale > 1.01 && realScale <= 1.01) {
            let transform = firstCloneImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstCloneImg);
              transform = cs.transform !== "none" ? cs.transform : "";
            }
            firstRealImg.style.transition = "none";
            firstRealImg.style.transform = transform;
            firstRealImg.offsetWidth;
          }
        }
      }
      const len2 = slideCount();
      const cur = selectedIndex.current || 0;
      const nextIdx = ((cur + 1) % len2 + len2) % len2;
      if (slideFade) {
        fadeToIndex(nextIdx);
        return;
      }
      const fsScrollTo = scrollToRef.current;
      const body = bodyRef.current;
      if (!fsScrollTo || !body) return;
      const step = perSlide();
      body.useBaseDuration().useBaseFriction();
      fsScrollTo.distance(-step, true);
    }
    function updateCounterFromIndex(canonicalIndex) {
      const len2 = slides.current.length || 1;
      let actualIndex = canonicalIndex + 1;
      actualIndex = (actualIndex % len2 + len2) % len2;
      if (actualIndex === 0) actualIndex = imageCount;
      if (counterRef.current) {
        counterRef.current.textContent = `${actualIndex} / ${imageCount}`;
      }
    }
    function toggleActiveVideoPlay() {
      const idx = selectedIndex.current ?? 0;
      const actualIndex = idx + 1;
      const api = plyrRefs.current[actualIndex] || plyrRef.current[0];
      const p = api?.plyr;
      if (!p) return;
      if (p.playing) p.pause();
      else p.play();
    }
    function isPlyrControlsEl(el) {
      return !!el?.closest?.(
        [
          ".plyr__controls",
          ".plyr__control--overlaid",
          ".plyr__menu__container",
          ".plyr__tooltip",
          ".plyr__captions"
        ].join(",")
      );
    }
    function getClientXY(evt) {
      const t = evt.changedTouches?.[0] ?? evt.touches?.[0];
      if (t) return { x: t.clientX, y: t.clientY };
      return { x: evt.clientX, y: evt.clientY };
    }
    function clickedVideoSurface(evt) {
      const { x: x2, y: y2 } = getClientXY(evt);
      const under = document.elementFromPoint(x2, y2);
      if (!under) return false;
      const slide = under.closest('[data-rmg-fs-slide="true"]');
      if (!slide) return false;
      const plyrRoot = slide.querySelector(".plyr");
      if (!plyrRoot) return false;
      const wrap = plyrRoot.querySelector(".plyr__video-wrapper");
      if (!wrap) return false;
      const r = wrap.getBoundingClientRect();
      const inside = x2 >= r.left && x2 <= r.right && y2 >= r.top && y2 <= r.bottom;
      if (under.closest(".plyr__controls")) return false;
      return inside;
    }
    function isYouTubeVideoEvent(evt) {
      const target = evt.target;
      if (!target) return false;
      const slide = target.closest('[data-rmg-fs-slide="true"]');
      if (!slide) return false;
      const plyrRoot = slide.querySelector(".rmg__player");
      if (!plyrRoot) return false;
      return plyrRoot.getAttribute("data-rmg-plyr-provider") === "youtube";
    }
    useEffect(() => {
      const root = viewportRef.current;
      const track = slider.current;
      if (!root || !track) return;
      const axis = FullscreenAxis();
      axisRef.current = axis;
      const per = perSlideRef.current || track.clientWidth || 1;
      const len2 = slides.current.length || 1;
      const W = per * len2;
      const counterMax = len2 - 1;
      const startIndex = selectedIndex.current || 0;
      const location = Vector1D(0);
      const previousLocation = Vector1D(0);
      const offsetLocation = Vector1D(0);
      const target = Vector1D(0);
      locationRef.current = location;
      previousLocationRef.current = previousLocation;
      offsetLocationRef.current = offsetLocation;
      targetRef.current = target;
      const scrollSnaps = Array.from({ length: len2 }, (_, i) => -per * i);
      scrollSnapsRef.current = scrollSnaps;
      const initialSnap = scrollSnaps[startIndex] ?? 0;
      location.set(initialSnap);
      previousLocation.set(initialSnap);
      offsetLocation.set(initialSnap);
      target.set(initialSnap);
      x.current = initialSnap;
      translateRef.current = TranslateFullscreen(track);
      setTranslateX(initialSnap, 0);
      const indexCurrent = Counter(counterMax, startIndex, true);
      const indexPrevious = Counter(counterMax, startIndex, true);
      indexCurrentRef.current = indexCurrent;
      indexPreviousRef.current = indexPrevious;
      selectedIndex.current = startIndex;
      sub.setLocalIndex(startIndex);
      updateCounterFromIndex(startIndex);
      contentSizeRef.current = W;
      loopLimitRef.current = Limit(-W, 0);
      scrollContentSizeRef.current = W;
      const fsLimit = createBaseLimit(-W, 0);
      scrollLimitRef.current = fsLimit;
      if (loopLimitRef.current) {
        scrollTargetRef.current = ScrollTarget(
          true,
          scrollSnaps,
          W,
          loopLimitRef.current,
          target
        );
      }
      function scrollTo(target2) {
        const indexCurrent2 = indexCurrentRef.current;
        const indexPrevious2 = indexPreviousRef.current;
        if (!indexCurrent2 || !indexPrevious2) return;
        const distanceDiff = target2.distance;
        const indexDiff = target2.index !== indexCurrent2.get();
        targetRef.current.add(distanceDiff);
        if (distanceDiff) {
          if (bodyRef.current.duration()) {
            animRef.current.start();
          } else {
            bodyRef.current.seek();
            positionSlider();
          }
        }
        if (indexDiff) {
          indexPrevious2.set(indexCurrent2.get());
          indexCurrent2.set(target2.index);
          const idx = indexCurrent2.get();
          commitIndexChange(idx);
        }
      }
      const fsScrollTo = {
        distance(n, snap) {
          const st = scrollTargetRef.current;
          if (!st) return;
          const target2 = st.byDistance(n, snap);
          scrollTo(target2);
        },
        index(n, direction2) {
          const st = scrollTargetRef.current;
          const indexCurrent2 = indexCurrentRef.current;
          if (!st || !indexCurrent2) return;
          const targetIndex = indexCurrent2.clone().set(n).get();
          const target2 = st.byIndex(targetIndex, direction2);
          scrollTo(target2);
        }
      };
      scrollToRef.current = fsScrollTo;
      const looper = ScrollLooper(
        contentSizeRef.current,
        loopLimitRef.current,
        location,
        [location, previousLocation, offsetLocation, target]
      );
      const body = ScrollBody(location, offsetLocation, previousLocation, target, sliderDuration, sliderFriction);
      bodyRef.current = body;
      const anim = Animations(
        document,
        window,
        () => {
          bodyRef.current?.seek();
          const body2 = bodyRef.current;
          const dir = body2.direction() || Math.sign(target.get() - location.get()) || 0;
          if (!suppressLoopRef.current && imageCount > 1 && W > 0) {
            looper.loop(dir);
          }
          x.current = location.get();
        },
        (alpha) => {
          const cur = location.get();
          const prev = previousLocation.get();
          const loc = cur * alpha + prev * (1 - alpha);
          offsetLocation.set(loc);
          x.current = loc;
          y.current = isVerticalScroll.current ? yTemp.current : y.current;
          positionSlider();
          const settled = bodyRef.current?.settled();
          if (settled && !pointerDownRef.current) {
            animRef.current?.stop();
            isAnimatingRef.current = false;
          }
          if (!isZoomedRef.current && !isAnimatingRef.current) {
            updateActiveIndexFromX(loc);
          }
        }
      );
      animRef.current = anim;
      anim.init();
      const dragStore = EventStore();
      const moveStore = EventStore();
      const trackerX = DragTracker(axis, window);
      const axisY = {
        scroll: "y",
        cross: "x",
        direction(n) {
          return n;
        },
        measureSize: (r) => r.height
      };
      const trackerY = DragTracker(axisY, window);
      let isMouse = false;
      let preventScroll = false;
      let startPX = 0;
      let startPY = 0;
      const dragThresholdLocal = dragThreshold;
      function addDragEvents() {
        const node = isMouse ? document : root;
        moveStore.add(node, "touchmove", onMove, { passive: false }).add(node, "touchend", onUp).add(node, "mousemove", onMove, { passive: false }).add(node, "mouseup", onUp);
      }
      function onDown(evt) {
        const targetEl = evt.target;
        if (isPlyrControlsEl(targetEl)) return;
        if (isZoomedRef.current || closingModal) return;
        const isMouseEvt = isMouseEvent(evt, window);
        isMouse = isMouseEvt;
        if (isMouseEvt && evt.button !== 0) return;
        startGrabbing();
        wasPinch.current = false;
        isTouchPinching.current = false;
        activeTouchCount.current = !isMouseEvt ? evt.touches?.length ?? 1 : 0;
        pointerDownRef.current = true;
        isPointerDown.current = true;
        isScrolling.current = false;
        isPinching.current = false;
        isTouchPinching.current = false;
        isClick.current = true;
        dragMode.current = "none";
        yTemp.current = 0;
        dragStartY.current = 0;
        dragYForClose.current = 0;
        trackerX.pointerDown(evt);
        trackerY.pointerDown(evt);
        startPX = trackerX.readPoint(evt, "x");
        startPY = trackerY.readPoint(evt, "y");
        bodyRef.current.useFriction(0).useDuration(0);
        targetRef.current.set(locationRef.current.get());
        addDragEvents();
        animRef.current?.start();
      }
      function onMove(evt) {
        if (isZoomedRef.current) return;
        const isTouchEvt = !isMouseEvent(evt, window);
        if (isTouchEvt) {
          const t = evt;
          activeTouchCount.current = t.touches?.length ?? 1;
          if (activeTouchCount.current >= 2) {
            wasPinch.current = true;
            isTouchPinching.current = true;
            isClick.current = false;
            dragMode.current = "none";
            animRef.current?.stop();
            if (t.cancelable) {
              t.preventDefault();
            }
            return;
          }
        }
        const lastScroll = trackerX.readPoint(evt, "x");
        const lastCross = trackerY.readPoint(evt, "y");
        const dxAbs = Math.abs(lastScroll - startPX);
        const dyAbs = Math.abs(lastCross - startPY);
        if (dragMode.current === "none") {
          if (dxAbs > dragThresholdLocal || dyAbs > dragThresholdLocal) {
            dragMode.current = dxAbs >= dyAbs ? "x" : "y";
            isClick.current = false;
            if (dragMode.current === "y") {
              isVerticalScroll.current = true;
              dragStartY.current = lastCross;
              yTemp.current = 0;
            }
          }
        }
        disableOverlayTransition();
        const diffX = trackerX.pointerMove(evt).dx * sign;
        trackerY.pointerMove(evt);
        previousDragX.current = dragX.current;
        dragX.current = lastScroll * sign;
        velocityX.current = diffX;
        dragMoveTime.current = /* @__PURE__ */ new Date();
        if (!preventScroll && !isMouse && dragMode.current === "x") {
          if (!("cancelable" in evt) || !evt.cancelable) return;
          preventScroll = dxAbs > dyAbs;
          if (!preventScroll) return;
        }
        if (dragMode.current === "y") {
          const dy = lastCross - dragStartY.current;
          dragYForClose.current = dy;
          yTemp.current = dy * 0.5;
          y.current = yTemp.current;
          const xNow = offsetLocationRef.current.get();
          commitXY(xNow, y.current);
          if (overlayDivRef.current) {
            const progress = clamp01(Math.abs(dy) / FADE_DISTANCE);
            overlayDivRef.current.style.opacity = String(1 - progress);
          }
          evt.preventDefault?.();
          return;
        }
        bodyRef.current.useFriction(0.3).useDuration(0.75);
        const delta = axisRef.current.direction(diffX);
        targetRef.current.add(delta);
        animRef.current?.start();
        if (evt.cancelable) evt.preventDefault();
      }
      function onUp(evt) {
        const isTouchEvt = !isMouseEvent(evt, window);
        if (isTouchEvt && (isTouchPinching.current || wasPinch.current)) {
          const t = evt;
          activeTouchCount.current = t.touches?.length ?? 0;
          if (activeTouchCount.current > 0) {
            return;
          }
          stopGrabbing();
          isTouchPinching.current = false;
          wasPinch.current = false;
          pointerDownRef.current = false;
          isPointerDown.current = false;
          isClick.current = false;
          dragMode.current = "none";
          isVerticalScroll.current = false;
          yTemp.current = 0;
          moveStore.clear();
          preventScroll = false;
          return;
        }
        isPointerDown.current = false;
        pointerDownRef.current = false;
        moveStore.clear();
        preventScroll = false;
        if (isClick.current) {
          const target2 = evt.target;
          if (clickedVideoSurface(evt) && !isYouTubeVideoEvent(evt)) {
            evt.preventDefault?.();
            evt.stopPropagation?.();
            toggleActiveVideoPlay();
            dragMode.current = "none";
            suppressLoopRef.current = true;
            goToCanonical(selectedIndex.current);
            return;
          }
          if (target2.closest("[class*='plyr__']")) return;
          const t = evt;
          const clickedImg = target2.closest("img");
          if (!clickedImg) {
            restoreOverlayTransition();
            clickedImgMargin.current = true;
            animRef.current?.stop();
            requestFsCloseRef.current?.();
            if (t.cancelable) {
              t.preventDefault();
            }
            return;
          }
          const imgIndex = clickedImg.dataset.index;
          if (imgIndex == null) return;
          const matchedRef = imageRefs[parseInt(imgIndex)];
          const idx = selectedIndex.current;
          if (idx === imageCount - 1 && Number(imgIndex) === imageCount + 1) {
            suppressLoopRef.current = true;
            goToCanonical(0);
            return;
          }
          if (idx !== Number(imgIndex) && Number(imgIndex) !== idx + 2) {
            isZooming.current = true;
            handleZoomToggle(evt, matchedRef);
          }
          if (idx === imageCount - 1 && Number(imgIndex) === imageCount + 1) {
            isZooming.current = true;
            handleZoomToggle(evt, matchedRef);
          }
          if (slider.current && slider.current.children.length === 1) {
            isZooming.current = true;
            handleZoomToggle(evt, matchedRef);
          }
          suppressLoopRef.current = true;
          goToCanonical(idx);
          return;
        }
        if (dragMode.current === "y") {
          const rawY = trackerY.pointerUp(evt).fy;
          const tinyFlick = Math.abs(rawY) > 0.15;
          if (tinyFlick) {
            anim?.stop();
            translateRef.current?.lockY(yTemp.current);
            restoreOverlayTransition();
            isClosing.current = true;
            requestFsCloseRef.current?.();
            yTemp.current = 0;
            isVerticalScroll.current = false;
            return;
          }
          const dy = dragYForClose.current;
          const distanceThreshold = windowSize.height * 0.3;
          if (Math.abs(dy) > distanceThreshold) {
            anim?.stop();
            translateRef.current?.lockY(yTemp.current);
            restoreOverlayTransition();
            isClosing.current = true;
            requestFsCloseRef.current?.();
            yTemp.current = 0;
            isVerticalScroll.current = false;
            return;
          }
          snapBackY(300);
          dragMode.current = "none";
          isVerticalScroll.current = false;
        } else {
          let allowedForce2 = function(force2) {
            const len3 = slides.current.length || 1;
            const curIndex = selectedIndex.current || 0;
            const dirIndex = mathSign(force2) * -1;
            const nextIndex = ((curIndex + dirIndex) % len3 + len3) % len3;
            const dirBump = slides.current.length === 2 ? mathSign(force2) : 0;
            const nextTarget = fsScrollTarget.byIndex(nextIndex, dirBump);
            return nextTarget.distance;
          };
          const end = trackerX.pointerUp(evt);
          let rawForce = end.fx;
          if (isRtl) rawForce = -rawForce;
          const isMouseEvt = isMouseEvent(evt, window);
          const snapForceBoost = { mouse: 300, touch: 400 };
          const boost = snapForceBoost[isMouseEvt ? "mouse" : "touch"];
          const boostedForce = rawForce * boost;
          const fsScrollTarget = scrollTargetRef.current;
          const fsScrollTo2 = scrollToRef.current;
          const body2 = bodyRef.current;
          if (!fsScrollTarget || !fsScrollTo2 || !body2) {
            dragMode.current = "none";
            return;
          }
          const force = allowedForce2(boostedForce);
          const baseSpeed = sliderDuration;
          const baseFriction = sliderFriction;
          const forceFactor = factorAbs(boostedForce, force);
          const speed = baseSpeed - 10 * forceFactor;
          const friction = baseFriction + forceFactor / 50;
          body2.useDuration(speed).useFriction(friction);
          fsScrollTo2.distance(force, true);
        }
        dragMode.current = "none";
      }
      dragStore.add(root, "dragstart", (evt) => evt.preventDefault(), { passive: false }).add(root, "touchstart", onDown).add(root, "mousedown", onDown, { passive: true }).add(root, "touchcancel", () => {
        isTouchPinching.current = false;
        wasPinch.current = false;
        pointerDownRef.current = false;
        isPointerDown.current = false;
        dragMode.current = "none";
        isVerticalScroll.current = false;
        yTemp.current = 0;
        moveStore.clear();
      }).add(root, "contextmenu", onUp);
      return () => {
        dragStore.clear();
        moveStore.clear();
        animRef.current?.destroy();
        animRef.current = null;
      };
    }, [show, imageCount]);
    function goToCanonical(canonicalIdx, mode = "animated") {
      scrollToIndex(canonicalIdx, { jump: mode === "instant" });
    }
    useEffect(() => {
      const root = viewportRef.current;
      if (!root) return;
      let wheelTimer = null;
      function onWheel(e) {
        if (isZoomed) return;
        const track = slider.current;
        if (!track) return;
        const containerWidth = track.clientWidth;
        const contentWidth = (slides.current.length || 1) * (perSlideRef.current || containerWidth);
        const canScrollHorizontally = contentWidth > containerWidth;
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        if (!isHorizontal || !canScrollHorizontally) return;
        e.preventDefault();
        const cur = (offsetLocationRef.current?.get() ?? 0) - e.deltaX * sign;
        const next2 = cur;
        targetRef.current?.set(next2);
        bodyRef.current?.useDuration(0).useFriction(1);
        animRef.current?.start();
        x.current = next2;
        positionSlider();
        updateActiveIndexFromX(next2);
        if (wheelTimer) clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
        }, 120);
      }
      root.addEventListener("wheel", onWheel, { passive: false });
      return () => root.removeEventListener("wheel", onWheel);
    }, [isZoomed]);
    function updateActiveIndexFromX(loc) {
      const per = perSlide();
      const len2 = slideCount();
      let idx = Math.round(Math.abs(loc) / per);
      idx = (idx % len2 + len2) % len2;
      if (selectedIndex.current !== idx) {
        selectedIndex.current = idx;
        indexCurrentRef.current?.set(idx);
        sub.setLocalIndex(idx);
        let actualIndex = ((idx + 1) % imageCount + imageCount) % imageCount;
        if (actualIndex === 0) actualIndex = imageCount;
        if (counterRef.current) {
          counterRef.current.textContent = `${actualIndex} / ${imageCount}`;
        }
      }
    }
    function setTranslateX(tx, ty) {
      if (!slider.current) return;
      let ny;
      if (isVerticalScroll.current) {
        ny = Math.round(ty);
      } else {
        const currentY = appliedYRef.current;
        const easedY = currentY + (0 - currentY) * 0.2;
        ny = Math.round(easedY);
        appliedYRef.current = ny;
      }
      commitXY(tx, ny);
    }
    function positionSlider() {
      setTranslateX(x.current, y.current);
    }
    useEffect(() => {
      const left = leftChevronRef.current;
      const right = rightChevronRef.current;
      const onClick = (ev) => {
        const target = ev.currentTarget;
        const action = target?.dataset.action;
        if (action === "prev") previous();
        else if (action === "next") next();
      };
      if (left) left.addEventListener("click", onClick);
      if (right) right.addEventListener("click", onClick);
      return () => {
        if (left) left.removeEventListener("click", onClick);
        if (right) right.removeEventListener("click", onClick);
      };
    }, [leftChevronRef.current, rightChevronRef.current, showFullscreenSlider, isRtl]);
    function setAllX(nx) {
      locationRef.current?.set(nx);
      previousLocationRef.current?.set(nx);
      offsetLocationRef.current?.set(nx);
      targetRef.current?.set(nx);
      x.current = nx;
    }
    useEffect(() => {
      let raf = 0;
      function onResize() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          animRef.current?.stop();
          recenterWithAnchor();
        });
      }
      onResize();
      const roViewport = new ResizeObserver(onResize);
      if (viewportRef.current) roViewport.observe(viewportRef.current);
      window.addEventListener("orientationchange", onResize, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("orientationchange", onResize);
        roViewport.disconnect();
      };
    }, [windowSize, recenterWithAnchor]);
    useEffect(() => {
      const offReq = sub.onRequest((req) => {
        switch (req.type) {
          case "requestSet": {
            const mode = req.mode ?? "animated";
            if (mode === "instant") {
              const per = perSlide();
              const nx = -per * req.index;
              setAllX(nx);
              setTranslateX(nx, 0);
              animRef.current?.stop();
              const idx = (req.index % slideCount() + slideCount()) % slideCount();
              commitIndexChange(idx);
              if (counterRef.current) {
                let actual = selectedIndex.current + 1;
                const len2 = slideCount();
                actual = (actual % len2 + len2) % len2;
                if (actual === 0) actual = imageCount;
                counterRef.current.textContent = `${actual} / ${imageCount}`;
              }
            } else {
              const mode2 = req.mode ?? "animated";
              const jump = mode2 === "instant";
              scrollToIndex(req.index, { jump });
            }
            break;
          }
          case "requestPrev":
            previous();
            break;
          case "requestNext":
            next();
            break;
          case "center":
            recenterWithAnchor();
            break;
        }
      });
      const offEvt = sub.onEvent(() => {
      });
      return () => {
        offReq();
        offEvt();
      };
    }, [sub]);
    function centerSlider() {
      scrollToIndex(selectedIndex.current, { jump: false });
    }
    useImperativeHandle(ref, () => ({ centerSlider }), [centerSlider]);
    function isVideoItem(item) {
      if (!item) return false;
      const any = item;
      if (any.type === "video") return true;
      if (any.kind === "video") return true;
      if (any.mediaType === "video") return true;
      if (any.videoSrc) return true;
      if (any.src && typeof any.src === "string" && any.src.match(/\.(mp4|webm|mov)(\?|#|$)/i)) return true;
      if (any.plyrSource) return true;
      if (any.sources?.video) return true;
      return false;
    }
    const len = normalizedItems?.length || imageCount || 1;
    const openingIndex = ((slideIndex ?? 0) % len + len) % len;
    const isVideoSlide = isVideoItem(normalizedItems?.[openingIndex]);
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref: viewportRef,
        className: `fs_viewport ${rtlCls}`,
        dir: isRtl ? "rtl" : void 0,
        style: {
          position: "absolute",
          inset: 0,
          overflow: "hidden"
        },
        children: /* @__PURE__ */ jsx(
          "div",
          {
            ref: slider,
            className: `fullscreen_slider ${rtlCls}`,
            style: {
              position: "absolute",
              inset: 0,
              overflow: "visible",
              cursor: "grab",
              userSelect: "none",
              willChange: "opacity, transform",
              backfaceVisibility: "hidden",
              transition: introFade || isVideoSlide ? `opacity ${introDuration}ms ${introEasing}` : void 0,
              opacity: showFullscreenSlider ? introFade || isVideoSlide ? fadeOpening ? 0 : 1 : 1 : 0
            },
            children
          }
        )
      }
    );
  }
);
FullscreenSlider.displayName = "FullscreenSlider";
function FullscreenThumbnailSlider({
  items,
  position,
  fsSub,
  className,
  style,
  thumbnailWidth,
  thumbnailHeight,
  thumbnailsCenter,
  thumbnailsContainerWidth,
  thumbnailsContainerHeight,
  visible = true,
  invisible = false,
  fadeDurationMs = 300,
  thumbnailItemClassName,
  thumbnailItemStyle,
  gap,
  freeScroll,
  groupCells,
  loop,
  direction,
  skipSnaps,
  centerActiveThumb,
  selectDuration,
  freeScrollDuration,
  sliderFriction,
  breakpointMap = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  rippleEnabled,
  rippleClassName,
  showArrows = false,
  arrowStyles,
  arrowClassName,
  prevArrowStyles,
  prevArrowClassName,
  nextArrowStyles,
  nextArrowClassName,
  renderArrows,
  renderPrevArrow,
  renderNextArrow
}) {
  const channelRef = useRef(createIndexChannel(fsSub.get(), "animated"));
  useEffect(() => {
    const off = fsSub.onEvent((e) => {
      if (e.type === "internalIndex") {
        channelRef.current.set(e.index, "animated", { silent: false });
      }
    });
    return off;
  }, [fsSub]);
  useEffect(() => {
    channelRef.current.set(fsSub.get(), "animated", { silent: true });
  }, [fsSub]);
  const children = useMemo(
    () => items.map((item, i) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        style: {
          border: "none",
          padding: 0,
          background: "transparent",
          cursor: "pointer"
        },
        children: /* @__PURE__ */ jsx(
          "img",
          {
            src: item.thumbSrc,
            alt: item.alt ?? `thumb-${i}`,
            style: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            },
            draggable: false
          }
        )
      },
      `fs-thumb-${i}`
    )),
    [items]
  );
  const isOpen = visible && !invisible;
  const opacity = isOpen ? 1 : 0;
  const transform = isOpen ? "translateY(0)" : "translateY(8px)";
  const pointerEvents = isOpen ? "auto" : "none";
  const wrapperStyle = {
    opacity,
    transform,
    pointerEvents,
    transition: `
      opacity ${fadeDurationMs}ms cubic-bezier(.4,0,.22,1),
      transform ${fadeDurationMs}ms cubic-bezier(.4,0,.22,1)
    `
  };
  return /* @__PURE__ */ jsx("div", { style: wrapperStyle, className, children: /* @__PURE__ */ jsx(
    ThumbnailSlider,
    {
      position,
      thumbnailWidth,
      thumbnailHeight,
      indexChannel: channelRef.current,
      style,
      onSelectThumb: (idx) => fsSub.requestSet(idx, "animated"),
      thumbnailsCenter,
      thumbnailsContainerWidth,
      thumbnailsContainerHeight,
      thumbnailItemClassName,
      thumbnailItemStyle,
      gap,
      freeScroll,
      groupCells,
      loop,
      direction,
      skipSnaps,
      centerActiveThumb,
      selectDuration,
      freeScrollDuration,
      sliderFriction,
      breakpointMap,
      rippleEnabled,
      rippleClassName,
      showArrows,
      arrowStyles,
      arrowClassName,
      prevArrowStyles,
      prevArrowClassName,
      nextArrowStyles,
      nextArrowClassName,
      renderArrows,
      renderPrevArrow,
      renderNextArrow,
      children
    }
  ) });
}
function FsEntryOverlayMount({ setMountEl, style, className }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: setMountEl,
      className,
      style: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        ...style
      }
    }
  );
}
function usePlyrProps(args) {
  const { items, source, options } = args;
  return React8.useMemo(() => {
    if (!items?.length) return [];
    const getSource = (item, index) => (source ?? defaultPlyrSource)(item, index);
    const getOptions = mergePlyrOptions(defaultPlyrOptions, options);
    return buildPlyrProps(items, getSource, getOptions);
  }, [items, source, options]);
}
function renderFullscreenSlides(opts) {
  const {
    items,
    plyrList,
    getTransform,
    imageRefs,
    playerRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle: defaultPlayerStyle2,
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
    renderImage
  } = opts;
  const vw = typeof window !== "undefined" ? document.documentElement.clientWidth : 1024;
  const effectivePlacement = resolveFsCaptionPlacement(
    fsCaptionPlacement,
    fsCaptionBreakpoint,
    vw
  );
  const isHorizontal = effectivePlacement === "left" || effectivePlacement === "right";
  const isVertical = effectivePlacement === "top" || effectivePlacement === "bottom";
  const captionFirst = effectivePlacement === "left" || effectivePlacement === "top";
  const DEFAULT_SIDE = 280;
  const DEFAULT_TOP_BOTTOM = 200;
  const sideWidth = fsCaptionWidth ?? DEFAULT_SIDE;
  const topBottomHeight = fsCaptionHeight ?? DEFAULT_TOP_BOTTOM;
  return items.map((item, index) => {
    const imageRef = imageRefs.current[index];
    const plyr = plyrList[index];
    const captionNode = renderCaption ? renderCaption({ item, index, isZoomed }) : null;
    const provider = item.kind === "video" ? detectProvider(plyr?.source) : "other";
    return /* @__PURE__ */ jsx(
      "div",
      {
        "data-rmg-fs-slide": "true",
        "data-index": index,
        ref: (el) => {
          if (el && !cells.current.some((c) => c.element === el)) {
            cells.current.push({ element: el, index });
          }
        },
        style: {
          transform: getTransform(index),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: 0,
          minWidth: "100%",
          height: "100%",
          margin: "auto",
          touchAction: "none"
        },
        className: styles.imgMargin,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: isHorizontal ? "row" : "column",
              justifyContent: "center"
            },
            children: [
              captionNode && captionFirst && /* @__PURE__ */ jsx(
                "div",
                {
                  className: captionClassName,
                  "data-rmg-fs-caption": "true",
                  style: {
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
                    ...captionStyle
                  },
                  children: captionNode
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  ref: imageRef,
                  onPointerDown: (e) => onPanPointerDown(e, imageRef),
                  onClickCapture: onSuppressNextClickCapture,
                  style: {
                    overflow: "visible",
                    touchAction: "none",
                    height: isVertical ? `calc(100% - ${captionNode ? topBottomHeight : 0}px)` : "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  },
                  children: item.kind === "video" ? /* @__PURE__ */ jsx(
                    "div",
                    {
                      "data-index": index,
                      style: { ...defaultPlayerStyle2, ...fsVideoStyle ?? {} },
                      className: ["rmg__player", fsVideoClassName].filter(Boolean).join(" "),
                      "data-rmg-plyr": "true",
                      "data-rmg-plyr-index": String(index),
                      "data-rmg-plyr-provider": provider,
                      children: /* @__PURE__ */ jsx(
                        Plyr,
                        {
                          source: plyr.source,
                          options: plyr.options,
                          ref: (player) => {
                            playerRefs.current[index] = player;
                            installDblclickGuardWhenReady(player);
                          }
                        }
                      )
                    }
                  ) : renderImage ? renderImage({
                    item,
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
                      userSelect: "none"
                    }
                  }) : /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: item.src,
                      alt: item.alt ?? `cell-${index}`,
                      srcSet: item.srcSet,
                      sizes: item.sizes,
                      "data-index": index,
                      className: styles.fullscreenImages,
                      draggable: "false",
                      style: {
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        touchAction: "manipulation",
                        transformOrigin: "0 0",
                        transform: "translate(0, 0) scale(1)",
                        cursor: isZoomed ? "grab" : "zoom-in",
                        userSelect: "none"
                      }
                    }
                  )
                }
              ),
              captionNode && !captionFirst && /* @__PURE__ */ jsx(
                "div",
                {
                  className: captionClassName,
                  "data-rmg-fs-caption": "true",
                  style: {
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
                    ...captionStyle
                  },
                  children: captionNode
                }
              )
            ]
          }
        )
      },
      `${item.src}-${index}`
    );
  });
}

// src/Gallery/fullscreen/transforms.ts
function createWrappedTransform({ length, sign }) {
  return (index) => {
    const originalCount = length - 2;
    if (index === 0) return `translateX(${ -100 * sign}%)`;
    if (index === length - 1) return `translateX(${originalCount * 100 * sign}%)`;
    return `translateX(${(index - 1) * 100 * sign}%)`;
  };
}
function createSingleTransform() {
  return () => `translateX(0%)`;
}

// src/Gallery/video/fullscreenPlayerStyle.ts
var defaultPlayerStyle = {
  aspectRatio: "16 / 9",
  height: "auto",
  width: "100%",
  maxWidth: "calc(100dvh * (16 / 9))",
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)"
};
function usePanAnimation(d) {
  React8.useEffect(() => {
    const anim = Animations(
      document,
      window,
      () => {
        d.boundsX.current?.constrain(d.pointerDownRef.current);
        d.boundsY.current?.constrain(d.pointerDownRef.current);
        d.bodyX.current?.seek();
        d.bodyY.current?.seek();
      },
      (alpha) => {
        const locX = d.locX.current;
        const locY = d.locY.current;
        const prevX = d.prevX.current;
        const prevY = d.prevY.current;
        if (!locX || !locY || !prevX || !prevY) return;
        const lx = locX.get() * alpha + prevX.get() * (1 - alpha);
        const ly = locY.get() * alpha + prevY.get() * (1 - alpha);
        d.offX.current?.set(lx);
        d.offY.current?.set(ly);
        d.renderPan(lx, ly);
        const settled = !!d.bodyX.current?.settled() && !!d.bodyY.current?.settled();
        const within = !d.boundsX.current?.reached?.() && !d.boundsY.current?.reached?.();
        const stop = settled && within && !d.pointerDownRef.current;
        if (stop) d.animRef.current?.stop();
      }
    );
    d.animRef.current = anim;
    anim.init();
    return () => {
      anim.destroy();
      d.animRef.current = null;
    };
  }, []);
}
function Axis() {
  return {
    scroll: "x",
    cross: "y",
    direction(n) {
      return n;
    },
    measureSize(rect) {
      return rect.width;
    }
  };
}
function isMouseEvent2(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}
function DragTracker2(axis, ownerWindow) {
  return createDragTracker({ ownerWindow, axis });
}
function usePanDrag(d) {
  const freeBoost = React8.useMemo(() => ({ mouse: 400, touch: 400 }), []);
  const trackerRef = React8.useRef(null);
  const dragStore = React8.useRef(EventStore()).current;
  const moveStore = React8.useRef(EventStore()).current;
  const forceBoost = React8.useCallback(
    (rawForce, isMouse) => rawForce * (isMouse ? freeBoost.mouse : freeBoost.touch),
    [freeBoost]
  );
  let injected = false;
  function ensurePanCursorStyle() {
    if (injected) return;
    injected = true;
    const style = document.createElement("style");
    style.setAttribute("data-rmg-pan-cursor", "true");
    style.textContent = `
      html.rmg-pan-grabbing,
      html.rmg-pan-grabbing * {
        cursor: grabbing !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  React8.useEffect(() => {
    ensurePanCursorStyle();
  }, []);
  const setGrabbing = React8.useCallback((on) => {
    const root = document.documentElement;
    if (on) root.classList.add("rmg-pan-grabbing");
    else root.classList.remove("rmg-pan-grabbing");
  }, []);
  const handlePanPointerStart = React8.useCallback(
    (e, imageRef) => {
      if (!d.isZoomed) return;
      if (!imageRef.current) return;
      d.currentImage.current = imageRef.current;
      d.rebuildPanBodies();
      const ownerWin = window;
      const axis = d.axisRef.current || Axis();
      trackerRef.current = DragTracker2(axis, ownerWin);
      const mouse = e.button !== void 0;
      const isPrimaryMouse = mouse ? e.button === 0 : false;
      if (mouse && !isPrimaryMouse) return;
      d.pointerDownRef.current = true;
      d.interactionModeRef.current = "drag";
      setGrabbing(true);
      const endDrag = () => {
        d.pointerDownRef.current = false;
        d.interactionModeRef.current = "idle";
        moveStore.clear();
        setGrabbing(false);
      };
      d.tgtX.current?.set(d.locX.current?.get?.() ?? 0);
      d.tgtY.current?.set(d.locY.current?.get?.() ?? 0);
      const CLICK_MOVE_TOL = 3;
      const CLICK_TIME_TOL_MS = 220;
      const FLICK_FORCE_TOL = 0.075;
      let totalAbsDx = 0;
      let totalAbsDy = 0;
      let canceledByMultiTouch = false;
      const downTs = performance.now();
      const downNativeEvt = e.nativeEvent;
      trackerRef.current.pointerDown(downNativeEvt);
      const onMove = (evt) => {
        if (!isMouseEvent2(evt, window) && evt.touches?.length >= 2) {
          canceledByMultiTouch = true;
          endDrag();
          return onUp(evt);
        }
        const moved = trackerRef.current.pointerMove(evt);
        totalAbsDx += Math.abs(moved.dx);
        totalAbsDy += Math.abs(moved.dy);
        d.bodyX.current?.useFriction(0.3).useDuration(0.75);
        d.bodyY.current?.useFriction(0.3).useDuration(0.75);
        d.tgtX.current?.add(moved.dx);
        d.tgtY.current?.add(moved.dy);
        d.animRef.current?.start();
        if ("cancelable" in evt && evt.cancelable) evt.preventDefault?.();
      };
      const onUp = (evt) => {
        const flick = trackerRef.current.pointerUp(evt);
        const isMouse = isMouseEvent2(evt, window);
        const durMs = performance.now() - downTs;
        const tinyTravel = totalAbsDx <= CLICK_MOVE_TOL && totalAbsDy <= CLICK_MOVE_TOL;
        const tinyFlick = Math.abs(flick.fx) <= FLICK_FORCE_TOL && Math.abs(flick.fy) <= FLICK_FORCE_TOL;
        const isClick = !canceledByMultiTouch && tinyTravel && tinyFlick && durMs <= CLICK_TIME_TOL_MS;
        d.pointerDownRef.current = false;
        d.interactionModeRef.current = "idle";
        moveStore.clear();
        endDrag();
        if (isClick) {
          const current = d.currentImage.current;
          const imgEl = current?.querySelector?.("img") ?? current?.children?.[0];
          if (imgEl) {
            const upAny = evt;
            const cx = upAny?.touches?.[0]?.clientX ?? upAny?.changedTouches?.[0]?.clientX ?? upAny?.clientX ?? downNativeEvt?.clientX;
            const cy = upAny?.touches?.[0]?.clientY ?? upAny?.changedTouches?.[0]?.clientY ?? upAny?.clientY ?? downNativeEvt?.clientY;
            const fakeReactEvt = {
              target: imgEl,
              currentTarget: imgEl,
              clientX: cx,
              clientY: cy,
              nativeEvent: upAny ?? downNativeEvt
            };
            d.handleZoomToggle(d.zoomCtx, fakeReactEvt, d.currentImage);
            d.suppressNextClickRef.current = true;
            const anyEvt = evt;
            anyEvt?.preventDefault?.();
            anyEvt?.stopPropagation?.();
            d.animRef.current?.stop();
            return;
          }
          d.animRef.current?.stop();
          return;
        }
        const fx = forceBoost(flick.fx, isMouse);
        const fy = forceBoost(flick.fy, isMouse);
        const factorX = Math.min(
          1,
          Math.abs(flick.fx) > 0 ? Math.abs((Math.abs(fx) - Math.abs(flick.fx)) / (flick.fx || 1)) : 0
        );
        const factorY = Math.min(
          1,
          Math.abs(flick.fy) > 0 ? Math.abs((Math.abs(fy) - Math.abs(flick.fy)) / (flick.fy || 1)) : 0
        );
        const speedX = d.fs.zoom.panDuration - 10 * factorX;
        const speedY = d.fs.zoom.panDuration - 10 * factorY;
        const frictionX = d.fs.zoom.panFriction + factorX / 50;
        const frictionY = d.fs.zoom.panFriction + factorY / 50;
        d.bodyX.current?.useDuration(speedX).useFriction(frictionX);
        d.bodyY.current?.useDuration(speedY).useFriction(frictionY);
        d.tgtX.current?.add(fx);
        d.tgtY.current?.add(fy);
        d.animRef.current?.start();
      };
      const isMouseDown = e.nativeEvent instanceof MouseEvent;
      const node = isMouseDown ? document : window;
      moveStore.add(node, "touchmove", onMove, { passive: false }).add(node, "touchend", onUp).add(node, "mousemove", onMove, { passive: false }).add(node, "mouseup", onUp);
      dragStore.add(window, "touchcancel", onUp).add(window, "contextmenu", onUp);
    },
    [d, dragStore, moveStore, forceBoost, setGrabbing]
  );
  React8.useEffect(() => {
    return () => {
      moveStore.clear();
      dragStore.clear();
      document.documentElement.classList.remove("rmg-pan-grabbing");
    };
  }, [moveStore, dragStore]);
  return { handlePanPointerStart };
}

// src/Gallery/zoomPan/pan/index.ts
function usePanRuntime(deps) {
  usePanAnimation(deps);
  return usePanDrag(deps);
}

// src/Gallery/zoomPan/core/rebuildPanBodies.ts
function rebuildPanBodiesFn(ctx) {
  if (!ctx.currentImage.current) return;
  const container = ctx.currentImage.current;
  const img = getPrimaryImgEl(container);
  if (!img) return;
  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;
  const { baseW, baseH } = baseFitSizeC(img, containerW, containerH);
  const { x, y } = getCurrentTransform(img);
  ctx.locX.current = ctx.Vector1D(x);
  ctx.prevX.current = ctx.Vector1D(x);
  ctx.offX.current = ctx.Vector1D(x);
  ctx.tgtX.current = ctx.Vector1D(x);
  ctx.locY.current = ctx.Vector1D(y);
  ctx.prevY.current = ctx.Vector1D(y);
  ctx.offY.current = ctx.Vector1D(y);
  ctx.tgtY.current = ctx.Vector1D(y);
  ctx.bodyX.current = ctx.ScrollBody(
    ctx.locX.current,
    ctx.offX.current,
    ctx.prevX.current,
    ctx.tgtX.current,
    ctx.fs.zoom.panDuration,
    ctx.fs.zoom.panFriction
  ).sync();
  ctx.bodyY.current = ctx.ScrollBody(
    ctx.locY.current,
    ctx.offY.current,
    ctx.prevY.current,
    ctx.tgtY.current,
    ctx.fs.zoom.panDuration,
    ctx.fs.zoom.panFriction
  ).sync();
  const { x: limX, y: limY, povX, povY } = ctx.boundsForCurrent(
    ctx.scaleRef.current,
    baseW,
    baseH,
    containerW,
    containerH
  );
  ctx.boundsX.current = ctx.ScrollBounds(
    limX,
    ctx.offX.current,
    ctx.tgtX.current,
    ctx.bodyX.current,
    povX,
    ctx.fs.zoom.panDuration
  );
  ctx.boundsY.current = ctx.ScrollBounds(
    limY,
    ctx.offY.current,
    ctx.tgtY.current,
    ctx.bodyY.current,
    povY,
    ctx.fs.zoom.panDuration
  );
}

// src/Gallery/zoomPan/core/boundsForCurrent.ts
function boundsForCurrent(args) {
  const {
    scale,
    imgW,
    imgH,
    currentImageEl,
    viewW,
    viewH
  } = args;
  const rect = currentImageEl?.getBoundingClientRect() || null;
  const vw = viewW ?? rect?.width ?? document.documentElement.clientWidth;
  const vh = viewH ?? rect?.height ?? window.innerHeight;
  const scaledW = imgW * scale;
  const scaledH = imgH * scale;
  const offsetW = (vw - imgW) / 2;
  const offsetH = (vh - imgH) / 2;
  const xMin = scaledW <= vw ? -offsetW - (scaledW - vw) / 2 : -(scaledW - vw) - offsetW;
  const xMax = scaledW <= vw ? -offsetW - (scaledW - vw) / 2 : -offsetW;
  const yMin = scaledH <= vh ? -offsetH - (scaledH - vh) / 2 : -(scaledH - vh) - offsetH;
  const yMax = scaledH <= vh ? -offsetH - (scaledH - vh) / 2 : -offsetH;
  return {
    x: Limit(xMin, xMax),
    y: Limit(yMin, yMax),
    povX: PercentOfView(vw),
    povY: PercentOfView(vh)
  };
}
function isPinchGesture(e) {
  if (e.ctrlKey) return true;
  const absX = Math.abs(e.deltaX);
  const absY = Math.abs(e.deltaY);
  if (absX < 1 && absY < 1) return false;
  const ratio = absX / absY;
  return ratio >= 0.8 && ratio <= 1.2;
}
function useGlobalPinchZoom(args) {
  const {
    scaleRef,
    zoomCtx,
    zoomTo: zoomTo2,
    isZoomed,
    currentImage,
    imageRefs,
    fullscreenSliderApi,
    rebuildPanBodies,
    baseFitSizeC: baseFitSizeC2,
    boundsForCurrent: boundsForCurrent2,
    ScrollBounds: ScrollBounds2,
    boundsX,
    boundsY,
    offX,
    offY,
    tgtX,
    tgtY,
    bodyX,
    bodyY,
    animRef,
    panDuration,
    findImgAtPoint: findImgAtPoint2,
    readDataIndex: readDataIndex2,
    distance: distance2,
    midpoint: midpoint2
  } = args;
  const isPinching = React8.useRef(false);
  const isTouchPinching = React8.useRef(false);
  const pinchJustEnded = React8.useRef(false);
  const startDist = React8.useRef(0);
  const startScale = React8.useRef(1);
  const handlePinchWheel = React8.useCallback(
    (e, imageRef) => {
      if (!imageRef.current) return;
      if (!e.ctrlKey) return;
      e.preventDefault();
      fullscreenSliderApi.current?.centerSlider();
      if (scaleRef.current > 1.01) {
        isPinching.current = true;
      }
      const { ctrlKey, deltaMode } = e;
      let { deltaY } = e;
      if (deltaMode === 1) {
        deltaY *= 15;
      }
      const divisor = ctrlKey ? 100 : 300;
      const scaleDiff = 1 - deltaY / divisor;
      const destZoomLevel = scaleRef.current * scaleDiff;
      zoomTo2(zoomCtx, {
        destZoomLevel,
        centerPoint: { x: e.clientX, y: e.clientY },
        imageRef
      });
    },
    [fullscreenSliderApi, scaleRef, zoomTo2, zoomCtx]
  );
  const handleWheelPan = React8.useCallback(
    (e) => {
      if (!isZoomed) return;
      if (isPinchGesture(e)) return;
      if (e.ctrlKey) return;
      if (!currentImage.current) return;
      e.preventDefault();
      rebuildPanBodies();
      const container = currentImage.current;
      const rect = container.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;
      const { baseW, baseH } = baseFitSizeC2(
        container.children[0],
        containerW,
        containerH
      );
      const { x: limX, y: limY, povX, povY } = boundsForCurrent2(
        scaleRef.current,
        baseW,
        baseH,
        containerW,
        containerH
      );
      boundsX.current = ScrollBounds2(
        limX,
        offX.current,
        tgtX.current,
        bodyX.current,
        povX,
        panDuration
      );
      boundsY.current = ScrollBounds2(
        limY,
        offY.current,
        tgtY.current,
        bodyY.current,
        povY,
        panDuration
      );
      let tx = (offX.current?.get() ?? 0) - e.deltaX;
      let ty = (offY.current?.get() ?? 0) - e.deltaY;
      tx = limX.constrain(tx);
      ty = limY.constrain(ty);
      tgtX.current?.set(tx);
      tgtY.current?.set(ty);
      bodyX.current?.useDuration(0).useFriction(1);
      bodyY.current?.useDuration(0).useFriction(1);
      animRef.current?.start();
    },
    [
      isZoomed,
      currentImage,
      rebuildPanBodies,
      baseFitSizeC2,
      boundsForCurrent2,
      scaleRef,
      boundsX,
      boundsY,
      ScrollBounds2,
      offX,
      offY,
      tgtX,
      tgtY,
      bodyX,
      bodyY,
      animRef,
      panDuration
    ]
  );
  React8.useEffect(() => {
    window.addEventListener("wheel", handleWheelPan, { passive: false });
    return () => window.removeEventListener("wheel", handleWheelPan);
  }, [handleWheelPan]);
  React8.useLayoutEffect(() => {
    function pinchWheelHandler(e) {
      const img = findImgAtPoint2(document, e.clientX, e.clientY);
      if (!img) return;
      const idx = readDataIndex2(img);
      if (idx == null) return;
      const matchedRef = imageRefs.current[idx];
      if (!matchedRef) return;
      currentImage.current = matchedRef.current;
      handlePinchWheel(e, matchedRef);
    }
    window.addEventListener("wheel", pinchWheelHandler, { passive: false });
    return () => window.removeEventListener("wheel", pinchWheelHandler);
  }, [findImgAtPoint2, readDataIndex2, imageRefs, currentImage, handlePinchWheel]);
  const onTouchStart = React8.useCallback(
    (e) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      fullscreenSliderApi.current?.centerSlider();
      isTouchPinching.current = true;
      const [t0, t1] = [e.touches[0], e.touches[1]];
      startDist.current = distance2(t0, t1);
      startScale.current = scaleRef.current;
    },
    [distance2, fullscreenSliderApi, scaleRef]
  );
  const onTouchMove = React8.useCallback(
    (e, imageRef) => {
      if (!isTouchPinching.current || e.touches.length !== 2) return;
      e.preventDefault();
      const [t0, t1] = [e.touches[0], e.touches[1]];
      const currDist = distance2(t0, t1);
      const factor = currDist / startDist.current;
      const destZoomLevel = startScale.current * factor;
      const center = midpoint2(t0, t1);
      zoomTo2(zoomCtx, { destZoomLevel, centerPoint: center, imageRef });
    },
    [distance2, midpoint2, zoomTo2, zoomCtx]
  );
  const endPinch = React8.useCallback(() => {
    if (!isTouchPinching.current) return;
    isTouchPinching.current = false;
    pinchJustEnded.current = true;
  }, []);
  React8.useLayoutEffect(() => {
    function touchPinchMoveHandler(e) {
      if (e.touches.length < 2) return;
      const mid = midpoint2(e.touches[0], e.touches[1]);
      const img = findImgAtPoint2(document, mid.x, mid.y);
      if (!img) return;
      const idx = readDataIndex2(img);
      if (idx == null) return;
      const matchedRef = imageRefs.current[idx];
      if (!matchedRef) return;
      currentImage.current = matchedRef.current;
      onTouchMove(e, matchedRef);
    }
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", touchPinchMoveHandler, { passive: false });
    window.addEventListener("touchend", endPinch);
    window.addEventListener("touchcancel", endPinch);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", touchPinchMoveHandler);
      window.removeEventListener("touchend", endPinch);
      window.removeEventListener("touchcancel", endPinch);
    };
  }, [
    onTouchStart,
    onTouchMove,
    endPinch,
    midpoint2,
    findImgAtPoint2,
    readDataIndex2,
    imageRefs,
    currentImage
  ]);
  return {
    isPinching,
    isTouchPinching
  };
}
function useWrappedItemsAndRefs(args) {
  const { normalizedItems, wrappedItems, setWrappedItems, imageRefs } = args;
  React8.useEffect(() => {
    if (!normalizedItems.length) return;
    const first = normalizedItems[0];
    const last = normalizedItems[normalizedItems.length - 1];
    setWrappedItems([last, ...normalizedItems, first]);
  }, [normalizedItems, setWrappedItems]);
  React8.useEffect(() => {
    if (!wrappedItems.length) return;
    imageRefs.current = wrappedItems.map(() => React8.createRef());
  }, [wrappedItems, imageRefs]);
}

// src/Gallery/zoomPan/zoom/forceResetZoom.ts
function forceResetZoom(args) {
  const { setScale, zoomState, imageRefs, resetPan } = args;
  const transition = args.transition ?? "transform 0.2s cubic-bezier(.4,0,.22,1)";
  const transform = "translate(0, 0) scale(1)";
  setScale(1);
  zoomState.previousZoom.current.x = 0;
  zoomState.previousZoom.current.y = 0;
  zoomState.panRef.current = { x: 0, y: 0 };
  zoomState.scaleRef.current = 1;
  imageRefs.current.forEach((ref) => {
    const element = ref.current;
    if (!element) return;
    const child = element.children[0];
    if (isVideoSlideElement(child)) return;
    const match = transition.match(/([\d.]+)s/);
    const durationMs = match ? parseFloat(match[1]) * 1e3 : 300;
    element.style.transition = transition;
    if (child) child.style.transition = transition;
    element.offsetWidth;
    element.style.transform = transform;
    if (child) child.style.transform = transform;
    window.setTimeout(() => {
      element.style.transition = "";
      if (child) child.style.transition = "";
    }, durationMs + 50);
  });
  resetPan();
}

// src/Gallery/zoomPan/zoom/resetZoomForSlideChange.ts
function resetZoomForSlideChange(args) {
  const { setScale, zoomState, imageRefs, resetPan } = args;
  if (zoomState.scaleRef.current === 1) return;
  zoomState.changingSlides.current = true;
  setScale(1);
  zoomState.previousZoom.current.x = 0;
  zoomState.previousZoom.current.y = 0;
  zoomState.panRef.current = { x: 0, y: 0 };
  zoomState.scaleRef.current = 1;
  zoomState.suppressLoopRef.current = false;
  const transition = "transform 0.2s cubic-bezier(.4,0,.22,1)";
  const transform = "translate(0, 0) scale(1)";
  imageRefs.current.forEach((ref) => {
    const element = ref.current;
    if (!element) return;
    const child = element.children[0];
    if (isVideoSlideElement(child)) return;
    const match = transition.match(/([\d.]+)s/);
    const durationMs = match ? parseFloat(match[1]) * 1e3 : 300;
    element.style.transition = transition;
    if (child) child.style.transition = transition;
    element.offsetWidth;
    element.style.transform = transform;
    if (child) child.style.transform = transform;
    setTimeout(() => {
      element.style.transition = "";
      if (child) child.style.transition = "";
    }, durationMs + 50);
  });
  resetPan?.();
  const unlockDelayMs = 200;
  setTimeout(() => {
    zoomState.changingSlides.current = false;
  }, unlockDelayMs);
}

// src/Gallery/zoomPan/pan/resetPanForScale1.ts
function resetPanForScale1(args) {
  const {
    currentImage,
    locX,
    prevX,
    offX,
    tgtX,
    locY,
    prevY,
    offY,
    tgtY,
    bodyX,
    bodyY,
    boundsX,
    boundsY,
    ScrollBody: ScrollBody2,
    ScrollBounds: ScrollBounds2,
    baseFitSizeC: baseFitSizeC2,
    boundsForCurrent: boundsForCurrent2,
    panDuration,
    panFriction,
    animRef
  } = args;
  const container = currentImage.current;
  if (!container || !locX.current || !prevX.current || !offX.current || !tgtX.current || !bodyX.current || !boundsX.current || !tgtX.current) return;
  const firstChild = container.children[0];
  if (isVideoSlideElement(firstChild)) return;
  const imgEl = firstChild;
  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;
  const { baseW, baseH } = baseFitSizeC2(imgEl, containerW, containerH);
  locX.current.set(0);
  prevX.current.set(0);
  offX.current.set(0);
  tgtX.current.set(0);
  locY.current.set(0);
  prevY.current.set(0);
  offY.current.set(0);
  tgtY.current.set(0);
  bodyX.current = ScrollBody2(
    locX.current,
    offX.current,
    prevX.current,
    tgtX.current,
    panDuration,
    panFriction
  ).sync();
  bodyY.current = ScrollBody2(
    locY.current,
    offY.current,
    prevY.current,
    tgtY.current,
    panDuration,
    panFriction
  ).sync();
  const { x: limX2, y: limY2, povX, povY } = boundsForCurrent2(1, baseW, baseH, containerW, containerH);
  boundsX.current = ScrollBounds2(limX2, offX.current, tgtX.current, bodyX.current, povX, panDuration);
  boundsY.current = ScrollBounds2(limY2, offY.current, tgtY.current, bodyY.current, povY, panDuration);
  tgtX.current.set(limX2.constrain(tgtX.current.get()));
  tgtY.current.set(limY2.constrain(tgtY.current.get()));
  animRef.current?.resetBlend();
}
function useFsEntryOverlay(args) {
  const {
    enabled,
    fsSub,
    entriesObject,
    entryMapRef,
    syncFullscreenSourceFromIndex,
    resetAllZoomDom,
    wrapperBaseStyle,
    fadeOutMs = 120,
    closing
  } = args;
  const mountRef = React8.useRef(null);
  const rootRef = React8.useRef(null);
  const rootMountRef = React8.useRef(null);
  const fsIndexRef = React8.useRef(fsSub.get());
  React8.useRef(1);
  const overlayElRef = React8.useRef(null);
  const openTokenRef = React8.useRef(0);
  const enteredTokenRef = React8.useRef(0);
  const enterRafRef = React8.useRef(0);
  const pendingUnmountRef = React8.useRef(0);
  const swapJobRef = React8.useRef(null);
  const cancelSwapJob = React8.useCallback(() => {
    const job = swapJobRef.current;
    if (!job) return;
    if (job.raf) cancelAnimationFrame(job.raf);
    if (job.t) clearTimeout(job.t);
    swapJobRef.current = null;
  }, []);
  const setEntryOverlayOpacity = React8.useCallback((next) => {
    const el = overlayElRef.current;
    if (!el) return;
    el.style.setProperty("--rmg-entry-opacity", String(next));
  }, []);
  const getEntryIndexForFsIndex = React8.useCallback(
    (fsIndex) => {
      const map = entryMapRef.current;
      const link = map?.[fsIndex];
      return link?.entryIndex ?? -1;
    },
    [entryMapRef]
  );
  const renderEntryOverlayForIndex = React8.useCallback(
    (index) => {
      const mount = mountRef.current;
      if (!mount) return;
      if (rootRef.current && rootMountRef.current !== mount) {
        const oldRoot = rootRef.current;
        rootRef.current = null;
        rootMountRef.current = null;
        requestAnimationFrame(() => {
          try {
            oldRoot.unmount();
          } catch {
          }
        });
      }
      if (!rootRef.current) {
        rootRef.current = createRoot(mount);
        rootMountRef.current = mount;
      }
      const root = rootRef.current;
      const renderOverlay = entriesObject.render?.overlay;
      if (typeof renderOverlay !== "function") {
        root.render(null);
        overlayElRef.current = null;
        return;
      }
      const map = entryMapRef.current;
      const items = entriesObject.items;
      if (!items?.length || !map?.length) {
        root.render(null);
        overlayElRef.current = null;
        return;
      }
      const link = map[index];
      if (!link) {
        root.render(null);
        overlayElRef.current = null;
        return;
      }
      const entry = items[link.entryIndex];
      if (!entry) {
        root.render(null);
        overlayElRef.current = null;
        return;
      }
      const wrapperStyle = {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "1.25rem 1.5rem",
        background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
        color: "#fff",
        fontSize: "0.9rem",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: "var(--rmg-entry-opacity, 1)",
        transform: "translateY(calc(8px * (1 - var(--rmg-entry-opacity, 1))))",
        transition: "opacity 300ms cubic-bezier(.4,0,.22,1), transform 180ms cubic-bezier(.4,0,.22,1)",
        ...wrapperBaseStyle ?? {},
        ...entriesObject.overlay?.style ?? {}
      };
      root.render(
        /* @__PURE__ */ jsx(
          "div",
          {
            className: entriesObject.overlay?.className,
            style: wrapperStyle,
            ref: (el) => {
              overlayElRef.current = el;
              if (!el) return;
              const token = openTokenRef.current;
              if (enteredTokenRef.current === token) return;
              enteredTokenRef.current = token;
              el.style.setProperty("--rmg-entry-opacity", "0");
              void el.getBoundingClientRect();
              if (enterRafRef.current) cancelAnimationFrame(enterRafRef.current);
              enterRafRef.current = requestAnimationFrame(() => {
                enterRafRef.current = 0;
                el.style.setProperty("--rmg-entry-opacity", "1");
              });
            },
            children: renderOverlay({
              entry,
              entryIndex: link.entryIndex,
              mediaIndex: link.mediaIndex,
              link,
              opacity: 1,
              fsIndex: index,
              style: wrapperStyle,
              containerProps: {
                className: entriesObject.overlay?.className,
                style: wrapperStyle
              }
            })
          }
        )
      );
    },
    [entriesObject, entryMapRef, wrapperBaseStyle]
  );
  const fadeSwapToIndex = React8.useCallback(
    (nextIndex) => {
      if (closing) return;
      cancelSwapJob();
      setEntryOverlayOpacity(0);
      const job = { t: null, raf: 0 };
      swapJobRef.current = job;
      job.t = setTimeout(() => {
        renderEntryOverlayForIndex(nextIndex);
        syncFullscreenSourceFromIndex(nextIndex);
        resetAllZoomDom();
        job.raf = requestAnimationFrame(() => {
          setEntryOverlayOpacity(1);
          swapJobRef.current = null;
        });
      }, fadeOutMs);
    },
    [
      cancelSwapJob,
      fadeOutMs,
      renderEntryOverlayForIndex,
      resetAllZoomDom,
      setEntryOverlayOpacity,
      syncFullscreenSourceFromIndex
    ]
  );
  const setMountEl = React8.useCallback(
    (el) => {
      mountRef.current = el;
      if (el) return;
      cancelSwapJob();
      overlayElRef.current = null;
      const root = rootRef.current;
      rootRef.current = null;
      rootMountRef.current = null;
      if (pendingUnmountRef.current) {
        cancelAnimationFrame(pendingUnmountRef.current);
        pendingUnmountRef.current = 0;
      }
      if (root) {
        pendingUnmountRef.current = requestAnimationFrame(() => {
          pendingUnmountRef.current = 0;
          try {
            root.unmount();
          } catch {
          }
        });
      }
    },
    [cancelSwapJob]
  );
  React8.useEffect(() => {
    if (closing) {
      cancelSwapJob();
      setEntryOverlayOpacity(0);
      return;
    }
    if (!enabled) return;
    openTokenRef.current += 1;
    enteredTokenRef.current = 0;
    const start = fsSub.get();
    fsIndexRef.current = start;
    renderEntryOverlayForIndex(start);
    syncFullscreenSourceFromIndex(start);
    const off = fsSub.onEvent((e) => {
      if (e.type !== "internalIndex") return;
      const next = e.index;
      if (next === fsIndexRef.current && overlayElRef.current) return;
      const prevFsIndex = fsIndexRef.current;
      const prevEntryIndex = getEntryIndexForFsIndex(prevFsIndex);
      const nextEntryIndex = getEntryIndexForFsIndex(next);
      fsIndexRef.current = next;
      if (prevEntryIndex !== nextEntryIndex) {
        fadeSwapToIndex(next);
      } else {
        cancelSwapJob();
        renderEntryOverlayForIndex(next);
        syncFullscreenSourceFromIndex(next);
        resetAllZoomDom();
        requestAnimationFrame(() => setEntryOverlayOpacity(1));
      }
    });
    return () => {
      cancelSwapJob();
      off();
    };
  }, [
    enabled,
    fsSub,
    entriesObject.render?.overlay,
    entriesObject.items,
    cancelSwapJob,
    fadeSwapToIndex,
    getEntryIndexForFsIndex,
    renderEntryOverlayForIndex,
    resetAllZoomDom,
    setEntryOverlayOpacity,
    syncFullscreenSourceFromIndex,
    closing
  ]);
  return { setMountEl, setOpacity: setEntryOverlayOpacity };
}
function FullscreenRuntime(props) {
  const {
    fsEnabled,
    fsSub,
    showFullscreenModal,
    setShowFullscreenModal,
    isClick,
    isAnimatingRef,
    overlayDivRef,
    cells,
    setShowFullscreenSlider,
    cellsStateLength,
    slidesForFullscreen,
    sliderForFullscreen,
    visibleImagesForFullscreen,
    selectedIndexForFullscreen,
    sliderXForFullscreen,
    sliderVelocityForFullscreen,
    isWrappingForFullscreen,
    wrappedItems,
    setClosingModal,
    closeButtonRef,
    counterRef,
    leftChevronRef,
    rightChevronRef,
    centerAlign,
    centerSliderForFullscreen,
    setSliderIndexForFullscreen,
    layout,
    expandableImgRefs,
    entryMapRef,
    entryMediaLayout,
    introFade,
    introDuration,
    introEasing,
    epoch,
    fullscreenSliderApi,
    slideIndex,
    isZoomClick,
    isZoomed,
    windowSize,
    handleZoomToggle,
    imageRefs,
    scale,
    showFullscreenSlider,
    isZooming,
    wrappedModePlyrRefs,
    singleModePlyrRefs,
    closingModal,
    duplicateImgRef,
    direction,
    sliderDuration,
    sliderFriction,
    suppressLoopRef,
    fsFadeOpening,
    slideFade,
    slideFadeDuration,
    slideFadeEasing,
    normalizedItems,
    flexDirection,
    fsThumbContainerRef,
    fsThumbFadeDuration,
    fsThumbFadeEasing,
    fsThumbsOpen,
    fsResolvedThumbPos,
    fsThumbnailsPositionDefined,
    fsThumbnailsContainerClassName,
    fsThumbnailsContainerStyle,
    fsThumbThumbnailWidth,
    fsThumbThumbnailHeight,
    fsThumbCenter,
    fsThumbContainerWidth,
    fsThumbContainerHeight,
    fsThumbGap,
    fsThumbFreeScroll,
    fsThumbGroupCells,
    fsThumbLoop,
    fsThumbSkipSnaps,
    fsThumbCenterActiveThumb,
    fsThumbSelectDuration,
    fsThumbFreeScrollDuration,
    fsThumbFriction,
    fsThumbBreakpointMap,
    fsThumbRippleEnabled,
    fsThumbRippleClassName,
    fsThumbControlsEnabled,
    sliderThumbArrowStyles,
    sliderThumbArrowClassName,
    fsThumbPrevArrowStyles,
    fsThumbPrevArrowClassName,
    fsThumbNextArrowStyles,
    fsThumbNextArrowClassName,
    sliderThumbRenderArrows,
    fsThumbRenderPrevArrow,
    fsThumbRenderNextArrow,
    showFsEntryOverlayMount,
    fsIntroReq,
    clearFsIntroReq,
    styles,
    fs,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setFsFadeOpening,
    addShield,
    resolveFsCaptionPlacement,
    requestFsCloseRef,
    suppressNextClickRef,
    currentImage,
    scaleRef,
    pointerDownRef,
    interactionModeRef,
    boundsX,
    boundsY,
    bodyX,
    bodyY,
    locX,
    locY,
    prevX,
    prevY,
    offX,
    offY,
    tgtX,
    tgtY,
    axisRef,
    animRef,
    setScale,
    previousZoom,
    panRef,
    changingSlides,
    setWrappedItems,
    fsIndexRef,
    entriesObject,
    fsOwnersRef,
    entrySliderRefs,
    sliderApiRef
  } = props;
  React8.useEffect(() => {
    if (!fsIntroReq) return;
    const { origImg, index, closestSelector } = fsIntroReq;
    runFullscreenIntro({
      origImg,
      index,
      normalizedItems,
      isRtl: direction === "rtl",
      styles,
      fs,
      overlayDivRef,
      duplicateImgRef,
      overlayCaptionRef,
      overlayCaptionRootRef,
      fsThumbContainerRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      addShield,
      resolveFsCaptionPlacement,
      closestSelector
    });
    clearFsIntroReq();
  }, [fsIntroReq]);
  function boundsForCurrent2(scale2, imgW, imgH, viewW, viewH) {
    return boundsForCurrent({
      scale: scale2,
      imgW,
      imgH,
      currentImageEl: currentImage.current,
      viewW,
      viewH
    });
  }
  React8.useEffect(() => {
    axisRef.current = PanAxis();
  }, []);
  const zoomCtx = React8.useMemo(() => ({
    fs,
    currentImage,
    scaleRef,
    setScale,
    previousZoom,
    suppressLoopRef,
    locX,
    prevX,
    offX,
    tgtX,
    locY,
    prevY,
    offY,
    tgtY,
    bodyX,
    bodyY,
    boundsX,
    boundsY,
    Vector1D,
    ScrollBody,
    ScrollBounds,
    boundsForCurrent: boundsForCurrent2,
    renderPan,
    animRef,
    panRef,
    resetAllZoomDom: resetZoomForSlideChange2
  }), [
    fs,
    setScale,
    Vector1D,
    ScrollBody,
    ScrollBounds,
    boundsForCurrent2,
    renderPan
  ]);
  function resetPanForScale12() {
    resetPanForScale1({
      currentImage,
      locX,
      prevX,
      offX,
      tgtX,
      locY,
      prevY,
      offY,
      tgtY,
      bodyX,
      bodyY,
      boundsX,
      boundsY,
      ScrollBody,
      ScrollBounds,
      baseFitSizeC,
      boundsForCurrent: boundsForCurrent2,
      panDuration: fs.zoom?.panDuration,
      panFriction: fs.zoom?.panFriction,
      animRef
    });
  }
  function onForceResetZoom() {
    forceResetZoom({
      setScale,
      zoomState: {
        previousZoom,
        panRef,
        scaleRef
      },
      imageRefs,
      resetPan: resetPanForScale12
    });
  }
  function resetZoomForSlideChange2() {
    resetZoomForSlideChange({
      setScale,
      zoomState: {
        previousZoom,
        panRef,
        scaleRef,
        suppressLoopRef,
        changingSlides
      },
      imageRefs,
      resetPan: resetPanForScale12
    });
  }
  useWrappedItemsAndRefs({
    normalizedItems,
    wrappedItems,
    setWrappedItems,
    imageRefs
  });
  const rebuildPanBodies = React8.useCallback(() => {
    rebuildPanBodiesFn({
      fs,
      currentImage,
      scaleRef,
      locX,
      prevX,
      offX,
      tgtX,
      locY,
      prevY,
      offY,
      tgtY,
      bodyX,
      bodyY,
      boundsX,
      boundsY,
      Vector1D,
      ScrollBody,
      ScrollBounds,
      boundsForCurrent: boundsForCurrent2
    });
  }, [fs.zoom?.panDuration, fs.zoom?.panFriction]);
  const { isPinching, isTouchPinching } = useGlobalPinchZoom({
    scaleRef,
    zoomCtx,
    zoomTo,
    isZoomed,
    currentImage,
    imageRefs,
    fullscreenSliderApi,
    rebuildPanBodies,
    baseFitSizeC,
    boundsForCurrent: boundsForCurrent2,
    ScrollBounds,
    boundsX,
    boundsY,
    offX,
    offY,
    tgtX,
    tgtY,
    bodyX,
    bodyY,
    animRef,
    panDuration: fs.zoom?.panDuration,
    findImgAtPoint,
    readDataIndex,
    distance,
    midpoint
  });
  function syncFullscreenSourceFromIndex(nextIndex) {
    fsIndexRef.current = nextIndex;
    if (layout === "entries" && entriesObject.items?.length && fsOwnersRef.current.length) {
      const owner = fsOwnersRef.current[nextIndex];
      const entryHandle = owner ? entrySliderRefs.current[owner.entryIndex] : null;
      const internals2 = entryHandle?.getInternals?.();
      if (!internals2) return;
      sliderForFullscreen.current = internals2.slider.current;
      slidesForFullscreen.current = internals2.slides.current;
      visibleImagesForFullscreen.current = internals2.visibleImages.current;
      selectedIndexForFullscreen.current = internals2.selectedIndex.current;
      sliderXForFullscreen.current = internals2.sliderX.current;
      sliderVelocityForFullscreen.current = internals2.sliderVelocity.current;
      isWrappingForFullscreen.current = internals2.isWrapping.current;
      return;
    }
    const internals = sliderApiRef.current?.getInternals?.();
    if (!internals) return;
    sliderForFullscreen.current = internals.slider.current;
    slidesForFullscreen.current = internals.slides.current;
    visibleImagesForFullscreen.current = internals.visibleImages.current;
    selectedIndexForFullscreen.current = internals.selectedIndex.current;
    sliderXForFullscreen.current = internals.sliderX.current;
    sliderVelocityForFullscreen.current = internals.sliderVelocity.current;
    isWrappingForFullscreen.current = internals.isWrapping.current;
  }
  React8.useEffect(() => {
    if (!showFullscreenModal) return;
    const start = fsSub.get();
    fsIndexRef.current = start;
    syncFullscreenSourceFromIndex(start);
  }, [showFullscreenModal, fsSub]);
  const { setMountEl: setFsEntryOverlayMountEl, setOpacity: setFsEntryOverlayOpacity } = useFsEntryOverlay({
    enabled: !!showFullscreenModal && layout === "entries",
    fsSub,
    entriesObject,
    entryMapRef,
    syncFullscreenSourceFromIndex,
    resetAllZoomDom: resetZoomForSlideChange2,
    closing: !!closingModal
  });
  const isRtl = direction === "rtl";
  const sign = isRtl ? -1 : 1;
  const wrappedPlyrProps = usePlyrProps({
    items: wrappedItems,
    source: fs.video?.source,
    options: fs.video?.options
  });
  const singlePlyrProps = usePlyrProps({
    items: normalizedItems,
    source: fs.video?.source,
    options: fs.video?.options
  });
  const wrappedTransform = React8.useMemo(
    () => createWrappedTransform({ length: wrappedItems.length, sign }),
    [wrappedItems.length, sign]
  );
  const singleTransform = React8.useMemo(
    () => createSingleTransform(),
    []
  );
  function renderPan(xPx, yPx) {
    if (!currentImage.current) return;
    const img = currentImage.current.children[0];
    if (!img) return;
    img.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`;
  }
  const pan = usePanRuntime({
    fs,
    isZoomed,
    zoomCtx,
    currentImage,
    rebuildPanBodies,
    renderPan,
    handleZoomToggle,
    suppressNextClickRef,
    pointerDownRef,
    interactionModeRef,
    boundsX,
    boundsY,
    bodyX,
    bodyY,
    locX,
    locY,
    prevX,
    prevY,
    offX,
    offY,
    tgtX,
    tgtY,
    axisRef,
    animRef
  });
  const wrappedFullscreenImages = renderFullscreenSlides({
    items: wrappedItems,
    plyrList: wrappedPlyrProps,
    getTransform: wrappedTransform,
    imageRefs,
    playerRefs: wrappedModePlyrRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,
    onPanPointerDown: (e, imageRef) => pan.handlePanPointerStart(e, imageRef),
    onSuppressNextClickCapture: (e) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        e.stopPropagation?.();
      }
    },
    renderCaption: fs.caption?.render,
    captionClassName: fs.caption?.className,
    captionStyle: fs.caption?.style,
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
    resolveFsCaptionPlacement,
    styles: {
      imgMargin: styles.imgMargin,
      fullscreenImages: styles.fullscreenImages
    },
    renderImage: fs.renderImage
  });
  const oneFullscreenImage = renderFullscreenSlides({
    items: normalizedItems,
    plyrList: singlePlyrProps,
    getTransform: singleTransform,
    imageRefs,
    playerRefs: singleModePlyrRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,
    onPanPointerDown: (e, imageRef) => pan.handlePanPointerStart(e, imageRef),
    onSuppressNextClickCapture: (e) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        e.stopPropagation?.();
      }
    },
    renderCaption: fs.caption?.render,
    captionClassName: fs.caption?.className,
    captionStyle: fs.caption?.style,
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
    resolveFsCaptionPlacement,
    styles: {
      imgMargin: styles.imgMargin,
      fullscreenImages: styles.fullscreenImages
    },
    renderImage: fs.renderImage
  });
  React8.useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
      setScale(1);
      previousZoom.current.x = 0;
      previousZoom.current.y = 0;
      panRef.current = { x: 0, y: 0 };
      scaleRef.current = 1;
      setFsEntryOverlayOpacity(0);
    }
  }, [closingModal]);
  return /* @__PURE__ */ jsx(Fragment, { children: fsEnabled && /* @__PURE__ */ jsxs(
    FullscreenModal,
    {
      fsSub,
      open: showFullscreenModal,
      onClose: () => setShowFullscreenModal(false),
      isClick,
      isAnimating: isAnimatingRef,
      overlayDivRef,
      cells,
      setShowFullscreenSlider,
      imageCount: cellsStateLength,
      slides: slidesForFullscreen,
      slider: sliderForFullscreen,
      visibleImagesRef: visibleImagesForFullscreen,
      selectedIndex: selectedIndexForFullscreen,
      sliderX: sliderXForFullscreen,
      sliderVelocity: sliderVelocityForFullscreen,
      isWrapping: isWrappingForFullscreen,
      wrappedItems,
      setClosingModal,
      closeButtonRef,
      counterRef,
      leftChevronRef,
      rightChevronRef,
      centerAlign,
      centerSlider: centerSliderForFullscreen,
      setSliderIndex: setSliderIndexForFullscreen,
      onForceResetZoom: () => onForceResetZoom(),
      layout,
      expandableImgRefs,
      entryMapRef,
      entryMediaLayout,
      introFade,
      introDuration,
      introEasing,
      requestFsCloseRef,
      fs,
      styles,
      direction,
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection
            },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    flex: "1 1 auto",
                    position: "relative",
                    minHeight: 0
                  },
                  children: /* @__PURE__ */ jsx(
                    FullscreenSlider,
                    {
                      sub: fsSub,
                      ref: fullscreenSliderApi,
                      imageCount: cellsStateLength,
                      slideIndex,
                      isClick: isZoomClick,
                      isZoomed,
                      windowSize,
                      show: showFullscreenModal,
                      handleZoomToggle: (e, imageRef) => handleZoomToggle(zoomCtx, e, imageRef),
                      imageRefs: imageRefs.current,
                      cells,
                      isPinching,
                      scale,
                      isTouchPinching,
                      showFullscreenSlider,
                      isZooming,
                      plyrRefs: wrappedModePlyrRefs,
                      plyrRef: singleModePlyrRefs,
                      closingModal,
                      closeButtonRef,
                      counterRef,
                      leftChevronRef,
                      rightChevronRef,
                      overlayDivRef,
                      direction,
                      isWrapping: isWrappingForFullscreen,
                      sliderDuration,
                      sliderFriction,
                      suppressLoopRef,
                      fadeOpening: fsFadeOpening,
                      introFade,
                      slideFade,
                      slideFadeDuration,
                      slideFadeEasing,
                      normalizedItems,
                      introDuration,
                      introEasing,
                      resetAllZoomDom: () => resetZoomForSlideChange2(),
                      requestFsCloseRef,
                      children: normalizedItems.length > 1 ? wrappedFullscreenImages : oneFullscreenImage
                    },
                    epoch
                  )
                }
              ),
              fsThumbnailsPositionDefined && /* @__PURE__ */ jsx(
                "div",
                {
                  ref: fsThumbContainerRef,
                  className: fsThumbnailsContainerClassName,
                  style: {
                    flex: fsResolvedThumbPos === "left" || fsResolvedThumbPos === "right" ? "0 0 auto" : "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: fsResolvedThumbPos === "top" || fsResolvedThumbPos === "bottom" ? "0.75rem 1rem" : "0.75rem 0.5rem",
                    transition: `background-color ${fsThumbFadeDuration}ms ${fsThumbFadeEasing}`,
                    backgroundColor: fsThumbsOpen ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
                    ...fsThumbnailsContainerStyle || {}
                  },
                  children: normalizedItems.length > 1 && /* @__PURE__ */ jsx(
                    FullscreenThumbnailSlider,
                    {
                      items: normalizedItems.map((item) => ({
                        thumbSrc: item.thumbSrc ?? item.src,
                        alt: item.alt
                      })),
                      position: fsResolvedThumbPos,
                      fsSub,
                      thumbnailWidth: fsThumbThumbnailWidth,
                      thumbnailHeight: fsThumbThumbnailHeight,
                      thumbnailsCenter: fsThumbCenter,
                      thumbnailsContainerWidth: fsThumbContainerWidth,
                      thumbnailsContainerHeight: fsThumbContainerHeight,
                      visible: showFullscreenModal,
                      invisible: closingModal,
                      thumbnailItemClassName: void 0,
                      thumbnailItemStyle: void 0,
                      gap: fsThumbGap,
                      freeScroll: fsThumbFreeScroll,
                      groupCells: fsThumbGroupCells,
                      loop: fsThumbLoop,
                      direction,
                      skipSnaps: fsThumbSkipSnaps,
                      centerActiveThumb: fsThumbCenterActiveThumb,
                      selectDuration: fsThumbSelectDuration,
                      freeScrollDuration: fsThumbFreeScrollDuration,
                      sliderFriction: fsThumbFriction,
                      breakpointMap: fsThumbBreakpointMap,
                      rippleEnabled: fsThumbRippleEnabled,
                      rippleClassName: fsThumbRippleClassName,
                      showArrows: fsThumbControlsEnabled,
                      arrowStyles: sliderThumbArrowStyles,
                      arrowClassName: sliderThumbArrowClassName,
                      prevArrowStyles: fsThumbPrevArrowStyles,
                      prevArrowClassName: fsThumbPrevArrowClassName,
                      nextArrowStyles: fsThumbNextArrowStyles,
                      nextArrowClassName: fsThumbNextArrowClassName,
                      renderArrows: sliderThumbRenderArrows,
                      renderPrevArrow: fsThumbRenderPrevArrow,
                      renderNextArrow: fsThumbRenderNextArrow
                    }
                  )
                }
              )
            ]
          }
        ),
        showFsEntryOverlayMount ? /* @__PURE__ */ jsx(FsEntryOverlayMount, { setMountEl: setFsEntryOverlayMountEl }) : null
      ]
    }
  ) });
}
var FullscreenRuntime_default = FullscreenRuntime;

export { FullscreenRuntime, FullscreenRuntime_default as default };
//# sourceMappingURL=FullscreenRuntime-KDMVGBKY.mjs.map
//# sourceMappingURL=FullscreenRuntime-KDMVGBKY.mjs.map