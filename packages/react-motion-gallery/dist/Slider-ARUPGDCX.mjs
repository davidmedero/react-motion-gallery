import { createGestureShield, RmgSlideProvider } from './chunk-3BWJSDSC.mjs';
import { createSliderFullscreenIntroRunner } from './chunk-IUGZ6H6B.mjs';
import { Vector1D, Counter, Translate, Limit, createBaseLimit, ScrollTarget, ScrollLooper, ScrollBody, PercentOfView, ScrollBounds, Animations, EventStore, RmgArrows, buildScopedSkeletonCountCss, createDragTracker, isMouseEvent, factorAbs, mathSign } from './chunk-PBZSDTG5.mjs';
import { createIndexChannel } from './chunk-A2O3PMPN.mjs';
import './chunk-AD5YPMDD.mjs';
import * as React from 'react';
import { forwardRef, useRef, useState, useMemo, useId, Children, useEffect, isValidElement, useLayoutEffect, createRef, useCallback, useImperativeHandle, cloneElement } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

// src/Gallery/slider/Slider.module.css
var Slider_default = {};
var TWEEN_FACTOR_BASE = 0.2;
function mod(n, m) {
  return (n % m + m) % m;
}
function useParallaxEffect({
  enabled,
  wrap,
  axisMain,
  sliderRef,
  sliderWidthRef,
  offsetLocationRef,
  visibleImagesRef,
  slidesLen,
  clonedLen,
  isReady
}) {
  const tweenNodesRef = React.useRef([]);
  const parallaxNodesRef = React.useRef([]);
  const parallaxSnapsRef = React.useRef([]);
  const collectParallaxForAll = React.useCallback(() => {
    const track = sliderRef.current;
    if (!track) return;
    const W = sliderWidthRef.current || 0;
    const nodes = [];
    const snaps = [];
    const kids = Array.from(track.children);
    for (const el of kids) {
      const layer = el.querySelector(".rmg__parallax__layer");
      if (!layer) continue;
      const m = /translateX\((-?\d+(\.\d+)?)px\)/.exec(el.style.transform || "");
      const baseX = m ? parseFloat(m[1]) : el.offsetLeft;
      const n = W > 0 ? mod(baseX, W) / W : 0;
      nodes.push(layer);
      snaps.push(n);
    }
    tweenNodesRef.current = nodes;
    parallaxNodesRef.current = nodes;
    parallaxSnapsRef.current = snaps;
  }, [sliderRef, sliderWidthRef]);
  const currentTweenFactor = React.useCallback(() => {
    const count = parallaxSnapsRef.current.length || 1;
    const visible = Math.max(visibleImagesRef.current || 1, 1);
    return TWEEN_FACTOR_BASE * (count / visible);
  }, [visibleImagesRef]);
  const scrollProgressNorm = React.useCallback(() => {
    const track = sliderRef.current;
    const W = sliderWidthRef.current || 0;
    if (!track) return 0;
    const loc = -(offsetLocationRef.current?.get() ?? 0);
    if (!wrap) {
      const max = Math.max(0, W - track.clientWidth);
      if (max <= 0) return 0;
      return Math.min(1, Math.max(0, loc / max));
    }
    if (W <= 0) return 0;
    const world = mod(loc, W);
    return world / W;
  }, [sliderRef, sliderWidthRef, offsetLocationRef, wrap]);
  const tweenParallax = React.useCallback(() => {
    if (!enabled) return;
    const nodes = parallaxNodesRef.current;
    const snaps = parallaxSnapsRef.current;
    if (!nodes.length || nodes.length !== snaps.length) return;
    const p = scrollProgressNorm();
    const factor = currentTweenFactor();
    function circDiff(a, b) {
      let d = a - b;
      if (d > 0.5) d -= 1;
      if (d < -0.5) d += 1;
      return d;
    }
    for (let i = 0; i < nodes.length; i++) {
      const snap = snaps[i];
      const diff = wrap ? circDiff(snap, p) : snap - p;
      const translatePct = diff * (-1 * factor) * 100;
      nodes[i].style.transform = axisMain === "x" ? `translateX(${translatePct}%)` : `translateY(${translatePct}%)`;
    }
  }, [enabled, wrap, axisMain, scrollProgressNorm, currentTweenFactor]);
  React.useEffect(() => {
    if (!enabled) return;
    collectParallaxForAll();
  }, [enabled, slidesLen, clonedLen, wrap, isReady, collectParallaxForAll]);
  React.useEffect(() => {
    if (enabled) return;
    tweenNodesRef.current.forEach((n) => n && n.removeAttribute("style"));
  }, [enabled]);
  React.useEffect(() => {
    if (!enabled) return;
    if (!slidesLen) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tweenParallax();
      });
    });
  }, [enabled, slidesLen, clonedLen, wrap, tweenParallax, isReady]);
  return {
    collectParallaxForAll,
    tweenParallax,
    parallaxNodesRef,
    parallaxSnapsRef
  };
}
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}
function useScaleEffect({
  enabled,
  scaleAmount,
  wrap,
  sliderRef,
  sliderWidthRef,
  offsetLocationRef,
  slidesRef,
  getCenterOffsetForIndex,
  slidesLen,
  clonedLen
}) {
  const slideCenterX = React.useCallback(
    (logicalIdx) => {
      const s = slidesRef.current?.[logicalIdx];
      if (!s || !sliderRef.current) return 0;
      const centerOffset = getCenterOffsetForIndex(logicalIdx);
      return s.target - centerOffset;
    },
    [slidesRef, sliderRef, getCenterOffsetForIndex]
  );
  const getCenters = React.useCallback(() => {
    const L = slidesRef.current?.length ?? 0;
    const arr = [];
    for (let i = 0; i < L; i++) arr.push(slideCenterX(i));
    return arr;
  }, [slidesRef, slideCenterX]);
  const findBoundingPair = React.useCallback(
    (loc) => {
      const centers = getCenters();
      const L = centers.length;
      if (!L) return { iL: 0, iR: 0, t: 0 };
      const W = sliderWidthRef.current || 0;
      const useWrap = wrap && W > 0;
      const nodes = [];
      for (let i = 0; i < L; i++) {
        const base = centers[i];
        if (useWrap) {
          nodes.push({ x: base - W, i });
          nodes.push({ x: base, i });
          nodes.push({ x: base + W, i });
        } else {
          nodes.push({ x: base, i });
        }
      }
      nodes.sort((a, b) => a.x - b.x);
      let leftIdx = 0, rightIdx = 0;
      for (let k = 0; k < nodes.length - 1; k++) {
        const a = nodes[k], b = nodes[k + 1];
        if (loc >= a.x && loc <= b.x) {
          leftIdx = k;
          rightIdx = k + 1;
          break;
        }
      }
      if (loc < nodes[0].x) {
        leftIdx = 0;
        rightIdx = 1;
      }
      if (loc > nodes[nodes.length - 1].x) {
        leftIdx = nodes.length - 2;
        rightIdx = nodes.length - 1;
      }
      const left = nodes[leftIdx];
      const right = nodes[rightIdx];
      const span = Math.max(1, right.x - left.x);
      const t = clamp01((loc - left.x) / span);
      return { iL: left.i, iR: right.i, t };
    },
    [getCenters, sliderWidthRef, wrap]
  );
  const applyPairScaleTween = React.useCallback(() => {
    if (!enabled || !sliderRef.current || !slidesRef.current?.length || !scaleAmount) return;
    const track = sliderRef.current;
    const kids = Array.from(track.children);
    const loc = -(offsetLocationRef.current?.get() ?? 0);
    const { iL, iR, t } = findBoundingPair(loc);
    const wL = 1 - t;
    const wR = t;
    const L = slidesRef.current.length;
    const sByIdx = new Array(L).fill(1);
    sByIdx[iL] = 1 + (scaleAmount - 1) * wL;
    sByIdx[iR] = 1 + (scaleAmount - 1) * wR;
    for (const el of kids) {
      const idxAttr = el.getAttribute("data-rmg-idx");
      if (!idxAttr) {
        el.style.setProperty("--rmg-scale", "1");
        el.style.zIndex = "0";
        continue;
      }
      const li = Number(idxAttr);
      const s = sByIdx[li] ?? 1;
      el.style.setProperty("--rmg-scale", String(s));
      el.style.zIndex = s > 1.0001 ? "1" : "0";
      if (!el.style.transformOrigin) el.style.transformOrigin = "center";
      if (!el.style.transition) el.style.transition = "transform 120ms linear";
    }
  }, [enabled, sliderRef, slidesRef, scaleAmount, offsetLocationRef, findBoundingPair]);
  React.useEffect(() => {
    applyPairScaleTween();
  }, [enabled, scaleAmount, slidesLen, clonedLen]);
  React.useEffect(() => {
    if (enabled) return;
    const track = sliderRef.current;
    if (!track) return;
    const kids = Array.from(track.children);
    for (const el of kids) {
      el.style.setProperty("--rmg-scale", "1");
      el.style.zIndex = "0";
    }
  }, [enabled, sliderRef]);
  return { applyPairScaleTween, getCenters };
}
var MIN_FADE_OPACITY = 0.5;
function circularDist(x, c, W) {
  let d = Math.abs(x - c);
  if (W > 0) {
    d = Math.min(d, Math.abs(x - (c - W)), Math.abs(x - (c + W)));
  }
  return d;
}
function useFadeEffect({
  enabled,
  wrap,
  sliderRef,
  sliderWidthRef,
  offsetLocationRef,
  slidesRef,
  getCenterOffsetForIndex,
  slidesLen,
  clonedLen
}) {
  const slideCenterX = React.useCallback(
    (logicalIdx) => {
      const s = slidesRef.current?.[logicalIdx];
      if (!s || !sliderRef.current) return 0;
      const centerOffset = getCenterOffsetForIndex(logicalIdx);
      return s.target - centerOffset;
    },
    [slidesRef, sliderRef, getCenterOffsetForIndex]
  );
  const getCenters = React.useCallback(() => {
    const L = slidesRef.current?.length ?? 0;
    const arr = [];
    for (let i = 0; i < L; i++) arr.push(slideCenterX(i));
    return arr;
  }, [slidesRef, slideCenterX]);
  const applyFadeTween = React.useCallback(() => {
    if (!enabled || !sliderRef.current || !slidesRef.current?.length) return;
    const track = sliderRef.current;
    const kids = Array.from(track.children);
    const loc = -(offsetLocationRef.current?.get() ?? 0);
    const centers = getCenters();
    const L = centers.length;
    if (!L) return;
    const W = sliderWidthRef.current || 0;
    const useWrap = wrap && W > 0;
    const nodes = [];
    for (let i = 0; i < L; i++) {
      const base = centers[i];
      if (useWrap) {
        nodes.push({ x: base - W, i });
        nodes.push({ x: base, i });
        nodes.push({ x: base + W, i });
      } else {
        nodes.push({ x: base, i });
      }
    }
    nodes.sort((a, b) => a.x - b.x);
    let leftIdx = 0, rightIdx = 1;
    for (let k = 0; k < nodes.length - 1; k++) {
      const a = nodes[k], b = nodes[k + 1];
      if (loc >= a.x && loc <= b.x) {
        leftIdx = k;
        rightIdx = k + 1;
        break;
      }
    }
    const span = Math.max(1, nodes[rightIdx].x - nodes[leftIdx].x);
    const opacityByIdx = new Array(L).fill(MIN_FADE_OPACITY);
    for (let i = 0; i < L; i++) {
      const c = centers[i];
      const d = useWrap ? circularDist(loc, c, W) : Math.abs(loc - c);
      const t = Math.max(0, Math.min(1, 1 - d / span));
      const op = MIN_FADE_OPACITY + (1 - MIN_FADE_OPACITY) * t;
      opacityByIdx[i] = op;
    }
    for (const el of kids) {
      const idxAttr = el.getAttribute("data-rmg-idx");
      if (!idxAttr) {
        el.style.opacity = "1";
        continue;
      }
      const li = Number(idxAttr);
      const op = opacityByIdx[li] ?? 1;
      el.style.opacity = String(op);
      if (!el.style.transition) el.style.transition = "opacity 120ms linear";
    }
  }, [
    enabled,
    sliderRef,
    slidesRef,
    offsetLocationRef,
    getCenters,
    sliderWidthRef,
    wrap
  ]);
  React.useEffect(() => {
    applyFadeTween();
  }, [enabled, slidesLen, clonedLen, wrap]);
  React.useEffect(() => {
    if (enabled) return;
    const track = sliderRef.current;
    if (!track) return;
    const kids = Array.from(track.children);
    for (const el of kids) el.style.opacity = "1";
  }, [enabled, sliderRef]);
  return { applyFadeTween, getCenters };
}
function getDotsHidden(args) {
  const { AX, slider, sliderWidth, showDots } = args;
  const clientMain = slider.current ? slider.current[AX.clientKey] : 0;
  const dotsAutoHidden = !!(slider.current && sliderWidth.current <= clientMain);
  const dotsHidden = !showDots || dotsAutoHidden;
  return { clientMain, dotsAutoHidden, dotsHidden };
}
function DefaultDotsFactory(args) {
  const { AX, createRipple, styles, dotsContainerStyles, dotsStyles } = args;
  return function DefaultDots({
    ref,
    count,
    activeIndex,
    hidden,
    goTo,
    getDotRef,
    classNameContainer,
    classNameDot
  }) {
    const pos = AX.main === "y" ? { top: "50%", left: 10, transform: "translateY(-50%)", flexDirection: "column" } : { left: "50%", bottom: 10, transform: "translateX(-50%)", flexDirection: "row" };
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: `rmgDots ${classNameContainer ?? ""}`,
        style: {
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          zIndex: 10,
          background: "rgba(0, 0, 0, 0.5)",
          padding: AX.main === "y" ? "8px 4px" : "4px 8px",
          borderRadius: "9999px",
          cursor: "auto",
          opacity: hidden ? 0 : 1,
          pointerEvents: hidden ? "none" : "auto",
          visibility: hidden ? "hidden" : "visible",
          ...pos,
          ...dotsContainerStyles || {}
        },
        children: Array.from({ length: count }).map((_, index) => {
          const isActive = activeIndex === index;
          return /* @__PURE__ */ jsx(
            "div",
            {
              ref: getDotRef(index),
              onMouseDown: (e) => {
                createRipple(e.currentTarget);
              },
              onClick: () => goTo(index),
              className: [
                styles.pagination_dot,
                isActive ? styles.active : styles.inactive,
                "rmgDot",
                classNameDot ?? ""
              ].filter(Boolean).join(" "),
              style: {
                ...dotsStyles || {}
              }
            },
            index
          );
        })
      }
    );
  };
}
function buildDotsNode(args) {
  const {
    AX,
    slider,
    sliderWidth,
    showDots,
    selectedIndex,
    slides,
    dotsContainerRef,
    dotRefs,
    isScrolling,
    goToIndex,
    renderDots,
    createRipple,
    styles,
    dotsContainerStyles,
    dotsStyles,
    dotsContainerClassName,
    dotsClassName
  } = args;
  const { dotsHidden } = getDotsHidden({ AX, slider, sliderWidth, showDots });
  const DefaultDots = DefaultDotsFactory({
    AX,
    createRipple,
    styles,
    dotsContainerStyles,
    dotsStyles
  });
  const node = (renderDots ?? DefaultDots)({
    ref: dotsContainerRef,
    count: slides.current?.length ?? 0,
    activeIndex: selectedIndex.current,
    hidden: dotsHidden,
    goTo: (i) => {
      isScrolling.current = false;
      requestAnimationFrame(() => goToIndex(i));
    },
    getDotRef: (i) => (el) => {
      dotRefs.current[i] = el;
    },
    createRipple,
    classNameContainer: dotsContainerClassName,
    classNameDot: dotsClassName
  });
  return { dotsHidden, dotsNode: node };
}
function clamp012(n) {
  return Math.max(0, Math.min(1, n));
}
function setProgressDom(args) {
  const { AX, lastProgressRef, progressHolderRef, progressInnerRef, p } = args;
  const v = clamp012(p);
  lastProgressRef.current = v;
  const holder = progressHolderRef.current;
  const inner = progressInnerRef.current;
  if (holder) {
    holder.style.setProperty("--rmg-progress", String(v));
    holder.setAttribute("data-rmg-progress", String(v));
    holder.setAttribute("aria-valuenow", String(Math.round(v * 100)));
  }
  if (inner && AX.main === "x") {
    inner.style.width = `${v * 100}%`;
  } else if (inner && AX.main === "y") {
    inner.style.height = `${v * 100}%`;
  }
}
function updateProgressInFrame(args) {
  const {
    AX,
    slider,
    sliderWidth,
    wrap,
    offsetLocationRef,
    lastProgressRef,
    progressHolderRef,
    progressInnerRef
  } = args;
  const track = slider.current;
  const content = sliderWidth.current || 0;
  if (!track) {
    setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: 0 });
    return;
  }
  const cw = track[AX.clientKey];
  if (!wrap) {
    const max = Math.max(0, content - cw);
    if (max <= 0) {
      setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: 1 });
      return;
    }
    const loc = -(offsetLocationRef.current?.get() ?? 0);
    setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: Math.min(1, Math.max(0, loc / max)) });
  } else {
    const W = sliderWidth.current || 0;
    if (W <= 0) {
      setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p: 0 });
      return;
    }
    const world = (-(offsetLocationRef.current?.get() ?? 0) % W + W) % W;
    setProgressDom({
      AX,
      lastProgressRef,
      progressHolderRef,
      progressInnerRef,
      p: Math.round(world) === Math.round(W) ? 0 : world / W
    });
  }
}
function DefaultProgress({
  ref,
  innerRef,
  hidden,
  progress,
  axis,
  className,
  style,
  innerClassName,
  innerStyle
}) {
  if (hidden) return null;
  const isY = axis === "y";
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className,
      style: {
        position: "absolute",
        left: isY ? 6 : "50%",
        top: isY ? "50%" : void 0,
        bottom: isY ? void 0 : 6,
        transform: isY ? "translateY(-50%)" : "translateX(-50%)",
        width: isY ? 4 : "60%",
        height: isY ? "60%" : 4,
        background: "rgba(0,0,0,0.3)",
        borderRadius: 9999,
        overflow: "hidden",
        zIndex: 10,
        pointerEvents: "none",
        ["--rmg-progress"]: progress,
        ...style || {}
      },
      "aria-hidden": true,
      "data-rmg-progress": String(progress),
      children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: innerRef,
          className: innerClassName,
          style: {
            width: isY ? "100%" : "calc(var(--rmg-progress, 0) * 100%)",
            height: isY ? "calc(var(--rmg-progress, 0) * 100%)" : "100%",
            background: "rgb(80,163,255)",
            transition: "none",
            ...innerStyle || {}
          }
        }
      )
    }
  );
}
function buildProgressNode(args) {
  const {
    AX,
    slider,
    sliderWidth,
    wrap,
    offsetLocationRef,
    lastProgressRef,
    progressHolderRef,
    progressInnerRef,
    showProgress,
    renderProgress,
    progressClassName,
    progressStyle,
    progressInnerClassName,
    progressInnerStyle
  } = args;
  const progressHiddenAuto = false;
  const progressHidden = !(showProgress ?? false) || progressHiddenAuto;
  const node = (renderProgress ?? DefaultProgress)({
    ref: progressHolderRef,
    innerRef: progressInnerRef,
    hidden: progressHidden,
    progress: lastProgressRef.current,
    axis: AX.main,
    className: progressClassName,
    style: progressStyle,
    innerClassName: progressInnerClassName,
    innerStyle: progressInnerStyle
  });
  const api = {
    progressHidden,
    progressNode: node,
    setProgressDom: (p) => setProgressDom({ AX, lastProgressRef, progressHolderRef, progressInnerRef, p }),
    updateProgressInFrame: () => updateProgressInFrame({
      AX,
      slider,
      sliderWidth,
      wrap,
      offsetLocationRef,
      lastProgressRef,
      progressHolderRef,
      progressInnerRef
    })
  };
  return api;
}
function DragTracker(main, ownerWindow) {
  const scroll = main ?? "x";
  const cross = scroll === "x" ? "y" : "x";
  return createDragTracker({
    ownerWindow,
    axis: { scroll, cross }
  });
}
var RMG_BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
function markLazyShell(slideEl) {
  slideEl.setAttribute("data-rmg-lazyload", "");
  slideEl.setAttribute("aria-busy", "true");
  const targets = slideEl.querySelectorAll("[data-rmg-src]");
  targets.forEach((t) => {
    if (t instanceof HTMLImageElement) {
      if (!t.getAttribute("src")) t.src = RMG_BLANK;
      const s = t.style;
      if (!s.opacity) s.opacity = "0";
      if (!s.transition) s.transition = "opacity 220ms ease";
      t.addEventListener("error", () => {
        if (!t.src.endsWith("/rmg-blank.png")) t.src = "/rmg-blank.png";
      }, { once: true });
    } else {
      t.style.opacity = "0";
    }
  });
}
function revealSlide(slideEl) {
  const targets = slideEl.querySelectorAll("[data-rmg-src]");
  targets.forEach((t) => {
    const src = t.getAttribute("data-rmg-src");
    if (!src) return;
    if (t instanceof HTMLImageElement) {
      t.src = src;
      t.removeAttribute("data-rmg-src");
      t.style.opacity = "1";
    } else {
      t.style.backgroundImage = `url("${src}")`;
      t.removeAttribute("data-rmg-src");
      t.style.opacity = "1";
    }
  });
  slideEl.setAttribute("data-rmg-lazyloaded", "true");
  slideEl.removeAttribute("aria-busy");
  const sp = slideEl.querySelector("[data-rmg-spinner]");
  if (sp) sp.style.display = "none";
}
function detectKindFromDom(slideEl) {
  if (slideEl.querySelector(".plyr")) return "video";
  if (slideEl.querySelector("video")) return "video";
  if (slideEl.querySelector("iframe")) return "video";
  if (slideEl.querySelector("[data-plyr-provider], [data-plyr-embed-id]")) return "video";
  return "image";
}
function cloneSlide(child, key, elementIndex, cells, enableParallax, imageCountForIdx, lazyLoad, extraStyle, fullscreen, isClone, plyrRefsByIdx) {
  const normIdx = imageCountForIdx != null ? (elementIndex % imageCountForIdx + imageCountForIdx) % imageCountForIdx : elementIndex;
  const ctxVal = {
    normIdx,
    isClone: !!isClone,
    registerPlyr: (api) => {
      if (isClone || !plyrRefsByIdx) return;
      if (api) plyrRefsByIdx.current[normIdx] = api;
      else delete plyrRefsByIdx.current[normIdx];
    }
  };
  const shellProps = {
    ["data-rmg-slide"]: "true",
    ["data-rmg-idx"]: String(normIdx),
    ["data-rmg-kind"]: "image",
    ["data-rmg-clone"]: isClone ? "true" : "false",
    ref: (el) => {
      if (el && !cells.current.some((c) => c.element === el)) {
        cells.current.push({ element: el, index: elementIndex });
      }
      if (el && lazyLoad) markLazyShell(el);
      if (el) {
        const kind = detectKindFromDom(el);
        if (el.getAttribute("data-rmg-kind") !== kind) {
          el.setAttribute("data-rmg-kind", kind);
        }
      }
    },
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      ...extraStyle || {},
      userSelect: "none",
      ...fullscreen ? { cursor: "zoom-in" } : {}
    }
  };
  let contentNode = child;
  if (!isClone && lazyLoad && typeof child.type === "string" && child.type.toLowerCase() === "img") {
    const imgProps = child.props || {};
    const realSrc = imgProps.src;
    const alt = imgProps.alt ?? "";
    contentNode = cloneElement(child, {
      src: RMG_BLANK,
      alt,
      ["data-rmg-src"]: realSrc,
      decoding: "async",
      style: {
        ...imgProps.style || {},
        opacity: 0,
        transition: "opacity 220ms ease"
      }
    });
  }
  if (!enableParallax) {
    return /* @__PURE__ */ jsx("div", { ...shellProps, children: /* @__PURE__ */ jsx(RmgSlideProvider, { value: ctxVal, children: contentNode }) }, key);
  }
  return /* @__PURE__ */ jsx("div", { ...shellProps, className: "rmg__slide", children: /* @__PURE__ */ jsx(RmgSlideProvider, { value: ctxVal, children: /* @__PURE__ */ jsx("div", { className: "rmg__parallax", children: /* @__PURE__ */ jsx("div", { className: "rmg__parallax__layer", children: contentNode }) }) }) }, key);
}
var Slider = forwardRef(function Slider2({
  children,
  imageCount,
  isClick,
  expandableImgRefs,
  overlayDivRef,
  setSlideIndex,
  setShowFullscreenModal,
  setShowFullscreenSlider,
  showFullscreenSlider,
  duplicateImgRef,
  closeButtonRef,
  counterRef,
  leftChevronRef,
  rightChevronRef,
  isReady,
  setIsReady,
  loop,
  freeScroll,
  autoPlay,
  autoPlaySpeed,
  autoPlayPause,
  autoScroll,
  autoScrollSpeed,
  autoScrollPause,
  pauseAutoPlayOnHover,
  pauseAutoScrollOnHover,
  groupCells,
  centerAlign,
  gap,
  sliderViewportStyles,
  sliderViewportClassName,
  sliderContainerStyles,
  sliderContainerClassName,
  sliderHeight,
  responsiveHeights,
  arrowStyles,
  arrowClassName,
  prevArrowStyles,
  prevArrowClassName,
  nextArrowStyles,
  nextArrowClassName,
  dotsContainerStyles,
  dotsContainerClassName,
  dotsStyles,
  dotsClassName,
  renderArrows,
  renderPrevArrow,
  renderNextArrow,
  renderDots,
  showArrows,
  showDots,
  enableFullscreen,
  showProgress,
  progressClassName,
  progressStyle,
  progressInnerClassName,
  progressInnerStyle,
  renderProgress,
  fullscreenControls = {},
  showFsArrows,
  showFsClose,
  renderFsClose,
  renderFsArrows,
  renderFsPrev,
  renderFsNext,
  showFsCounter,
  renderFsCounter,
  fsCaptionPlacement,
  fsCaptionWidth,
  fsCaptionHeight,
  fsCaptionBreakpoint,
  parallax,
  parallaxBleedPct,
  parallaxBorderRadius,
  parallaxSideWidth,
  scaleEffect,
  scaleAmount,
  fadeEffect,
  initialHeight,
  cellsPerSlide,
  direction,
  axis,
  skipSnaps,
  selectDuration,
  freeScrollDuration,
  sliderFriction,
  indexChannel: externalIndexChannel,
  loadingOptions,
  introOptions,
  lazyLoad,
  rippleEnabled,
  rippleClassName,
  renderFsCaption,
  normalizedItems,
  fsThumbContainerRef,
  fullscreenThumbnails,
  sliderImagesReady,
  fullscreenIntroFade,
  setFsFadeOpening,
  breakpointMap,
  fsIntroDuration = 300,
  fsIntroEasing = "cubic-bezier(.4,0,.22,1)"
}, ref) {
  const slider = useRef(null);
  const slides = useRef([]);
  const visibleImagesRef = useRef(0);
  const selectedIndex = useRef(0);
  const sliderX = useRef(0);
  const sliderVelocity = useRef(0);
  const isWrapping = useRef(true);
  const sliderContainer = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const dotRefs = useRef([]);
  const dotsContainerRef = useRef(null);
  const [clonedChildren, setClonedChildren] = useState([]);
  const clonesCountRef = useRef(0);
  const [visibleImages, setVisibleImages] = useState(1);
  const [slidesState, setSlidesState] = useState([]);
  const [isMeasured, setIsMeasured] = useState(false);
  const [inView, setInView] = useState(false);
  const [wrap, setWrap] = useState(false);
  const progressHolderRef = useRef(null);
  const progressInnerRef = useRef(null);
  const lastProgressRef = useRef(0);
  const cellToSlideRef = useRef([]);
  const builtOnceRef = useRef(false);
  const slideBuildSubs = useRef(/* @__PURE__ */ new Set());
  const [layoutReady, setLayoutReady] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const overlayCaptionRef = useRef(null);
  const overlayCaptionRootRef = useRef(null);
  const locationRef = useRef(null);
  const previousLocationRef = useRef(null);
  const offsetLocationRef = useRef(null);
  const targetRef = useRef(null);
  const bodyRef = useRef(null);
  const translateRef = useRef(null);
  const animRef = useRef(null);
  const limitRef = useRef(null);
  const pointerDownRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const isPointerDown = useRef(false);
  const isScrolling = useRef(false);
  const xRef = useRef(0);
  const dragX = useRef(0);
  const previousDragX = useRef(0);
  const dragMoveTime = useRef(null);
  const boundsRef = useRef(null);
  const povRef = useRef(null);
  const cells = useRef([]);
  const sliderWidth = useRef(0);
  const hasPositioned = useRef(false);
  const getSnapTargets = () => (slides.current || []).map((s) => s.target);
  const totalWidth = () => sliderWidth.current || 0;
  const contentSizeRef = useRef(0);
  const loopLimitRef = useRef(null);
  const scrollSnapsRef = useRef([]);
  const scrollContentSizeRef = useRef(0);
  const scrollLimitRef = useRef(null);
  const scrollTargetRef = useRef(null);
  const scrollToRef = useRef(null);
  const indexCurrentRef = useRef(null);
  const indexPreviousRef = useRef(null);
  const layoutRef = useRef(null);
  const draggingAttr = "data-rmg-drag";
  const activePointerIdRef = useRef(null);
  const guardsStoreRef = useRef(null);
  const isHoveringRef = useRef(false);
  const lastPointerUpTime = useRef(performance.now() - 1e3);
  const autoScrollPauseUntil = useRef(0);
  const [buildKey, setBuildKey] = useState(0);
  const loopStableRef = useRef(null);
  const [geomKey, setGeomKey] = useState(0);
  const lastGeomSigRef = useRef("");
  const plyrRefsByIdx = useRef({});
  const lastCloneSigRef = useRef("");
  const shieldCleanupRef = useRef(null);
  const shieldRef = useRef(null);
  const internalIndexChannel = useMemo(() => createIndexChannel(), []);
  const indexChannel = externalIndexChannel ?? internalIndexChannel;
  const isRtl = direction === "rtl" ? true : false;
  const rtlCls = isRtl ? Slider_default.rtl : "";
  const sign = axis === "x" && isRtl ? -1 : 1;
  const [responsiveSliderHeight, setResponsiveSliderHeight] = useState(() => {
    if (typeof initialHeight === "number" && initialHeight > 0) {
      return `${initialHeight}px`;
    }
    if (typeof initialHeight === "string" && initialHeight.trim() !== "") {
      return initialHeight;
    }
    return "0px";
  });
  const lastNonZeroHeightRef = useRef(
    typeof initialHeight === "number" && initialHeight > 0 ? initialHeight : 1
  );
  const scopeId = useId().replace(/:/g, "-");
  const AX = useMemo(() => {
    const main = axis;
    const cross = axis === "x" ? "y" : "x";
    const sizeKey = axis === "x" ? "width" : "height";
    const clientKey = axis === "x" ? "clientWidth" : "clientHeight";
    const startKey = axis === "x" ? "left" : "top";
    const endKey = axis === "x" ? "right" : "bottom";
    const translate = (n) => axis === "x" ? `translate3d(${n}px,0,0)` : `translate3d(0,${n}px,0)`;
    const place = (n) => axis === "x" ? `translateX(${n}px) scale(var(--rmg-scale, 1))` : `translateY(${n}px) scale(var(--rmg-scale, 1))`;
    const wheelDelta = (e) => axis === "x" ? e.deltaX : e.deltaY;
    return { main, cross, sizeKey, clientKey, startKey, endKey, translate, place, wheelDelta };
  }, [axis]);
  const responsiveCss = useMemo(() => {
    const rules = Array.isArray(responsiveHeights) ? responsiveHeights : [];
    if (rules.length === 0) return "";
    const rootSel = `#${scopeId}`;
    return rules.map((r) => `@media ${r.query} { ${rootSel} { --rmg-slider-height: ${r.height} !important; } }`).join("\n");
  }, [responsiveHeights, scopeId]);
  const hasResponsiveHeights = Array.isArray(responsiveHeights) && responsiveHeights.length > 0;
  const heightVarValue = sliderHeight ? sliderHeight : hasResponsiveHeights ? void 0 : responsiveSliderHeight;
  const baseCss = useMemo(() => {
    const root = `#${scopeId}`;
    return `
  ${root} .rmg__slide {
    position: absolute;
    left: 0;
    width: ${parallaxSideWidth};
    height: 100dvh;
    overflow: hidden;
    border-radius: ${parallaxBorderRadius};
  }

  ${root} .rmg__parallax {
    width: 100%;
    height: 100%;
  }

  ${root} .rmg__parallax__layer {
    width: 100%;
    height: 100%;
    will-change: transform;
    transform: ${axis === "x" ? "translateX(0%)" : "translateY(0%)"}
  }

  ${root} .rmg__parallax__layer > img,
  ${root} .rmg__parallax__layer > picture,
  ${root} .rmg__parallax__layer > video {
    display: block;
    height: 100%;
    width: ${parallaxBleedPct};
    max-width: none;
    object-fit: cover;
    margin-left: calc((100% - ${parallaxBleedPct}) / 2);
  }
  `;
  }, [scopeId, parallaxBleedPct, parallaxBorderRadius, parallaxSideWidth]);
  const progressApi = buildProgressNode({
    AX,
    slider,
    sliderWidth,
    wrap,
    offsetLocationRef,
    lastProgressRef,
    progressHolderRef,
    progressInnerRef,
    showProgress,
    renderProgress,
    progressClassName,
    progressStyle,
    progressInnerClassName,
    progressInnerStyle
  });
  const progressNode = progressApi.progressNode;
  function resolveFsCaptionPlacement(placement, breakpoint, viewportWidth) {
    if (!placement) return null;
    if (breakpoint != null && viewportWidth < breakpoint) {
      return "bottom";
    }
    return placement;
  }
  const childrenKey = useMemo(() => {
    const arr = Children.toArray(children);
    return arr.map((c) => String(c?.key ?? "")).join("|");
  }, [children]);
  useEffect(() => {
    setEngineReady(false);
    setLayoutReady(false);
    hasPositioned.current = false;
    setIsReady(false);
  }, [imageCount, childrenKey, loop, axis]);
  function getOriginalNodes() {
    const track = slider.current;
    if (!track) return [];
    const kids = Array.from(track.children);
    const before = clonesCountRef.current || 0;
    const after = before;
    return kids.slice(before, kids.length - after);
  }
  function clampIndex(i, len) {
    return Math.max(0, Math.min(len - 1, i));
  }
  useEffect(() => {
    isWrapping.current = wrap;
  }, [wrap, isWrapping]);
  function ensureDragStyle(scopeId2) {
    const id = "rmg-drag-style-" + scopeId2;
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      /* Only while data-rmg-drag is present on this slider root */
      #${scopeId2}[data-rmg-drag]        { cursor: grabbing !important; }
      #${scopeId2}[data-rmg-drag] *      { cursor: grabbing !important; }
    `;
    document.head.appendChild(style);
  }
  useEffect(() => {
    if (sliderContainer.current) ensureDragStyle(scopeId);
  }, [sliderContainer.current, scopeId]);
  function setDragCursor(on) {
    const root = sliderContainer.current;
    if (!root) return;
    if (on) {
      if (!root.hasAttribute(draggingAttr)) root.setAttribute(draggingAttr, "");
      return;
    }
    if (root.hasAttribute(draggingAttr)) root.removeAttribute(draggingAttr);
    activePointerIdRef.current = null;
    guardsStoreRef.current?.clear();
    guardsStoreRef.current = null;
  }
  useEffect(() => {
    const root = sliderContainer.current;
    if (!root) return;
    const onLeave = () => {
      if (pointerDownRef.current) setDragCursor(false);
    };
    const onEnter = () => {
      if (pointerDownRef.current && activePointerIdRef.current != null) setDragCursor(true);
    };
    root.addEventListener("mouseleave", onLeave, { passive: true });
    root.addEventListener("mouseenter", onEnter, { passive: true });
    return () => {
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("mouseenter", onEnter);
    };
  }, []);
  function getCenterOffsetForIndex(idx) {
    const track = slider.current;
    if (!track || !slides.current?.[idx]?.cells?.[0]?.element) return 0;
    const containerSize = track[AX.clientKey];
    const cellSize = slides.current[idx].cells[0].element.getBoundingClientRect()[AX.sizeKey];
    return centerAlign ? (containerSize - cellSize) / 2 : 0;
  }
  useEffect(() => {
    const root = sliderContainer.current;
    if (!root) return;
    const onEnter = () => {
      isHoveringRef.current = true;
    };
    const onLeave = () => {
      isHoveringRef.current = false;
    };
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now();
      if (isPointerDown.current || showFullscreenSlider || !isWrapping.current || !autoPlay || !isReady || pauseAutoPlayOnHover && isHoveringRef.current) {
        return;
      }
      if (now - lastPointerUpTime.current < autoPlayPause) return;
      if (isRtl) {
        previous();
      } else {
        next();
      }
    }, autoPlaySpeed);
    return () => {
      window.clearInterval(id);
    };
  }, [showFullscreenSlider, slidesState, clonedChildren, isWrapping.current]);
  useEffect(() => {
    let lastTime = performance.now();
    let frameId;
    function loop2(now) {
      frameId = requestAnimationFrame(loop2);
      const dt = now - lastTime;
      lastTime = now;
      if (!slider.current || !isWrapping.current || isPointerDown.current || isAnimatingRef.current || showFullscreenSlider || !autoScroll || pauseAutoScrollOnHover && isHoveringRef.current) {
        return;
      }
      if (now < autoScrollPauseUntil.current) return;
      const dir = isRtl ? 1 : -1;
      const offset = offsetLocationRef.current?.get() ?? 0;
      const next2 = offset + dir * autoScrollSpeed * dt;
      targetRef.current?.set(next2);
      bodyRef.current?.useDuration(0).useFriction(1);
      animRef.current?.start();
      xRef.current = next2;
      positionSlider();
      progressApi.updateProgressInFrame();
      tweenParallax();
      updateActiveIndexFromX(next2);
    }
    frameId = requestAnimationFrame(loop2);
    return () => cancelAnimationFrame(frameId);
  }, [showFullscreenSlider]);
  function setWrapSafe(next2) {
    if (loopStableRef.current === next2) return;
    loopStableRef.current = next2;
    setWrap(next2);
    isWrapping.current = next2;
    hasPositioned.current = false;
    setLayoutReady(false);
    setBuildKey((k) => k + 1);
  }
  function getPlyrInstance(api) {
    return api?.plyr ?? api ?? null;
  }
  function togglePlyr(api) {
    const inst = getPlyrInstance(api);
    if (!inst) return;
    const isPaused = typeof inst.paused === "boolean" ? inst.paused : inst.media?.paused ?? true;
    if (isPaused) inst.play?.();
    else inst.pause?.();
  }
  function toggleActiveVideoPlay() {
    const active = selectedIndex.current;
    const api = plyrRefsByIdx.current[active];
    if (!api) return;
    togglePlyr(api);
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
    const { x, y } = getClientXY(evt);
    const under = document.elementFromPoint(x, y);
    if (!under) return false;
    const slide = under.closest('[data-rmg-slide="true"]');
    if (!slide) return false;
    const host = slide.querySelector('[data-rmg-plyr="true"]');
    if (!host) return false;
    const r = host.getBoundingClientRect();
    const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    if (!inside) return false;
    if (under.closest(".plyr__controls")) return false;
    return true;
  }
  function computeCloneSig(originals, per, useCols, cellSize) {
    return `${originals}|per=${per}|cols=${useCols ? cellsPerSlide : 0}|cell=${cellSize ?? 0}|wrap=${wrap ? 1 : 0}`;
  }
  useEffect(() => {
    const el = slider.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rawKids = Children.toArray(children).filter(isValidElement);
      const originals = rawKids.length;
      if (originals < 1) {
        clonesCountRef.current = 0;
        cells.current = [];
        setClonedChildren([]);
        sliderWidth.current = 0;
        layoutRef.current = null;
        setWrapSafe(false);
        slides.current = [];
        setSlidesState([]);
        cellToSlideRef.current = [];
        return;
      }
      const allEls = Array.from(el.children);
      const clonesBefore = clonesCountRef.current;
      const clonesAfter = clonesBefore;
      const originalEls = allEls.slice(clonesBefore, allEls.length - clonesAfter);
      const cw = el[AX.clientKey];
      const useCols = typeof cellsPerSlide === "number" && cellsPerSlide > 0;
      let cols = 1;
      let cellSize;
      if (useCols) {
        cols = Math.max(1, Math.min(originals, cellsPerSlide));
        const totalGap = gap * Math.max(0, cols - 1);
        cellSize = (cw - totalGap) / cols;
      }
      let sum = 0;
      let count = 0;
      for (const slot of originalEls) {
        const w = slot.getBoundingClientRect()[AX.sizeKey];
        if (w === 0) {
          requestAnimationFrame(() => ro.observe(el));
          return;
        }
        if (sum + w <= cw) {
          sum += w;
          count++;
        } else {
          count++;
          break;
        }
      }
      const per = useCols ? Math.max(1, Math.min(originals, cols)) : Math.max(2, Math.min(originals, count));
      const shouldLoop = wrap;
      clonesCountRef.current = shouldLoop ? per : 0;
      if (visibleImagesRef.current !== per) {
        setVisibleImages(per);
        visibleImagesRef.current = per;
      }
      const sig = computeCloneSig(originals, per, useCols, cellSize);
      if (sig === lastCloneSigRef.current) return;
      lastCloneSigRef.current = sig;
      const enableParallax = !!parallax;
      const slidesArr = [];
      cells.current = [];
      const extraStyle = useCols && cellSize != null ? {
        flex: "0 0 auto",
        [AX.sizeKey]: `${cellSize}px`
      } : void 0;
      if (shouldLoop) {
        slidesArr.push(
          ...rawKids.slice(-per).map(
            (c, i) => cloneSlide(
              c,
              `before-${i}`,
              -per + i,
              cells,
              enableParallax,
              imageCount,
              lazyLoad,
              extraStyle,
              enableFullscreen,
              true,
              plyrRefsByIdx
            )
          )
        );
      }
      slidesArr.push(
        ...rawKids.map(
          (c, i) => cloneSlide(
            c,
            `original-${i}`,
            i,
            cells,
            enableParallax,
            imageCount,
            lazyLoad,
            extraStyle,
            enableFullscreen,
            false,
            plyrRefsByIdx
          )
        )
      );
      if (shouldLoop) {
        slidesArr.push(
          ...rawKids.slice(0, per).map(
            (c, i) => cloneSlide(
              c,
              `after-${i}`,
              originals + i,
              cells,
              enableParallax,
              imageCount,
              lazyLoad,
              extraStyle,
              enableFullscreen,
              true,
              plyrRefsByIdx
            )
          )
        );
      }
      setClonedChildren(slidesArr);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    imageCount,
    slider,
    visibleImagesRef,
    cellsPerSlide,
    buildKey,
    wrap
  ]);
  useEffect(() => {
    const track = slider.current;
    if (!track) return;
    const schedule = () => {
      measureAndPosition();
    };
    function measureAndPosition() {
      const trackEl = slider.current;
      if (!trackEl) return;
      const slideEls = Array.from(trackEl.children);
      if (slideEls.length === 0) return;
      const sizes = slideEls.map((sl) => sl.getBoundingClientRect()[AX.sizeKey]);
      if (sizes.some((s) => s === 0)) {
        setTimeout(measureAndPosition, 0);
        return;
      }
      const contentSize = AX.main === "x" ? trackEl.scrollWidth : trackEl.scrollHeight;
      const clonesBefore = clonesCountRef.current;
      const beforeSizes = sizes.slice(0, clonesBefore);
      let running = -(beforeSizes.reduce((s, w) => s + w, 0) + gap * clonesBefore);
      slideEls.forEach((sl, i) => {
        sl.style.transformOrigin = "center";
        sl.style.transform = AX.place(running * sign);
        running += sizes[i] + gap;
      });
      const origSizes = sizes.slice(clonesBefore, sizes.length - clonesBefore);
      let m0 = 0;
      const originalsForLayout = slideEls.slice(clonesBefore, slideEls.length - clonesBefore).map((sl, i) => {
        const s = origSizes[i];
        const start = m0;
        const end = m0 + s;
        m0 += s + gap;
        return { el: sl, start, end, size: s };
      });
      layoutRef.current = {
        originals: originalsForLayout,
        cw: trackEl[AX.clientKey]
      };
      const originalsCount = layoutRef.current?.originals?.length ?? 0;
      const innerGaps = Math.max(0, originalsCount - 1);
      const baseWidth = origSizes.reduce((sum, s) => sum + s, 0) + gap * innerGaps;
      sliderWidth.current = wrap ? baseWidth + (originalsCount > 0 ? gap : 0) : baseWidth;
      const cw = trackEl[AX.clientKey];
      const wantLoop = !!loop && originalsCount > 1 && contentSize > cw;
      const origSizesCsv = originalsForLayout.map((o) => o.size).join(",");
      const sig = `${origSizesCsv}|gap=${gap}|cw=${cw}|W=${contentSize}`;
      if (sig !== lastGeomSigRef.current) {
        lastGeomSigRef.current = sig;
        setGeomKey((k) => k + 1);
      }
      setWrapSafe(wantLoop);
      setIsMeasured(true);
    }
    const ro = new ResizeObserver(schedule);
    ro.observe(track);
    if (sliderContainer.current) {
      ro.observe(sliderContainer.current);
    }
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", schedule);
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [imageCount, clonedChildren, visibleImages, cellsPerSlide, gap, wrap, loop, AX, sign]);
  useEffect(() => {
    if (isReady) return;
    const imagesOk = lazyLoad ? true : sliderImagesReady;
    if (!engineReady || !imagesOk) return;
    setIsReady(true);
  }, [lazyLoad, sliderImagesReady, engineReady, isReady]);
  useLayoutEffect(() => {
    if (!slider.current || cells.current.length === 0 || sliderWidth.current === 0 || !slides.current || !slides.current[0] || !slides.current[0].cells[0]?.element) return;
    const containerSize = slider.current[AX.clientKey];
    if (!wrap && sliderWidth.current <= containerSize) {
      sliderX.current = (containerSize - sliderWidth.current) / 2;
      translateRef.current?.to(Math.round(sliderX.current));
    }
    updateControlsImperatively();
  }, [slidesState, wrap]);
  useEffect(() => {
    const containerEl = slider.current;
    if (!containerEl) return;
    let canceled = false;
    let retryTimer = null;
    let tries = 0;
    const MAX_TRIES = 5;
    function retry() {
      if (canceled) return;
      if (tries++ >= MAX_TRIES) return;
      if (retryTimer != null) window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(() => {
        buildPages();
      }, 0);
    }
    const rawKids = Children.toArray(children).filter(isValidElement);
    const childCount = rawKids.length;
    const clonesBefore = wrap ? visibleImages : 0;
    const clonesAfter = clonesBefore;
    const cw = containerEl[AX.clientKey];
    function buildPages() {
      if (canceled || !containerEl) return;
      const allEls = Array.from(containerEl.children);
      const originals = allEls.slice(clonesBefore, allEls.length - clonesAfter);
      const idxMap = new Map(originals.map((el, i2) => [el, i2]));
      const start0 = containerEl.getBoundingClientRect()[AX.startKey];
      const data = originals.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          start: r[AX.startKey] - start0,
          end: r[AX.endKey] - start0
        };
      });
      const pages = [];
      let i = 0;
      if (groupCells) {
        while (i < childCount) {
          const startLeft = data[i]?.start ?? 0;
          const viewRight = startLeft + cw;
          let j = i;
          while (j < childCount && (data[j]?.end ?? 0) <= viewRight) j++;
          if (j === i) j++;
          const slice = originals.slice(i, j);
          const isLast = j >= childCount;
          let target = startLeft;
          if (isLast && !wrap) {
            target = Math.max(0, (sliderWidth.current || 0) - cw);
          }
          if (i === 0) target = 0;
          pages.push({ els: slice, target });
          i = j;
        }
      } else {
        const L = layoutRef.current;
        if (!L || !L.originals?.length) {
          retry();
          return;
        }
        const data2 = L.originals;
        const cw2 = L.cw;
        const maxTarget = Math.max(0, (sliderWidth.current || 0) - cw2);
        const EPS = 0.5;
        if (wrap) {
          data2.forEach((d, idx) => {
            const t = idx === 0 ? 0 : d.start;
            pages.push({ els: [d.el], target: t });
          });
        } else {
          for (let idx = 0; idx < data2.length; idx++) {
            const d = data2[idx];
            let t = idx === 0 ? 0 : d.start;
            t = Math.min(t, maxTarget);
            if (!pages.length || Math.abs(t - pages[pages.length - 1].target) > EPS) {
              pages.push({ els: [d.el], target: t });
            }
            if (Math.abs(t - maxTarget) <= EPS) break;
          }
          const winStart = maxTarget - EPS;
          const winEnd = maxTarget + cw2 + EPS;
          const lastEls = data2.filter((d) => d.start < winEnd && d.end > winStart).map((d) => d.el);
          if (lastEls.length) {
            const lastT = pages[pages.length - 1]?.target ?? -1;
            if (Math.abs(lastT - maxTarget) > EPS) {
              pages.push({ els: lastEls, target: maxTarget });
            } else {
              const uniq = new Set(pages[pages.length - 1].els.concat(lastEls));
              pages[pages.length - 1].els = Array.from(uniq);
            }
          } else {
            let safeIdx = -1;
            for (let i2 = data2.length - 1; i2 >= 0; i2--) {
              if (data2[i2].start <= maxTarget + EPS) {
                safeIdx = i2;
                break;
              }
            }
            const fallback = data2[Math.max(0, safeIdx)];
            if (fallback) {
              const lastT = pages[pages.length - 1]?.target ?? -1;
              if (Math.abs(lastT - maxTarget) > EPS) {
                pages.push({ els: [fallback.el], target: maxTarget });
              }
            }
          }
        }
      }
      const newSlides = pages.map((page) => ({
        target: page.target,
        cells: page.els.map((el) => ({
          element: el,
          index: idxMap.get(el)
        }))
      }));
      const hasNaN = newSlides.some((s) => Number.isNaN(s.target));
      const unstable = hasNaN || wrap && newSlides.length === 1;
      if (unstable) {
        retry();
        return;
      }
      const pagesAllowLoop = newSlides.length > 1;
      setWrap(!!loop && pagesAllowLoop && sliderWidth.current > cw);
      isWrapping.current = !!loop && pagesAllowLoop && sliderWidth.current > cw;
      slides.current = newSlides;
      setSlidesState(newSlides);
      setLayoutReady(true);
      const map = [];
      newSlides.forEach((s, slideIdx) => {
        s.cells.forEach((c) => {
          map[c.index] = slideIdx;
        });
      });
      cellToSlideRef.current = map;
      window.setTimeout(() => {
        if (canceled) return;
        const nodes = getOriginalNodes();
        if (nodes.length) {
          builtOnceRef.current = true;
          slideBuildSubs.current.forEach((fn) => fn(nodes));
        }
      }, 0);
    }
    buildPages();
    return () => {
      canceled = true;
      if (retryTimer != null) window.clearTimeout(retryTimer);
    };
  }, [imageCount, children, clonedChildren, visibleImages, cellsPerSlide, geomKey]);
  useEffect(() => {
    if (!lazyLoad) return;
    if (!layoutReady) return;
    const root = sliderContainer.current;
    const track = slider.current;
    if (!root || !track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          const slideEl = ent.target;
          if (slideEl.getAttribute("data-rmg-lazyloaded") === "true") {
            io.unobserve(slideEl);
            continue;
          }
          if (ent.isIntersecting && ent.intersectionRatio >= 0.6) {
            revealSlide(slideEl);
            io.unobserve(slideEl);
          }
        }
      },
      {
        root,
        rootMargin: "0px",
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 1]
      }
    );
    const slidesToObserve = Array.from(track.children).filter(
      (el) => el.hasAttribute("data-rmg-lazyload")
    );
    slidesToObserve.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lazyLoad, clonedChildren, wrap, AX.main]);
  useEffect(() => {
    if (!slider.current) return;
    const childrenArray = Children.toArray(children);
    const imgOffset = !wrap ? 0 : visibleImages * 2;
    if (clonedChildren.length !== Children.toArray(children).length + imgOffset) return;
    if (!expandableImgRefs) return;
    expandableImgRefs.current = [];
    expandableImgRefs.current = Array(childrenArray.length + imgOffset).fill(null).map(() => createRef());
    const images = slider.current.querySelectorAll("img");
    images.forEach((img, index) => {
      if (expandableImgRefs.current[index]) {
        expandableImgRefs.current[index].current = img;
      }
    });
    return () => {
      expandableImgRefs.current = [];
    };
  }, [children, clonedChildren, visibleImages, wrap]);
  useLayoutEffect(() => {
    if (hasResponsiveHeights) return;
    if (sliderHeight) return;
    if (typeof initialHeight === "number" && initialHeight > 0) return;
    if (typeof initialHeight === "string" && initialHeight.trim() !== "") return;
    if (typeof cellsPerSlide !== "number" || cellsPerSlide <= 0) return;
    if (axis !== "x") return;
    const root = sliderContainer.current;
    if (!root) return;
    const updateFromWidth = () => {
      if (!sliderContainer.current) return;
      const cw = sliderContainer.current.getBoundingClientRect().width;
      if (!cw || cw <= 0) return;
      const cols = Math.max(1, cellsPerSlide);
      const totalGap = gap * Math.max(0, cols - 1);
      const cellSize = (cw - totalGap) / cols;
      if (cellSize <= 0) return;
      if (Math.abs(cellSize - lastNonZeroHeightRef.current) >= 1) {
        lastNonZeroHeightRef.current = cellSize;
        setResponsiveSliderHeight(cellSize + "px");
      }
    };
    updateFromWidth();
    const ro = new ResizeObserver(() => {
      updateFromWidth();
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
    };
  }, [
    sliderHeight,
    initialHeight,
    cellsPerSlide,
    axis,
    gap,
    sliderContainer,
    hasResponsiveHeights
  ]);
  useEffect(() => {
    if (inView) return;
    if (!sliderContainer.current || !layoutReady || !engineReady || !isReady || !isMeasured) return;
    const el = sliderContainer.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [layoutReady, engineReady, isReady, isMeasured, inView]);
  function scrollToIndex(requested, opts = {}) {
    const { jump = false, direction: direction2 } = opts;
    const indexCurrent = indexCurrentRef.current;
    if (!scrollToRef.current || !bodyRef.current || !indexCurrent) return;
    const targetIndex = indexCurrent.clone().set(requested).get();
    if (jump) {
      bodyRef.current.useDuration(0);
    } else {
      bodyRef.current.useBaseDuration().useBaseFriction();
    }
    const dir = typeof direction2 === "number" ? direction2 : 0;
    scrollToRef.current.index(targetIndex, dir);
  }
  function previous() {
    const scrollTo = scrollToRef.current;
    const body = bodyRef.current;
    const indexCur = indexCurrentRef.current;
    const len = slides.current?.length ?? 0;
    if (!scrollTo || !body || !indexCur || !len) return;
    const cur = indexCur.get();
    const target = wrap ? ((cur - 1) % len + len) % len : clampIndex(cur - 1, len);
    body.useBaseDuration().useBaseFriction();
    scrollToIndex(target, { direction: 1 });
  }
  function next() {
    const scrollTo = scrollToRef.current;
    const body = bodyRef.current;
    const indexCur = indexCurrentRef.current;
    const len = slides.current?.length ?? 0;
    if (!scrollTo || !body || !indexCur || !len) return;
    const cur = indexCur.get();
    const target = wrap ? ((cur + 1) % len + len) % len : clampIndex(cur + 1, len);
    body.useBaseDuration().useBaseFriction();
    scrollToIndex(target, { direction: -1 });
  }
  function indexFromX(loc) {
    const x = -loc;
    const targets = getSnapTargets();
    const W = totalWidth();
    if (!targets.length) return 0;
    let best = 0;
    let min = Infinity;
    for (let i = 0; i < targets.length; i++) {
      const base = targets[i];
      const candidates = !W || !wrap ? [base] : [base, base + W, base - W];
      for (const c of candidates) {
        const d = Math.abs(c - x);
        if (d < min) {
          min = d;
          best = i;
        }
      }
    }
    return best;
  }
  function positionSlider(loc) {
    const x = xRef.current;
    translateRef.current?.to(x * sign);
  }
  function updateActiveIndexFromX(loc) {
    const indexCurrent = indexCurrentRef.current;
    if (!indexCurrent) return;
    const idxFromLoc = indexFromX(loc);
    const canonical = indexCurrent.get();
    updateControlsImperatively();
    if (idxFromLoc === canonical) return;
    if (!pointerDownRef.current && isAnimatingRef.current) {
      return;
    }
    indexCurrent.set(idxFromLoc);
    selectedIndex.current = idxFromLoc;
    indexChannel.set(idxFromLoc, "animated");
  }
  function goToIndex(idx, opts = {}) {
    const { preserveTiming = false } = opts;
    if (!bodyRef.current || !targetRef.current) return;
    if (!preserveTiming) bodyRef.current.useBaseDuration().useBaseFriction();
    scrollToIndex(idx);
  }
  useEffect(() => {
    const ch = indexChannel;
    const len = () => slides.current?.length ?? 0;
    const handle = (ev) => {
      const L = len();
      if (!L) return;
      const cur = selectedIndex.current;
      const signed = (n) => isRtl ? -n : n;
      if (ev.type === "set") {
        const nextC = wrap ? (ev.index % L + L) % L : clampIndex(ev.index, L);
        if (nextC === cur) return;
        scrollToIndex(nextC, ev.mode);
        return;
      }
      if (ev.type === "bump") {
        const delta = signed(ev.delta | 0);
        if (!delta) return;
        if (!wrap) {
          const bounded = clampIndex(cur + delta, L);
          if (bounded === cur) return;
          scrollToIndex(bounded, ev.mode);
        } else {
          const targetC = ((cur + delta) % L + L) % L;
          scrollToIndex(targetC, ev.mode);
        }
        return;
      }
      if (typeof ev.index === "number") {
        const nextC = wrap ? (ev.index % L + L) % L : clampIndex(ev.index, L);
        if (nextC !== cur) scrollToIndex(nextC, ev.mode || "animated");
      }
    };
    if (typeof ch.onEvent === "function") {
      return ch.onEvent(handle);
    } else {
      return ch.subscribe(() => {
        const { index, mode } = ch.get();
        handle({ type: "set", index, mode });
      });
    }
  }, [indexChannel, wrap, isRtl]);
  function isYouTubeVideoEvent(evt) {
    const target = evt.target;
    if (!target) return false;
    const plyrRoot = target.closest('[data-rmg-plyr="true"]');
    if (!plyrRoot) return false;
    return plyrRoot.getAttribute("data-rmg-plyr-provider") === "youtube";
  }
  useEffect(() => {
    const root = sliderContainer.current;
    const track = slider.current;
    if (!root || !track || !slides.current?.length || !layoutReady || !isMeasured || sliderWidth.current === 0) {
      return;
    }
    const startIdx = selectedIndex.current || 0;
    const location = Vector1D(0);
    const previousLocation = Vector1D(0);
    const offsetLocation = Vector1D(0);
    const target = Vector1D(0);
    locationRef.current = location;
    previousLocationRef.current = previousLocation;
    offsetLocationRef.current = offsetLocation;
    targetRef.current = target;
    const W = sliderWidth.current || 0;
    const len = slides.current.length || 1;
    const counterMax = len - 1;
    const startIndex = selectedIndex.current || 0;
    const indexCurrent = Counter(counterMax, startIndex, true);
    const indexPrevious = Counter(counterMax, startIndex, true);
    indexCurrentRef.current = indexCurrent;
    indexPreviousRef.current = indexPrevious;
    contentSizeRef.current = W;
    scrollContentSizeRef.current = W;
    const scrollSnaps = slides.current.map((slide, i) => {
      const centerOffset = getCenterOffsetForIndex(i);
      return -slide.target + centerOffset;
    });
    scrollSnapsRef.current = scrollSnaps;
    const initialSnap = scrollSnaps[startIdx] ?? 0;
    location.set(initialSnap);
    previousLocation.set(initialSnap);
    offsetLocation.set(initialSnap);
    target.set(initialSnap);
    xRef.current = initialSnap;
    translateRef.current = Translate(track, AX);
    translateRef.current.to(initialSnap * sign);
    selectedIndex.current = startIdx;
    indexChannel.set(startIdx, "instant");
    const minSnap = Math.min(...scrollSnaps);
    const maxSnap = Math.max(...scrollSnaps);
    loopLimitRef.current = wrap ? Limit(-W, 0) : Limit(minSnap, maxSnap);
    const baseLimit = wrap ? createBaseLimit(-W, 0) : createBaseLimit(minSnap, maxSnap);
    scrollLimitRef.current = baseLimit;
    if (loopLimitRef.current) {
      scrollTargetRef.current = ScrollTarget(
        wrap,
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
          isAnimatingRef.current = true;
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
        selectedIndex.current = idx;
        const mode = bodyRef.current?.duration() ? "animated" : "instant";
        indexChannel.set(idx, mode);
      }
    }
    const baseScrollTo = {
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
        const targetIndex = indexCurrent2.clone().set(n);
        const target2 = st.byIndex(targetIndex.get(), direction2);
        scrollTo(target2);
      }
    };
    scrollToRef.current = baseScrollTo;
    const loLimit = Limit(-W, 0);
    const looper = wrap && W > 0 ? ScrollLooper(
      W,
      loLimit,
      locationRef.current,
      [locationRef.current, previousLocationRef.current, offsetLocationRef.current, targetRef.current]
    ) : null;
    const body = ScrollBody(location, offsetLocation, previousLocation, target, selectDuration, sliderFriction);
    bodyRef.current = body;
    if (!wrap) {
      const cw = track[AX.clientKey];
      const min = -Math.max(0, sliderWidth.current - cw);
      const max = 0;
      limitRef.current = Limit(isNaN(min) ? 0 : min, max);
      povRef.current = PercentOfView(cw);
      boundsRef.current = ScrollBounds(
        limitRef.current,
        offsetLocationRef.current,
        targetRef.current,
        bodyRef.current,
        povRef.current,
        selectDuration
      );
    } else {
      limitRef.current = null;
      boundsRef.current = null;
      povRef.current = null;
    }
    const anim = Animations(
      document,
      window,
      () => {
        if (!wrap) {
          boundsRef.current?.constrain(pointerDownRef.current);
        }
        bodyRef.current?.seek();
        if (wrap && W > 0) {
          const body2 = bodyRef.current;
          const dir = body2.direction() || Math.sign(targetRef.current.get() - locationRef.current.get()) || 0;
          looper?.loop(dir);
        }
        xRef.current = locationRef.current.get();
      },
      (alpha) => {
        const body2 = bodyRef.current;
        const shouldSettle = body2 ? body2.settled() : true;
        const idle = shouldSettle && !pointerDownRef.current;
        if (idle) {
          animRef.current?.stop();
          isAnimatingRef.current = false;
        }
        const cur = locationRef.current.get();
        const prev = previousLocationRef.current.get();
        const loc = cur * alpha + prev * (1 - alpha);
        offsetLocationRef.current.set(loc);
        xRef.current = loc;
        positionSlider();
        applyPairScaleTween();
        applyFadeTween();
        progressApi.updateProgressInFrame();
        tweenParallax();
        updateActiveIndexFromX(loc);
      }
    );
    animRef.current = anim;
    anim.init();
    const dragStore = EventStore();
    const moveStore = EventStore();
    const tracker = DragTracker(AX.main, window);
    let isMouse = false;
    let startMain = 0;
    let startCross = 0;
    let preventScroll = false;
    const freeBoost = { mouse: 500, touch: 600 };
    function addDragEvents() {
      const node = isMouse ? document : root;
      moveStore.add(node, "touchmove", onMove).add(node, "touchend", onUp).add(node, "mousemove", onMove, { passive: false }).add(node, "mouseup", onUp);
    }
    function forceBoost(rawForce) {
      const type = isMouse ? "mouse" : "touch";
      return rawForce * freeBoost[type];
    }
    function onDown(evt) {
      const targetEl = evt.target;
      if (isPlyrControlsEl(targetEl)) return;
      const hit = evt.target;
      if (prevButtonRef.current?.contains(hit)) return;
      if (nextButtonRef.current?.contains(hit)) return;
      const dotIndex = dotRefs.current.findIndex((dot) => dot?.contains(hit));
      if (dotIndex >= 0) return;
      if (dotsContainerRef.current?.contains(hit)) return;
      const isMouseEvt = isMouseEvent(evt, window);
      isMouse = isMouseEvt;
      if (isMouseEvt && evt.button !== 0) return;
      setDragCursor(true);
      pointerDownRef.current = true;
      isPointerDown.current = true;
      isScrolling.current = false;
      isClick.current = true;
      tracker.pointerDown(evt);
      startMain = tracker.readPoint(evt, AX.main);
      startCross = tracker.readPoint(evt, AX.cross);
      bodyRef.current.useFriction(0).useDuration(0);
      targetRef.current.set(locationRef.current.get());
      addDragEvents();
      animRef.current?.start();
    }
    function onMove(evt) {
      const isTouchEvt = !isMouseEvent(evt, window);
      if (isTouchEvt && evt.touches?.length >= 2) return onUp(evt);
      if (pointerDownRef.current && activePointerIdRef.current != null) setDragCursor(true);
      const lastMain = tracker.readPoint(evt, AX.main);
      const lastCross = tracker.readPoint(evt, AX.cross);
      const diffMain = Math.abs(lastMain - startMain);
      const diffCross = Math.abs(lastCross - startCross);
      if (diffMain > 5 || diffCross > 5) isClick.current = false;
      if (!preventScroll && !isMouse) {
        if (!("cancelable" in evt) || !evt.cancelable) return onUp(evt);
        preventScroll = diffMain > diffCross;
        if (!preventScroll) return onUp(evt);
      }
      const { dx, dy } = tracker.pointerMove(evt);
      const deltaMain = (AX.main === "x" ? dx : dy) * sign;
      previousDragX.current = dragX.current;
      dragX.current = lastMain * sign;
      sliderVelocity.current = deltaMain;
      dragMoveTime.current = /* @__PURE__ */ new Date();
      bodyRef.current.useFriction(0.3).useDuration(0.75);
      targetRef.current.add(deltaMain);
      animRef.current?.start();
      if (evt.cancelable) evt.preventDefault?.();
    }
    function onUp(evt) {
      isPointerDown.current = false;
      preventScroll = false;
      pointerDownRef.current = false;
      moveStore.clear();
      setDragCursor(false);
      if (isClick.current && enableFullscreen) {
        const target2 = evt.target;
        const img = target2.closest("img");
        if (img) {
          if (!expandableImgRefs) return;
          const index = expandableImgRefs.current.findIndex((ref2) => ref2.current === img);
          if (index >= 0) handleImageClick(evt, index);
          scrollToIndex(selectedIndex.current);
          return;
        }
        if (clickedVideoSurface(evt) && !isYouTubeVideoEvent(evt)) {
          evt.preventDefault?.();
          evt.stopPropagation?.();
          toggleActiveVideoPlay();
          scrollToIndex(selectedIndex.current);
          return;
        }
      }
      autoScrollPauseUntil.current = performance.now() + autoScrollPause;
      if (freeScroll === false) {
        let allowedForce2 = function(force2) {
          const len2 = slides.current.length || 1;
          if (!baseScrollTarget) return 0;
          const curIndex = selectedIndex.current || 0;
          const dir = mathSign(force2);
          if (dir === 0) return 0;
          if (!skipSnaps) {
            const dirIndex2 = dir * -1;
            let nextIndex2 = curIndex + dirIndex2;
            if (!wrap) {
              if (nextIndex2 < 0 || nextIndex2 > len2 - 1) {
                nextIndex2 = curIndex;
              }
            } else {
              nextIndex2 = (nextIndex2 % len2 + len2) % len2;
            }
            const dirBump2 = slides.current.length === 2 ? dir : 0;
            const nextTarget = baseScrollTarget.byIndex(nextIndex2, dirBump2);
            return nextTarget.distance;
          }
          const baseTarget = baseScrollTarget.byDistance(force2, true);
          let { index: proposedIndex } = baseTarget;
          const { distance } = baseTarget;
          const currentIndex = curIndex;
          if (proposedIndex !== currentIndex) {
            if (!wrap) {
              proposedIndex = Math.max(0, Math.min(len2 - 1, proposedIndex));
              const clamped = baseScrollTarget.byIndex(proposedIndex, dir);
              return clamped.distance;
            }
            return distance;
          }
          const dirIndex = dir * -1;
          let nextIndex = currentIndex + dirIndex;
          if (wrap) {
            nextIndex = (nextIndex % len2 + len2) % len2;
          } else {
            nextIndex = Math.max(0, Math.min(len2 - 1, nextIndex));
            if (nextIndex === currentIndex) {
              return 0;
            }
          }
          const dirBump = slides.current.length === 2 ? dir : 0;
          const forced = baseScrollTarget.byIndex(nextIndex, dirBump);
          return forced.distance;
        };
        const end = tracker.pointerUp(evt);
        let rawForce = AX.main === "x" ? end.fx : end.fy;
        if (isRtl) rawForce = -rawForce;
        const isMouseEvt = isMouseEvent(evt, window);
        const snapForceBoost = { mouse: 300, touch: 400 };
        const boost = snapForceBoost[isMouseEvt ? "mouse" : "touch"];
        const boostedForce = rawForce * boost;
        const baseScrollTarget = scrollTargetRef.current;
        const baseScrollTo2 = scrollToRef.current;
        const body2 = bodyRef.current;
        if (!baseScrollTarget || !baseScrollTo2 || !body2) {
          return;
        }
        const force = allowedForce2(boostedForce);
        const baseSpeed = selectDuration;
        const baseFriction = sliderFriction;
        const forceFactor = factorAbs(boostedForce, force);
        const speed = baseSpeed - 10 * forceFactor;
        const friction = baseFriction + forceFactor / 50;
        body2.useDuration(speed).useFriction(friction);
        baseScrollTo2.distance(force, true);
      } else {
        const end = tracker.pointerUp(evt);
        const raw = AX.main === "x" ? end.fx : end.fy;
        const boosted = forceBoost(raw);
        const force = boosted;
        const factor = Math.min(1, Math.abs(raw) > 0 ? Math.abs((Math.abs(boosted) - Math.abs(force)) / (raw || 1)) : 0);
        const speed = freeScrollDuration - 10 * factor;
        const friction = sliderFriction + factor / 50;
        bodyRef.current.useDuration(speed).useFriction(friction);
        targetRef.current.add(force);
        anim.start();
        isMouse = false;
      }
    }
    dragStore.add(root, "dragstart", (evt) => evt.preventDefault(), { passive: false }).add(root, "touchstart", onDown).add(root, "mousedown", onDown, { passive: true }).add(root, "touchcancel", onUp).add(root, "contextmenu", onUp);
    function onWheel(e) {
      const trackEl = slider.current;
      if (!trackEl) return;
      const containerSize = trackEl[AX.clientKey];
      const contentSize = sliderWidth.current;
      const canScrollMain = contentSize > containerSize;
      const isMain = AX.main === "x" ? Math.abs(e.deltaX) > Math.abs(e.deltaY) : Math.abs(e.deltaY) >= Math.abs(e.deltaX);
      if (!isMain || !canScrollMain) return;
      autoScrollPauseUntil.current = performance.now() + 100;
      const cur = (offsetLocationRef.current?.get() ?? 0) - AX.wheelDelta(e) * sign;
      let next2 = cur;
      if (!wrap && limitRef.current) next2 = limitRef.current.constrain(cur);
      targetRef.current?.set(next2);
      bodyRef.current?.useDuration(0).useFriction(1);
      animRef.current?.start();
      xRef.current = next2;
      positionSlider();
      if (e.cancelable) e.preventDefault?.();
    }
    root.addEventListener("wheel", onWheel, { passive: false });
    requestAnimationFrame(() => {
      if (!slider.current || !slides.current?.length) return;
      setEngineReady(true);
    });
    hasPositioned.current = true;
    return () => {
      dragStore.clear();
      moveStore.clear();
      root.removeEventListener("wheel", onWheel);
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [
    slidesState.length,
    wrap,
    cellsPerSlide,
    geomKey,
    layoutReady,
    isMeasured
  ]);
  const { tweenParallax } = useParallaxEffect({
    enabled: parallax,
    wrap,
    axisMain: AX.main,
    sliderRef: slider,
    sliderWidthRef: sliderWidth,
    offsetLocationRef,
    visibleImagesRef,
    slidesLen: slidesState.length,
    clonedLen: clonedChildren.length,
    isReady
  });
  const { applyPairScaleTween } = useScaleEffect({
    enabled: scaleEffect,
    scaleAmount,
    wrap,
    sliderRef: slider,
    sliderWidthRef: sliderWidth,
    offsetLocationRef,
    slidesRef: slides,
    getCenterOffsetForIndex,
    slidesLen: slidesState.length,
    clonedLen: clonedChildren.length
  });
  const { applyFadeTween } = useFadeEffect({
    enabled: fadeEffect,
    wrap,
    sliderRef: slider,
    sliderWidthRef: sliderWidth,
    offsetLocationRef,
    slidesRef: slides,
    getCenterOffsetForIndex,
    slidesLen: slidesState.length,
    clonedLen: clonedChildren.length
  });
  const centerSlider = useCallback(() => {
    const track = slider.current;
    if (!track) return;
    const idx = selectedIndex.current || 0;
    const x = -(slides.current?.[idx]?.target ?? 0) + getCenterOffsetForIndex(idx);
    locationRef.current?.set(x);
    previousLocationRef.current?.set(x);
    offsetLocationRef.current?.set(x);
    targetRef.current?.set(x);
    xRef.current = x;
    positionSlider();
    progressApi.updateProgressInFrame();
    tweenParallax();
    applyFadeTween();
  }, []);
  function cellsInViewInternal() {
    const L = layoutRef.current;
    const track = slider.current;
    if (!L || !track) return [];
    const cellsMeta = L.originals;
    const cw = L.cw;
    if (!cellsMeta.length || cw <= 0) return [];
    const loc = -(offsetLocationRef.current?.get() ?? 0);
    if (!wrap) {
      const viewStart = loc;
      const viewEnd = loc + cw;
      const res = [];
      cellsMeta.forEach((m, i) => {
        const cellStart = m.start;
        const cellEnd = m.end;
        if (cellEnd > viewStart && cellStart < viewEnd) {
          res.push(i);
        }
      });
      return res;
    }
    const W = sliderWidth.current || 0;
    if (W <= 0) return [];
    const world = (loc % W + W) % W;
    const resSet = /* @__PURE__ */ new Set();
    const view1Start = world;
    const view1End = Math.min(world + cw, W);
    const checkSegment = (vStart, vEnd) => {
      cellsMeta.forEach((m, i) => {
        const cellStart = m.start;
        const cellEnd = m.end;
        if (cellEnd > vStart && cellStart < vEnd) {
          resSet.add(i);
        }
      });
    };
    checkSegment(view1Start, view1End);
    if (world + cw > W) {
      const spill = world + cw - W;
      const view2Start = 0;
      const view2End = spill;
      checkSegment(view2Start, view2End);
    }
    return Array.from(resSet);
  }
  useImperativeHandle(
    ref,
    () => {
      const getSafeIndex = () => indexChannel.get().index ?? 0;
      const slideCount = () => slides.current?.length ?? 0;
      function canScrollNextInternal() {
        const L = slideCount();
        if (L <= 1) return false;
        if (wrap) return true;
        const atFirst = getSafeIndex() <= 0;
        const atLast = getSafeIndex() >= Math.max(0, L - 1);
        return !(isRtl ? atFirst : atLast);
      }
      function canScrollPrevInternal() {
        const L = slideCount();
        if (L <= 1) return false;
        if (wrap) return true;
        const atFirst = getSafeIndex() <= 0;
        const atLast = getSafeIndex() >= Math.max(0, L - 1);
        return !(isRtl ? atLast : atFirst);
      }
      function scrollProgressInternal() {
        return lastProgressRef.current;
      }
      function getInternals() {
        return {
          slides: slides ?? [],
          slider,
          visibleImages: visibleImagesRef,
          selectedIndex,
          sliderX,
          sliderVelocity,
          isWrapping
        };
      }
      return {
        centerSlider: () => centerSlider(),
        getIndex: () => getSafeIndex(),
        setIndex: (i, mode = "animated") => {
          scrollToIndex(i, { jump: mode === "animated" ? false : true });
        },
        subscribeIndex: (fn) => indexChannel.subscribe(fn),
        slideIndexForCell: (cellIndex) => {
          const Lcells = imageCount;
          const Lslides = slideCount();
          if (!Lcells || !Lslides) return 0;
          const ci = (cellIndex % Lcells + Lcells) % Lcells;
          const s = cellToSlideRef.current[ci];
          return typeof s === "number" ? s : Math.min(ci, Lslides - 1);
        },
        getRootNode: () => sliderContainer.current,
        getContainerNode: () => slider.current,
        getSlideNodes: () => {
          return getOriginalNodes();
        },
        onSlidesBuilt: (cb) => {
          slideBuildSubs.current.add(cb);
          if (builtOnceRef.current) cb(getOriginalNodes());
          return () => slideBuildSubs.current.delete(cb);
        },
        whenSlidesBuilt: () => {
          if (builtOnceRef.current) {
            return Promise.resolve(getOriginalNodes());
          }
          return new Promise((resolve) => {
            const handler = (nodes) => {
              slideBuildSubs.current.delete(handler);
              resolve(nodes);
            };
            slideBuildSubs.current.add(handler);
          });
        },
        isSlidesBuilt: () => builtOnceRef.current,
        scrollNext: () => {
          if (!canScrollNextInternal()) return;
          next();
        },
        scrollPrev: () => {
          if (!canScrollPrevInternal()) return;
          previous();
        },
        canScrollNext: () => canScrollNextInternal(),
        canScrollPrev: () => canScrollPrevInternal(),
        scrollProgress: () => scrollProgressInternal(),
        cellsInView: () => cellsInViewInternal(),
        getInternals
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [centerSlider, indexChannel, wrap, imageCount, isRtl, showFullscreenSlider]
  );
  function updateControlsImperatively() {
    const count = slides.current?.length ?? 0;
    const idx = selectedIndex.current;
    const atFirst = !wrap && idx <= 0;
    const atLast = !wrap && idx >= Math.max(0, count - 1);
    const setArrow = (el, disabled) => {
      if (!el) return;
      el.style.cursor = disabled ? "default" : "pointer", el.style.opacity = disabled ? "0.35" : "1";
      el.setAttribute("aria-disabled", disabled ? "true" : "false");
    };
    setArrow(prevButtonRef.current, isRtl ? atLast : atFirst);
    setArrow(nextButtonRef.current, isRtl ? atFirst : atLast);
    const L = dotRefs.current.length;
    for (let i = 0; i < L; i++) {
      const el = dotRefs.current[i];
      if (!el) continue;
      el.classList.toggle(Slider_default.active, i === idx);
      el.classList.toggle(Slider_default.inactive, i !== idx);
    }
  }
  useEffect(() => {
    const track = slider.current;
    if (!track) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const cw = track[AX.clientKey];
          const contentW = sliderWidth.current || 0;
          if (!isWrapping.current) {
            if (contentW <= cw) {
              const center = Math.round((cw - contentW) / 2);
              const newLimit = Limit(center, center);
              limitRef.current = newLimit;
              povRef.current = PercentOfView(cw);
              boundsRef.current = ScrollBounds(
                newLimit,
                offsetLocationRef.current,
                targetRef.current,
                bodyRef.current,
                povRef.current,
                selectDuration
              );
              locationRef.current?.set(center);
              previousLocationRef.current?.set(center);
              offsetLocationRef.current?.set(center);
              targetRef.current?.set(center);
              translateRef.current?.to(center);
              xRef.current = center;
              sliderX.current = center;
            } else {
              const min = -(contentW - cw);
              const max = 0;
              const newLimit = Limit(min, max);
              limitRef.current = newLimit;
              povRef.current = PercentOfView(cw);
              boundsRef.current = ScrollBounds(
                newLimit,
                offsetLocationRef.current,
                targetRef.current,
                bodyRef.current,
                povRef.current,
                selectDuration
              );
              const cur = offsetLocationRef.current?.get() ?? 0;
              const constrained = newLimit.constrain(cur);
              locationRef.current?.set(constrained);
              previousLocationRef.current?.set(constrained);
              offsetLocationRef.current?.set(constrained);
              targetRef.current?.set(constrained);
              translateRef.current?.to(constrained);
              xRef.current = constrained;
              sliderX.current = constrained;
            }
          } else {
            limitRef.current = null;
            povRef.current = null;
            boundsRef.current = null;
            const a = offsetLocationRef.current?.get() ?? xRef.current ?? 0;
            const W = sliderWidth.current || 0;
            if (W > 0) {
              const normalized = (a % W + W) % W - W;
              const delta = normalized - a;
              locationRef.current?.add(delta);
              previousLocationRef.current?.add(delta);
              offsetLocationRef.current?.add(delta);
              targetRef.current?.add(delta);
              xRef.current += delta;
              translateRef.current?.to(xRef.current);
            }
          }
        });
      });
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [wrap]);
  useEffect(() => {
    const track = slider.current;
    if (!track || sliderHeight) return;
    const ro = new ResizeObserver(() => {
      centerSlider();
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [clonedChildren, visibleImages, wrap, cellsPerSlide, slider, sliderHeight, centerSlider, slidesState]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(1e4);
  }, []);
  const addShield = useCallback((timeoutMs) => {
    shieldCleanupRef.current?.();
    const teardown = shieldRef.current?.add(timeoutMs);
    shieldCleanupRef.current = teardown ?? null;
  }, []);
  function handleImageClick(e, parsedImgIndex) {
    isClick.current = true;
    const originalIndex = ((parsedImgIndex - visibleImagesRef.current) % imageCount + imageCount) % imageCount;
    const fullscreenIndex = originalIndex + 1;
    const finalIndex = !wrap ? parsedImgIndex : fullscreenIndex;
    setShowFullscreenModal(true);
    if (!expandableImgRefs) return;
    runSlideFullscreenIntro(e, expandableImgRefs.current[parsedImgIndex], finalIndex);
    setSlideIndex(finalIndex);
  }
  const fsForIntro = useMemo(() => {
    return {
      effects: {
        introDuration: fsIntroDuration,
        introEasing: fsIntroEasing,
        introFade: fullscreenIntroFade
      },
      caption: {
        placement: fsCaptionPlacement,
        breakpoint: fsCaptionBreakpoint,
        width: fsCaptionWidth,
        height: fsCaptionHeight,
        render: renderFsCaption
      },
      thumbnails: {
        layout: { position: fullscreenThumbnails }
      },
      controls: {
        close: {
          enabled: showFsClose !== false,
          render: renderFsClose ?? void 0,
          style: fullscreenControls?.close?.style,
          className: fullscreenControls?.close?.className
        },
        counter: {
          enabled: showFsCounter !== false,
          render: renderFsCounter ?? void 0,
          style: fullscreenControls?.counter?.style,
          className: fullscreenControls?.counter?.className
        },
        arrows: {
          enabled: showFsArrows !== false,
          render: renderFsArrows ?? void 0,
          renderPrev: renderFsPrev ?? void 0,
          renderNext: renderFsNext ?? void 0,
          arrow: fullscreenControls?.arrows?.arrow,
          prev: fullscreenControls?.arrows?.prev,
          next: fullscreenControls?.arrows?.next
        }
      }
    };
  }, [
    fsIntroDuration,
    fsIntroEasing,
    fullscreenIntroFade,
    fsCaptionPlacement,
    fsCaptionBreakpoint,
    fsCaptionWidth,
    fsCaptionHeight,
    fullscreenThumbnails,
    showFsClose,
    showFsCounter,
    showFsArrows,
    fullscreenControls,
    renderFsCaption,
    renderFsClose,
    renderFsCounter,
    renderFsArrows,
    renderFsPrev,
    renderFsNext
  ]);
  const runSlideFullscreenIntro = useMemo(() => {
    return createSliderFullscreenIntroRunner({
      normalizedItems,
      isRtl: direction === "rtl",
      styles: Slider_default,
      fs: fsForIntro,
      overlayDivRef,
      duplicateImgRef,
      overlayCaptionRef,
      overlayCaptionRootRef,
      fsThumbContainerRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      addShield,
      resolveFsCaptionPlacement,
      closestSelector: ".rmg__slide"
    });
  }, [
    normalizedItems,
    direction,
    Slider_default,
    fsForIntro,
    overlayDivRef,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    closeButtonRef,
    leftChevronRef,
    rightChevronRef,
    counterRef,
    fsThumbContainerRef,
    setShowFullscreenSlider,
    setFsFadeOpening,
    addShield,
    resolveFsCaptionPlacement
  ]);
  function onTouchStart(e) {
    const t0 = e.touches[0];
    onTouchStart._sx = t0.clientX;
    onTouchStart._sy = t0.clientY;
  }
  function onTouchMove(e) {
    if (e.touches.length !== 1) return;
    const t0 = e.touches[0];
    const sx = onTouchStart._sx ?? t0.clientX;
    const sy = onTouchStart._sy ?? t0.clientY;
    const dx = t0.clientX - sx;
    const dy = t0.clientY - sy;
    const mainMag = AX.main === "x" ? Math.abs(dx) : Math.abs(dy);
    const crossMag = AX.main === "x" ? Math.abs(dy) : Math.abs(dx);
    if (mainMag > crossMag) e.preventDefault();
  }
  useEffect(() => {
    const el = sliderContainer.current;
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);
  const effectiveRippleEnabled = rippleEnabled !== false;
  const effectiveRippleClass = rippleClassName && rippleClassName.trim().length > 0 ? rippleClassName : Slider_default.ripple;
  const createRipple = useCallback((container) => {
    if (!effectiveRippleEnabled || !container) return;
    const old = container.querySelector("[data-rmg-ripple]");
    if (old) old.remove();
    const rect = container.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    const x = rect.width / 2 - radius;
    const y = rect.height / 2 - radius;
    const span = document.createElement("span");
    span.setAttribute("data-rmg-ripple", "");
    if (effectiveRippleClass) {
      span.className = effectiveRippleClass;
    }
    span.style.width = `${diameter}px`;
    span.style.height = `${diameter}px`;
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    container.appendChild(span);
    span.addEventListener("animationend", () => span.remove(), { once: true });
  }, [effectiveRippleEnabled, effectiveRippleClass]);
  const arrowNodes = /* @__PURE__ */ jsx(
    RmgArrows,
    {
      axisMain: AX.main,
      clientKey: AX.clientKey,
      wrap,
      isRtl,
      showArrows,
      selectedIndex: selectedIndex.current,
      slideCount: slides.current?.length ?? 0,
      measureRef: slider,
      viewportMainSizeRef: sliderWidth,
      previous,
      next,
      prevButtonRef,
      nextButtonRef,
      createRipple,
      arrowStyles,
      prevArrowStyles,
      nextArrowStyles,
      arrowClassName,
      prevArrowClassName,
      nextArrowClassName,
      renderPrevArrow,
      renderNextArrow,
      renderArrows
    }
  );
  const { dotsNode } = buildDotsNode({
    AX,
    slider,
    sliderWidth,
    showDots,
    selectedIndex,
    slides,
    dotsContainerRef,
    dotRefs,
    isScrolling,
    goToIndex,
    renderDots,
    createRipple,
    styles: Slider_default,
    dotsContainerStyles,
    dotsStyles,
    dotsContainerClassName,
    dotsClassName
  });
  useEffect(() => {
    if (hasResponsiveHeights) return;
    const el = slider.current;
    if (!el) return;
    if (!isReady) return;
    const ro = new ResizeObserver((entries) => {
      let max = 0;
      for (const ent of entries) {
        max = Math.max(max, ent.contentRect.height || 0);
      }
      if (max < 1) return;
      if (Math.abs(max - lastNonZeroHeightRef.current) >= 1) {
        lastNonZeroHeightRef.current = max;
        setResponsiveSliderHeight(max + "px");
      }
    });
    Array.from(el.children).forEach((child) => ro.observe(child));
    return () => ro.disconnect();
  }, [clonedChildren, visibleImages, wrap, isReady, hasResponsiveHeights]);
  const normalizedLoading = useMemo(() => {
    const src = loadingOptions ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading
    };
  }, [loadingOptions]);
  const normalizedIntro = useMemo(() => {
    const src = introOptions ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 40,
      transform: src.transform ?? 10,
      durationMs: src.durationMs ?? 300,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)"
    };
  }, [introOptions]);
  const introChildren = useMemo(
    () => clonedChildren.map((child, i) => {
      if (!isValidElement(child)) return child;
      const el = child;
      const prevStyle = el.props?.style || {};
      return cloneElement(el, {
        ...el.props,
        "data-rmg-idx": i,
        style: {
          ...prevStyle,
          ["--rmg-intro-index"]: i
        }
      });
    }),
    [clonedChildren]
  );
  const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
    arrowNodes,
    /* @__PURE__ */ jsx(
      "div",
      {
        className: [
          Slider_default.viewport,
          sliderViewportClassName ?? ""
        ].join(" "),
        style: {
          ...sliderViewportStyles
        },
        children: /* @__PURE__ */ jsx(
          "div",
          {
            ref: slider,
            className: `${Slider_default.track} ${rtlCls}`,
            style: { gap: `${gap}px`, [AX.sizeKey]: "100%" },
            children: introChildren
          }
        )
      }
    ),
    dotsNode,
    progressNode
  ] });
  const baseContainerProps = {
    className: [
      Slider_default.fade_container,
      rtlCls,
      isReady && inView ? Slider_default.fadeInActive : Slider_default.fadeInStart
    ].join(" "),
    style: {
      position: "relative",
      ...heightVarValue != null ? { ["--rmg-slider-height"]: heightVarValue } : {}
    },
    "aria-busy": !isReady ? true : void 0
  };
  const columnsForSkeleton = typeof cellsPerSlide === "number" && cellsPerSlide > 0 ? cellsPerSlide : visibleImages || visibleImagesRef.current || 1;
  const MAX_SKELETONS = 12;
  const bpMap = breakpointMap;
  const { cssText: skeletonCss, ssrBaseCount: skeletonCountBase } = useMemo(() => {
    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: normalizedLoading.skeletonCount,
      fallbackCount: columnsForSkeleton,
      breakpointMap: bpMap,
      maxSlots: MAX_SKELETONS
    });
  }, [scopeId, normalizedLoading.skeletonCount, columnsForSkeleton, bpMap]);
  const defaultSliderSkeleton = /* @__PURE__ */ jsx("div", { className: Slider_default.sliderSkeletonOverlay, "data-rmg-skel-part": "overlay", children: /* @__PURE__ */ jsx("div", { className: Slider_default.sliderSkeletonRow, "data-rmg-skel-part": "row", children: Array.from({ length: MAX_SKELETONS }).map((_, i) => /* @__PURE__ */ jsx(
    "div",
    {
      className: Slider_default.sliderSkeleton,
      "data-rmg-skel-slot": i + 1
    },
    `rmg-slider-skel-${i}`
  )) }) });
  const loadingNode = !isReady ? normalizedLoading.renderLoading ? normalizedLoading.renderLoading({
    layout: "slider",
    count: skeletonCountBase
  }) : defaultSliderSkeleton : null;
  const introWrapped = normalizedIntro.renderIntro ? /* @__PURE__ */ jsx("div", { ...baseContainerProps, children: normalizedIntro.renderIntro(
    { active: isReady && inView, containerProps: baseContainerProps },
    inner
  ) }) : /* @__PURE__ */ jsx("div", { ...baseContainerProps, children: inner });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    responsiveCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: responsiveCss } }),
    baseCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: baseCss } }),
    skeletonCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: skeletonCss } }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        id: scopeId,
        "data-rmg-scope": scopeId,
        ref: sliderContainer,
        className: [
          Slider_default.slider_container,
          rtlCls,
          sliderContainerClassName ?? ""
        ].join(" "),
        dir: isRtl ? "rtl" : void 0,
        style: {
          position: "relative",
          ...heightVarValue != null ? { ["--rmg-slider-height"]: heightVarValue } : {},
          ["--rmg-intro-stagger"]: `${normalizedIntro.staggerMs}ms`,
          ["--rmg-intro-transform"]: `${normalizedIntro.transform}px`,
          ["--rmg-intro-duration"]: `${normalizedIntro.durationMs}ms`,
          ["--rmg-intro-easing"]: normalizedIntro.easing,
          zIndex: 1,
          ...sliderContainerStyles
        },
        children: [
          loadingNode,
          introWrapped
        ]
      }
    )
  ] });
});
var Slider_default2 = Slider;

export { Slider_default2 as default };
//# sourceMappingURL=Slider-ARUPGDCX.mjs.map
//# sourceMappingURL=Slider-ARUPGDCX.mjs.map