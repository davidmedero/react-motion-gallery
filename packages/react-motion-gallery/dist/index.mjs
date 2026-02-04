import { DEFAULT_ENTRIES } from './chunk-7KJKS6NB.mjs';
import { getPrimaryImgEl, gapAllEdges, getCurrentTransform, getClientXY, baseFitSizeC, applySmoothTransform, detectProvider, Plyr, installDblclickGuardWhenReady } from './chunk-BK66FVWK.mjs';
import { createGestureShield, useRmgSlide } from './chunk-3BWJSDSC.mjs';
import { createIndexChannel } from './chunk-A2O3PMPN.mjs';
import { Gallery_default } from './chunk-SAZMF4ZD.mjs';
import { BREAKPOINT_MAP, resolveNumberFromResponsive, resolvePositionFromResponsive } from './chunk-AD5YPMDD.mjs';
import * as React4 from 'react';
import React4__default, { useMemo, useState, useRef, useCallback, useImperativeHandle, useEffect } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

// src/Gallery/fullscreen/fullscreenSliderSub.tsx
function createFullscreenSliderSub(initialIndex = 0) {
  let curIndex = initialIndex;
  const reqSubs = /* @__PURE__ */ new Set();
  const evtSubs = /* @__PURE__ */ new Set();
  const api = {
    get: () => curIndex,
    requestSet(index, mode) {
      reqSubs.forEach((fn) => fn({ type: "requestSet", index, mode }));
    },
    requestPrev() {
      reqSubs.forEach((fn) => fn({ type: "requestPrev" }));
    },
    requestNext() {
      reqSubs.forEach((fn) => fn({ type: "requestNext" }));
    },
    requestCenter() {
      reqSubs.forEach((fn) => fn({ type: "center" }));
    },
    onEvent(fn) {
      evtSubs.add(fn);
      return () => evtSubs.delete(fn);
    },
    onRequest(fn) {
      reqSubs.add(fn);
      return () => reqSubs.delete(fn);
    },
    setLocalIndex(index) {
      curIndex = index;
      evtSubs.forEach((fn) => fn({ type: "internalIndex", index }));
    },
    destroy() {
      reqSubs.clear();
      evtSubs.clear();
    }
  };
  queueMicrotask(() => {
    evtSubs.forEach((fn) => fn({ type: "mounted" }));
  });
  return api;
}
function useViewportWidth() {
  const [vw, setVw] = React4.useState(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth;
  });
  React4.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vw;
}

// src/Gallery/shared/normalize/normalizeLoading.ts
function normalizeLoading(src) {
  return {
    isLoading: src?.isLoading,
    skeletonCount: src?.skeletonCount,
    renderLoading: src?.renderLoading
  };
}

// src/Gallery/shared/normalize/normalizeIntro.ts
function normalizeIntro(src) {
  return {
    renderIntro: src?.renderIntro,
    staggerMs: src?.staggerMs ?? 40,
    transform: src?.transform ?? "translateY(10px) scale(0.99)",
    durationMs: src?.durationMs ?? 300,
    easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)"
  };
}
function buildMasonryChildren(opts) {
  const {
    cells,
    fsEnabled,
    openFullscreenAt,
    registerExpandableImg,
    itemBaseClass,
    itemBaseStyleClass,
    itemClassName
  } = opts;
  return cells.map((cell, index) => {
    const original = cell.node;
    const introStyle = {
      ["--rmg-intro-index"]: index
    };
    const className = [itemBaseClass, itemBaseStyleClass, itemClassName || ""].filter(Boolean).join(" ");
    const common = {
      key: cell.id,
      "data-rmg-idx": index,
      style: introStyle,
      className
    };
    if (!React4.isValidElement(original)) {
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          ...common,
          onClick: (e) => {
            e.preventDefault();
            if (!fsEnabled) return;
            openFullscreenAt(index);
          },
          children: original
        }
      );
    }
    const originalEl = original;
    const origProps = originalEl.props ?? {};
    const origRef = originalEl.ref;
    const mergedRef = (node) => {
      if (typeof origRef === "function") origRef(node);
      else if (origRef && typeof origRef === "object") origRef.current = node;
      if (node) registerExpandableImg(index, node);
    };
    const mergedOnClick = (e) => {
      origProps.onClick?.(e);
      if (e.defaultPrevented) return;
      if (!fsEnabled) return;
      openFullscreenAt(index);
    };
    return React4.cloneElement(originalEl, {
      key: cell.id,
      ref: mergedRef,
      onClick: mergedOnClick,
      "data-rmg-idx": index,
      className: [itemBaseClass, itemBaseStyleClass, origProps.className || "", itemClassName || ""].filter(Boolean).join(" "),
      style: {
        ...origProps.style || {},
        ...introStyle
      }
    });
  });
}

// src/Gallery/zoomPan/zoom/handleZoomToggle.ts
function handleZoomToggle(ctx, e, imageRef) {
  if (!imageRef.current) return;
  ctx.currentImage.current = imageRef.current;
  const container = ctx.currentImage.current;
  if (!container) return;
  const imgEl = getPrimaryImgEl(container);
  if (!imgEl) return;
  const rect0 = container.getBoundingClientRect();
  if (gapAllEdges({ width: rect0.width, height: rect0.height }, imgEl)) return;
  const { x: domTx, y: domTy } = getCurrentTransform(imgEl);
  if (!ctx.locX.current || !ctx.locY.current) {
    ctx.locX.current = ctx.Vector1D(domTx);
    ctx.prevX.current = ctx.Vector1D(domTx);
    ctx.offX.current = ctx.Vector1D(domTx);
    ctx.tgtX.current = ctx.Vector1D(domTx);
    ctx.locY.current = ctx.Vector1D(domTy);
    ctx.prevY.current = ctx.Vector1D(domTy);
    ctx.offY.current = ctx.Vector1D(domTy);
    ctx.tgtY.current = ctx.Vector1D(domTy);
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
  }
  const s0 = ctx.scaleRef.current || 1;
  const goingIn = s0 === 1;
  const s1 = goingIn ? ctx.fs.zoom.clickZoomLevel : 1;
  const ZOOM_EPS = 1.01;
  const wasZoomed = s0 > ZOOM_EPS;
  const willBeZoomed = s1 > ZOOM_EPS;
  if (wasZoomed && !willBeZoomed) {
    ctx.resetAllZoomDom();
  }
  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;
  const { clientX, clientY } = getClientXY(e);
  const cx = clientX - rect.left;
  const cy = clientY - rect.top;
  const { baseW, baseH } = baseFitSizeC(imgEl, containerW, containerH);
  const offXc = (containerW - baseW) / 2;
  const offYc = (containerH - baseH) / 2;
  const tx0 = ctx.offX.current.get();
  const ty0 = ctx.offY.current.get();
  let tx1;
  let ty1;
  if (goingIn) {
    const k = s1 / s0;
    tx1 = tx0 + (1 - k) * (cx - offXc - tx0);
    ty1 = ty0 + (1 - k) * (cy - offYc - ty0);
    const { x: limX, y: limY } = ctx.boundsForCurrent(
      s1,
      baseW,
      baseH,
      containerW,
      containerH
    );
    tx1 = limX.constrain(tx1);
    ty1 = limY.constrain(ty1);
  } else {
    tx1 = 0;
    ty1 = 0;
  }
  const DURATION = 300;
  applySmoothTransform(ctx, tx1, ty1, s1, DURATION);
  ctx.scaleRef.current = s1;
  ctx.setScale(s1);
  ctx.previousZoom.current.x = cx;
  ctx.previousZoom.current.y = cy;
  ctx.panRef.current = { x: tx1, y: ty1 };
  ctx.locX.current.set(tx1);
  ctx.prevX.current.set(tx1);
  ctx.offX.current.set(tx1);
  ctx.tgtX.current.set(tx1);
  ctx.locY.current.set(ty1);
  ctx.prevY.current.set(ty1);
  ctx.offY.current.set(ty1);
  ctx.tgtY.current.set(ty1);
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
  const { x: limX2, y: limY2, povX, povY } = ctx.boundsForCurrent(
    s1,
    baseW,
    baseH,
    containerW,
    containerH
  );
  ctx.boundsX.current = ctx.ScrollBounds(
    limX2,
    ctx.offX.current,
    ctx.tgtX.current,
    ctx.bodyX.current,
    povX,
    ctx.fs.zoom.panDuration
  );
  ctx.boundsY.current = ctx.ScrollBounds(
    limY2,
    ctx.offY.current,
    ctx.tgtY.current,
    ctx.bodyY.current,
    povY,
    ctx.fs.zoom.panDuration
  );
  ctx.tgtX.current.set(limX2.constrain(ctx.tgtX.current.get()));
  ctx.tgtY.current.set(limY2.constrain(ctx.tgtY.current.get()));
  ctx.animRef.current?.resetBlend();
}
function readSize() {
  return {
    width: document.documentElement.clientWidth,
    height: window.innerHeight
  };
}
function useWindowSize() {
  const [size, setSize] = React4.useState(() => {
    if (typeof window === "undefined") return { width: 1024, height: 768 };
    return readSize();
  });
  React4.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setSize(readSize());
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// src/Gallery/shared/types/media.ts
var toMediaItems = (urls) => urls.map(
  (u) => /\.(mp4|webm|ogg)$/i.test(u) ? { kind: "video", src: u } : { kind: "image", src: u }
);

// src/Gallery/fullscreen/defaults.ts
var DEFAULT_FULLSCREEN = {
  enabled: false,
  effects: {
    introDuration: 300,
    introEasing: "cubic-bezier(.4,0,.22,1)",
    introFade: false,
    slideFade: false,
    slideFadeDuration: 120,
    slideFadeEasing: "cubic-bezier(.4,0,.22,1)",
    thumbnailsFadeDuration: 300,
    thumbnailsFadeEasing: "cubic-bezier(.4,0,.22,1)"
  },
  slider: {
    duration: 25,
    friction: 0.68
  },
  zoom: {
    clickZoomLevel: 2.5,
    maxZoomLevel: 3,
    panDuration: 43,
    panFriction: 0.68
  }
};

// src/Gallery/slider/thumbnails/defaults.ts
var DEFAULT_THUMBNAILS = {
  layout: {
    position: "bottom",
    gap: 8,
    center: false
  },
  scroll: {
    freeScroll: true,
    groupCells: false,
    loop: false,
    skipSnaps: false,
    centerActiveThumb: false
  },
  motion: {
    selectDuration: 25,
    freeScrollDuration: 43,
    friction: 0.68
  }
};

// src/Gallery/slider/defaults.ts
var DEFAULT_SLIDER = {
  layout: { gap: 20 },
  direction: { dir: "ltr", axis: "x" },
  align: "start",
  scroll: {
    groupCells: false,
    skipSnaps: false,
    freeScroll: false,
    loop: false
  },
  lazyLoad: false,
  controls: {
    arrows: { enabled: true, arrow: {}, prev: {}, next: {} },
    dots: { enabled: true, root: {}, dot: {} },
    progress: { enabled: false, root: {}, bar: {} },
    ripple: { enabled: true, className: "" }
  },
  thumbnails: DEFAULT_THUMBNAILS,
  auto: {
    play: { enabled: false, speedMs: 3e3, pauseMs: 1e3, pauseOnHover: true },
    scroll: { enabled: false, speedMs: 3e3, pauseMs: 1e3, pauseOnHover: true }
  },
  motion: {
    selectDuration: 25,
    freeScrollDuration: 43,
    friction: 0.68
  }
};

// src/Gallery/grid/defaults.ts
var DEFAULT_GRID = {
  minColumnWidth: 160,
  gap: 8
};

// src/Gallery/masonry/defaults.ts
var DEFAULT_MASONRY = {
  placement: "balanced"
};
var FullscreenRuntime = React4__default.lazy(
  () => import('./FullscreenRuntime-KDMVGBKY.mjs')
);
var SliderRuntime = React4__default.lazy(
  () => import('./Slider-ARUPGDCX.mjs').then((m) => ({ default: m.default }))
);
var ThumbnailSliderRuntime = React4__default.lazy(
  () => import('./ThumbnailSlider-DWFG44X6.mjs').then((m) => ({ default: m.default }))
);
var GridLayoutRuntime = React4__default.lazy(
  () => import('./GridLayout-PI4MM7GH.mjs').then((m) => ({ default: m.GridLayout }))
);
var MasonryLayoutRuntime = React4__default.lazy(
  () => import('./MasonryLayout-4Z7Q5O2Y.mjs').then((m) => ({ default: m.MasonryLayout }))
);
var EntryListRuntime = React4__default.lazy(
  () => import('./entries-VXQBOWZW.mjs').then((m) => ({ default: m.EntryList }))
);
function useOpenEpoch(open) {
  const [epoch, setEpoch] = useState(0);
  const prev = useRef(open);
  useEffect(() => {
    if (open && !prev.current) setEpoch((e) => e + 1);
    prev.current = open;
  }, [open]);
  return epoch;
}
var Gallery = React4__default.forwardRef(function Gallery2({
  children,
  fullscreen,
  slider,
  layout = "slider",
  grid,
  masonry,
  entries,
  breakpoints,
  root,
  container
}, ref) {
  const indexChannel = useMemo(() => createIndexChannel(), []);
  const fsSub = useMemo(() => createFullscreenSliderSub(0), []);
  const [slideIndex, setSlideIndex] = useState(0);
  const isClick = useRef(false);
  const isZoomClick = useRef(false);
  const imageRefs = useRef([]);
  const [showFullscreenSlider, setShowFullscreenSlider] = useState(false);
  const fullscreenSliderApi = useRef(null);
  const isZooming = useRef(false);
  const expandableImgRefs = useRef([]);
  const overlayDivRef = useRef(null);
  const duplicateImgRef = useRef(null);
  const closeButtonRef = useRef(null);
  const counterRef = useRef(null);
  const leftChevronRef = useRef(null);
  const rightChevronRef = useRef(null);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [wrappedItems, setWrappedItems] = useState([]);
  const windowSize = useWindowSize();
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const previousZoom = useRef({ x: 0, y: 0 });
  const sliderForFullscreen = useRef(null);
  const slidesForFullscreen = useRef([]);
  const visibleImagesForFullscreen = useRef(1);
  const selectedIndexForFullscreen = useRef(0);
  const sliderXForFullscreen = useRef(0);
  const sliderVelocityForFullscreen = useRef(0);
  const isWrappingForFullscreen = useRef(false);
  const fsIndexRef = useRef(fsSub.get());
  const [fsFadeOpening, setFsFadeOpening] = useState(false);
  const entryMapRef = useRef(null);
  const entryFlatIndexRef = useRef(null);
  const fsOwnersRef = useRef([]);
  const [closingModal, setClosingModal] = useState(false);
  const changingSlides = useRef(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const isZoomedRef = useRef(false);
  const currentImage = useRef(null);
  const axisRef = useRef(null);
  const pointerDownRef = useRef(false);
  const interactionModeRef = useRef("idle");
  const locX = useRef(null);
  const locY = useRef(null);
  const prevX = useRef(null);
  const prevY = useRef(null);
  const offX = useRef(null);
  const offY = useRef(null);
  const tgtX = useRef(null);
  const tgtY = useRef(null);
  const sliderApiRef = useRef(null);
  const entrySliderRefs = useRef([]);
  const overlayCaptionRef = useRef(null);
  const overlayCaptionRootRef = useRef(null);
  const fsThumbContainerRef = useRef(null);
  const epoch = useOpenEpoch(showFullscreenModal);
  const [isReady, setIsReady] = useState(false);
  const suppressLoopRef = useRef(false);
  const shieldCleanupRef = React4__default.useRef(null);
  const shieldRef = useRef(null);
  const bodyX = useRef(null);
  const bodyY = useRef(null);
  const boundsX = useRef(null);
  const boundsY = useRef(null);
  const isAnimatingRef = useRef(false);
  const animRef = useRef(null);
  const wrappedModePlyrRefs = useRef([]);
  const singleModePlyrRefs = useRef([]);
  const suppressNextClickRef = useRef(false);
  const cells = useRef([]);
  const [fsIntroReq, setFsIntroReq] = useState(null);
  const requestFsCloseRef = React4__default.useRef(null);
  const idSeqRef = useRef(0);
  const asArray = (x) => Array.isArray(x) ? x : [x];
  const newId = useCallback(() => `rmg-${++idSeqRef.current}`, []);
  const effectiveBreakpoints = useMemo(
    () => ({ ...BREAKPOINT_MAP, ...breakpoints || {} }),
    [breakpoints]
  );
  const fs = {
    ...DEFAULT_FULLSCREEN,
    ...fullscreen ?? {},
    slider: { ...DEFAULT_FULLSCREEN.slider, ...fullscreen?.slider ?? {} },
    zoom: { ...DEFAULT_FULLSCREEN.zoom, ...fullscreen?.zoom ?? {} },
    effects: { ...DEFAULT_FULLSCREEN.effects, ...fullscreen?.effects ?? {} },
    controls: { ...fullscreen?.controls ?? {} }
  };
  const sliderObject = {
    ...DEFAULT_SLIDER,
    ...slider ?? {},
    layout: { ...DEFAULT_SLIDER.layout, ...slider?.layout ?? {} },
    direction: { ...DEFAULT_SLIDER.direction, ...slider?.direction ?? {} },
    align: slider?.align ?? DEFAULT_SLIDER.align,
    scroll: { ...DEFAULT_SLIDER.scroll, ...slider?.scroll ?? {} },
    controls: {
      ...DEFAULT_SLIDER.controls,
      ...slider?.controls ?? {},
      arrows: {
        ...DEFAULT_SLIDER.controls.arrows,
        ...slider?.controls?.arrows ?? {},
        arrow: {
          ...DEFAULT_SLIDER.controls.arrows.arrow,
          ...slider?.controls?.arrows?.arrow ?? {}
        },
        prev: {
          ...DEFAULT_SLIDER.controls.arrows.prev,
          ...slider?.controls?.arrows?.prev ?? {}
        },
        next: {
          ...DEFAULT_SLIDER.controls.arrows.next,
          ...slider?.controls?.arrows?.next ?? {}
        }
      },
      dots: {
        ...DEFAULT_SLIDER.controls.dots,
        ...slider?.controls?.dots ?? {},
        root: {
          ...DEFAULT_SLIDER.controls.dots.root,
          ...slider?.controls?.dots?.root ?? {}
        },
        dot: {
          ...DEFAULT_SLIDER.controls.dots.dot,
          ...slider?.controls?.dots?.dot ?? {}
        }
      },
      progress: {
        ...DEFAULT_SLIDER.controls.progress,
        ...slider?.controls?.progress ?? {},
        root: {
          ...DEFAULT_SLIDER.controls.progress.root,
          ...slider?.controls?.progress?.root ?? {}
        },
        bar: {
          ...DEFAULT_SLIDER.controls.progress.bar,
          ...slider?.controls?.progress?.bar ?? {}
        }
      },
      ripple: {
        ...DEFAULT_SLIDER.controls.ripple,
        ...slider?.controls?.ripple ?? {}
      }
    },
    thumbnails: { ...DEFAULT_SLIDER.thumbnails, ...slider?.thumbnails ?? {} },
    lazyLoad: slider?.lazyLoad ?? DEFAULT_SLIDER.lazyLoad,
    auto: {
      ...DEFAULT_SLIDER.auto,
      ...slider?.auto ?? {},
      play: { ...DEFAULT_SLIDER.auto.play, ...slider?.auto?.play ?? {} },
      scroll: { ...DEFAULT_SLIDER.auto.scroll, ...slider?.auto?.scroll ?? {} }
    },
    motion: { ...DEFAULT_SLIDER.motion, ...slider?.motion ?? {} }
  };
  const gridObject = {
    ...grid,
    minColumnWidth: grid?.minColumnWidth ?? DEFAULT_GRID.minColumnWidth,
    gap: grid?.gap ?? DEFAULT_GRID.gap
  };
  const masonryObject = {
    ...masonry,
    placement: masonry?.placement ?? DEFAULT_MASONRY.placement
  };
  const entriesObject = {
    ...entries,
    mediaLayout: entries?.mediaLayout ?? DEFAULT_ENTRIES.mediaLayout
  };
  const { flattenedEntryMedia, flattenedEntryMap } = useMemo(() => {
    if (!entriesObject.items || entriesObject.items.length === 0) {
      entryFlatIndexRef.current = null;
      fsOwnersRef.current = [];
      return {
        flattenedEntryMedia: null,
        flattenedEntryMap: null
      };
    }
    const media = [];
    const map = [];
    const indexByEntry = [];
    const owners = [];
    entriesObject.items.forEach((ent, rIdx) => {
      indexByEntry[rIdx] = [];
      (ent.media ?? []).forEach((m, mIdx) => {
        const flatIndex = media.length;
        media.push(m);
        map.push({ entryIndex: rIdx, mediaIndex: mIdx });
        owners.push({ entryIndex: rIdx });
        indexByEntry[rIdx][mIdx] = flatIndex;
      });
    });
    entryFlatIndexRef.current = indexByEntry;
    fsOwnersRef.current = owners;
    return { flattenedEntryMedia: media, flattenedEntryMap: map };
  }, [entries]);
  function nodeFromMedia(m) {
    if (m.kind === "image") return /* @__PURE__ */ jsx("img", { src: m.src, alt: m.alt ?? "" });
    if (m.kind === "video") {
      return /* @__PURE__ */ jsx("video", { src: m.src, controls: true, preload: "metadata" });
    }
    return null;
  }
  const initialCells = useMemo(() => {
    const kids = React4__default.Children.toArray(children);
    if (kids.length > 0) return kids.map((n) => ({ id: newId(), node: n }));
    if (flattenedEntryMedia && flattenedEntryMedia.length && flattenedEntryMap) {
      const cells2 = [];
      const links = [];
      flattenedEntryMedia.forEach((m, flatIdx) => {
        const link = flattenedEntryMap[flatIdx];
        if (!link) return;
        const entry = entriesObject.items?.[link.entryIndex];
        if (!entry) return;
        const node = typeof entriesObject.render?.media === "function" ? entriesObject.render.media({
          entry,
          entryIndex: link.entryIndex,
          media: m,
          mediaIndex: link.mediaIndex
        }) : nodeFromMedia(m);
        cells2.push({ id: newId(), node });
        links.push(link);
      });
      entryMapRef.current = links;
      return cells2;
    }
    if (normalizedItems.length) {
      return normalizedItems.map((mi) => ({ id: newId(), node: nodeFromMedia(mi) }));
    }
    return [];
  }, []);
  const cellsRef = React4__default.useRef(initialCells);
  const [cellsState, setCellsState] = React4__default.useState(initialCells);
  const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");
  const normalizeFsItems = (v) => {
    if (!v || !v.length) return [];
    return isStringArray(v) ? toMediaItems(v) : v;
  };
  const [normalizedItems, setNormalizedItems] = useState(() => {
    const fs2 = normalizeFsItems(fullscreen?.items);
    if (fs2.length) return fs2;
    if (flattenedEntryMedia?.length) return flattenedEntryMedia;
    return [];
  });
  function usePredecodeImages(urls, enabled) {
    const [ready, setReady] = useState(
      !enabled || urls.length === 0
    );
    useEffect(() => {
      if (!enabled || !urls.length) {
        setReady(true);
        return;
      }
      let cancelled = false;
      setReady(false);
      const decodeUrl = (url) => new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        const hasDecode = typeof img.decode === "function";
        if (hasDecode) {
          img.decode().catch(() => {
          }).finally(() => {
            if (!cancelled) resolve();
          });
        } else {
          if (img.complete) {
            if (!cancelled) resolve();
            return;
          }
          const done = () => {
            img.onload = null;
            img.onerror = null;
            if (!cancelled) resolve();
          };
          img.onload = done;
          img.onerror = done;
        }
      });
      (async () => {
        for (const url of urls) {
          if (cancelled) break;
          await decodeUrl(url);
        }
        if (!cancelled) {
          setReady(true);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [enabled, urls]);
    return ready;
  }
  const fullscreenImageUrls = useMemo(
    () => normalizedItems.filter((m) => m.kind === "image").map((m) => m.src),
    [normalizedItems]
  );
  usePredecodeImages(
    fullscreenImageUrls,
    fs.enabled
  );
  const sliderImageUrls = useMemo(
    () => normalizedItems.filter((m) => m.kind === "image").map((m) => m.src),
    [normalizedItems]
  );
  const sliderImagesReady = usePredecodeImages(
    sliderImageUrls,
    sliderImageUrls.length > 0
  );
  const setScale = useCallback((newScale) => {
    scaleRef.current = newScale;
    const prev = isZoomedRef.current;
    const next = newScale > 1.01;
    if (next !== prev) {
      isZoomedRef.current = next;
      setIsZoomed(next);
    }
  }, []);
  const attachEntrySliderRef = useCallback(
    (entryIndex) => (instance) => {
      entrySliderRefs.current[entryIndex] = instance;
    },
    []
  );
  function resolveFsCaptionPlacement(placement, breakpoint, viewportWidth2) {
    if (!placement) return null;
    if (breakpoint != null && viewportWidth2 < breakpoint) {
      return "bottom";
    }
    return placement;
  }
  function isForwardRefType(t) {
    return t && typeof t === "object" && "render" in t;
  }
  function cellsToMediaItems(next) {
    const extract = (node) => {
      if (!React4__default.isValidElement(node)) return null;
      const n = node;
      const p = n.props ?? {};
      const keyStr = String(n.key ?? "");
      const decodedKey = keyStr.replace(/=2/g, ":").replace(/=0/g, "=");
      const cleanedKey = decodedKey.replace(/^\.\$/, "");
      if (typeof n.type === "string" && n.type.toLowerCase() === "img") {
        const src = p.src ?? "";
        if (!src) return null;
        return { kind: "image", src, alt: p.alt ?? "" };
      }
      const videoMatch = cleanedKey.match(/https?:\/\/[^\s'")]+?\.(mp4|webm|mov|m4v)(\?|#|$)/i);
      if (videoMatch) {
        return { kind: "video", src: videoMatch[0], alt: p.alt ?? "", thumb: p.src ?? "" };
      }
      if (typeof n.type === "string" && n.type.toLowerCase() === "video") {
        const src = p.src ?? "";
        if (!src) return null;
        return { kind: "video", src, alt: p.alt ?? "", thumb: p.thumb ?? p.poster ?? "" };
      }
      const t = n.type;
      if (isForwardRefType(t)) {
        try {
          return extract(t.render(p, null));
        } catch {
        }
      }
      if (typeof t === "function" && !t.prototype?.isReactComponent) {
        try {
          return extract(t(p));
        } catch {
        }
      }
      if (p.children) {
        for (const child of React4__default.Children.toArray(p.children)) {
          const res = extract(child);
          if (res) return res;
        }
      }
      return null;
    };
    const out = [];
    for (const cell of next) {
      const media = extract(cell.node);
      if (media) out.push(media);
    }
    return out;
  }
  function commit(next, opts) {
    cellsRef.current = next;
    setCellsState(next);
    setNormalizedItems(() => {
      const fromCells = cellsToMediaItems(next);
      if (fromCells.length) return fromCells;
      const fs2 = normalizeFsItems(fullscreen?.items);
      if (fs2.length) return fs2;
      if (flattenedEntryMedia?.length) return flattenedEntryMedia;
      return [];
    });
    if (!next.length) {
      indexChannel.set(0, "instant");
      return;
    }
    if (opts?.adjustIndex) {
      const cur = sliderApiRef.current?.getIndex() ?? 0;
      const adj = opts.adjustIndex(cur);
      if (adj !== cur) sliderApiRef.current?.setIndex(adj, "instant");
    }
  }
  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }
  function append(nodes) {
    const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
    const next = [...cellsRef.current, ...add];
    commit(next);
    return next.length;
  }
  function prepend(nodes) {
    const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
    const prevLen = cellsRef.current.length;
    const addLen = add.length;
    commit([...add, ...cellsRef.current], {
      adjustIndex: (cur) => clamp(cur + addLen, 0, prevLen + addLen - 1)
    });
    return prevLen + addLen;
  }
  function insert(index, nodes) {
    const arr = cellsRef.current.slice();
    const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
    const to = clamp(index | 0, 0, arr.length);
    const next = [...arr.slice(0, to), ...add, ...arr.slice(to)];
    const addLen = add.length;
    commit(next, {
      adjustIndex: (cur) => cur >= to ? cur + addLen : cur
    });
    return next.length;
  }
  function remove(indexOrPredicate) {
    const arr = cellsRef.current;
    if (!arr.length) return 0;
    let predicate;
    if (typeof indexOrPredicate === "number") {
      const idx = clamp(indexOrPredicate, 0, arr.length - 1);
      predicate = (i) => i === idx;
    } else {
      predicate = indexOrPredicate;
    }
    const curIndex = sliderApiRef.current?.getIndex() ?? 0;
    const next = [];
    let removedBeforeOrAt = 0;
    arr.forEach((c, i) => {
      const isRemoved = predicate(i);
      if (!isRemoved) next.push(c);
      if (isRemoved && i <= curIndex) removedBeforeOrAt++;
    });
    commit(next, {
      adjustIndex: (cur) => clamp(cur - Math.max(0, removedBeforeOrAt), 0, Math.max(0, next.length - 1))
    });
    return next.length;
  }
  function replace(index, node) {
    const arr = cellsRef.current;
    if (!arr.length) return;
    const i = clamp(index | 0, 0, arr.length - 1);
    const keepId = arr[i].id;
    const next = arr.slice();
    next[i] = { id: keepId, node };
    commit(next);
  }
  function setItems(input) {
    let nextCells = [];
    const nodes = input ?? [];
    nextCells = nodes.map((n) => ({ id: newId(), node: n }));
    commit(nextCells, {
      adjustIndex: (cur) => clamp(cur, 0, Math.max(0, nextCells.length - 1))
    });
    return nextCells.length;
  }
  useImperativeHandle(ref, () => {
    return {
      rootNode() {
        return sliderApiRef.current?.getRootNode() ?? null;
      },
      containerNode() {
        return sliderApiRef.current?.getContainerNode() ?? null;
      },
      slideNodes() {
        return sliderApiRef.current?.getSlideNodes() ?? [];
      },
      onReady: (cb) => sliderApiRef.current?.onSlidesBuilt(cb) ?? (() => {
      }),
      whenReady: () => sliderApiRef.current?.whenSlidesBuilt() ?? Promise.resolve([]),
      isReady: () => sliderApiRef.current?.isSlidesBuilt() ?? false,
      scrollTo(index, jump) {
        const len = normalizedItems.length;
        if (!len) return;
        const cur = indexChannel.get().index ?? 0;
        const next = index;
        if (next === cur) return;
        indexChannel.set(next, jump ? "instant" : "animated");
      },
      scrollNext() {
        const api = sliderApiRef.current;
        if (!api) return;
        api.scrollNext();
      },
      scrollPrev() {
        const api = sliderApiRef.current;
        if (!api) return;
        api.scrollPrev();
      },
      canScrollNext() {
        return sliderApiRef.current?.canScrollNext() ?? false;
      },
      canScrollPrev() {
        return sliderApiRef.current?.canScrollPrev() ?? false;
      },
      cellsInView() {
        return sliderApiRef.current?.cellsInView() ?? [];
      },
      scrollProgress() {
        return sliderApiRef.current?.scrollProgress() ?? 0;
      },
      selectCell(index, jump) {
        const sliderApi = sliderApiRef.current;
        const lenCells = normalizedItems.length;
        if (!sliderApi || !lenCells) return;
        const slideIdx = sliderApi.slideIndexForCell ? sliderApi.slideIndexForCell(index) : (index % lenCells + lenCells) % lenCells;
        const cur = indexChannel.get().index ?? 0;
        const next = slideIdx;
        if (!sliderObject.scroll.loop && next === cur) return;
        if (next !== cur) {
          indexChannel.set(next, jump ? "instant" : "animated");
        }
      },
      getIndex() {
        return indexChannel.get().index ?? 0;
      },
      onIndexChange(cb) {
        const off = indexChannel.onEvent((ev) => {
          if (ev.type === "set" || ev.type === "bump") {
            cb(indexChannel.get().index, { mode: ev.mode });
          }
        });
        return off;
      },
      append,
      prepend,
      insert,
      remove,
      replace,
      setItems
    };
  }, [indexChannel, cellsState.length, sliderObject.scroll.loop]);
  const renderedCells = React4__default.useMemo(() => {
    return cellsState.map((c) => {
      const n = c.node;
      return React4__default.isValidElement(n) ? React4__default.cloneElement(n, { key: c.id }) : /* @__PURE__ */ jsx("span", { style: { display: "block" }, children: n }, c.id);
    });
  }, [cellsState]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(1e4);
  }, []);
  const addShield = useCallback((timeoutMs) => {
    shieldCleanupRef.current?.();
    const teardown = shieldRef.current?.add(timeoutMs);
    shieldCleanupRef.current = teardown ?? null;
  }, []);
  const openFullscreenAt = useCallback(
    (gridIndex, originEl) => {
      if (!fs.enabled) return;
      if (layout === "entries" && entriesObject.mediaLayout === "slider" && entryMapRef.current) {
        const link = entryMapRef.current[gridIndex];
        if (link) {
          const { entryIndex } = link;
          const entryHandle = entrySliderRefs.current[entryIndex];
          const internals = entryHandle?.getInternals?.();
          const ownerSlider = entrySliderRefs.current[entryIndex];
          const sel = internals?.selectedIndex?.current;
          if (ownerSlider && typeof ownerSlider.setIndex === "function" && typeof sel === "number") {
            ownerSlider.setIndex(sel, "animated");
          }
        }
      }
      const imageCount = normalizedItems.length;
      if (!imageCount) return;
      let imgEl = null;
      if (originEl) {
        imgEl = originEl.tagName === "IMG" ? originEl : originEl.querySelector("img");
      }
      if (!imgEl) {
        imgEl = expandableImgRefs.current[gridIndex] ?? null;
      }
      if (!imgEl) return;
      let fullscreenIndex = gridIndex;
      if (layout === "grid" || layout === "masonry") fullscreenIndex = gridIndex;
      isClick.current = true;
      setShowFullscreenModal(true);
      setFsIntroReq({
        origImg: imgEl,
        index: fullscreenIndex,
        closestSelector: ".rmg__grid-item"
      });
      setSlideIndex(fullscreenIndex);
    },
    [fs.enabled, normalizedItems.length, layout, entriesObject.mediaLayout]
  );
  function registerExpandableImg(index, node) {
    if (!node) {
      expandableImgRefs.current[index] = null;
      return;
    }
    let img = null;
    if (node.tagName === "IMG") {
      img = node;
    } else {
      img = node.querySelector("img");
    }
    expandableImgRefs.current[index] = img;
  }
  const viewportWidth = useViewportWidth();
  const gridLoading = useMemo(() => normalizeLoading(gridObject.loading), [gridObject.loading]);
  const gridIntro = useMemo(() => normalizeIntro(gridObject.intro), [gridObject.intro]);
  const masonryLoading = useMemo(() => normalizeLoading(masonryObject.loading), [masonryObject.loading]);
  const masonryIntro = useMemo(() => normalizeIntro(masonryObject.intro), [masonryObject.intro]);
  const resolvedCellsPerSlide = useMemo(() => {
    if (layout !== "slider") return void 0;
    const hasCellsPerSlideProp = sliderObject.layout.cellsPerSlide != null;
    if (!hasCellsPerSlideProp) {
      return void 0;
    }
    const source = hasCellsPerSlideProp ? sliderObject.layout.cellsPerSlide : void 0;
    const raw = resolveNumberFromResponsive(
      source,
      1,
      viewportWidth,
      effectiveBreakpoints
    );
    const n = Math.max(1, raw | 0);
    return n;
  }, [sliderObject.layout.cellsPerSlide, viewportWidth, effectiveBreakpoints, layout]);
  const hasUserCellsPerSlide = sliderObject.layout.cellsPerSlide != null;
  const sliderResponsiveColumns = hasUserCellsPerSlide && typeof resolvedCellsPerSlide === "number" ? resolvedCellsPerSlide : void 0;
  const resolvedGap = useMemo(() => {
    const raw = resolveNumberFromResponsive(
      sliderObject.layout.gap,
      20,
      viewportWidth,
      effectiveBreakpoints
    );
    return Math.max(0, raw | 0);
  }, [sliderObject.layout.gap, viewportWidth, effectiveBreakpoints]);
  const fsEnabled = fs.enabled;
  const openFullscreenAtStable = useCallback(
    (index) => {
      openFullscreenAt(index);
    },
    [openFullscreenAt]
  );
  const registerExpandableImgStable = useCallback(
    (index, node) => {
      registerExpandableImg(index, node);
    },
    [registerExpandableImg]
  );
  const itemClassName = masonryObject.classNames?.item ?? "";
  const masonryChildren = useMemo(() => {
    return buildMasonryChildren({
      cells: cellsState,
      fsEnabled,
      openFullscreenAt: openFullscreenAtStable,
      registerExpandableImg: registerExpandableImgStable,
      itemBaseClass: "rmg__masonry-item",
      itemBaseStyleClass: "",
      itemClassName
    });
  }, [
    cellsState,
    fsEnabled,
    openFullscreenAtStable,
    registerExpandableImgStable,
    itemClassName
  ]);
  function getSliderHandleForFullscreen() {
    const idx = fsIndexRef.current;
    if (layout === "entries" && entriesObject.items?.length && fsOwnersRef.current.length) {
      const owner = fsOwnersRef.current[idx];
      if (!owner) return null;
      return entrySliderRefs.current[owner.entryIndex] ?? null;
    }
    return sliderApiRef.current ?? null;
  }
  const centerSliderForFullscreen = () => {
    const handle = getSliderHandleForFullscreen();
    handle?.centerSlider?.();
  };
  const setSliderIndexForFullscreen = (index, mode) => {
    const handle = getSliderHandleForFullscreen();
    handle?.setIndex?.(index, mode);
  };
  const flexDirection = fs.thumbnails?.layout?.position === "left" ? "row-reverse" : fs.thumbnails?.layout?.position === "right" ? "row" : fs.thumbnails?.layout?.position === "top" ? "column-reverse" : "column";
  const fsThumbsOpen = showFullscreenModal && !closingModal;
  const fsThumbFadeDuration = fs.effects.thumbnailsFadeDuration;
  const fsThumbFadeEasing = fs.effects.thumbnailsFadeEasing;
  const vw = useViewportWidth();
  const resolvedThumbPos = useMemo(() => {
    if (!slider?.thumbnails?.layout?.position) return void 0;
    return resolvePositionFromResponsive(
      slider?.thumbnails?.layout?.position,
      "bottom",
      vw,
      effectiveBreakpoints
    );
  }, [slider?.thumbnails?.layout?.position, vw, effectiveBreakpoints]);
  const fsResolvedThumbPos = useMemo(
    () => resolvePositionFromResponsive(
      fs.thumbnails?.layout?.position,
      "bottom",
      vw,
      effectiveBreakpoints
    ),
    [fs.thumbnails?.layout?.position, vw, effectiveBreakpoints]
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: root?.className, style: root?.style, children: [
      layout === "slider" && (resolvedThumbPos === "top" || resolvedThumbPos === "left") && /* @__PURE__ */ jsx(
        ThumbnailSliderRuntime,
        {
          indexChannel,
          position: resolvedThumbPos,
          thumbnailWidth: sliderObject.thumbnails.layout?.thumbnail?.width,
          thumbnailHeight: sliderObject.thumbnails.layout?.thumbnail?.height,
          thumbnailsCenter: sliderObject.thumbnails.layout?.center,
          thumbnailsContainerWidth: sliderObject.thumbnails.layout?.container?.width,
          thumbnailsContainerHeight: sliderObject.thumbnails.layout?.container?.height,
          thumbnailsContainerStyle: sliderObject.thumbnails.elements?.container?.style,
          thumbnailsContainerClassName: sliderObject.thumbnails.elements?.container?.className,
          thumbnailItemStyle: sliderObject.thumbnails.elements?.thumbnail?.style,
          thumbnailItemClassName: sliderObject.thumbnails.elements?.thumbnail?.className,
          gap: sliderObject.thumbnails.layout?.gap,
          freeScroll: sliderObject.thumbnails.scroll?.freeScroll,
          groupCells: sliderObject.thumbnails.scroll?.groupCells,
          loop: sliderObject.thumbnails.scroll?.loop,
          skipSnaps: sliderObject.thumbnails.scroll?.skipSnaps,
          centerActiveThumb: sliderObject.thumbnails.scroll?.centerActiveThumb,
          selectDuration: sliderObject.thumbnails.motion?.selectDuration,
          freeScrollDuration: sliderObject.thumbnails.motion?.freeScrollDuration,
          sliderFriction: sliderObject.thumbnails.motion?.friction,
          loadingOptions: sliderObject.thumbnails.transitions?.loading,
          introOptions: sliderObject.thumbnails.transitions?.intro,
          breakpointMap: sliderObject.thumbnails.breakpointMap,
          rippleEnabled: sliderObject.thumbnails.controls?.ripple?.enabled,
          rippleClassName: sliderObject.thumbnails.controls?.ripple?.className,
          showArrows: sliderObject.thumbnails.controls?.enabled,
          arrowStyles: sliderObject.thumbnails.controls?.arrow?.style,
          arrowClassName: sliderObject.thumbnails.controls?.arrow?.className,
          prevArrowStyles: sliderObject.thumbnails.controls?.prev?.style,
          prevArrowClassName: sliderObject.thumbnails.controls?.prev?.className,
          nextArrowStyles: sliderObject.thumbnails.controls?.next?.style,
          nextArrowClassName: sliderObject.thumbnails.controls?.next?.className,
          renderArrows: sliderObject.thumbnails.controls?.render,
          renderPrevArrow: sliderObject.thumbnails.controls?.renderPrev,
          renderNextArrow: sliderObject.thumbnails.controls?.renderNext,
          children: sliderObject.thumbnails.children
        }
      ),
      /* @__PURE__ */ jsx("div", { className: container?.className, style: container?.style, children: layout === "slider" ? /* @__PURE__ */ jsx(
        SliderRuntime,
        {
          imageCount: cellsState.length,
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
          loop: sliderObject.scroll.loop,
          freeScroll: sliderObject.scroll.freeScroll,
          autoPlay: sliderObject.auto.play.enabled,
          autoPlaySpeed: sliderObject.auto.play.speedMs,
          autoPlayPause: sliderObject.auto.play.pauseMs,
          autoScroll: sliderObject.auto.scroll.enabled,
          autoScrollSpeed: sliderObject.auto.scroll.speedMs,
          autoScrollPause: sliderObject.auto.scroll.pauseMs,
          pauseAutoPlayOnHover: sliderObject.auto.play.pauseOnHover,
          pauseAutoScrollOnHover: sliderObject.auto.scroll.pauseOnHover,
          groupCells: sliderObject.scroll.groupCells,
          centerAlign: sliderObject.align === "center",
          gap: resolvedGap,
          sliderViewportStyles: sliderObject.elements?.viewport?.style,
          sliderViewportClassName: sliderObject.elements?.viewport?.className,
          sliderContainerStyles: sliderObject.elements?.container?.style,
          sliderContainerClassName: sliderObject.elements?.container?.className,
          sliderHeight: sliderObject.size?.height,
          responsiveHeights: sliderObject.size?.heightRules,
          arrowStyles: sliderObject.controls.arrows.arrow.style,
          arrowClassName: sliderObject.controls.arrows.arrow.className,
          prevArrowStyles: sliderObject.controls.arrows.prev.style,
          prevArrowClassName: sliderObject.controls.arrows.prev.className,
          nextArrowStyles: sliderObject.controls.arrows.next.style,
          nextArrowClassName: sliderObject.controls.arrows.next.className,
          dotsContainerStyles: sliderObject.controls.dots.root.style,
          dotsContainerClassName: sliderObject.controls.dots.root.className,
          dotsStyles: sliderObject.controls.dots.dot.style,
          dotsClassName: sliderObject.controls.dots.dot.className,
          renderArrows: sliderObject.controls.arrows.render,
          renderPrevArrow: sliderObject.controls.arrows.renderPrev,
          renderNextArrow: sliderObject.controls.arrows.renderNext,
          renderDots: sliderObject.controls.dots.render,
          showArrows: sliderObject.controls.arrows.enabled,
          showDots: sliderObject.controls.dots.enabled,
          enableFullscreen: fs.enabled,
          showProgress: sliderObject.controls.progress.enabled,
          progressClassName: sliderObject.controls.progress.root.className,
          progressStyle: sliderObject.controls.progress.root.style,
          progressInnerClassName: sliderObject.controls.progress.bar.className,
          progressInnerStyle: sliderObject.controls.progress.bar.style,
          renderProgress: sliderObject.controls.progress.render,
          fullscreenControls: {
            close: fs.controls.close,
            arrows: {
              arrow: fs.controls.arrows?.arrow,
              prev: fs.controls.arrows?.prev,
              next: fs.controls.arrows?.next
            },
            counter: fs.controls.counter
          },
          showFsArrows: fs.controls.arrows?.enabled,
          showFsClose: fs.controls.close?.enabled,
          renderFsClose: fs.controls.close?.render,
          renderFsArrows: fs.controls.arrows?.render,
          renderFsPrev: fs.controls.arrows?.renderPrev,
          renderFsNext: fs.controls.arrows?.renderNext,
          showFsCounter: fs.controls.counter?.enabled,
          renderFsCounter: fs.controls.counter?.render,
          parallax: sliderObject.effects?.parallax?.enabled,
          parallaxBleedPct: sliderObject.effects?.parallax?.bleedPct,
          parallaxBorderRadius: sliderObject.effects?.parallax?.borderRadius,
          parallaxSideWidth: sliderObject.effects?.parallax?.sideWidth,
          ref: sliderApiRef,
          scaleEffect: sliderObject.effects?.scale?.enabled,
          scaleAmount: sliderObject.effects?.scale?.amount,
          fadeEffect: sliderObject.effects?.fade?.enabled,
          initialHeight: sliderObject.size?.initialHeight,
          cellsPerSlide: sliderResponsiveColumns,
          direction: sliderObject.direction.dir,
          axis: sliderObject.direction.axis,
          skipSnaps: sliderObject.scroll.skipSnaps,
          selectDuration: sliderObject.motion.selectDuration,
          freeScrollDuration: sliderObject.motion.freeScrollDuration,
          sliderFriction: sliderObject.motion.friction,
          indexChannel,
          loadingOptions: sliderObject.transitions?.loading,
          introOptions: sliderObject.transitions?.intro,
          lazyLoad: sliderObject.lazyLoad,
          rippleEnabled: sliderObject.controls.ripple.enabled,
          rippleClassName: sliderObject.controls.ripple.className,
          fsCaptionPlacement: fs.caption?.placement,
          fsCaptionWidth: fs.caption?.width,
          fsCaptionHeight: fs.caption?.height,
          fsCaptionBreakpoint: fs.caption?.breakpoint,
          renderFsCaption: fs.caption?.render,
          normalizedItems,
          fsThumbContainerRef,
          fullscreenThumbnails: fsResolvedThumbPos,
          sliderImagesReady,
          fullscreenIntroFade: fs.effects.introFade,
          setFsFadeOpening,
          breakpointMap: effectiveBreakpoints,
          fsIntroDuration: fs.effects.introDuration,
          fsIntroEasing: fs.effects.introEasing,
          children: renderedCells
        }
      ) : layout === "masonry" ? /* @__PURE__ */ jsx(
        MasonryLayoutRuntime,
        {
          items: masonryChildren,
          masonry: masonryObject,
          breakpoints: effectiveBreakpoints,
          viewportWidth,
          loading: masonryLoading,
          intro: masonryIntro,
          skeletonCount: cellsState.length
        }
      ) : layout === "entries" ? /* @__PURE__ */ jsx(
        EntryListRuntime,
        {
          enabled: layout === "entries",
          entries: entriesObject,
          fsEnabled: !!fs.enabled,
          openFullscreenAt,
          entryFlatIndexRef,
          nodeFromMedia,
          isClickRef: isClick,
          registerExpandableImg,
          renderMediaContainer: ({ entryIndex, mediaNodes }) => {
            if (entriesObject.mediaLayout === "masonry") {
              return /* @__PURE__ */ jsx("div", { className: Gallery_default.entryMasonry, children: /* @__PURE__ */ jsx(
                MasonryLayoutRuntime,
                {
                  items: mediaNodes,
                  masonry: masonryObject,
                  breakpoints: effectiveBreakpoints,
                  viewportWidth,
                  loading: masonryLoading,
                  intro: masonryIntro,
                  skeletonCount: mediaNodes.length
                }
              ) });
            }
            if (entriesObject.mediaLayout === "slider") {
              return /* @__PURE__ */ jsx(
                SliderRuntime,
                {
                  imageCount: mediaNodes.length,
                  isClick,
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
                  isReady: true,
                  setIsReady: () => {
                  },
                  loadingOptions: { isLoading: false },
                  loop: sliderObject.scroll.loop,
                  freeScroll: sliderObject.scroll.freeScroll,
                  autoPlay: sliderObject.auto.play.enabled,
                  autoPlaySpeed: sliderObject.auto.play.speedMs ?? 3e3,
                  autoPlayPause: sliderObject.auto.play.pauseMs ?? 1e3,
                  autoScroll: sliderObject.auto.scroll.enabled,
                  autoScrollSpeed: sliderObject.auto.scroll.speedMs ?? 3e3,
                  autoScrollPause: sliderObject.auto.scroll.pauseMs ?? 1e3,
                  pauseAutoPlayOnHover: sliderObject.auto.play.pauseOnHover,
                  pauseAutoScrollOnHover: sliderObject.auto.scroll.pauseOnHover,
                  groupCells: sliderObject.scroll.groupCells,
                  centerAlign: sliderObject.align === "center",
                  gap: resolvedGap,
                  sliderViewportStyles: sliderObject.elements?.viewport?.style,
                  sliderViewportClassName: sliderObject.elements?.viewport?.className,
                  sliderContainerStyles: sliderObject.elements?.container?.style,
                  sliderContainerClassName: sliderObject.elements?.container?.className,
                  sliderHeight: sliderObject.size?.height,
                  responsiveHeights: sliderObject.size?.heightRules,
                  arrowStyles: sliderObject.controls.arrows.arrow.style,
                  arrowClassName: sliderObject.controls.arrows.arrow.className,
                  prevArrowStyles: sliderObject.controls.arrows.prev.style,
                  prevArrowClassName: sliderObject.controls.arrows.prev.className,
                  nextArrowStyles: sliderObject.controls.arrows.next.style,
                  nextArrowClassName: sliderObject.controls.arrows.next.className,
                  dotsContainerStyles: sliderObject.controls.dots.root.style,
                  dotsContainerClassName: sliderObject.controls.dots.root.className,
                  dotsStyles: sliderObject.controls.dots.dot.style,
                  dotsClassName: sliderObject.controls.dots.dot.className,
                  renderArrows: sliderObject.controls.arrows.render,
                  renderPrevArrow: sliderObject.controls.arrows.renderPrev,
                  renderNextArrow: sliderObject.controls.arrows.renderNext,
                  renderDots: sliderObject.controls.dots.render,
                  showArrows: sliderObject.controls.arrows.enabled,
                  showDots: sliderObject.controls.dots.enabled,
                  enableFullscreen: fs.enabled,
                  showProgress: sliderObject.controls.progress.enabled,
                  progressClassName: sliderObject.controls.progress.root.className,
                  progressStyle: sliderObject.controls.progress.root.style,
                  progressInnerClassName: sliderObject.controls.progress.bar.className,
                  progressInnerStyle: sliderObject.controls.progress.bar.style,
                  renderProgress: sliderObject.controls.progress.render,
                  fullscreenControls: {
                    close: fs.controls.close,
                    arrows: {
                      arrow: fs.controls.arrows?.arrow,
                      prev: fs.controls.arrows?.prev,
                      next: fs.controls.arrows?.next
                    },
                    counter: fs.controls.counter
                  },
                  showFsArrows: fs.controls.arrows?.enabled,
                  showFsClose: fs.controls.close?.enabled,
                  renderFsClose: fs.controls.close?.render,
                  renderFsArrows: fs.controls.arrows?.render,
                  renderFsPrev: fs.controls.arrows?.renderPrev,
                  renderFsNext: fs.controls.arrows?.renderNext,
                  showFsCounter: fs.controls.counter?.enabled,
                  renderFsCounter: fs.controls.counter?.render,
                  parallax: sliderObject.effects?.parallax?.enabled,
                  parallaxBleedPct: sliderObject.effects?.parallax?.bleedPct,
                  parallaxBorderRadius: sliderObject.effects?.parallax?.borderRadius,
                  parallaxSideWidth: sliderObject.effects?.parallax?.sideWidth,
                  ref: attachEntrySliderRef(entryIndex),
                  scaleEffect: sliderObject.effects?.scale?.enabled,
                  scaleAmount: sliderObject.effects?.scale?.amount,
                  fadeEffect: sliderObject.effects?.fade?.enabled,
                  initialHeight: sliderObject.size?.initialHeight,
                  cellsPerSlide: sliderResponsiveColumns,
                  direction: sliderObject.direction.dir,
                  axis: sliderObject.direction.axis,
                  skipSnaps: sliderObject.scroll.skipSnaps,
                  selectDuration: sliderObject.motion.selectDuration,
                  freeScrollDuration: sliderObject.motion.freeScrollDuration,
                  sliderFriction: sliderObject.motion.friction,
                  introOptions: sliderObject.transitions?.intro,
                  lazyLoad: sliderObject.lazyLoad,
                  rippleEnabled: sliderObject.controls.ripple.enabled,
                  rippleClassName: sliderObject.controls.ripple.className,
                  renderFsCaption: fs.caption?.render,
                  normalizedItems,
                  fsThumbContainerRef,
                  fullscreenThumbnails: fsResolvedThumbPos,
                  sliderImagesReady,
                  fullscreenIntroFade: fs.effects.introFade,
                  setFsFadeOpening,
                  breakpointMap: effectiveBreakpoints,
                  fsIntroDuration: fs.effects.introDuration,
                  fsIntroEasing: fs.effects.introEasing,
                  children: mediaNodes
                }
              );
            }
            const cells2 = mediaNodes.map((node, i) => ({
              id: `entry-${entryIndex}-media-${i}`,
              node
            }));
            return /* @__PURE__ */ jsx(
              GridLayoutRuntime,
              {
                cells: cells2,
                grid: {
                  ...gridObject,
                  rootClassName: [gridObject.rootClassName, Gallery_default.gridEntryRoot].filter(Boolean).join(" "),
                  itemClassName: [gridObject.itemClassName, Gallery_default.gridEntryItem].filter(Boolean).join(" ")
                },
                renderMode: "passthrough",
                gridItemBaseClass: "",
                breakpoints: effectiveBreakpoints,
                viewportWidth,
                loading: { isLoading: false },
                intro: gridIntro,
                enableFullscreen: false,
                onOpen: () => {
                },
                registerExpandableImg: () => {
                }
              }
            );
          }
        }
      ) : layout === "grid" ? /* @__PURE__ */ jsx(
        GridLayoutRuntime,
        {
          cells: cellsState,
          grid: gridObject,
          breakpoints: effectiveBreakpoints,
          viewportWidth,
          loading: gridLoading,
          intro: gridIntro,
          enableFullscreen: !!fs.enabled,
          onOpen: openFullscreenAt,
          registerExpandableImg
        }
      ) : null }),
      layout === "slider" && (resolvedThumbPos === "bottom" || resolvedThumbPos === "right") && /* @__PURE__ */ jsx(
        ThumbnailSliderRuntime,
        {
          indexChannel,
          position: resolvedThumbPos,
          thumbnailWidth: sliderObject.thumbnails.layout?.thumbnail?.width,
          thumbnailHeight: sliderObject.thumbnails.layout?.thumbnail?.height,
          thumbnailsCenter: sliderObject.thumbnails.layout?.center,
          thumbnailsContainerWidth: sliderObject.thumbnails.layout?.container?.width,
          thumbnailsContainerHeight: sliderObject.thumbnails.layout?.container?.height,
          thumbnailsContainerStyle: sliderObject.thumbnails.elements?.container?.style,
          thumbnailsContainerClassName: sliderObject.thumbnails.elements?.container?.className,
          thumbnailItemStyle: sliderObject.thumbnails.elements?.thumbnail?.style,
          thumbnailItemClassName: sliderObject.thumbnails.elements?.thumbnail?.className,
          gap: sliderObject.thumbnails.layout?.gap,
          freeScroll: sliderObject.thumbnails.scroll?.freeScroll,
          groupCells: sliderObject.thumbnails.scroll?.groupCells,
          loop: sliderObject.thumbnails.scroll?.loop,
          skipSnaps: sliderObject.thumbnails.scroll?.skipSnaps,
          centerActiveThumb: sliderObject.thumbnails.scroll?.centerActiveThumb,
          selectDuration: sliderObject.thumbnails.motion?.selectDuration,
          freeScrollDuration: sliderObject.thumbnails.motion?.freeScrollDuration,
          sliderFriction: sliderObject.thumbnails.motion?.friction,
          loadingOptions: sliderObject.thumbnails.transitions?.loading,
          introOptions: sliderObject.thumbnails.transitions?.intro,
          breakpointMap: sliderObject.thumbnails.breakpointMap,
          rippleEnabled: sliderObject.thumbnails.controls?.ripple?.enabled,
          rippleClassName: sliderObject.thumbnails.controls?.ripple?.className,
          showArrows: sliderObject.thumbnails.controls?.enabled,
          arrowStyles: sliderObject.thumbnails.controls?.arrow?.style,
          arrowClassName: sliderObject.thumbnails.controls?.arrow?.className,
          prevArrowStyles: sliderObject.thumbnails.controls?.prev?.style,
          prevArrowClassName: sliderObject.thumbnails.controls?.prev?.className,
          nextArrowStyles: sliderObject.thumbnails.controls?.next?.style,
          nextArrowClassName: sliderObject.thumbnails.controls?.next?.className,
          renderArrows: sliderObject.thumbnails.controls?.render,
          renderPrevArrow: sliderObject.thumbnails.controls?.renderPrev,
          renderNextArrow: sliderObject.thumbnails.controls?.renderNext,
          children: sliderObject.thumbnails.children
        }
      )
    ] }),
    fs.enabled && /* @__PURE__ */ jsx(React4__default.Suspense, { fallback: null, children: /* @__PURE__ */ jsx(
      FullscreenRuntime,
      {
        fsEnabled: fs.enabled,
        fsSub,
        showFullscreenModal,
        setShowFullscreenModal,
        setShowFullscreenSlider,
        showFullscreenSlider,
        epoch,
        isClick,
        isAnimatingRef,
        overlayDivRef,
        duplicateImgRef,
        cells,
        cellsStateLength: cellsState.length,
        slidesForFullscreen,
        sliderForFullscreen,
        visibleImagesForFullscreen,
        selectedIndexForFullscreen,
        sliderXForFullscreen,
        sliderVelocityForFullscreen,
        isWrappingForFullscreen,
        wrappedItems,
        setClosingModal,
        closingModal,
        closeButtonRef,
        counterRef,
        leftChevronRef,
        rightChevronRef,
        centerAlign: sliderObject.align === "center",
        centerSliderForFullscreen,
        setSliderIndexForFullscreen,
        layout,
        expandableImgRefs,
        entryMapRef,
        entryMediaLayout: entriesObject.mediaLayout,
        introFade: fs.effects.introFade,
        introDuration: fs.effects.introDuration,
        introEasing: fs.effects.introEasing,
        fullscreenSliderApi,
        slideIndex,
        isZoomClick,
        isZoomed,
        windowSize,
        handleZoomToggle,
        imageRefs,
        scale: scaleRef.current,
        isZooming,
        wrappedModePlyrRefs,
        singleModePlyrRefs,
        direction: sliderObject.direction.dir,
        sliderDuration: fs.slider.duration,
        sliderFriction: fs.slider.friction,
        suppressLoopRef,
        fsFadeOpening,
        slideFade: fs.effects.slideFade,
        slideFadeDuration: fs.effects.slideFadeDuration,
        slideFadeEasing: fs.effects.slideFadeEasing,
        normalizedItems,
        flexDirection,
        fsThumbContainerRef,
        fsThumbFadeDuration,
        fsThumbFadeEasing,
        fsThumbsOpen,
        fsResolvedThumbPos,
        fsThumbnailsPositionDefined: fs.thumbnails?.layout?.position !== void 0,
        fsThumbnailsContainerClassName: fs.thumbnails?.elements?.container?.className,
        fsThumbnailsContainerStyle: fs.thumbnails?.elements?.container?.style,
        fsThumbThumbnailWidth: fs.thumbnails?.layout?.thumbnail?.width,
        fsThumbThumbnailHeight: fs.thumbnails?.layout?.thumbnail?.height,
        fsThumbCenter: fs.thumbnails?.layout?.center,
        fsThumbContainerWidth: fs.thumbnails?.layout?.container?.width,
        fsThumbContainerHeight: fs.thumbnails?.layout?.container?.height,
        fsThumbGap: fs.thumbnails?.layout?.gap,
        fsThumbFreeScroll: fs.thumbnails?.scroll?.freeScroll,
        fsThumbGroupCells: fs.thumbnails?.scroll?.groupCells,
        fsThumbLoop: fs.thumbnails?.scroll?.loop,
        fsThumbSkipSnaps: fs.thumbnails?.scroll?.skipSnaps,
        fsThumbCenterActiveThumb: fs.thumbnails?.scroll?.centerActiveThumb,
        fsThumbSelectDuration: fs.thumbnails?.motion?.selectDuration,
        fsThumbFreeScrollDuration: fs.thumbnails?.motion?.freeScrollDuration,
        fsThumbFriction: fs.thumbnails?.motion?.friction,
        fsThumbBreakpointMap: fs.thumbnails?.breakpointMap,
        fsThumbRippleEnabled: fs.thumbnails?.controls?.ripple?.enabled,
        fsThumbRippleClassName: fs.thumbnails?.controls?.ripple?.className,
        fsThumbControlsEnabled: fs.thumbnails?.controls?.enabled,
        sliderThumbArrowStyles: sliderObject.thumbnails.controls?.arrow?.style,
        sliderThumbArrowClassName: sliderObject.thumbnails.controls?.arrow?.className,
        fsThumbPrevArrowStyles: fs.thumbnails?.controls?.prev?.style,
        fsThumbPrevArrowClassName: fs.thumbnails?.controls?.prev?.className,
        fsThumbNextArrowStyles: fs.thumbnails?.controls?.next?.style,
        fsThumbNextArrowClassName: fs.thumbnails?.controls?.next?.className,
        sliderThumbRenderArrows: sliderObject.thumbnails.controls?.render,
        fsThumbRenderPrevArrow: fs.thumbnails?.controls?.renderPrev,
        fsThumbRenderNextArrow: fs.thumbnails?.controls?.renderNext,
        showFsEntryOverlayMount: showFullscreenModal && layout === "entries",
        fsIntroReq,
        clearFsIntroReq: () => setFsIntroReq(null),
        styles: Gallery_default,
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
      }
    ) })
  ] });
});
var Gallery_default2 = Gallery;
var baseWrap = { width: "100%", height: "100%" };
var basePoster = {
  width: "100%",
  height: "100%",
  objectFit: "contain"
};
function RmgPlyrVideo(props) {
  const ctx = useRmgSlide();
  const isClone = ctx?.isClone ?? false;
  const index = ctx?.normIdx ?? 0;
  if (isClone) {
    return /* @__PURE__ */ jsx(
      "img",
      {
        src: props.poster || "",
        alt: props.alt ?? "",
        draggable: false,
        className: ["rmg__plyr__image", "rmg__plyr__video-preview", props.posterClassName].filter(Boolean).join(" "),
        style: { ...basePoster, ...props.posterStyle || {} }
      }
    );
  }
  const source = props.source ?? props.sourceBuilder?.({ src: props.src, poster: props.poster }) ?? {
    type: "video",
    sources: [{ src: props.src }],
    poster: props.poster
  };
  const options = typeof props.options === "function" ? props.options({ src: props.src, poster: props.poster, index }) : props.options;
  const provider = detectProvider(source);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: ["rmg__plyr__video", props.className].filter(Boolean).join(" "),
      style: { ...baseWrap, ...props.style || {} },
      "data-rmg-plyr": "true",
      "data-rmg-plyr-index": String(index),
      "data-rmg-plyr-provider": provider,
      children: /* @__PURE__ */ jsx(
        Plyr,
        {
          ref: (api) => {
            const apiOrNull = api ?? null;
            ctx?.registerPlyr?.(apiOrNull);
            props.onApi?.(apiOrNull);
            props.registerApiByIndex?.(index, apiOrNull);
            installDblclickGuardWhenReady(api);
          },
          source,
          options
        }
      )
    }
  );
}

export { Gallery_default2 as Gallery, RmgPlyrVideo };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map