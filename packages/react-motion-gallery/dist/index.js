"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Gallery: () => Gallery_default2,
  RmgPlyrVideo: () => RmgPlyrVideo
});
module.exports = __toCommonJS(index_exports);

// src/Gallery/index.tsx
var import_react6 = __toESM(require("react"));

// src/Gallery/fullscreen/FullscreenSlider.tsx
var import_react = require("react");

// src/Gallery/fullscreen/FullscreenSlider.module.css
var FullscreenSlider_default = {};

// src/Gallery/shared/input/dragTracker.ts
function createDragTracker(opts) {
  const {
    axis,
    ownerWindow,
    windowMs = 120,
    recentMs = 90,
    releaseFreshMs = 180,
    stillMs = 140,
    moveEps = 0.5,
    flickVel = 0.1,
    flickDist = 1,
    minVel = 0.06
  } = opts;
  const EPS = 1e-6;
  let samples = [];
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0, lastT = 0;
  let lastActiveT = 0;
  function now(evt) {
    const ts = evt.timeStamp;
    const perf = ownerWindow?.performance?.now ? ownerWindow.performance.now() : Date.now();
    return typeof ts === "number" && ts > 0 ? ts : perf;
  }
  function isMouse(evt) {
    return ownerWindow.MouseEvent ? evt instanceof ownerWindow.MouseEvent : "clientX" in evt && !("touches" in evt);
  }
  function readPoint(evt, axisKey = axis.scroll) {
    const coord = axisKey === "x" ? "clientX" : "clientY";
    if (isMouse(evt)) return evt[coord];
    const te = evt;
    const touch = te.touches && te.touches[0] || te.changedTouches && te.changedTouches[0];
    return touch ? touch[coord] : axisKey === "x" ? lastX : lastY;
  }
  function trimTo(t) {
    const earliest = t - windowMs * 1.5;
    while (samples.length && samples[0].t < earliest) samples.shift();
  }
  function velocityInWindow(endT, spanMs) {
    const startT = endT - spanMs;
    let sumDx = 0, sumDy = 0;
    let firstT = Number.POSITIVE_INFINITY, lastT2 = Number.NEGATIVE_INFINITY;
    for (let i = samples.length - 1; i >= 0; i--) {
      const s = samples[i];
      if (s.t < startT) break;
      firstT = Math.min(firstT, s.t);
      lastT2 = Math.max(lastT2, s.t);
      const age = s.t - startT;
      const w = 0.5 + 0.5 * (age / Math.max(spanMs, 1));
      sumDx += s.dx * w;
      sumDy += s.dy * w;
    }
    const dt = Math.max(lastT2 - firstT, EPS);
    return { vx: sumDx / dt, vy: sumDy / dt };
  }
  function displacementInWindow(endT, spanMs) {
    const startT = endT - spanMs;
    let dx = 0, dy = 0;
    for (let i = samples.length - 1; i >= 0; i--) {
      const s = samples[i];
      if (s.t < startT) break;
      dx += s.dx;
      dy += s.dy;
    }
    return { dx, dy };
  }
  return {
    axis,
    pointerDown(evt) {
      samples = [];
      startX = lastX = readPoint(evt, "x");
      startY = lastY = readPoint(evt, "y");
      return { x: startX, y: startY };
    },
    pointerMove(evt) {
      const t = now(evt);
      const x = readPoint(evt, "x");
      const y = readPoint(evt, "y");
      const dx = x - lastX;
      const dy = y - lastY;
      samples.push({ t, dx, dy });
      trimTo(t);
      if (Math.abs(dx) >= moveEps || Math.abs(dy) >= moveEps) lastActiveT = t;
      lastX = x;
      lastY = y;
      lastT = t;
      return { dx, dy };
    },
    pointerUp(evt) {
      const t = now(evt);
      samples.push({ t, dx: 0, dy: 0 });
      trimTo(t);
      const sinceLastMove = t - lastT;
      const idleMs = t - lastActiveT;
      const releasedFresh = sinceLastMove <= releaseFreshMs;
      const wasStill = idleMs > stillMs;
      if (wasStill) return { fx: 0, fy: 0 };
      const { vx: vxRecent, vy: vyRecent } = velocityInWindow(t, recentMs);
      const { dx: dxRecent, dy: dyRecent } = displacementInWindow(t, recentMs);
      const intentX = releasedFresh && (Math.abs(vxRecent) >= flickVel || Math.abs(dxRecent) >= flickDist);
      const intentY = releasedFresh && (Math.abs(vyRecent) >= flickVel || Math.abs(dyRecent) >= flickDist);
      const { vx, vy } = velocityInWindow(t, windowMs);
      let fx = intentX ? vx : 0;
      let fy = intentY ? vy : 0;
      if (intentX && Math.abs(fx) < minVel) fx = (dxRecent >= 0 ? 1 : -1) * minVel;
      if (intentY && Math.abs(fy) < minVel) fy = (dyRecent >= 0 ? 1 : -1) * minVel;
      return { fx, fy };
    },
    readPoint
  };
}

// src/Gallery/shared/motion/vector1d.ts
function Vector1D(initial) {
  let v = initial;
  return {
    get: () => v,
    set: (n) => {
      v = n;
    },
    add: (n) => {
      v += n;
    }
  };
}

// src/Gallery/shared/motion/scrollBody.ts
function ScrollBody(location, offsetLocation, previousLocation, target, baseDuration, baseFriction) {
  let vel = 0;
  let dir = 0;
  let duration = baseDuration;
  let friction = baseFriction;
  let raw = location.get();
  let rawPrev = 0;
  const mathAbs3 = Math.abs;
  return {
    sync() {
      raw = location.get();
      rawPrev = raw;
      return this;
    },
    resetVelocity() {
      vel = 0;
      return this;
    },
    useDuration(n) {
      duration = n;
      return this;
    },
    useFriction(n) {
      friction = n;
      return this;
    },
    useBaseDuration() {
      return this.useDuration(baseDuration);
    },
    useBaseFriction() {
      return this.useFriction(baseFriction);
    },
    duration() {
      return duration;
    },
    frictionFactor() {
      return friction;
    },
    direction() {
      return dir;
    },
    velocity() {
      return vel;
    },
    seek() {
      const curLoc = location.get();
      const curTgt = target.get();
      const disp = curTgt - curLoc;
      const instant = !duration;
      let d = 0;
      if (instant) {
        vel = 0;
        previousLocation.set(curTgt);
        location.set(curTgt);
        d = disp;
      } else {
        previousLocation.set(curLoc);
        vel += disp / duration;
        vel *= friction;
        raw += vel;
        location.add(vel);
        d = raw - rawPrev;
      }
      dir = Math.sign(d);
      rawPrev = raw;
      return this;
    },
    settled() {
      const diff = target.get() - offsetLocation.get();
      return mathAbs3(diff) < 1e-3;
    }
  };
}

// src/Gallery/shared/motion/limit.ts
function Limit(min, max) {
  const span = max - min || 1;
  return {
    min,
    max,
    reachedMin(n) {
      return n < min;
    },
    reachedMax(n) {
      return n > max;
    },
    constrain(n) {
      return Math.max(min, Math.min(max, n));
    },
    reachedAny(n) {
      return n < min || n > max;
    },
    removeOffset(n) {
      let x = n;
      while (x < min) x += span;
      while (x > max) x -= span;
      return x;
    }
  };
}

// src/Gallery/shared/motion/scrollLooper.ts
function ScrollLooper(contentSize, limit, location, vectors) {
  const jointSafety = 0.1;
  const min = limit.min + jointSafety;
  const max = limit.max + jointSafety;
  const l = Limit(min, max);
  function shouldLoop(direction) {
    if (direction === 1) return l.reachedMax(location.get());
    if (direction === -1) return l.reachedMin(location.get());
    return false;
  }
  return {
    loop(direction) {
      if (!shouldLoop(direction)) return;
      const shift = contentSize * (direction * -1);
      vectors.forEach((v) => v.add(shift));
    }
  };
}

// src/Gallery/shared/motion/scrollTarget.ts
function ScrollTarget(loop, scrollSnaps, contentSize, limit, targetVector) {
  const { reachedAny, removeOffset, constrain } = limit;
  function minDistance(distances) {
    return distances.concat().sort((a, b) => Math.abs(a) - Math.abs(b))[0];
  }
  function shortcut(target, direction) {
    const targets = [target, target + contentSize, target - contentSize];
    if (!loop) return target;
    if (!direction) return minDistance(targets);
    const dir = Math.sign(direction);
    const matchingTargets = targets.filter((t) => Math.sign(t) === dir);
    if (matchingTargets.length) return minDistance(matchingTargets);
    return arrayLast(targets) - contentSize;
  }
  function findTargetSnap(target) {
    const distance2 = loop ? removeOffset(target) : constrain(target);
    const ascDiffsToSnaps = scrollSnaps.map((snap, index2) => ({
      diff: shortcut(snap - distance2, 0),
      index: index2
    })).sort((d1, d2) => Math.abs(d1.diff) - Math.abs(d2.diff));
    const { index } = ascDiffsToSnaps[0];
    return { index, distance: distance2 };
  }
  function byIndex(index, direction) {
    const diffToSnap = scrollSnaps[index] - targetVector.get();
    const distance2 = shortcut(diffToSnap, direction);
    return { index, distance: distance2 };
  }
  function byDistance(distance2, snap) {
    const target = targetVector.get() + distance2;
    const { index, distance: targetSnapDistance } = findTargetSnap(target);
    const reachedBound = !loop && reachedAny(target);
    if (!snap || reachedBound) return { index, distance: distance2 };
    const diffToSnap = scrollSnaps[index] - targetSnapDistance;
    const snapDistance = distance2 + shortcut(diffToSnap, 0);
    return { index, distance: snapDistance };
  }
  return { byDistance, byIndex, shortcut };
}
var mathAbs = Math.abs;
var mathSign = (n) => n === 0 ? 0 : n > 0 ? 1 : -1;
function deltaAbs(valueB, valueA) {
  return mathAbs(valueB - valueA);
}
function factorAbs(valueB, valueA) {
  if (valueB === 0 || valueA === 0) return 0;
  if (mathAbs(valueB) <= mathAbs(valueA)) return 0;
  const diff = deltaAbs(mathAbs(valueB), mathAbs(valueA));
  return mathAbs(diff / valueB);
}
function arrayLast(array) {
  return array[arrayLastIndex(array)];
}
function arrayLastIndex(array) {
  return Math.max(0, array.length - 1);
}

// src/Gallery/shared/motion/eventStore.ts
function EventStore() {
  const listeners = [];
  return {
    add(t, type, fn, opts) {
      t.addEventListener(type, fn, opts);
      listeners.push(() => t.removeEventListener(type, fn, opts));
      return this;
    },
    clear() {
      while (listeners.length) listeners.pop()?.();
    }
  };
}

// src/Gallery/shared/motion/animations.ts
function Animations(doc, win, update, render) {
  const fixed = 1e3 / 60;
  const visible = EventStore();
  let last = null;
  let acc = 0;
  let animId = 0;
  function reset() {
    last = null;
    acc = 0;
  }
  function animate(ts) {
    if (!animId) return;
    if (last == null) {
      last = ts;
      update();
      update();
    }
    const dt = ts - last;
    last = ts;
    acc += dt;
    while (acc >= fixed) {
      update();
      acc -= fixed;
    }
    const alpha = acc / fixed;
    render(alpha);
    if (animId) animId = win.requestAnimationFrame(animate);
  }
  return {
    init() {
      visible.add(doc, "visibilitychange", () => {
        if (doc.hidden) reset();
      });
    },
    destroy() {
      this.stop();
      visible.clear();
    },
    start() {
      if (animId) return;
      animId = win.requestAnimationFrame(animate);
    },
    stop() {
      win.cancelAnimationFrame(animId);
      animId = 0;
      reset();
    },
    resetBlend() {
      reset();
    }
  };
}

// src/Gallery/shared/input/pointerTypes.ts
function isMouseEvent(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}

// src/Gallery/shared/types/axis.ts
function Axis(isHorizontal) {
  const scroll = isHorizontal ? "x" : "y";
  const cross = isHorizontal ? "y" : "x";
  return {
    scroll,
    cross,
    measureSize(rect) {
      return isHorizontal ? rect.width : rect.height;
    }
  };
}
function FullscreenAxis() {
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
function PanAxis() {
  return {
    scroll: "x",
    cross: "y",
    direction(n) {
      return n;
    }
  };
}

// src/Gallery/shared/motion/translate.ts
function Translate(container, AX) {
  let prev = NaN;
  function write(n) {
    if (n === prev) return;
    container.style.transform = AX.translate(n);
    prev = n;
  }
  return {
    to(target) {
      write(target);
    },
    get() {
      return prev;
    },
    resetCache() {
      prev = NaN;
    }
  };
}
function TranslateFullscreen(container) {
  let prevX = NaN;
  let prevY = NaN;
  let lockY = false;
  let lockedY = 0;
  let suspended = false;
  const round2 = (n) => Math.round(n * 100) / 100;
  function write(nx, ny) {
    if (nx === prevX && ny === prevY) return;
    container.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
    prevX = nx;
    prevY = ny;
  }
  return {
    to(targetX, targetY = 0) {
      if (suspended) return;
      const nx = round2(targetX);
      const ny = lockY ? lockedY : targetY;
      write(nx, ny);
    },
    lockY(value) {
      lockY = true;
      lockedY = Math.round((value ?? prevY) || 0);
      write(prevX || 0, lockedY);
    },
    unlockY() {
      lockY = false;
    },
    suspend(on = true) {
      suspended = on;
    },
    get() {
      return { x: prevX, y: prevY };
    },
    resetCache() {
      prevX = NaN;
      prevY = NaN;
    }
  };
}

// src/Gallery/shared/motion/baseLimit.ts
function createBaseLimit(min, max) {
  const range = max - min || 1;
  function constrain(n) {
    return Math.max(min, Math.min(max, n));
  }
  function reachedAny(n) {
    return n < min || n > max;
  }
  function removeOffset(n) {
    let x = n;
    while (x < min) x += range;
    while (x > max) x -= range;
    return x;
  }
  return { min, max, constrain, reachedAny, removeOffset };
}

// src/Gallery/shared/motion/counter.ts
var mathAbs2 = Math.abs;
function Counter(max, start, loop) {
  const { constrain } = Limit(0, max);
  const loopEnd = max + 1;
  let counter = withinLimit(start);
  function withinLimit(n) {
    return !loop ? constrain(n) : mathAbs2((loopEnd + n) % loopEnd);
  }
  function get() {
    return counter;
  }
  function set(n) {
    counter = withinLimit(n);
    return self;
  }
  function add(n) {
    return clone().set(get() + n);
  }
  function clone() {
    return Counter(max, get(), loop);
  }
  const self = {
    get,
    set,
    add,
    clone
  };
  return self;
}

// src/Gallery/fullscreen/FullscreenSlider.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var clamp01 = (n) => Math.max(0, Math.min(1, n));
var easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
function DragTracker(axis, ownerWindow) {
  return createDragTracker({
    ownerWindow,
    axis
  });
}
var FullscreenSlider = (0, import_react.forwardRef)(
  ({
    sub,
    children,
    imageCount,
    slideIndex,
    isClick,
    isZoomed,
    windowSize,
    show,
    handleZoomToggle: handleZoomToggle2,
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
    resetAllZoomDom
  }, ref) => {
    const isRtl = direction === "rtl" ? true : false;
    const rtlCls = isRtl ? FullscreenSlider_default.rtl : "";
    const sign = isRtl ? -1 : 1;
    const viewportRef = (0, import_react.useRef)(null);
    const slider = (0, import_react.useRef)(null);
    const axisRef = (0, import_react.useRef)(null);
    const locationRef = (0, import_react.useRef)(null);
    const previousLocationRef = (0, import_react.useRef)(null);
    const offsetLocationRef = (0, import_react.useRef)(null);
    const targetRef = (0, import_react.useRef)(null);
    const bodyRef = (0, import_react.useRef)(null);
    const translateRef = (0, import_react.useRef)(null);
    const animRef = (0, import_react.useRef)(null);
    const isAnimatingRef = (0, import_react.useRef)(false);
    const pointerDownRef = (0, import_react.useRef)(false);
    const yTemp = (0, import_react.useRef)(0);
    const dragThreshold = 5;
    const FADE_DISTANCE = 300;
    const selectedIndex = (0, import_react.useRef)(0);
    const hasPositioned = (0, import_react.useRef)(false);
    const perSlideRef = (0, import_react.useRef)(0);
    const contentSizeRef = (0, import_react.useRef)(0);
    const loopLimitRef = (0, import_react.useRef)(null);
    const scrollSnapsRef = (0, import_react.useRef)([]);
    const scrollContentSizeRef = (0, import_react.useRef)(0);
    const scrollLimitRef = (0, import_react.useRef)(null);
    const scrollTargetRef = (0, import_react.useRef)(null);
    const scrollToRef = (0, import_react.useRef)(null);
    const slides = (0, import_react.useRef)([]);
    const indexCurrentRef = (0, import_react.useRef)(null);
    const indexPreviousRef = (0, import_react.useRef)(null);
    const isPointerDown = (0, import_react.useRef)(false);
    const isVerticalScroll = (0, import_react.useRef)(false);
    const isScrolling = (0, import_react.useRef)(false);
    const isClosing = (0, import_react.useRef)(false);
    const clickedImgMargin = (0, import_react.useRef)(false);
    const dragStartY = (0, import_react.useRef)(0);
    const dragYForClose = (0, import_react.useRef)(0);
    const x = (0, import_react.useRef)(0);
    const y = (0, import_react.useRef)(0);
    const velocityX = (0, import_react.useRef)(0);
    const dragX = (0, import_react.useRef)(0);
    const previousDragX = (0, import_react.useRef)(0);
    const dragMoveTime = (0, import_react.useRef)(null);
    const activeTouchCount = (0, import_react.useRef)(0);
    const wasPinch = (0, import_react.useRef)(false);
    const appliedYRef = (0, import_react.useRef)(0);
    const dragMode = (0, import_react.useRef)("none");
    function useLatest(value) {
      const r = (0, import_react.useRef)(value);
      (0, import_react.useEffect)(() => {
        r.current = value;
      }, [value]);
      return r;
    }
    const isZoomedRef = useLatest(isZoomed);
    const recenterWithAnchor = (0, import_react.useCallback)(() => {
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
    (0, import_react.useEffect)(() => {
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
    (0, import_react.useEffect)(() => {
      const childrenArray = import_react.Children.toArray(children);
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
      const guardsRef = (0, import_react.useRef)(null);
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
      (0, import_react.useEffect)(() => stop, []);
      return { start, stop };
    }
    const { start: startGrabbing, stop: stopGrabbing } = useGlobalGrabbingGuards();
    const slideFadeBusyRef = (0, import_react.useRef)(false);
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
    (0, import_react.useEffect)(() => {
      if (closingModal) {
        animRef.current?.stop();
        pointerDownRef.current = false;
      }
    }, [closingModal]);
    (0, import_react.useEffect)(() => {
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
    function getClientXY2(evt) {
      const t = evt.changedTouches?.[0] ?? evt.touches?.[0];
      if (t) return { x: t.clientX, y: t.clientY };
      return { x: evt.clientX, y: evt.clientY };
    }
    function clickedVideoSurface(evt) {
      const { x: x2, y: y2 } = getClientXY2(evt);
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
    (0, import_react.useEffect)(() => {
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
            closeButtonRef.current?.click();
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
            handleZoomToggle2(evt, matchedRef);
          }
          if (idx === imageCount - 1 && Number(imgIndex) === imageCount + 1) {
            isZooming.current = true;
            handleZoomToggle2(evt, matchedRef);
          }
          if (slider.current && slider.current.children.length === 1) {
            isZooming.current = true;
            handleZoomToggle2(evt, matchedRef);
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
            closeButtonRef.current?.click();
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
            closeButtonRef.current?.click();
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
          var allowedForce = allowedForce2;
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
    (0, import_react.useEffect)(() => {
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
    (0, import_react.useEffect)(() => {
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
    (0, import_react.useEffect)(() => {
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
    (0, import_react.useEffect)(() => {
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
    (0, import_react.useImperativeHandle)(ref, () => ({ centerSlider }), [centerSlider]);
    function isVideoItem2(item) {
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
    const isVideoSlide = isVideoItem2(normalizedItems?.[openingIndex]);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var FullscreenSlider_default2 = FullscreenSlider;

// src/Gallery/fullscreen/FullscreenModal.tsx
var import_react2 = __toESM(require("react"));

// src/Gallery/shared/transitions/objectPosition.ts
function parseObjectPosition(op) {
  if (!op) return { x: 0.5, y: 0.5 };
  const mapKW = (kw, isX) => {
    const lower = kw.toLowerCase();
    if (isX) {
      if (lower === "left") return 0;
      if (lower === "center") return 0.5;
      if (lower === "right") return 1;
    } else {
      if (lower === "top") return 0;
      if (lower === "center") return 0.5;
      if (lower === "bottom") return 1;
    }
    return NaN;
  };
  const parts = op.trim().split(/\s+/);
  let xf = 0.5, yf = 0.5;
  if (parts.length >= 1) {
    const p0 = parts[0];
    if (p0.endsWith("%")) xf = Math.min(1, Math.max(0, parseFloat(p0) / 100));
    else {
      const m0 = mapKW(p0, true);
      if (!Number.isNaN(m0)) xf = m0;
    }
  }
  if (parts.length >= 2) {
    const p1 = parts[1];
    if (p1.endsWith("%")) yf = Math.min(1, Math.max(0, parseFloat(p1) / 100));
    else {
      const m1 = mapKW(p1, false);
      if (!Number.isNaN(m1)) yf = m1;
    }
  }
  return { x: xf, y: yf };
}

// src/Gallery/shared/transitions/objectFitTransform.ts
function coverTransformForRect(natW, natH, cropRect, objPos) {
  const cropW = Math.max(1, cropRect.width);
  const cropH = Math.max(1, cropRect.height);
  const s = Math.max(cropW / Math.max(1, natW), cropH / Math.max(1, natH));
  const scaledW = natW * s;
  const scaledH = natH * s;
  const ox = objPos?.x ?? 0.5;
  const oy = objPos?.y ?? 0.5;
  const overflowX = Math.max(0, scaledW - cropW);
  const overflowY = Math.max(0, scaledH - cropH);
  const dx = (0.5 - ox) * overflowX;
  const dy = (0.5 - oy) * overflowY;
  const cx = cropRect.left + cropW / 2 + dx;
  const cy = cropRect.top + cropH / 2 + dy;
  return { cx, cy, scale: s };
}
function containTransformForRect(natW, natH, cropRect, objPos) {
  const cropW = Math.max(1, cropRect.width);
  const cropH = Math.max(1, cropRect.height);
  const s = Math.min(cropW / Math.max(1, natW), cropH / Math.max(1, natH));
  const scaledW = natW * s;
  const scaledH = natH * s;
  const ox = objPos?.x ?? 0.5;
  const oy = objPos?.y ?? 0.5;
  const extraX = Math.max(0, cropW - scaledW);
  const extraY = Math.max(0, cropH - scaledH);
  const left = cropRect.left + extraX * ox;
  const top = cropRect.top + extraY * oy;
  const cx = left + scaledW / 2;
  const cy = top + scaledH / 2;
  return { cx, cy, scale: s };
}
function objectFitContentRect(natW, natH, box, fit, objPos) {
  const scale = fit === "contain" ? Math.min(box.width / natW, box.height / natH) : Math.max(box.width / natW, box.height / natH);
  const w = natW * scale;
  const h = natH * scale;
  const left = box.left + (box.width - w) * objPos.x;
  const top = box.top + (box.height - h) * objPos.y;
  return new DOMRect(left, top, w, h);
}

// src/Gallery/fullscreen/FullscreenModal.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
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
    if (!w || !h) return null;
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
  introEasing = "cubic-bezier(.4,0,.22,1)"
}) => {
  const DURATION_MS = introDuration;
  const EASING = introEasing;
  const modalRef = import_react2.default.useRef(null);
  const pointerDownX = import_react2.default.useRef(0);
  const pointerDownY = import_react2.default.useRef(0);
  const shieldRef = import_react2.default.useRef(null);
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
  (0, import_react2.useEffect)(() => {
    return () => unmountShield();
  }, []);
  function withinFs(sel) {
    const root = modalRef.current;
    return root ? root.querySelector(sel) : null;
  }
  (0, import_react2.useEffect)(() => {
    const btn = closeButtonRef.current;
    if (!btn) return;
    const handler = (ev) => handleClose(ev);
    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, [open]);
  (0, import_react2.useEffect)(() => {
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
  function handleClose(e) {
    const clickedImg = e.target?.closest("img");
    if (clickedImg) return;
    proceedToClose();
  }
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
    const els = [leftChevronRef.current, rightChevronRef.current, counterRef.current, closeButtonRef.current];
    els.forEach((el) => {
      if (!el) return;
      el.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
      el.style.opacity = "0";
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
  function isVideoItem2(m) {
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
    let canonicalIdx = 0;
    let localSlideIdx = 0;
    if (!isGridish) {
      if (!slider.current || !slides.current?.length) return;
      const fsIndex = fsIdx;
      if (isWrapping.current) {
        if (slider.current && fsIndex >= slider.current.children.length - (visibleImagesRef.current || 0) * 2 && layout !== "entries") {
          canonicalIdx = 0;
        } else {
          canonicalIdx = fsIndex;
        }
      } else {
        const maxMedia = Math.max(0, originals.length - 1);
        canonicalIdx = Math.min(Math.max(0, fsIndex), maxMedia);
      }
      localSlideIdx = canonicalIdx;
      if (layout === "entries" && entryMapRef?.current) {
        const link = entryMapRef.current[canonicalIdx];
        if (link) {
          localSlideIdx = link.mediaIndex;
          await scrollEntrySectionIntoView(link.entryIndex);
        }
      }
    } else {
      canonicalIdx = Math.max(0, Math.min(originals.length - 1, fsIdx));
      localSlideIdx = canonicalIdx;
      const el = document.querySelector(`[data-rmg-idx="${canonicalIdx}"]`);
      await scrollElementIntoCenterView(el);
      if (layout === "entries" && entryMapRef?.current) {
        const link = entryMapRef.current[canonicalIdx];
        if (link) {
          await scrollEntrySectionIntoView(link.entryIndex);
        }
      }
    }
    const url = originals[canonicalIdx];
    const isVideoSlide = isVideoItem2(url);
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
    const origImgRef = expandableImgRefs.current?.[canonicalIdx] ?? null;
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
  function safeTeardown() {
    unmountShield();
    [leftChevronRef.current, rightChevronRef.current, counterRef.current, closeButtonRef.current].forEach((el) => el?.remove());
    leftChevronRef.current = null;
    rightChevronRef.current = null;
    counterRef.current = null;
    closeButtonRef.current = null;
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
      children
    }
  );
};
var FullscreenModal_default = FullscreenModal;

// src/Gallery/slider/Slider.tsx
var import_react3 = require("react");

// src/Gallery/slider/Slider.module.css
var Slider_default = {};

// src/Gallery/slider/sliderSub.tsx
function createIndexChannel(initialIndex = 0, initialMode = "animated") {
  let index = initialIndex;
  let mode = initialMode;
  let lastEvent = { type: "set", index: initialIndex, mode: initialMode };
  const subs = /* @__PURE__ */ new Set();
  const evtSubs = /* @__PURE__ */ new Set();
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const ev = lastEvent;
      evtSubs.forEach((fn) => fn(ev));
      subs.forEach((fn) => fn());
    });
  };
  return {
    get() {
      return { index, mode };
    },
    set(next, m = "animated", opts) {
      index = next;
      mode = m;
      lastEvent = { type: "set", index, mode: m };
      if (!opts?.silent) schedule();
    },
    bump(delta, m = "animated", opts) {
      lastEvent = { type: "bump", delta: delta | 0, mode: m };
      if (!opts?.silent) schedule();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    onEvent(fn) {
      evtSubs.add(fn);
      return () => {
        evtSubs.delete(fn);
      };
    }
  };
}

// src/Gallery/shared/motion/scrollBounds.ts
function ScrollBounds(limit, location, target, body, pov, selectDuration) {
  const pullBack = pov.measure(10);
  const edgeTol = pov.measure(50);
  const fricLim = Limit(0.1, 0.99);
  function reached() {
    return limit.reachedAny(target.get()) && limit.reachedAny(location.get());
  }
  return {
    reached,
    constrain(pointerDown) {
      if (!reached()) return;
      const edge = limit.reachedMin(location.get()) ? "min" : "max";
      const distToEdge = Math.abs(limit[edge] - location.get());
      const distToTarget = target.get() - location.get();
      const f = fricLim.constrain(distToEdge / edgeTol);
      target.set(target.get() - distToTarget * f);
      if (!pointerDown && Math.abs(distToTarget) < pullBack) {
        target.set(limit.constrain(target.get()));
        body.useDuration(selectDuration).useBaseFriction();
      }
    }
  };
}
function PercentOfView(viewSize) {
  return {
    measure(n) {
      return viewSize * n / 100;
    }
  };
}

// src/Gallery/shared/slideContext.tsx
var React2 = __toESM(require("react"));
var import_jsx_runtime3 = require("react/jsx-runtime");
var RmgSlideContext = React2.createContext(null);
function RmgSlideProvider({
  value,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RmgSlideContext.Provider, { value, children });
}
function useRmgSlide() {
  return React2.useContext(RmgSlideContext);
}

// src/Gallery/fullscreen/gestureShield.ts
function createGestureShield(zIndex = 1e4) {
  let cleanup = null;
  function add(timeoutMs = 400) {
    cleanup?.();
    const shield = document.createElement("div");
    Object.assign(shield.style, {
      position: "fixed",
      inset: "0",
      zIndex: String(zIndex),
      background: "transparent",
      touchAction: "none",
      pointerEvents: "auto"
    });
    document.body.appendChild(shield);
    const remove = () => {
      if (shield.parentNode) shield.remove();
    };
    const timer = window.setTimeout(() => {
      remove();
      cleanup = null;
    }, timeoutMs);
    const teardown = () => {
      window.clearTimeout(timer);
      remove();
      cleanup = null;
    };
    cleanup = teardown;
    return teardown;
  }
  return { add };
}

// src/Gallery/shared/responsive.ts
var BREAKPOINT_MAP = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
};
function parseNumberLike(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}
function effectiveViewportWidth(raw) {
  if (raw > 0) return raw;
  if (typeof window !== "undefined" && window.innerWidth > 0) return window.innerWidth;
  return 1024;
}
function resolveNumberFromResponsive(value, fallback, viewportWidth, breakpointMap = BREAKPOINT_MAP) {
  const vw = effectiveViewportWidth(viewportWidth);
  if (value == null) return fallback;
  if (typeof value === "number" || typeof value === "string") {
    return parseNumberLike(value, fallback);
  }
  if (Array.isArray(value)) {
    return resolveNumberFromResponsive(value[0], fallback, vw, breakpointMap);
  }
  const entries = Object.entries(value).map(([key, v]) => {
    const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
    return { minWidth: bp, value: v };
  }).sort((a, b) => a.minWidth - b.minWidth);
  let result = fallback;
  for (const bp of entries) {
    if (vw >= bp.minWidth) {
      result = resolveNumberFromResponsive(bp.value, result, vw, breakpointMap);
    }
  }
  return result;
}
function resolvePositionFromResponsive(value, fallback, viewportWidth, breakpointMap = BREAKPOINT_MAP) {
  const vw = effectiveViewportWidth(viewportWidth);
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  const entries = Object.entries(value).map(([key, v]) => {
    const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
    return { minWidth: bp, value: v };
  }).sort((a, b) => a.minWidth - b.minWidth);
  let result = fallback;
  for (const bp of entries) {
    if (vw >= bp.minWidth) {
      result = resolvePositionFromResponsive(bp.value, result, vw, breakpointMap);
    }
  }
  return result;
}
function normalizeResponsiveToMinWidthRules(value, fallback, breakpointMap) {
  if (value == null) return [{ minWidth: 0, count: fallback }];
  if (typeof value === "number" || typeof value === "string") {
    const n = Math.floor(parseNumberLike(value, fallback));
    return [{ minWidth: 0, count: Math.max(0, n) }];
  }
  if (Array.isArray(value)) {
    return normalizeResponsiveToMinWidthRules(value[0], fallback, breakpointMap);
  }
  const entries = Object.entries(value).map(([key, v]) => {
    const bp = breakpointMap[key] ?? (Number.isNaN(parseFloat(key)) ? 0 : parseFloat(key));
    const n = Math.floor(parseNumberLike(v, fallback));
    return { minWidth: bp, count: Math.max(0, n) };
  }).sort((a, b) => a.minWidth - b.minWidth);
  if (entries.length === 0) return [{ minWidth: 0, count: fallback }];
  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, count: fallback });
  } else if (entries[0].minWidth < 0) {
    entries[0] = { ...entries[0], minWidth: 0 };
  }
  return entries;
}

// src/Gallery/shared/skeleton/buildScopedSkeletonCountCss.ts
function buildScopedSkeletonCountCss(args) {
  const { scopeId, responsiveCount, fallbackCount, breakpointMap, maxSlots } = args;
  const rules = normalizeResponsiveToMinWidthRules(responsiveCount, fallbackCount, breakpointMap);
  const clamp2 = (n) => Math.max(0, Math.min(maxSlots, Math.floor(n)));
  const baseCount = clamp2(rules[0]?.count ?? fallbackCount);
  const rootSel = `[data-rmg-scope="${scopeId}"]`;
  const slotSel = `${rootSel} [data-rmg-skel-slot]`;
  const lines = [];
  lines.push(`${slotSel}{ display:none; }`);
  const showFirstN = (count) => {
    const c = clamp2(count);
    if (c <= 0) return "";
    return Array.from({ length: c }).map((_, i) => `${rootSel} [data-rmg-skel-slot="${i + 1}"]{ display:block; }`).join("\n");
  };
  lines.push(showFirstN(baseCount));
  for (const r of rules.slice(1)) {
    const c = clamp2(r.count);
    lines.push(`@media (min-width:${r.minWidth}px){
${showFirstN(c)}
}`);
  }
  return { cssText: lines.join("\n"), ssrBaseCount: baseCount };
}

// src/Gallery/slider/effects/useParallaxEffect.ts
var React3 = __toESM(require("react"));
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
  const tweenNodesRef = React3.useRef([]);
  const parallaxNodesRef = React3.useRef([]);
  const parallaxSnapsRef = React3.useRef([]);
  const collectParallaxForAll = React3.useCallback(() => {
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
  const currentTweenFactor = React3.useCallback(() => {
    const count = parallaxSnapsRef.current.length || 1;
    const visible = Math.max(visibleImagesRef.current || 1, 1);
    return TWEEN_FACTOR_BASE * (count / visible);
  }, [visibleImagesRef]);
  const scrollProgressNorm = React3.useCallback(() => {
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
  const tweenParallax = React3.useCallback(() => {
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
  React3.useEffect(() => {
    if (!enabled) return;
    collectParallaxForAll();
  }, [enabled, slidesLen, clonedLen, wrap, isReady, collectParallaxForAll]);
  React3.useEffect(() => {
    if (enabled) return;
    tweenNodesRef.current.forEach((n) => n && n.removeAttribute("style"));
  }, [enabled]);
  React3.useEffect(() => {
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

// src/Gallery/slider/effects/useScaleEffect.ts
var React4 = __toESM(require("react"));
function clamp012(n) {
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
  const slideCenterX = React4.useCallback(
    (logicalIdx) => {
      const s = slidesRef.current?.[logicalIdx];
      if (!s || !sliderRef.current) return 0;
      const centerOffset = getCenterOffsetForIndex(logicalIdx);
      return s.target - centerOffset;
    },
    [slidesRef, sliderRef, getCenterOffsetForIndex]
  );
  const getCenters = React4.useCallback(() => {
    const L = slidesRef.current?.length ?? 0;
    const arr = [];
    for (let i = 0; i < L; i++) arr.push(slideCenterX(i));
    return arr;
  }, [slidesRef, slideCenterX]);
  const findBoundingPair = React4.useCallback(
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
      const t = clamp012((loc - left.x) / span);
      return { iL: left.i, iR: right.i, t };
    },
    [getCenters, sliderWidthRef, wrap]
  );
  const applyPairScaleTween = React4.useCallback(() => {
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
  React4.useEffect(() => {
    applyPairScaleTween();
  }, [enabled, scaleAmount, slidesLen, clonedLen]);
  React4.useEffect(() => {
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

// src/Gallery/slider/effects/useFadeEffect.ts
var React5 = __toESM(require("react"));
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
  const slideCenterX = React5.useCallback(
    (logicalIdx) => {
      const s = slidesRef.current?.[logicalIdx];
      if (!s || !sliderRef.current) return 0;
      const centerOffset = getCenterOffsetForIndex(logicalIdx);
      return s.target - centerOffset;
    },
    [slidesRef, sliderRef, getCenterOffsetForIndex]
  );
  const getCenters = React5.useCallback(() => {
    const L = slidesRef.current?.length ?? 0;
    const arr = [];
    for (let i = 0; i < L; i++) arr.push(slideCenterX(i));
    return arr;
  }, [slidesRef, slideCenterX]);
  const applyFadeTween = React5.useCallback(() => {
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
  React5.useEffect(() => {
    applyFadeTween();
  }, [enabled, slidesLen, clonedLen, wrap]);
  React5.useEffect(() => {
    if (enabled) return;
    const track = sliderRef.current;
    if (!track) return;
    const kids = Array.from(track.children);
    for (const el of kids) el.style.opacity = "1";
  }, [enabled, sliderRef]);
  return { applyFadeTween, getCenters };
}

// src/Gallery/slider/controls/arrows.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function DefaultChevron({
  axisMain,
  direction,
  size = 32
}) {
  const pathPrev = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" });
  const pathNext = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" });
  if (axisMain === "y") {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "svg",
      {
        viewBox: "0 0 24 24",
        width: size,
        height: size,
        fill: "#000",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": true,
        style: { transform: "rotate(90deg)", transformOrigin: "50% 50%" },
        children: direction === "prev" ? pathPrev : pathNext
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "#000",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": true,
      children: direction === "prev" ? pathPrev : pathNext
    }
  );
}
var baseArrowStyle = {
  position: "absolute",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.75)",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
  borderRadius: "100%",
  zIndex: 2,
  width: 36,
  height: 36,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "opacity 120ms"
};
function prevPlacement(axisMain) {
  return axisMain === "y" ? { left: "50%", top: 10, transform: "translateX(-50%)" } : { left: 10, top: "50%", transform: "translateY(-50%)" };
}
function nextPlacement(axisMain) {
  return axisMain === "y" ? { left: "50%", bottom: 10, transform: "translateX(-50%)" } : { right: 10, top: "50%", transform: "translateY(-50%)" };
}
function RmgArrows(props) {
  const {
    axisMain,
    clientKey,
    wrap,
    isRtl,
    showArrows,
    selectedIndex,
    slideCount,
    measureRef,
    viewportMainSizeRef,
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
  } = props;
  const atFirst = !wrap && selectedIndex <= 0;
  const atLast = !wrap && selectedIndex >= Math.max(0, slideCount - 1);
  const clientMain = measureRef.current ? measureRef.current[clientKey] : 0;
  const arrowsAutoHidden = !(slideCount > 1 && measureRef.current && viewportMainSizeRef.current > clientMain);
  const arrowsHidden = !showArrows || arrowsAutoHidden;
  const prevDisabled = arrowsHidden || !wrap && (isRtl ? atLast : atFirst);
  const nextDisabled = arrowsHidden || !wrap && (isRtl ? atFirst : atLast);
  const prevArrowStylesEffective = {
    ...arrowStyles ?? {},
    ...prevArrowStyles ?? {}
  };
  const nextArrowStylesEffective = {
    ...arrowStyles ?? {},
    ...nextArrowStyles ?? {}
  };
  const prevArrowClassNameEffective = [arrowClassName, prevArrowClassName].filter(Boolean).join(" ");
  const nextArrowClassNameEffective = [arrowClassName, nextArrowClassName].filter(Boolean).join(" ");
  function makeArrowOnClick(dir, hidden) {
    return () => {
      if (hidden) return;
      requestAnimationFrame(() => {
        if (dir === "prev") previous();
        else next();
      });
    };
  }
  const DefaultArrow = ({
    dir,
    ref,
    onClick,
    hidden,
    disabled,
    className
  }) => {
    const dim = disabled ? 0.35 : 1;
    const placement = dir === "prev" ? prevPlacement(axisMain) : nextPlacement(axisMain);
    const perDirStyles = dir === "prev" ? prevArrowStylesEffective : nextArrowStylesEffective;
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        ref,
        className: `rmgArrow rmgArrow--${dir} ${className ?? ""}`,
        onClick: (evt) => {
          if (hidden) return;
          createRipple(evt.currentTarget);
          requestAnimationFrame(() => onClick());
        },
        style: {
          ...baseArrowStyle,
          ...placement,
          ...perDirStyles,
          cursor: disabled ? "default" : "pointer",
          opacity: hidden ? 0 : dim,
          pointerEvents: hidden ? "none" : "auto",
          visibility: hidden ? "hidden" : "visible"
        },
        "aria-label": dir === "prev" ? "Previous slide" : "Next slide",
        role: "button",
        title: disabled ? dir === "prev" ? "At first slide" : "At last slide" : dir === "prev" ? "Previous" : "Next",
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DefaultChevron, { axisMain, direction: dir, size: 32 })
      }
    );
  };
  const renderArrow = (dir, args) => {
    if (dir === "prev" && renderPrevArrow) return renderPrevArrow(args);
    if (dir === "next" && renderNextArrow) return renderNextArrow(args);
    if (renderArrows) return renderArrows({ ...args, dir });
    return DefaultArrow({ ...args, dir });
  };
  const prevArrowNode = renderArrow("prev", {
    ref: prevButtonRef,
    hidden: arrowsHidden,
    disabled: prevDisabled,
    onClick: makeArrowOnClick("prev", arrowsHidden),
    createRipple,
    className: prevArrowClassNameEffective
  });
  const nextArrowNode = renderArrow("next", {
    ref: nextButtonRef,
    hidden: arrowsHidden,
    disabled: nextDisabled,
    onClick: makeArrowOnClick("next", arrowsHidden),
    createRipple,
    className: nextArrowClassNameEffective
  });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
    prevArrowNode,
    nextArrowNode
  ] });
}

// src/Gallery/slider/controls/dots.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
          return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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

// src/Gallery/slider/controls/progress.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function clamp013(n) {
  return Math.max(0, Math.min(1, n));
}
function setProgressDom(args) {
  const { AX, lastProgressRef, progressHolderRef, progressInnerRef, p } = args;
  const v = clamp013(p);
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
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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

// src/Gallery/fullscreen/fullscreenIntro.tsx
var import_react_dom = require("react-dom");
var import_client = require("react-dom/client");
var import_jsx_runtime7 = require("react/jsx-runtime");
function elementStyleFromCfg(cfg) {
  if (!cfg) return void 0;
  const out = {};
  if (cfg.className) out.className = cfg.className;
  if (cfg.style) out.style = cfg.style;
  return out;
}
function applyElementStyle(el, cfg) {
  if (!el || !cfg) return;
  if (cfg.className) {
    cfg.className.split(" ").map((s) => s.trim()).filter(Boolean).forEach((c) => el.classList.add(c));
  }
  if (cfg.style) {
    Object.assign(el.style, cfg.style);
  }
}
function ensureButtonLike(el) {
  if (el.tagName.toLowerCase() === "button") {
    el.type || (el.type = "button");
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
function detectVideoSlide(item, slideEl) {
  return item?.type === "video" || item?.kind === "video" || item?.mediaType === "video" || !!item?.videoSrc || !!item?.sources?.video || !!item?.plyrSource || !!slideEl?.dataset?.rmgVideo;
}
function runFullscreenIntro(args) {
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
    closestSelector
  } = args;
  if (!origImg) return;
  const DURATION_MS = fs.effects?.introDuration ?? 300;
  const EASING = fs.effects?.introEasing ?? "cubic-bezier(.4,0,.22,1)";
  addShield?.(400);
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const slideEl = origImg.closest(
    closestSelector ?? // sensible default:
    (closestSelector === void 0 ? ".rmg__grid-item, .rmg__slide" : "")
  ) || origImg.parentElement || origImg;
  const slideRect = slideEl.getBoundingClientRect();
  const imgRect = origImg.getBoundingClientRect();
  const natW = Math.max(1, origImg.naturalWidth || 0);
  const natH = Math.max(1, origImg.naturalHeight || 0);
  const insetForRect2 = (r) => {
    const top = r.top;
    const left = r.left;
    const right = vw - (r.left + r.width);
    const bottom = vh - (r.top + r.height);
    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  };
  const fit = getComputedStyle(origImg).objectFit || "cover";
  const cs0 = getComputedStyle(origImg);
  const startObjPos = parseObjectPosition(cs0?.objectPosition ?? null);
  const visibleImgRect = fit === "contain" ? objectFitContentRect(natW, natH, imgRect, "contain", startObjPos) : imgRect;
  const startInset = insetForRect2(visibleImgRect);
  const overlay = document.createElement("div");
  overlay.className = styles.fullscreenOverlay;
  overlayDivRef.current = overlay;
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.transition = "none";
  document.body.appendChild(overlay);
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
  if (typeof fs.caption?.render === "function") {
    try {
      const overlayCaption = document.createElement("div");
      overlayCaption.className = styles.fsOverlayCaption;
      overlayCaptionRef.current = overlayCaption;
      const base = {
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
        transition: "opacity 220ms cubic-bezier(.4,0,.22,1), transform 220ms cubic-bezier(.4,0,.22,1)",
        zIndex: "9999"
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
        fs.caption.className.split(" ").map((s) => s.trim()).filter(Boolean).forEach((c) => overlayCaption.classList.add(c));
      }
      if (fs.caption?.style) {
        Object.assign(overlayCaption.style, fs.caption.style);
      }
      overlay.appendChild(overlayCaption);
      const root = (0, import_client.createRoot)(overlayCaption);
      overlayCaptionRootRef.current = root;
      const item2 = normalizedItems[index];
      const captionNode = fs.caption.render({
        item: item2,
        index,
        isZoomed: false
      });
      root.render(/* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: captionNode }));
    } catch (err) {
      console.error("[RMG] Failed to render overlay caption", err);
    }
  }
  const imageCount = normalizedItems.length;
  const closeEnabled = fs.controls?.close?.enabled !== false;
  const counterEnabled = fs.controls?.counter?.enabled !== false;
  const allowFsArrows = fs.controls?.arrows?.enabled !== false && imageCount > 1;
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
  const defaultChevron = (side) => {
    const ns = "http://www.w3.org/2000/svg";
    const action = side === "left" ? isRtl ? "next" : "prev" : isRtl ? "prev" : "next";
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
  const makeArrowEl = (dir, side) => {
    const explicit = dir === "prev" ? typeof fs.controls?.arrows?.renderPrev === "function" ? fs.controls.arrows.renderPrev() : null : typeof fs.controls?.arrows?.renderNext === "function" ? fs.controls.arrows.renderNext() : null;
    if (explicit instanceof HTMLElement) return explicit;
    if (typeof fs.controls?.arrows?.render === "function") {
      const el = fs.controls.arrows.render({ dir });
      if (el instanceof HTMLElement) return el;
    }
    return defaultChevron(side);
  };
  const defaultCounter = (cur, total) => {
    const el = document.createElement("div");
    el.className = styles.counter;
    el.textContent = `${cur + 1} / ${total}`;
    return el;
  };
  const closeExplicit = typeof fs.controls?.close?.render === "function" ? fs.controls.close.render() : null;
  const closeBtn = closeEnabled ? closeExplicit instanceof HTMLElement ? closeExplicit : defaultClose() : null;
  if (closeBtn) {
    ensureButtonLike(closeBtn);
    if (!closeBtn.getAttribute("aria-label"))
      closeBtn.setAttribute("aria-label", "Close");
  }
  const leftAction = isRtl ? "next" : "prev";
  const rightAction = isRtl ? "prev" : "next";
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
  const ctrExplicit = typeof fs.controls?.counter?.render === "function" ? fs.controls.counter.render({ index, count: imageCount }) : null;
  const ctr = counterEnabled ? ctrExplicit instanceof HTMLElement ? ctrExplicit : defaultCounter(index, imageCount) : null;
  applyElementStyle(closeBtn, elementStyleFromCfg(fs.controls?.close ?? null));
  applyElementStyle(leftCh, fs.controls?.arrows?.arrow);
  applyElementStyle(rightCh, fs.controls?.arrows?.arrow);
  applyElementStyle(leftCh, fs.controls?.arrows?.prev);
  applyElementStyle(rightCh, fs.controls?.arrows?.next);
  applyElementStyle(ctr, elementStyleFromCfg(fs.controls?.counter ?? null));
  if (leftCh) leftCh.classList.add(styles.leftChevron);
  if (rightCh) rightCh.classList.add(styles.rightChevron);
  closeButtonRef.current = closeBtn;
  leftChevronRef.current = leftCh;
  rightChevronRef.current = rightCh;
  counterRef.current = ctr;
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
  const item = normalizedItems[index];
  const isVideoSlide = detectVideoSlide(item, slideEl);
  const forceFadeIntro = !!fs.effects?.introFade || isVideoSlide;
  let clipper = null;
  let dup = null;
  if (!forceFadeIntro) {
    let startAnimation2 = function() {
      dup.style.transform = `translate3d(${startT.cx}px, ${startT.cy}px, 0) translate3d(${-natW / 2}px, ${-natH / 2}px, 0) scale(${startT.scale})`;
      void dup.offsetWidth;
      void clipper.offsetWidth;
      void overlay.offsetWidth;
      clipper.style.transition = `clip-path ${DURATION_MS}ms ${EASING}`;
      dup.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
      overlay.style.transition = `opacity ${DURATION_MS}ms ${EASING}`;
      requestAnimationFrame(() => {
        clipper.style.clipPath = "inset(0px 0px 0px 0px)";
        dup.style.transform = finalTransform;
        dup.style.opacity = "1";
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        if (overlayCaptionRef.current) {
          overlayCaptionRef.current.classList.add(styles.open);
        }
      });
    };
    var startAnimation = startAnimation2;
    clipper = document.createElement("div");
    Object.assign(clipper.style, {
      position: "fixed",
      inset: "0",
      clipPath: startInset,
      willChange: "clip-path",
      transition: "none",
      zIndex: "9998"
    });
    dup = document.createElement("img");
    dup.src = origImg.currentSrc || origImg.src;
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
      zIndex: "9998"
    });
    duplicateImgRef.current = dup;
    clipper.appendChild(dup);
    const frag = document.createDocumentFragment();
    frag.append(overlay, clipper);
    document.body.appendChild(frag);
    const startT = fit === "contain" ? containTransformForRect(natW, natH, visibleImgRect, startObjPos) : coverTransformForRect(natW, natH, slideRect, startObjPos);
    dup.style.transform = `translate3d(${startT.cx}px, ${startT.cy}px, 0) translate3d(${-natW / 2}px, ${-natH / 2}px, 0) scale(${startT.scale})`;
    void dup.offsetWidth;
    void clipper.offsetWidth;
    const fitsIntrinsic = natW <= contentRect.width && natH <= contentRect.height;
    const endObjPos = { x: 0.5, y: 0.5 };
    const endT = fitsIntrinsic ? {
      cx: contentRect.x + contentRect.width / 2,
      cy: contentRect.y + contentRect.height / 2,
      scale: 1
    } : containTransformForRect(natW, natH, contentRect, endObjPos);
    const finalTransform = `translate3d(${endT.cx}px, ${endT.cy}px, 0) translate3d(${-natW / 2}px, ${-natH / 2}px, 0) scale(${endT.scale})`;
    const ready = dup.decode ? dup.decode().catch(() => {
    }) : new Promise((resolve) => {
      if (dup.complete) return resolve();
      dup.addEventListener("load", () => resolve(), { once: true });
      dup.addEventListener("error", () => resolve(), { once: true });
    });
    ready.then(() => startAnimation2());
    requestAnimationFrame(() => {
      const many = imageCount > 1;
      const addOpen = (el) => el.classList.add(styles.open);
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
    const onEnd = async (ev) => {
      if (ev.propertyName !== "transform") return;
      dup.removeEventListener("transitionend", onEnd);
      await new Promise(
        (r) => requestAnimationFrame(() => requestAnimationFrame(r))
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
        clipper.remove();
        dup.remove();
        duplicateImgRef.current = null;
      });
    };
    dup.addEventListener("transitionend", onEnd, { once: true });
    return;
  }
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    if (overlayCaptionRef.current) {
      overlayCaptionRef.current.classList.add(styles.open);
    }
  });
  (0, import_react_dom.flushSync)(() => {
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
  requestAnimationFrame(() => {
    const many = imageCount > 1;
    const addOpen = (el) => el.classList.add(styles.open);
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
function createSliderFullscreenIntroRunner(deps) {
  return function runFromSliderEvent(_e, imgRef, index) {
    const origImg = imgRef.current;
    if (!origImg) return;
    runFullscreenIntro({
      ...deps,
      origImg,
      index,
      closestSelector: deps.closestSelector ?? ".rmg__slide"
    });
  };
}

// src/Gallery/slider/Slider.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function DragTracker2(main, ownerWindow) {
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
    contentNode = (0, import_react3.cloneElement)(child, {
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
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ...shellProps, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RmgSlideProvider, { value: ctxVal, children: contentNode }) }, key);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ...shellProps, className: "rmg__slide", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RmgSlideProvider, { value: ctxVal, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "rmg__parallax", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "rmg__parallax__layer", children: contentNode }) }) }) }, key);
}
var Slider = (0, import_react3.forwardRef)(function Slider2({
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
  const slider = (0, import_react3.useRef)(null);
  const slides = (0, import_react3.useRef)([]);
  const visibleImagesRef = (0, import_react3.useRef)(0);
  const selectedIndex = (0, import_react3.useRef)(0);
  const sliderX = (0, import_react3.useRef)(0);
  const sliderVelocity = (0, import_react3.useRef)(0);
  const isWrapping = (0, import_react3.useRef)(true);
  const sliderContainer = (0, import_react3.useRef)(null);
  const prevButtonRef = (0, import_react3.useRef)(null);
  const nextButtonRef = (0, import_react3.useRef)(null);
  const dotRefs = (0, import_react3.useRef)([]);
  const dotsContainerRef = (0, import_react3.useRef)(null);
  const [clonedChildren, setClonedChildren] = (0, import_react3.useState)([]);
  const clonesCountRef = (0, import_react3.useRef)(0);
  const [visibleImages, setVisibleImages] = (0, import_react3.useState)(1);
  const [slidesState, setSlidesState] = (0, import_react3.useState)([]);
  const [isMeasured, setIsMeasured] = (0, import_react3.useState)(false);
  const [inView, setInView] = (0, import_react3.useState)(false);
  const [wrap, setWrap] = (0, import_react3.useState)(false);
  const progressHolderRef = (0, import_react3.useRef)(null);
  const progressInnerRef = (0, import_react3.useRef)(null);
  const lastProgressRef = (0, import_react3.useRef)(0);
  const cellToSlideRef = (0, import_react3.useRef)([]);
  const builtOnceRef = (0, import_react3.useRef)(false);
  const slideBuildSubs = (0, import_react3.useRef)(/* @__PURE__ */ new Set());
  const [layoutReady, setLayoutReady] = (0, import_react3.useState)(false);
  const [engineReady, setEngineReady] = (0, import_react3.useState)(false);
  const overlayCaptionRef = (0, import_react3.useRef)(null);
  const overlayCaptionRootRef = (0, import_react3.useRef)(null);
  const locationRef = (0, import_react3.useRef)(null);
  const previousLocationRef = (0, import_react3.useRef)(null);
  const offsetLocationRef = (0, import_react3.useRef)(null);
  const targetRef = (0, import_react3.useRef)(null);
  const bodyRef = (0, import_react3.useRef)(null);
  const translateRef = (0, import_react3.useRef)(null);
  const animRef = (0, import_react3.useRef)(null);
  const limitRef = (0, import_react3.useRef)(null);
  const pointerDownRef = (0, import_react3.useRef)(false);
  const isAnimatingRef = (0, import_react3.useRef)(false);
  const isPointerDown = (0, import_react3.useRef)(false);
  const isScrolling = (0, import_react3.useRef)(false);
  const xRef = (0, import_react3.useRef)(0);
  const dragX = (0, import_react3.useRef)(0);
  const previousDragX = (0, import_react3.useRef)(0);
  const dragMoveTime = (0, import_react3.useRef)(null);
  const boundsRef = (0, import_react3.useRef)(null);
  const povRef = (0, import_react3.useRef)(null);
  const cells = (0, import_react3.useRef)([]);
  const sliderWidth = (0, import_react3.useRef)(0);
  const hasPositioned = (0, import_react3.useRef)(false);
  const getSnapTargets = () => (slides.current || []).map((s) => s.target);
  const totalWidth = () => sliderWidth.current || 0;
  const contentSizeRef = (0, import_react3.useRef)(0);
  const loopLimitRef = (0, import_react3.useRef)(null);
  const scrollSnapsRef = (0, import_react3.useRef)([]);
  const scrollContentSizeRef = (0, import_react3.useRef)(0);
  const scrollLimitRef = (0, import_react3.useRef)(null);
  const scrollTargetRef = (0, import_react3.useRef)(null);
  const scrollToRef = (0, import_react3.useRef)(null);
  const indexCurrentRef = (0, import_react3.useRef)(null);
  const indexPreviousRef = (0, import_react3.useRef)(null);
  const layoutRef = (0, import_react3.useRef)(null);
  const draggingAttr = "data-rmg-drag";
  const activePointerIdRef = (0, import_react3.useRef)(null);
  const guardsStoreRef = (0, import_react3.useRef)(null);
  const isHoveringRef = (0, import_react3.useRef)(false);
  const lastPointerUpTime = (0, import_react3.useRef)(performance.now() - 1e3);
  const autoScrollPauseUntil = (0, import_react3.useRef)(0);
  const [buildKey, setBuildKey] = (0, import_react3.useState)(0);
  const loopStableRef = (0, import_react3.useRef)(null);
  const [geomKey, setGeomKey] = (0, import_react3.useState)(0);
  const lastGeomSigRef = (0, import_react3.useRef)("");
  const plyrRefsByIdx = (0, import_react3.useRef)({});
  const lastCloneSigRef = (0, import_react3.useRef)("");
  const shieldCleanupRef = (0, import_react3.useRef)(null);
  const shieldRef = (0, import_react3.useRef)(null);
  const internalIndexChannel = (0, import_react3.useMemo)(() => createIndexChannel(), []);
  const indexChannel = externalIndexChannel ?? internalIndexChannel;
  const isRtl = direction === "rtl" ? true : false;
  const rtlCls = isRtl ? Slider_default.rtl : "";
  const sign = axis === "x" && isRtl ? -1 : 1;
  const [responsiveSliderHeight, setResponsiveSliderHeight] = (0, import_react3.useState)(() => {
    if (typeof initialHeight === "number" && initialHeight > 0) {
      return `${initialHeight}px`;
    }
    if (typeof initialHeight === "string" && initialHeight.trim() !== "") {
      return initialHeight;
    }
    return "0px";
  });
  const lastNonZeroHeightRef = (0, import_react3.useRef)(
    typeof initialHeight === "number" && initialHeight > 0 ? initialHeight : 1
  );
  const scopeId = (0, import_react3.useId)().replace(/:/g, "-");
  const AX = (0, import_react3.useMemo)(() => {
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
  const responsiveCss = (0, import_react3.useMemo)(() => {
    const rules = Array.isArray(responsiveHeights) ? responsiveHeights : [];
    if (rules.length === 0) return "";
    const rootSel = `#${scopeId}`;
    return rules.map((r) => `@media ${r.query} { ${rootSel} { --rmg-slider-height: ${r.height} !important; } }`).join("\n");
  }, [responsiveHeights, scopeId]);
  const hasResponsiveHeights = Array.isArray(responsiveHeights) && responsiveHeights.length > 0;
  const heightVarValue = sliderHeight ? sliderHeight : hasResponsiveHeights ? void 0 : responsiveSliderHeight;
  const baseCss = (0, import_react3.useMemo)(() => {
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
  const childrenKey = (0, import_react3.useMemo)(() => {
    const arr = import_react3.Children.toArray(children);
    return arr.map((c) => String(c?.key ?? "")).join("|");
  }, [children]);
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
  function getClientXY2(evt) {
    const t = evt.changedTouches?.[0] ?? evt.touches?.[0];
    if (t) return { x: t.clientX, y: t.clientY };
    return { x: evt.clientX, y: evt.clientY };
  }
  function clickedVideoSurface(evt) {
    const { x, y } = getClientXY2(evt);
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
  (0, import_react3.useEffect)(() => {
    const el = slider.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rawKids = import_react3.Children.toArray(children).filter(import_react3.isValidElement);
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
    if (isReady) return;
    const imagesOk = lazyLoad ? true : sliderImagesReady;
    if (!engineReady || !imagesOk) return;
    setIsReady(true);
  }, [lazyLoad, sliderImagesReady, engineReady, isReady]);
  (0, import_react3.useLayoutEffect)(() => {
    if (!slider.current || cells.current.length === 0 || sliderWidth.current === 0 || !slides.current || !slides.current[0] || !slides.current[0].cells[0]?.element) return;
    const containerSize = slider.current[AX.clientKey];
    if (!wrap && sliderWidth.current <= containerSize) {
      sliderX.current = (containerSize - sliderWidth.current) / 2;
      translateRef.current?.to(Math.round(sliderX.current));
    }
    updateControlsImperatively();
  }, [slidesState, wrap]);
  (0, import_react3.useEffect)(() => {
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
    const rawKids = import_react3.Children.toArray(children).filter(import_react3.isValidElement);
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
    if (!slider.current) return;
    const childrenArray = import_react3.Children.toArray(children);
    const imgOffset = !wrap ? 0 : visibleImages * 2;
    if (clonedChildren.length !== import_react3.Children.toArray(children).length + imgOffset) return;
    if (!expandableImgRefs) return;
    expandableImgRefs.current = [];
    expandableImgRefs.current = Array(childrenArray.length + imgOffset).fill(null).map(() => (0, import_react3.createRef)());
    const images = slider.current.querySelectorAll("img");
    images.forEach((img, index) => {
      if (expandableImgRefs.current[index]) {
        ;
        expandableImgRefs.current[index].current = img;
      }
    });
    return () => {
      expandableImgRefs.current = [];
    };
  }, [children, clonedChildren, visibleImages, wrap]);
  (0, import_react3.useLayoutEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
    const x = loc ?? xRef.current;
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
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
    const tracker = DragTracker2(AX.main, window);
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
          if (!len2 || !baseScrollTarget) return 0;
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
          const { distance: distance2 } = baseTarget;
          const currentIndex = curIndex;
          if (proposedIndex !== currentIndex) {
            if (!wrap) {
              proposedIndex = Math.max(0, Math.min(len2 - 1, proposedIndex));
              const clamped = baseScrollTarget.byIndex(proposedIndex, dir);
              return clamped.distance;
            }
            return distance2;
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
        var allowedForce = allowedForce2;
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
  const centerSlider = (0, import_react3.useCallback)(() => {
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
  (0, import_react3.useImperativeHandle)(
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
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useEffect)(() => {
    const track = slider.current;
    if (!track || sliderHeight) return;
    const ro = new ResizeObserver(() => {
      centerSlider();
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [clonedChildren, visibleImages, wrap, cellsPerSlide, slider, sliderHeight, centerSlider, slidesState]);
  (0, import_react3.useEffect)(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(1e4);
  }, []);
  const addShield = (0, import_react3.useCallback)((timeoutMs) => {
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
  const fsForIntro = (0, import_react3.useMemo)(() => {
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
  const runSlideFullscreenIntro = (0, import_react3.useMemo)(() => {
    return createSliderFullscreenIntroRunner({
      normalizedItems,
      isRtl: direction === "rtl",
      styles: Slider_default,
      fs: fsForIntro,
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
  (0, import_react3.useEffect)(() => {
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
  const createRipple = (0, import_react3.useCallback)((container) => {
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
  const arrowNodes = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
    wrap,
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
  (0, import_react3.useEffect)(() => {
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
  const normalizedLoading = (0, import_react3.useMemo)(() => {
    const src = loadingOptions ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading
    };
  }, [loadingOptions]);
  const normalizedIntro = (0, import_react3.useMemo)(() => {
    const src = introOptions ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 40,
      transform: src.transform ?? 10,
      durationMs: src.durationMs ?? 300,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)"
    };
  }, [introOptions]);
  const introChildren = (0, import_react3.useMemo)(
    () => clonedChildren.map((child, i) => {
      if (!(0, import_react3.isValidElement)(child)) return child;
      const el = child;
      const prevStyle = el.props?.style || {};
      return (0, import_react3.cloneElement)(el, {
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
  const inner = /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
    arrowNodes,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "div",
      {
        className: [
          Slider_default.viewport,
          sliderViewportClassName ?? ""
        ].join(" "),
        style: {
          ...sliderViewportStyles
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
  const { cssText: skeletonCss, ssrBaseCount: skeletonCountBase } = (0, import_react3.useMemo)(() => {
    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: normalizedLoading.skeletonCount,
      fallbackCount: columnsForSkeleton,
      breakpointMap: bpMap,
      maxSlots: MAX_SKELETONS
    });
  }, [scopeId, normalizedLoading.skeletonCount, columnsForSkeleton, bpMap]);
  const defaultSliderSkeleton = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: Slider_default.sliderSkeletonOverlay, "data-rmg-skel-part": "overlay", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: Slider_default.sliderSkeletonRow, "data-rmg-skel-part": "row", children: Array.from({ length: MAX_SKELETONS }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
  const introWrapped = normalizedIntro.renderIntro ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ...baseContainerProps, children: normalizedIntro.renderIntro(
    { active: isReady && inView, containerProps: baseContainerProps },
    inner
  ) }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ...baseContainerProps, children: inner });
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
    responsiveCss && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("style", { dangerouslySetInnerHTML: { __html: responsiveCss } }),
    baseCss && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("style", { dangerouslySetInnerHTML: { __html: baseCss } }),
    skeletonCss && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("style", { dangerouslySetInnerHTML: { __html: skeletonCss } }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
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

// src/Gallery/index.module.css
var Gallery_default = {};

// src/Gallery/slider/thumbnails/ThumbnailSlider.tsx
var import_react4 = require("react");

// src/Gallery/slider/thumbnails/ThumbnailSlider.module.css
var ThumbnailSlider_default = {};

// src/Gallery/slider/thumbnails/ThumbnailSlider.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function DragTracker3(axis, ownerWindow) {
  return createDragTracker({
    ownerWindow,
    axis
  });
}
function ThumbnailSlider({
  children,
  position,
  thumbSize,
  className,
  style,
  thumbnailWidth,
  thumbnailHeight,
  indexChannel,
  onSelectThumb,
  thumbnailsCenter,
  thumbnailsContainerWidth,
  thumbnailsContainerHeight,
  thumbnailsContainerClassName,
  thumbnailsContainerStyle,
  thumbnailItemClassName,
  thumbnailItemStyle,
  gap = 8,
  freeScroll = true,
  groupCells = false,
  loop = false,
  direction = "ltr",
  skipSnaps = false,
  centerActiveThumb = false,
  selectDuration = 25,
  freeScrollDuration = 43,
  sliderFriction = 0.68,
  loadingOptions,
  introOptions,
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
  const isHorizontal = position === "top" || position === "bottom";
  const axis = Axis(isHorizontal);
  const isRtl = direction === "rtl" ? true : false;
  const sign = isHorizontal && isRtl ? -1 : 1;
  const containerRef = (0, import_react4.useRef)(null);
  const trackRef = (0, import_react4.useRef)(null);
  const scopeId = (0, import_react4.useId)().replace(/:/g, "-");
  const channelRef = (0, import_react4.useRef)(indexChannel ?? createIndexChannel());
  const [thumbLong, setThumbLong] = (0, import_react4.useState)(thumbSize ?? 0);
  const [thumbCross, setThumbCross] = (0, import_react4.useState)(0);
  const [contentLength, setContentLength] = (0, import_react4.useState)(0);
  const [containerLength, setContainerLength] = (0, import_react4.useState)(0);
  const locationRef = (0, import_react4.useRef)(null);
  const previousLocationRef = (0, import_react4.useRef)(null);
  const offsetLocationRef = (0, import_react4.useRef)(null);
  const targetRef = (0, import_react4.useRef)(null);
  const bodyRef = (0, import_react4.useRef)(null);
  const translateRef = (0, import_react4.useRef)(null);
  const animRef = (0, import_react4.useRef)(null);
  const limitRef = (0, import_react4.useRef)(null);
  const boundsRef = (0, import_react4.useRef)(null);
  const povRef = (0, import_react4.useRef)(null);
  const isAnimatingRef = (0, import_react4.useRef)(false);
  const prevButtonRef = (0, import_react4.useRef)(null);
  const nextButtonRef = (0, import_react4.useRef)(null);
  const pagesRef = (0, import_react4.useRef)([]);
  const snapModeRef = (0, import_react4.useRef)("base");
  const pointerDownRef = (0, import_react4.useRef)(false);
  const isPointerDown = (0, import_react4.useRef)(false);
  const isClickRef = (0, import_react4.useRef)(true);
  const xRef = (0, import_react4.useRef)(0);
  const dragX = (0, import_react4.useRef)(0);
  const previousDragX = (0, import_react4.useRef)(0);
  const dragMoveTime = (0, import_react4.useRef)(null);
  const sliderVelocity = (0, import_react4.useRef)(0);
  const selectedIndexRef = (0, import_react4.useRef)(channelRef.current.get().index ?? 0);
  const rawKids = import_react4.Children.toArray(children).filter(import_react4.isValidElement);
  const count = rawKids.length;
  const baseOffsetRef = (0, import_react4.useRef)(0);
  const downTargetRef = (0, import_react4.useRef)(null);
  const [inView, setInView] = (0, import_react4.useState)(false);
  const [isReady, setIsReady] = (0, import_react4.useState)(false);
  const readyRafRef = (0, import_react4.useRef)(null);
  const readyPaintedRef = (0, import_react4.useRef)(false);
  const contentSizeRef = (0, import_react4.useRef)(0);
  const loopLimitRef = (0, import_react4.useRef)(null);
  const scrollSnapsRef = (0, import_react4.useRef)([]);
  const scrollContentSizeRef = (0, import_react4.useRef)(0);
  const scrollLimitRef = (0, import_react4.useRef)(null);
  const scrollTargetRef = (0, import_react4.useRef)(null);
  const scrollToRef = (0, import_react4.useRef)(null);
  const indexCurrentRef = (0, import_react4.useRef)(null);
  const indexPreviousRef = (0, import_react4.useRef)(null);
  const [buildKey, setBuildKey] = (0, import_react4.useState)(0);
  const loopStableRef = (0, import_react4.useRef)(null);
  const [geomKey, setGeomKey] = (0, import_react4.useState)(0);
  const lastGeomSigRef = (0, import_react4.useRef)("");
  const [wrap, setWrap] = (0, import_react4.useState)(false);
  const isWrapping = (0, import_react4.useRef)(false);
  const clonesCountRef = (0, import_react4.useRef)(0);
  const visibleThumbsRef = (0, import_react4.useRef)(1);
  const layoutRef = (0, import_react4.useRef)(null);
  const thumbCells = (0, import_react4.useRef)([]);
  const [clonedChildren, setClonedChildren] = (0, import_react4.useState)([]);
  const lastCloneSigRef = (0, import_react4.useRef)("");
  const slidesRef = (0, import_react4.useRef)([]);
  const [slidesState, setSlidesState] = (0, import_react4.useState)([]);
  const [isMeasured, setIsMeasured] = (0, import_react4.useState)(false);
  const cellToSlideRef = (0, import_react4.useRef)([]);
  const sliderWidth = (0, import_react4.useRef)(0);
  const [layoutReady, setLayoutReady] = (0, import_react4.useState)(false);
  const prevActiveRef = (0, import_react4.useRef)(-1);
  const draggingAttr = "data-rmg-drag";
  const activePointerIdRef = (0, import_react4.useRef)(null);
  const guardsStoreRef = (0, import_react4.useRef)(null);
  const AX = (0, import_react4.useMemo)(() => {
    const main = isHorizontal ? "x" : "y";
    const cross = isHorizontal ? "y" : "x";
    const sizeKey = isHorizontal ? "width" : "height";
    const clientKey = isHorizontal ? "clientWidth" : "clientHeight";
    const startKey = isHorizontal ? "left" : "top";
    const endKey = isHorizontal ? "right" : "bottom";
    const translate = (n) => isHorizontal ? `translate3d(${n}px,0,0)` : `translate3d(0,${n}px,0)`;
    const place = (n) => isHorizontal ? `translateX(${n}px) scale(var(--rmg-scale, 1))` : `translateY(${n}px) scale(var(--rmg-scale, 1))`;
    const wheelDelta = (e) => isHorizontal ? e.deltaX : e.deltaY;
    return { main, cross, sizeKey, clientKey, startKey, endKey, translate, place, wheelDelta };
  }, [position]);
  (0, import_react4.useEffect)(() => {
    const root2 = containerRef.current;
    if (!root2) return;
    let canceled = false;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (canceled) return;
        const ent = entries[0];
        setInView(!!ent?.isIntersecting);
      },
      {
        root: null,
        rootMargin: "200px 0px 200px 0px",
        threshold: 0.01
      }
    );
    io.observe(root2);
    return () => {
      canceled = true;
      io.disconnect();
    };
  }, []);
  function setWrapSafe(next2) {
    if (loopStableRef.current === next2) return;
    loopStableRef.current = next2;
    setWrap(next2);
    isWrapping.current = next2;
    setLayoutReady(false);
    setIsReady(false);
    readyPaintedRef.current = false;
    setBuildKey((k) => k + 1);
  }
  function mod2(n, m) {
    return (n % m + m) % m;
  }
  function getCenterScroll(i) {
    const lay = layoutRef.current;
    if (!lay?.originals?.length) return 0;
    const o = lay.originals[i];
    if (!o) return 0;
    const view = lay.cw || containerLength || 0;
    const size = o.size;
    const raw = o.start - (view - size) / 2;
    if (!wrap) {
      const maxScroll = Math.max(0, contentLength - view);
      return clamp(raw, 0, maxScroll);
    }
    const W = contentLength || sliderWidth.current || 0;
    if (!W) return 0;
    return mod2(raw, W);
  }
  function setTargetToScroll(scroll) {
    const tgt = targetRef.current;
    if (!tgt) return;
    const desired = -scroll;
    if (!wrap) {
      tgt.set(desired);
      return;
    }
    const W = contentLength || sliderWidth.current || 0;
    if (!W) {
      tgt.set(desired);
      return;
    }
    const cur = tgt.get();
    const c0 = desired;
    const c1 = desired + W;
    const c2 = desired - W;
    const best = Math.abs(c0 - cur) <= Math.abs(c1 - cur) && Math.abs(c0 - cur) <= Math.abs(c2 - cur) ? c0 : Math.abs(c1 - cur) <= Math.abs(c2 - cur) ? c1 : c2;
    tgt.set(best);
  }
  function cloneThumb(child, key, canonicalIndex, elementIndex) {
    return (0, import_react4.cloneElement)(child, {
      key,
      ["data-rmg-thumb-index"]: String(canonicalIndex),
      ref: (el) => {
        if (!el) return;
        if (!thumbCells.current.some((c) => c.element === el)) {
          thumbCells.current.push({ element: el, index: elementIndex });
        }
      },
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: thumbnailWidth,
        height: thumbnailHeight,
        cursor: "pointer",
        userSelect: "none",
        ...thumbnailItemStyle || {},
        ...child.props?.style || {}
      },
      className: [ThumbnailSlider_default.thumb, thumbnailItemClassName, child.props?.className].filter(Boolean).join(" "),
      draggable: false
    });
  }
  function computeCloneSig(originals, per) {
    return `${originals}|per=${per}|wrap=${wrap ? 1 : 0}`;
  }
  (0, import_react4.useEffect)(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rawKids2 = import_react4.Children.toArray(children).filter(import_react4.isValidElement);
      const originals = rawKids2.length;
      if (originals < 1) {
        clonesCountRef.current = 0;
        thumbCells.current = [];
        setClonedChildren([]);
        sliderWidth.current = 0;
        layoutRef.current = null;
        setWrapSafe(false);
        slidesRef.current = [];
        setSlidesState([]);
        cellToSlideRef.current = [];
        return;
      }
      const allEls = Array.from(el.children);
      const clonesBefore = clonesCountRef.current;
      const clonesAfter = clonesBefore;
      const originalEls = allEls.slice(clonesBefore, allEls.length - clonesAfter);
      const cw = el[AX.clientKey];
      let sum = 0;
      let count2 = 0;
      for (const slot of originalEls) {
        const w = slot.getBoundingClientRect()[AX.sizeKey];
        if (w === 0) {
          requestAnimationFrame(() => ro.observe(el));
          return;
        }
        if (sum + w <= cw) {
          sum += w;
          count2++;
        } else {
          count2++;
          break;
        }
      }
      const per = Math.max(2, Math.min(originals, count2));
      const shouldLoop = wrap;
      clonesCountRef.current = shouldLoop ? per : 0;
      if (visibleThumbsRef.current !== per) visibleThumbsRef.current = per;
      const sig = computeCloneSig(originals, per);
      if (sig === lastCloneSigRef.current) return;
      lastCloneSigRef.current = sig;
      const slides = [];
      thumbCells.current = [];
      if (shouldLoop) {
        slides.push(
          ...rawKids2.slice(-per).map((c, i) => {
            const canonicalIndex = originals - per + i;
            const elementIndex = -per + i;
            return cloneThumb(c, `before-${i}`, canonicalIndex, elementIndex);
          })
        );
      }
      slides.push(
        ...rawKids2.map((c, i) => {
          const canonicalIndex = i;
          const elementIndex = i;
          return cloneThumb(c, `original-${i}`, canonicalIndex, elementIndex);
        })
      );
      if (shouldLoop) {
        slides.push(
          ...rawKids2.slice(0, per).map((c, i) => {
            const canonicalIndex = i;
            const elementIndex = i;
            return cloneThumb(c, `after-${i}`, canonicalIndex, elementIndex);
          })
        );
      }
      setClonedChildren(slides);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    children,
    buildKey,
    wrap,
    gap,
    thumbSize,
    thumbLong,
    thumbnailWidth,
    thumbnailHeight,
    thumbnailItemClassName,
    thumbnailItemStyle,
    position
  ]);
  function getThumbIndexFromEventTarget(t) {
    const track = trackRef.current;
    if (!track) return -1;
    const el = t;
    if (!el) return -1;
    const thumbEl = el.closest?.("[data-rmg-thumb-index]");
    if (!thumbEl) return -1;
    if (!track.contains(thumbEl)) return -1;
    const raw = thumbEl.getAttribute("data-rmg-thumb-index");
    const idx = raw != null ? parseInt(raw, 10) : -1;
    return Number.isFinite(idx) ? idx : -1;
  }
  function commitThumbSelect(i) {
    if (i < 0 || i >= count) return;
    snapModeRef.current = "thumb";
    setActiveThumb(i);
    channelRef.current.set(i, "animated");
    onSelectThumb?.(i);
  }
  (0, import_react4.useEffect)(() => {
    if (!thumbnailsCenter) {
      baseOffsetRef.current = 0;
      return;
    }
    if (!contentLength || !containerLength) return;
    if (contentLength <= containerLength) {
      baseOffsetRef.current = (containerLength - contentLength) / 2;
    } else {
      baseOffsetRef.current = 0;
    }
  }, [thumbnailsCenter, contentLength, containerLength]);
  (0, import_react4.useEffect)(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;
    const schedule = () => {
      measureAndPosition();
    };
    function measureAndPosition() {
      const trackEl = trackRef.current;
      const container2 = containerRef.current;
      if (!trackEl || !container2) return;
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
      setContentLength(sliderWidth.current);
      setContainerLength(cw);
      const first = originalsForLayout[0]?.el;
      if (first) {
        const r = first.getBoundingClientRect();
        const long = r[AX.sizeKey];
        const cross = AX.main === "x" ? r.height : r.width;
        setThumbLong(long || thumbSize || 0);
        setThumbCross(cross || 0);
      }
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
    ro.observe(container);
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", schedule);
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [clonedChildren, gap, wrap, loop, AX, sign, position]);
  (0, import_react4.useEffect)(() => {
    readyPaintedRef.current = false;
    setIsReady(false);
    if (readyRafRef.current != null) {
      cancelAnimationFrame(readyRafRef.current);
      readyRafRef.current = null;
    }
    const root2 = containerRef.current;
    const track = trackRef.current;
    const canBeReady = !!root2 && !!track && isMeasured && layoutReady && sliderWidth.current > 0 && slidesRef.current.length > 0 && !!(thumbSize || thumbLong);
    if (!canBeReady) return;
    readyRafRef.current = requestAnimationFrame(() => {
      readyRafRef.current = requestAnimationFrame(() => {
        readyPaintedRef.current = true;
        setIsReady(true);
        readyRafRef.current = null;
      });
    });
    return () => {
      if (readyRafRef.current != null) {
        cancelAnimationFrame(readyRafRef.current);
        readyRafRef.current = null;
      }
    };
  }, [
    isMeasured,
    layoutReady,
    geomKey,
    buildKey,
    wrap,
    count,
    contentLength,
    containerLength,
    thumbLong,
    thumbSize,
    position
  ]);
  const getSnapTargets = () => (slidesRef.current || []).map((s) => s.target);
  const totalWidth = () => sliderWidth.current || 0;
  (0, import_react4.useEffect)(() => {
    const containerEl = trackRef.current;
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
    const rawKids2 = import_react4.Children.toArray(children).filter(import_react4.isValidElement);
    const childCount = rawKids2.length;
    const clonesBefore = wrap ? visibleThumbsRef.current : 0;
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
      slidesRef.current = newSlides;
      setSlidesState(newSlides);
      setLayoutReady(true);
      const map = [];
      newSlides.forEach((s, slideIdx) => {
        s.cells.forEach((c) => {
          map[c.index] = slideIdx;
        });
      });
      cellToSlideRef.current = map;
    }
    buildPages();
    return () => {
      canceled = true;
      if (retryTimer != null) window.clearTimeout(retryTimer);
    };
  }, [clonedChildren, geomKey, position]);
  function getPageForIndex(i) {
    const pages = pagesRef.current;
    if (!pages.length) return null;
    for (let p = 0; p < pages.length; p++) {
      const pg = pages[p];
      if (i >= pg.startIndex && i < pg.endIndex) return pg;
    }
    return pages[pages.length - 1] ?? null;
  }
  function getScrollForIndex(i) {
    if (centerActiveThumb) return getCenterScroll(i);
    if (groupCells && !freeScroll && snapModeRef.current === "thumb") {
      const pg = getPageForIndex(i);
      if (pg) return pg.targetScroll;
    }
    return snapModeRef.current === "thumb" ? getStartSnapScroll(i) : getCenteredScroll(i);
  }
  function setActiveThumb(i) {
    const track = trackRef.current;
    if (!track) return;
    const kids = Array.from(track.children);
    for (const el of kids) el.removeAttribute("data-active");
    const key = String(i);
    const matches = track.querySelectorAll(`[data-rmg-thumb-index="${CSS.escape(key)}"]`);
    matches.forEach((el) => el.setAttribute("data-active", "true"));
    prevActiveRef.current = i;
  }
  function ensureDragStyle(scopeId2) {
    const id = "rmg-drag-style-" + scopeId2;
    if (document.getElementById(id)) return;
    const style2 = document.createElement("style");
    style2.id = id;
    style2.textContent = `
      /* Only while data-rmg-drag is present on this slider root */
      #${scopeId2}[data-rmg-drag]        { cursor: grabbing !important; }
      #${scopeId2}[data-rmg-drag] *      { cursor: grabbing !important; }
    `;
    document.head.appendChild(style2);
  }
  (0, import_react4.useEffect)(() => {
    if (containerRef.current) ensureDragStyle(scopeId);
  }, [containerRef.current, scopeId]);
  function setDragCursor(on) {
    const root2 = containerRef.current;
    if (!root2) return;
    if (on) {
      if (!root2.hasAttribute(draggingAttr)) root2.setAttribute(draggingAttr, "");
      return;
    }
    if (root2.hasAttribute(draggingAttr)) root2.removeAttribute(draggingAttr);
    activePointerIdRef.current = null;
    guardsStoreRef.current?.clear();
    guardsStoreRef.current = null;
  }
  (0, import_react4.useEffect)(() => {
    const root2 = containerRef.current;
    if (!root2) return;
    const onLeave = () => {
      if (pointerDownRef.current) setDragCursor(false);
    };
    const onEnter = () => {
      if (pointerDownRef.current && activePointerIdRef.current != null) setDragCursor(true);
    };
    root2.addEventListener("mouseleave", onLeave, { passive: true });
    root2.addEventListener("mouseenter", onEnter, { passive: true });
    return () => {
      root2.removeEventListener("mouseleave", onLeave);
      root2.removeEventListener("mouseenter", onEnter);
    };
  }, []);
  (0, import_react4.useEffect)(() => {
    const ch = channelRef.current;
    const unsub = ch.subscribe(() => {
      const { index, mode } = ch.get();
      selectedIndexRef.current = clamp(index, 0, Math.max(0, count - 1));
      setActiveThumb(selectedIndexRef.current);
      if (pointerDownRef.current) return;
      snapModeRef.current = "base";
      const scroll = getScrollForIndex(selectedIndexRef.current);
      if (mode === "instant") {
        bodyRef.current?.useDuration(0).useFriction(1);
        setTargetToScroll(scroll);
        animRef.current?.start();
      } else {
        animateToScroll(scroll);
      }
    });
    return unsub;
  }, [count, thumbnailsCenter, contentLength, containerLength]);
  (0, import_react4.useEffect)(() => {
    const track = trackRef.current;
    if (!track) return;
    const ready = !!(contentLength && containerLength && (thumbSize || thumbLong));
    if (!ready) return;
    const maxIndex = Math.max(0, (track.children.length || count) - 1);
    const init = clamp(channelRef.current.get().index ?? 0, 0, maxIndex);
    setActiveThumb(init);
    animateToScroll(getScrollForIndex(init));
  }, [count, contentLength, containerLength, thumbLong, thumbSize]);
  function getCenteredScroll(i) {
    const lay = layoutRef.current;
    if (!lay?.originals?.length) return 0;
    const o = lay.originals[i];
    if (!o) return 0;
    const view = lay.cw || containerLength || 0;
    const size = o.size;
    const centerWanted = o.start - (view - size) / 2;
    const maxScroll = Math.max(0, contentLength - view);
    return clamp(centerWanted, 0, maxScroll);
  }
  function getStartSnapScroll(i) {
    const lay = layoutRef.current;
    if (!lay?.originals?.length) return 0;
    const o = lay.originals[i];
    if (!o) return 0;
    const view = lay.cw || containerLength || 0;
    const maxScroll = Math.max(0, contentLength - view);
    return clamp(o.start, 0, maxScroll);
  }
  function animateToScroll(scroll) {
    const isNarrow = thumbnailsCenter && contentLength <= containerLength;
    if (isNarrow) return;
    bodyRef.current?.useBaseDuration().useBaseFriction();
    setTargetToScroll(scroll);
    animRef.current?.start();
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
  function positionSlider() {
    const base = baseOffsetRef.current || 0;
    const x = xRef.current || 0;
    translateRef.current?.to((x + base) * sign);
  }
  function updateActiveIndexFromX(loc) {
    const indexCurrent = indexCurrentRef.current;
    if (!indexCurrent) return;
    const idxFromLoc = indexFromX(loc);
    const canonical = indexCurrent.get();
    if (idxFromLoc === canonical) return;
    if (!pointerDownRef.current && isAnimatingRef.current) {
      return;
    }
    indexCurrent.set(idxFromLoc);
    selectedIndexRef.current = idxFromLoc;
  }
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
  function clampIndex(i, len) {
    return Math.max(0, Math.min(len - 1, i));
  }
  function previous() {
    const scrollTo = scrollToRef.current;
    const body = bodyRef.current;
    const indexCur = indexCurrentRef.current;
    const len = slidesRef.current?.length ?? 0;
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
    const len = slidesRef.current?.length ?? 0;
    if (!scrollTo || !body || !indexCur || !len) return;
    const cur = indexCur.get();
    const target = wrap ? ((cur + 1) % len + len) % len : clampIndex(cur + 1, len);
    body.useBaseDuration().useBaseFriction();
    scrollToIndex(target, { direction: -1 });
  }
  (0, import_react4.useEffect)(() => {
    const root2 = containerRef.current;
    const track = trackRef.current;
    if (!root2 || !track || !slidesRef.current?.length || !layoutReady || !isMeasured || sliderWidth.current === 0) {
      return;
    }
    const isNarrow = !wrap && thumbnailsCenter && contentLength <= containerLength;
    const base = isNarrow ? (containerLength - contentLength) / 2 : 0;
    baseOffsetRef.current = base;
    const startIdx = selectedIndexRef.current || 0;
    const location = Vector1D(0);
    const previousLocation = Vector1D(0);
    const offsetLocation = Vector1D(0);
    const target = Vector1D(0);
    locationRef.current = location;
    previousLocationRef.current = previousLocation;
    offsetLocationRef.current = offsetLocation;
    targetRef.current = target;
    const W = sliderWidth.current || 0;
    const len = slidesRef.current.length || 1;
    const counterMax = len - 1;
    const startIndex = selectedIndexRef.current || 0;
    const indexCurrent = Counter(counterMax, startIndex, true);
    const indexPrevious = Counter(counterMax, startIndex, true);
    indexCurrentRef.current = indexCurrent;
    indexPreviousRef.current = indexPrevious;
    contentSizeRef.current = W;
    scrollContentSizeRef.current = W;
    const scrollSnaps = slidesRef.current.map((slide) => {
      return -slide.target;
    });
    scrollSnapsRef.current = scrollSnaps;
    const initialSnap = scrollSnaps[startIdx] ?? 0;
    location.set(initialSnap);
    previousLocation.set(initialSnap);
    offsetLocation.set(initialSnap);
    target.set(initialSnap);
    xRef.current = initialSnap;
    translateRef.current = Translate(track, AX);
    translateRef.current?.to((initialSnap + base) * sign);
    selectedIndexRef.current = startIdx;
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
        selectedIndexRef.current = idx;
        setActiveThumb(idx);
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
        updateActiveIndexFromX(loc);
      }
    );
    animRef.current = anim;
    anim.init();
    const dragStore = EventStore();
    const moveStore = EventStore();
    const tracker = DragTracker3(axis, window);
    let isMouse = false;
    let startMain = 0;
    let startCross = 0;
    let preventScroll = false;
    function addDragEvents() {
      const node = isMouse ? document : root2;
      moveStore.add(node, "touchmove", onMove).add(node, "touchend", onUp).add(node, "mousemove", onMove, { passive: false }).add(node, "mouseup", onUp);
    }
    function onDown(evt) {
      const isMouseEvt = isMouseEvent(evt, window);
      isMouse = isMouseEvt;
      if (isMouseEvt && evt.button !== 0) return;
      downTargetRef.current = evt.target;
      setDragCursor(true);
      pointerDownRef.current = true;
      isPointerDown.current = true;
      isClickRef.current = true;
      tracker.pointerDown(evt);
      startMain = tracker.readPoint(evt, AX.main);
      startCross = tracker.readPoint(evt, AX.cross);
      bodyRef.current.useFriction(0).useDuration(0);
      targetRef.current.set(locationRef.current.get());
      addDragEvents();
      animRef.current?.start();
    }
    const freeBoost = { mouse: 500, touch: 600 };
    function forceBoost(rawForce) {
      const type = isMouse ? "mouse" : "touch";
      return rawForce * freeBoost[type];
    }
    function onMove(evt) {
      const isTouchEvt = !isMouseEvent(evt, window);
      if (isTouchEvt && evt.touches?.length >= 2) return onUp(evt);
      if (pointerDownRef.current && activePointerIdRef.current != null) setDragCursor(true);
      const lastMain = tracker.readPoint(evt, AX.main);
      const lastCross = tracker.readPoint(evt, AX.cross);
      const diffMain = Math.abs(lastMain - startMain);
      const diffCross = Math.abs(lastCross - startCross);
      if (diffMain > 5 || diffCross > 5) isClickRef.current = false;
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
      if (isClickRef.current) {
        const idx = getThumbIndexFromEventTarget(evt.target);
        if (idx >= 0) {
          commitThumbSelect(idx);
          isMouse = false;
          return;
        }
      }
      if (freeScroll === false) {
        let allowedForce2 = function(force2) {
          const len2 = slidesRef.current.length || 1;
          if (!len2 || !baseScrollTarget) return 0;
          const curIndex = selectedIndexRef.current || 0;
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
            const dirBump2 = slidesRef.current.length === 2 ? dir : 0;
            const nextTarget = baseScrollTarget.byIndex(nextIndex2, dirBump2);
            return nextTarget.distance;
          }
          const baseTarget = baseScrollTarget.byDistance(force2, true);
          let { index: proposedIndex } = baseTarget;
          const { distance: distance2 } = baseTarget;
          const currentIndex = curIndex;
          if (proposedIndex !== currentIndex) {
            if (!wrap) {
              proposedIndex = Math.max(0, Math.min(len2 - 1, proposedIndex));
              const clamped = baseScrollTarget.byIndex(proposedIndex, dir);
              return clamped.distance;
            }
            return distance2;
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
          const dirBump = slidesRef.current.length === 2 ? dir : 0;
          const forced = baseScrollTarget.byIndex(nextIndex, dirBump);
          return forced.distance;
        };
        var allowedForce = allowedForce2;
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
    dragStore.add(root2, "dragstart", (evt) => evt.preventDefault(), { passive: false }).add(root2, "touchstart", onDown).add(root2, "mousedown", onDown, { passive: true }).add(root2, "touchcancel", onUp).add(root2, "contextmenu", onUp);
    function onWheel(e) {
      const primary = isHorizontal ? e.deltaX : e.deltaY;
      const primaryAbs = Math.abs(primary);
      const crossAbs = Math.abs(isHorizontal ? e.deltaY : e.deltaX);
      if (primaryAbs <= crossAbs) return;
      if (contentLength <= containerLength) return;
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
    root2.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      dragStore.clear();
      moveStore.clear();
      root2.removeEventListener("wheel", onWheel);
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [count, contentLength, containerLength, position, slidesState.length, layoutReady, geomKey, isMeasured, wrap]);
  (0, import_react4.useEffect)(() => {
    const isNarrow = !wrap && thumbnailsCenter && contentLength <= containerLength;
    const base = isNarrow ? baseOffsetRef.current : 0;
    const min = -Math.max(0, contentLength - containerLength);
    const max = 0;
    const nextLimit = Limit(isNaN(min) ? 0 : min, max);
    limitRef.current = nextLimit;
    if (pointerDownRef.current) return;
    if (isAnimatingRef.current) return;
    const cur = targetRef.current?.get() ?? 0;
    const clamped = nextLimit.constrain(cur);
    if (Math.abs(clamped - cur) < 1e-3) return;
    locationRef.current?.set(clamped);
    previousLocationRef.current?.set(clamped);
    offsetLocationRef.current?.set(clamped);
    targetRef.current?.set(clamped);
    xRef.current = clamped;
    translateRef.current?.to((clamped + base) * sign);
  }, [contentLength, containerLength, thumbnailsCenter, sign, wrap]);
  (0, import_react4.useEffect)(() => {
    if (!contentLength || !containerLength || !(thumbSize || thumbLong)) return;
    const i = clamp(channelRef.current.get().index ?? 0, 0, Math.max(0, count - 1));
    animateToScroll(getScrollForIndex(i));
  }, [contentLength, containerLength, thumbLong, thumbSize, count]);
  const normalizedLoading = (0, import_react4.useMemo)(() => {
    const src = loadingOptions ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading
    };
  }, [loadingOptions]);
  const normalizedIntro = (0, import_react4.useMemo)(() => {
    const src = introOptions ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 40,
      transform: src.transform ?? 10,
      durationMs: src.durationMs ?? 300,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)"
    };
  }, [introOptions]);
  const renderedThumbs = clonedChildren.length ? clonedChildren : rawKids.map((c, i) => cloneThumb(c, `fallback-${i}`, i, i));
  const introChildren = (0, import_react4.useMemo)(() => {
    return renderedThumbs.map((child, i) => {
      if (!(0, import_react4.isValidElement)(child)) return child;
      const el = child;
      const prevStyle = el.props?.style || {};
      return (0, import_react4.cloneElement)(el, {
        ...el.props,
        "data-rmg-index": i,
        style: {
          ...prevStyle,
          ["--rmg-intro-index"]: i
        }
      });
    });
  }, [renderedThumbs]);
  const MAX_SKELETONS = 12;
  const fallbackCount = 6;
  const { cssText: skeletonCss, ssrBaseCount: skeletonCountBase } = (0, import_react4.useMemo)(() => {
    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: normalizedLoading.skeletonCount,
      fallbackCount,
      breakpointMap,
      maxSlots: MAX_SKELETONS
    });
  }, [scopeId, normalizedLoading.skeletonCount, breakpointMap]);
  const defaultThumbSkeleton = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: ThumbnailSlider_default.thumbSkeletonOverlay, "data-rmg-skel-part": "overlay", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    "div",
    {
      className: ThumbnailSlider_default.thumbSkeletonRow,
      "data-rmg-skel-part": "row",
      style: {
        gap,
        flexDirection: isHorizontal ? "row" : "column"
      },
      children: Array.from({ length: MAX_SKELETONS }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "div",
        {
          className: ThumbnailSlider_default.thumbSkeleton,
          "data-rmg-skel-slot": i + 1,
          style: {
            width: isHorizontal ? thumbnailWidth ?? thumbSize ?? 64 : "100%",
            height: isHorizontal ? "100%" : thumbnailHeight ?? thumbSize ?? 64
          }
        },
        `rmg-thumb-skel-${i}`
      ))
    }
  ) });
  const showLoading = normalizedLoading.isLoading != null ? !!normalizedLoading.isLoading : !isReady;
  const loadingNode = showLoading ? normalizedLoading.renderLoading ? normalizedLoading.renderLoading({ layout: "thumbnails", count: skeletonCountBase }) : defaultThumbSkeleton : null;
  const fadeClass = showLoading ? "" : isReady && inView ? ThumbnailSlider_default.fadeInActive : ThumbnailSlider_default.fadeInStart;
  const baseContainerProps = {
    className: [ThumbnailSlider_default.fade_container, fadeClass].filter(Boolean).join(" "),
    "aria-busy": showLoading ? true : void 0
  };
  const outerStyle = {
    overflow: "hidden",
    ...isHorizontal ? { width: thumbnailsContainerWidth, height: thumbCross ? "100%" : "auto" } : { height: thumbnailsContainerHeight, width: thumbLong ? "100%" : "auto" },
    ...style || {}
  };
  const trackStyle = {
    width: isHorizontal ? "100%" : thumbnailWidth ?? "100%",
    height: isHorizontal ? thumbnailHeight ?? "100%" : "100%",
    willChange: "transform",
    backfaceVisibility: "hidden",
    touchAction: "none",
    visibility: isReady ? "visible" : "hidden"
  };
  const effectiveRippleEnabled = rippleEnabled !== false;
  const effectiveRippleClass = rippleClassName && rippleClassName.trim().length > 0 ? rippleClassName : ThumbnailSlider_default.ripple;
  const createRipple = (0, import_react4.useCallback)((container) => {
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
  const arrowNodes = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    RmgArrows,
    {
      axisMain: AX.main,
      clientKey: AX.clientKey,
      wrap,
      isRtl,
      showArrows,
      selectedIndex: selectedIndexRef.current,
      slideCount: slidesRef.current?.length ?? 0,
      measureRef: trackRef,
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
  const inner = /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
    arrowNodes,
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { ref: trackRef, style: trackStyle, children: introChildren })
  ] });
  const root = /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "div",
    {
      ...baseContainerProps,
      ref: containerRef,
      id: scopeId,
      "data-rmg-scope": scopeId,
      className: [className, thumbnailsContainerClassName, baseContainerProps.className].filter(Boolean).join(" "),
      style: {
        ...outerStyle,
        ...thumbnailsContainerStyle || {},
        ...baseContainerProps.style || {},
        ["--rmg-intro-stagger"]: `${normalizedIntro.staggerMs}ms`,
        ["--rmg-intro-transform"]: `${normalizedIntro.transform}px`,
        ["--rmg-intro-duration"]: `${normalizedIntro.durationMs}ms`,
        ["--rmg-intro-easing"]: normalizedIntro.easing
      },
      children: [
        loadingNode,
        normalizedIntro.renderIntro ? normalizedIntro.renderIntro(
          { active: isReady && inView, containerProps: baseContainerProps },
          inner
        ) : inner
      ]
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
    skeletonCss && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("style", { dangerouslySetInnerHTML: { __html: skeletonCss } }),
    root
  ] });
}

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

// src/Gallery/fullscreen/FullscreenThumbnailSlider.tsx
var import_react5 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
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
  const channelRef = (0, import_react5.useRef)(createIndexChannel(fsSub.get(), "animated"));
  (0, import_react5.useEffect)(() => {
    const off = fsSub.onEvent((e) => {
      if (e.type === "internalIndex") {
        channelRef.current.set(e.index, "animated", { silent: false });
      }
    });
    return off;
  }, [fsSub]);
  (0, import_react5.useEffect)(() => {
    channelRef.current.set(fsSub.get(), "animated", { silent: true });
  }, [fsSub]);
  const children = (0, import_react5.useMemo)(
    () => items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "button",
      {
        type: "button",
        style: {
          border: "none",
          padding: 0,
          background: "transparent",
          cursor: "pointer"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: wrapperStyle, className, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
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

// src/Gallery/grid/GridLayout.tsx
var React9 = __toESM(require("react"));

// src/Gallery/shared/hooks/useInViewOnce.ts
var React7 = __toESM(require("react"));
function useInViewOnce(enabled, ref, onInView) {
  React7.useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onInView();
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, ref, onInView]);
}

// src/Gallery/shared/hooks/useMediaReady.ts
var React8 = __toESM(require("react"));
function useMediaReady(enabled, ref, setReady) {
  React8.useEffect(() => {
    if (!enabled) return;
    setReady(false);
  }, [enabled, setReady]);
  React8.useEffect(() => {
    if (!enabled) return;
    const root = ref.current;
    if (!root) return;
    const media = Array.from(root.querySelectorAll("img,video"));
    if (media.length === 0) {
      setReady(true);
      return;
    }
    let cancelled = false;
    let loadedCount = 0;
    const tryDone = () => {
      if (cancelled) return;
      if (loadedCount >= media.length) setReady(true);
    };
    const offs = [];
    for (const el of media) {
      const mark = () => {
        if (cancelled) return;
        loadedCount += 1;
        tryDone();
      };
      if (el instanceof HTMLImageElement) {
        if (el.complete && el.naturalWidth > 0) {
          mark();
          continue;
        }
        const onDone = () => {
          el.removeEventListener("load", onDone);
          el.removeEventListener("error", onDone);
          mark();
        };
        el.addEventListener("load", onDone);
        el.addEventListener("error", onDone);
        offs.push(() => {
          el.removeEventListener("load", onDone);
          el.removeEventListener("error", onDone);
        });
      } else {
        if (el.readyState >= 2) {
          mark();
          continue;
        }
        const onDone = () => {
          el.removeEventListener("loadeddata", onDone);
          el.removeEventListener("error", onDone);
          mark();
        };
        el.addEventListener("loadeddata", onDone);
        el.addEventListener("error", onDone);
        offs.push(() => {
          el.removeEventListener("loadeddata", onDone);
          el.removeEventListener("error", onDone);
        });
      }
    }
    tryDone();
    return () => {
      cancelled = true;
      offs.forEach((off) => off());
    };
  }, [enabled, ref, setReady]);
}

// src/Gallery/grid/GridLayout.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
function GridLayout({
  cells,
  grid,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  enableFullscreen,
  onOpen,
  registerExpandableImg,
  gridItemBaseClass = "rmg__grid-item",
  renderMode
}) {
  const gridRootRef = React9.useRef(null);
  const [inView, setInView] = React9.useState(false);
  const [mediaReady, setMediaReady] = React9.useState(false);
  useInViewOnce(true, gridRootRef, () => setInView(true));
  useMediaReady(true, gridRootRef, setMediaReady);
  const isLoading = loading.isLoading ?? !mediaReady;
  const introActive = !isLoading && inView;
  const minWidth = typeof grid.minColumnWidth === "number" ? `${grid.minColumnWidth}px` : grid.minColumnWidth ?? "160px";
  const gapVal = React9.useMemo(() => {
    if (typeof grid.gap === "string" && Number.isNaN(parseFloat(grid.gap))) return grid.gap;
    const raw = resolveNumberFromResponsive(
      grid.gap,
      typeof grid.gap === "number" ? grid.gap : 8,
      viewportWidth,
      breakpoints
    );
    const px2 = Math.max(0, raw | 0);
    return `${px2}px`;
  }, [grid.gap, viewportWidth, breakpoints]);
  const resolvedGridColumnCount = React9.useMemo(() => {
    if (grid.columns == null) return void 0;
    const raw = resolveNumberFromResponsive(grid.columns, 1, viewportWidth, breakpoints);
    return Math.max(1, raw | 0);
  }, [grid.columns, viewportWidth, breakpoints]);
  const gridStyle = {
    ["--rmg-grid-min"]: minWidth,
    ["--rmg-grid-gap"]: gapVal
  };
  if (resolvedGridColumnCount && resolvedGridColumnCount > 0) {
    gridStyle.gridTemplateColumns = `repeat(${resolvedGridColumnCount}, minmax(0, 1fr))`;
  }
  const skeletonCount = cells.length;
  const defaultGridSkeleton = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: Gallery_default.gridSkeletonOverlay, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    "div",
    {
      className: [Gallery_default.gridSkeletonGrid, grid.rootClassName || ""].filter(Boolean).join(" "),
      style: gridStyle,
      children: Array.from({ length: skeletonCount }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: Gallery_default.gridSkeletonItem }, `rmg-grid-skel-${i}`))
    }
  ) });
  const loadingNode = isLoading ? loading.renderLoading ? loading.renderLoading({ layout: "grid", count: skeletonCount }) : defaultGridSkeleton : null;
  const renderModeProp = renderMode ?? "wrap";
  const gridChildren = React9.useMemo(() => {
    return cells.map((cell, index) => {
      const original = cell.node;
      const introStyle = {
        ["--rmg-intro-index"]: index
      };
      const baseClassName = [
        gridItemBaseClass,
        Gallery_default.gridItem,
        Gallery_default.introItem,
        grid.itemClassName || ""
      ].filter(Boolean).join(" ");
      if (renderModeProp === "passthrough") {
        return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          "div",
          {
            "data-rmg-idx": index,
            className: baseClassName,
            style: introStyle,
            children: original
          },
          cell.id
        );
      }
      if (!React9.isValidElement(original)) {
        return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          "button",
          {
            type: "button",
            "data-rmg-idx": index,
            className: baseClassName,
            style: introStyle,
            onClick: (e) => {
              e.preventDefault();
              if (!enableFullscreen) return;
              onOpen(index, e.currentTarget);
            },
            children: original
          },
          cell.id
        );
      }
      const originalEl = original;
      const origProps = originalEl.props ?? {};
      const origRef = originalEl.ref;
      const mergedRef = (node) => {
        if (typeof origRef === "function") origRef(node);
        else if (origRef && typeof origRef === "object") origRef.current = node;
        registerExpandableImg(index, node);
      };
      const mergedOnClick = (e) => {
        origProps.onClick?.(e);
        if (e.defaultPrevented) return;
        if (!enableFullscreen) return;
        onOpen(index, e.currentTarget);
      };
      return React9.cloneElement(originalEl, {
        key: cell.id,
        ref: mergedRef,
        onClick: mergedOnClick,
        "data-rmg-idx": index,
        className: [baseClassName, origProps.className || ""].filter(Boolean).join(" "),
        style: { ...origProps.style || {}, ...introStyle }
      });
    });
  }, [
    cells,
    enableFullscreen,
    onOpen,
    registerExpandableImg,
    grid.itemClassName,
    gridItemBaseClass,
    renderModeProp
  ]);
  React9.useLayoutEffect(() => {
    if (renderModeProp !== "passthrough") return;
    const root = gridRootRef.current;
    if (!root) return;
    for (let i = 0; i < cells.length; i++) {
      const host = root.querySelector(`[data-rmg-idx="${i}"]`);
      if (!host) {
        registerExpandableImg(i, null);
        continue;
      }
      const img = host.querySelector("img");
      registerExpandableImg(i, img ?? host);
    }
    return () => {
      for (let i = 0; i < cells.length; i++) registerExpandableImg(i, null);
    };
  }, [renderModeProp, cells.length, registerExpandableImg]);
  const containerProps = {
    className: [
      Gallery_default.gridRoot,
      Gallery_default.introContainer,
      introActive ? Gallery_default.introActive : "",
      grid.rootClassName || ""
    ].filter(Boolean).join(" "),
    style: {
      ...gridStyle,
      ["--rmg-intro-stagger"]: `${intro.staggerMs}ms`,
      ["--rmg-intro-transform"]: intro.transform,
      ["--rmg-intro-duration"]: `${intro.durationMs}ms`,
      ["--rmg-intro-easing"]: intro.easing
    },
    "aria-busy": isLoading ? true : void 0
  };
  const inner = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { ref: gridRootRef, ...containerProps, children: gridChildren });
  const introWrapped = intro.renderIntro ? intro.renderIntro({ active: introActive, containerProps }, inner) : inner;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
    loadingNode,
    introWrapped
  ] });
}

// src/Gallery/masonry/MasonryLayout.tsx
var React11 = __toESM(require("react"));

// src/Gallery/masonry/Masonry.tsx
var React10 = __toESM(require("react"));
var import_jsx_runtime12 = require("react/jsx-runtime");
var Masonry = ({
  items,
  masonryColumns,
  masonryGap,
  masonryPlacement = "balanced",
  masonryEstimatedItemHeight = 0,
  masonryClassNames,
  masonryStyle,
  masonryAs: RootComponent = "div",
  masonryRootRef,
  breakpoints
}) => {
  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;
  const [viewportWidth, setViewportWidth] = React10.useState(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth;
  });
  React10.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [heights, setHeights] = React10.useState(
    () => items.map(() => masonryEstimatedItemHeight)
  );
  React10.useEffect(() => {
    setHeights((prev) => {
      const next = [];
      for (let i = 0; i < items.length; i++) {
        next[i] = prev[i] ?? masonryEstimatedItemHeight;
      }
      return next;
    });
  }, [items.length, masonryEstimatedItemHeight]);
  const columnCount = React10.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryColumns,
      DEFAULT_MASONRY_COLUMNS,
      viewportWidth,
      breakpoints
    );
    return Math.max(1, raw | 0);
  }, [masonryColumns, viewportWidth, breakpoints]);
  const gapPx = React10.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryGap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      breakpoints
    );
    return Math.max(0, parseNumberLike(raw, DEFAULT_MASONRY_GAP_PX));
  }, [masonryGap, viewportWidth, breakpoints]);
  const [colIndex, setColIndex] = React10.useState(
    () => items.map(
      (_, i) => masonryPlacement === "roundRobin" ? i % Math.max(1, columnCount) : 0
    )
  );
  React10.useEffect(() => {
    const layout = new Array(items.length);
    if (masonryPlacement === "roundRobin") {
      for (let i = 0; i < items.length; i++) {
        layout[i] = i % columnCount;
      }
    } else {
      const colHeights = new Array(columnCount).fill(0);
      for (let i = 0; i < items.length; i++) {
        const h = heights[i] ?? masonryEstimatedItemHeight;
        let minCol = 0;
        let minVal = colHeights[0];
        for (let c = 1; c < columnCount; c++) {
          if (colHeights[c] < minVal) {
            minVal = colHeights[c];
            minCol = c;
          }
        }
        layout[i] = minCol;
        colHeights[minCol] += h + gapPx;
      }
    }
    setColIndex(layout);
  }, [
    items.length,
    heights,
    columnCount,
    masonryPlacement,
    gapPx,
    masonryEstimatedItemHeight
  ]);
  const handleHeight = React10.useCallback((index, height) => {
    setHeights((prev) => {
      const old = prev[index];
      if (old === height) return prev;
      const next = prev.slice();
      next[index] = height;
      return next;
    });
  }, []);
  const columnsChildren = React10.useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    items.forEach((child, index) => {
      let c = colIndex[index];
      if (c == null || c < 0 || c >= columnCount) {
        c = masonryPlacement === "roundRobin" ? index % columnCount : 0;
      }
      cols[c].push(
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          MasonryItem,
          {
            index,
            onHeight: handleHeight,
            className: masonryClassNames?.item,
            gapPx,
            children: child
          },
          index
        )
      );
    });
    return cols;
  }, [
    items,
    colIndex,
    columnCount,
    masonryPlacement,
    handleHeight,
    gapPx,
    masonryClassNames?.item
  ]);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    RootComponent,
    {
      ref: masonryRootRef,
      className: masonryClassNames?.root,
      style: {
        display: "flex",
        alignItems: "flex-start",
        columnGap: gapPx,
        rowGap: 0,
        width: "100%",
        ...masonryStyle || {}
      },
      children: columnsChildren.map((colChildren, i) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "div",
        {
          className: masonryClassNames?.column,
          style: {
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column"
          },
          children: colChildren
        },
        i
      ))
    }
  );
};
var MasonryItem = ({
  index,
  onHeight,
  className,
  gapPx,
  children
}) => {
  const ref = React10.useRef(null);
  React10.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => onHeight(index, el.offsetHeight);
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeight(index, entry.contentRect.height);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
    return;
  }, [index, onHeight]);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    "div",
    {
      ref,
      className,
      "data-rmg-idx": index,
      style: {
        marginBottom: gapPx,
        ["--rmg-intro-index"]: index
      },
      children
    }
  );
};
var DefaultMasonrySkeleton = ({
  count,
  columnCount,
  gapPx,
  classNames
}) => {
  const cols = Array.from(
    { length: Math.max(1, columnCount | 0) },
    () => []
  );
  const ratios = [55, 90, 130, 75];
  for (let i = 0; i < count; i++) {
    const pb = ratios[i % ratios.length];
    const colIdx = i % cols.length;
    cols[colIdx].push(
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "div",
        {
          className: classNames?.item,
          style: {
            paddingBottom: `${pb}%`,
            marginBottom: gapPx
          }
        },
        `rmg-mskel-${i}`
      )
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    "div",
    {
      className: classNames?.root,
      style: {
        display: "flex",
        alignItems: "flex-start",
        columnGap: gapPx,
        rowGap: 0,
        width: "100%"
      },
      children: cols.map((children, i) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "div",
        {
          className: classNames?.column,
          style: {
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column"
          },
          children
        },
        i
      ))
    }
  );
};

// src/Gallery/masonry/MasonryLayout.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function assignRef(ref, value) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}
function MasonryLayout({
  items,
  masonry,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  skeletonCount
}) {
  const localRootRef = React11.useRef(null);
  const [inView, setInView] = React11.useState(false);
  const [mediaReady, setMediaReady] = React11.useState(false);
  useInViewOnce(true, localRootRef, () => setInView(true));
  useMediaReady(true, localRootRef, setMediaReady);
  const isLoading = loading.isLoading ?? !mediaReady;
  const introActive = !isLoading && inView;
  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;
  const masonryColumnCount = React11.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonry.columns,
      DEFAULT_MASONRY_COLUMNS,
      viewportWidth,
      breakpoints
    );
    return Math.max(1, raw | 0);
  }, [masonry.columns, viewportWidth, breakpoints]);
  const masonryGapPx = React11.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonry.gap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      breakpoints
    );
    return Math.max(0, parseNumberLike(raw, DEFAULT_MASONRY_GAP_PX));
  }, [masonry.gap, viewportWidth, breakpoints]);
  const defaultMasonrySkeleton = /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: Gallery_default.gridSkeletonOverlay, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    DefaultMasonrySkeleton,
    {
      count: skeletonCount,
      columnCount: masonryColumnCount,
      gapPx: masonryGapPx,
      classNames: {
        root: Gallery_default.gridSkeletonMasonryRoot,
        column: Gallery_default.gridSkeletonMasonryCol,
        item: Gallery_default.gridSkeletonItem
      }
    }
  ) });
  const loadingNode = isLoading ? loading.renderLoading ? loading.renderLoading({ layout: "masonry", count: skeletonCount }) : defaultMasonrySkeleton : null;
  const masonryRootClassName = [
    Gallery_default.masonryRoot,
    Gallery_default.introContainer,
    introActive ? Gallery_default.introActive : "",
    masonry.classNames?.root || ""
  ].filter(Boolean).join(" ");
  const mergedRootRef = React11.useCallback((node) => {
    localRootRef.current = node;
    assignRef(masonry.rootRef, node);
  }, [masonry.rootRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
    loadingNode,
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      Masonry,
      {
        items,
        masonryColumns: masonry.columns,
        masonryGap: masonry.gap,
        masonryPlacement: masonry.placement ?? "balanced",
        masonryEstimatedItemHeight: masonry.estimatedItemHeight,
        masonryClassNames: {
          root: masonryRootClassName,
          column: [Gallery_default.masonryCol, masonry.classNames?.column].filter(Boolean).join(" "),
          item: [Gallery_default.masonryItem, masonry.classNames?.item].filter(Boolean).join(" ")
        },
        masonryStyle: {
          ["--rmg-intro-stagger"]: `${intro.staggerMs}ms`,
          ["--rmg-intro-transform"]: intro.transform,
          ["--rmg-intro-duration"]: `${intro.durationMs}ms`,
          ["--rmg-intro-easing"]: intro.easing
        },
        masonryAs: masonry.as ?? "div",
        masonryRootRef: mergedRootRef,
        breakpoints
      }
    )
  ] });
}

// src/Gallery/entries/defaults.ts
var DEFAULT_ENTRIES = {
  mediaLayout: "slider"
};

// src/Gallery/entries/hooks/useEntryInView.ts
var React12 = __toESM(require("react"));
function useEntryInView(len, opts) {
  const nearMargin = opts?.nearMargin ?? "700px 0px";
  const viewMargin = opts?.viewMargin ?? "0px 0px";
  const nearThreshold = opts?.threshold ?? 0.01;
  const everThreshold = 0;
  const root = opts?.root ?? null;
  const [nearView, setNearView] = React12.useState(
    () => Array.from({ length: len }, () => false)
  );
  const [everInView, setEverInView] = React12.useState(
    () => Array.from({ length: len }, () => false)
  );
  const nearIORef = React12.useRef(null);
  const viewIORef = React12.useRef(null);
  const nodeToIndexRef = React12.useRef(/* @__PURE__ */ new Map());
  const indexToNodeRef = React12.useRef([]);
  React12.useEffect(() => {
    indexToNodeRef.current = Array.from({ length: len }, () => null);
    setNearView(Array.from({ length: len }, () => false));
    setEverInView(Array.from({ length: len }, () => false));
    nodeToIndexRef.current.clear();
    nearIORef.current?.disconnect();
    viewIORef.current?.disconnect();
    nearIORef.current = null;
    viewIORef.current = null;
  }, [len]);
  React12.useEffect(() => {
    if (typeof window === "undefined") return;
    nearIORef.current?.disconnect();
    viewIORef.current?.disconnect();
    nearIORef.current = new IntersectionObserver(
      (entries) => {
        setNearView((prev) => {
          let next = prev;
          let changed = false;
          for (const e of entries) {
            const idx = nodeToIndexRef.current.get(e.target);
            if (idx == null || idx < 0 || idx >= len) continue;
            const isNow = !!e.isIntersecting;
            if (isNow !== prev[idx]) {
              if (!changed) {
                next = prev.slice();
                changed = true;
              }
              next[idx] = isNow;
            }
          }
          return changed ? next : prev;
        });
      },
      { root, rootMargin: nearMargin, threshold: nearThreshold }
    );
    viewIORef.current = new IntersectionObserver(
      (entries) => {
        setEverInView((prev) => {
          let next = prev;
          let changed = false;
          for (const e of entries) {
            const idx = nodeToIndexRef.current.get(e.target);
            if (idx == null || idx < 0 || idx >= len) continue;
            if (e.isIntersecting && !prev[idx]) {
              if (!changed) {
                next = prev.slice();
                changed = true;
              }
              next[idx] = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { root, rootMargin: viewMargin, threshold: everThreshold }
    );
    for (const [node] of nodeToIndexRef.current) {
      nearIORef.current.observe(node);
      viewIORef.current.observe(node);
    }
    return () => {
      nearIORef.current?.disconnect();
      viewIORef.current?.disconnect();
      nearIORef.current = null;
      viewIORef.current = null;
    };
  }, [root, nearMargin, viewMargin, nearThreshold, everThreshold, len]);
  const setEntryRef = React12.useCallback(
    (index) => (node) => {
      const prevNode = indexToNodeRef.current[index] ?? null;
      if (prevNode && prevNode !== node) {
        nodeToIndexRef.current.delete(prevNode);
        nearIORef.current?.unobserve(prevNode);
        viewIORef.current?.unobserve(prevNode);
      }
      indexToNodeRef.current[index] = node;
      if (!node) return;
      nodeToIndexRef.current.set(node, index);
      nearIORef.current?.observe(node);
      viewIORef.current?.observe(node);
    },
    []
  );
  return { nearView, everInView, setEntryRef };
}

// src/Gallery/entries/hooks/useEntryDecodeReady.ts
var React13 = __toESM(require("react"));
function safeEntriesKey(entries) {
  const list = entries ?? [];
  let key = `${list.length}|`;
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    key += (e?.key ?? e?.id ?? `i${i}`) + "|";
  }
  return key;
}
function decodeImageUrl(url, signal) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    const finish = () => resolve();
    if (signal?.aborted) return finish();
    signal?.addEventListener("abort", finish, { once: true });
    const hasDecode = typeof img.decode === "function";
    if (hasDecode) {
      img.decode().catch(() => {
      }).finally(finish);
      return;
    }
    if (img.complete) return finish();
    img.onload = finish;
    img.onerror = finish;
  });
}
function useEntryDecodeReady(enabled, entries, inView, opts) {
  const timeoutMs = opts?.timeoutMs ?? 8e3;
  const entriesKey = React13.useMemo(() => safeEntriesKey(entries), [entries]);
  const entryImageUrls = React13.useMemo(() => {
    const list = entries ?? [];
    return list.map(
      (entry) => (entry.media ?? []).filter((m) => m?.kind === "image" && typeof m?.src === "string").map((m) => m.src)
    );
  }, [entries]);
  const [decodedReady, setDecodedReady] = React13.useState([]);
  const startedRef = React13.useRef([]);
  const controllersRef = React13.useRef(/* @__PURE__ */ new Map());
  const initKeyRef = React13.useRef("");
  React13.useEffect(() => {
    if (!enabled) return;
    const len = entries?.length ?? 0;
    if (initKeyRef.current !== entriesKey) {
      initKeyRef.current = entriesKey;
      setDecodedReady(
        Array.from({ length: len }, (_, i) => (entryImageUrls[i]?.length ?? 0) === 0)
      );
      startedRef.current = Array.from({ length: len }, () => false);
      for (const [, ac] of controllersRef.current) ac.abort();
      controllersRef.current.clear();
    }
  }, [enabled, entriesKey, entries, entryImageUrls]);
  React13.useEffect(() => {
    if (!enabled) return;
    const len = entries?.length ?? 0;
    if (!len) return;
    for (let entryIndex = 0; entryIndex < len; entryIndex++) {
      const shouldStart = !!inView[entryIndex];
      const alreadyReady = decodedReady[entryIndex] ?? false;
      const alreadyStarted = startedRef.current[entryIndex] ?? false;
      if (!shouldStart || alreadyReady || alreadyStarted) continue;
      startedRef.current[entryIndex] = true;
      const urls = entryImageUrls[entryIndex] ?? [];
      if (!urls.length) {
        setDecodedReady((prev) => {
          if (prev[entryIndex]) return prev;
          const next = prev.slice();
          next[entryIndex] = true;
          return next;
        });
        continue;
      }
      const ac = new AbortController();
      controllersRef.current.set(entryIndex, ac);
      (async () => {
        for (const url of urls) {
          if (ac.signal.aborted) return;
          await Promise.race([
            decodeImageUrl(url, ac.signal),
            new Promise((resolve) => {
              const t = window.setTimeout(resolve, timeoutMs);
              ac.signal.addEventListener(
                "abort",
                () => {
                  window.clearTimeout(t);
                  resolve();
                },
                { once: true }
              );
            })
          ]);
        }
        if (ac.signal.aborted) return;
        setDecodedReady((prev) => {
          if (!prev || entryIndex < 0 || entryIndex >= prev.length) return prev;
          if (prev[entryIndex]) return prev;
          const next = prev.slice();
          next[entryIndex] = true;
          return next;
        });
      })();
    }
  }, [enabled, entries, entryImageUrls, inView, decodedReady, timeoutMs]);
  React13.useEffect(() => {
    return () => {
      for (const [, ac] of controllersRef.current) ac.abort();
      controllersRef.current.clear();
    };
  }, []);
  return { decodedReady, entriesKey };
}

// src/Gallery/entries/normalize.ts
var React14 = __toESM(require("react"));
function useNormalizedEntriesLoading(entries) {
  return React14.useMemo(() => {
    const src = entries.loading ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading
    };
  }, [entries.loading]);
}
function useNormalizedEntriesIntro(entries) {
  return React14.useMemo(() => {
    const src = entries.intro ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 200,
      transform: src.transform ?? "translateY(30px) scale(0.99)",
      durationMs: src.durationMs ?? 700,
      easing: src.easing ?? "cubic-bezier(.2,.7,.2,1)",
      staggerLimit: Math.max(0, (src.staggerLimit ?? 6) | 0)
    };
  }, [entries.intro]);
}

// src/Gallery/entries/components/EntryList.tsx
var React15 = __toESM(require("react"));

// src/Gallery/entries/components/EntrySkeleton.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function EntrySkeletonCard() {
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("article", { className: Gallery_default.entrySkeletonCard, children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: Gallery_default.entrySkeletonHeader, children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: `${Gallery_default.entrySkeletonAvatar} ${Gallery_default.entrySkeletonShimmer}` }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: Gallery_default.entrySkeletonLines, children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: `${Gallery_default.entrySkeletonLineShort} ${Gallery_default.entrySkeletonShimmer}` }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: `${Gallery_default.entrySkeletonLineLong} ${Gallery_default.entrySkeletonShimmer}` })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: Gallery_default.entrySkeletonBody, children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: `${Gallery_default.entrySkeletonLineLong} ${Gallery_default.entrySkeletonShimmer}` }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: `${Gallery_default.entrySkeletonLineMedium} ${Gallery_default.entrySkeletonShimmer}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: `${Gallery_default.entrySkeletonMedia} ${Gallery_default.entrySkeletonShimmer}` })
  ] });
}

// src/Gallery/entries/components/EntryList.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
function EntryList({
  enabled,
  entries,
  fsEnabled,
  openFullscreenAt,
  entryFlatIndexRef,
  nodeFromMedia,
  isClickRef,
  renderMediaContainer,
  registerExpandableImg
}) {
  const items = entries.items ?? [];
  const len = items.length;
  const { nearView, everInView, setEntryRef } = useEntryInView(len, {
    root: null,
    nearMargin: "700px 0px",
    viewMargin: "0px 0px",
    threshold: 0.01
  });
  const { decodedReady } = useEntryDecodeReady(enabled, items, nearView, {
    timeoutMs: 8e3
  });
  const loadingN = useNormalizedEntriesLoading(entries);
  const introN = useNormalizedEntriesIntro(entries);
  const showGlobalLoading = enabled && (loadingN.isLoading === true || len === 0);
  const entryRows = !len ? null : items.map((entry, entryIndex) => {
    const isNear = nearView[entryIndex] ?? false;
    const hasEver = everInView[entryIndex] ?? false;
    const isDecoded = decodedReady[entryIndex] ?? false;
    const shouldMountContent = hasEver || isNear;
    const reveal = hasEver && isDecoded;
    const showSkeleton = !reveal;
    let contentNode = null;
    if (shouldMountContent) {
      const mediaArray = entry.media ?? [];
      const flatIndexByEntry = entryFlatIndexRef.current;
      const mediaNodes = mediaArray.map((media, mediaIndex) => {
        const globalIndex = flatIndexByEntry?.[entryIndex]?.[mediaIndex] ?? 0;
        const rawContent = typeof entries.render?.media === "function" ? entries.render.media({ entry, entryIndex, media, mediaIndex }) : nodeFromMedia(media);
        const reg = (node) => {
          registerExpandableImg?.(globalIndex, node);
        };
        const handleClick = (e) => {
          e.preventDefault();
          if (!fsEnabled) return;
          if (entries.mediaLayout === "slider" && isClickRef && !isClickRef.current) return;
          openFullscreenAt(globalIndex, e.currentTarget);
        };
        if (React15.isValidElement(rawContent)) {
          const original = rawContent;
          const origOnClick = original.props?.onClick;
          const origRef = original.ref;
          const mergedOnClick = (e) => {
            if (typeof origOnClick === "function") origOnClick(e);
            if (e.defaultPrevented) return;
            handleClick(e);
          };
          if (typeof original.type === "string") {
            const mergedRef = (node) => {
              if (typeof origRef === "function") origRef(node);
              else if (origRef && typeof origRef === "object") origRef.current = node;
              reg(node);
            };
            return React15.cloneElement(original, {
              key: `${entryIndex}-${mediaIndex}`,
              onClick: mergedOnClick,
              ref: mergedRef
            });
          }
          return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "span",
            {
              ref: reg,
              style: { display: "contents" },
              children: React15.cloneElement(original, {
                onClick: mergedOnClick
              })
            },
            `${entryIndex}-${mediaIndex}`
          );
        }
        return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          "button",
          {
            type: "button",
            className: Gallery_default.entryMediaButton,
            onClick: handleClick,
            ref: reg,
            children: rawContent
          },
          `${entryIndex}-${mediaIndex}`
        );
      });
      const mediaContainer = renderMediaContainer({ entryIndex, mediaNodes });
      contentNode = typeof entries.render?.card === "function" ? entries.render.card({ entry, entryIndex, media: mediaContainer }) : mediaContainer;
    }
    const limit = introN.staggerLimit;
    const delayIndex = limit > 0 && entryIndex < limit ? entryIndex : 0;
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
      "div",
      {
        ref: setEntryRef(entryIndex),
        "data-rmg-entry-ready": reveal ? "1" : "0",
        className: Gallery_default.entryRow,
        "data-rmg-entry-owner": entryIndex,
        style: { ["--rmg-entry-intro-index"]: delayIndex },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: Gallery_default.entrySkeletonWrap, "aria-hidden": showSkeleton ? void 0 : true, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(EntrySkeletonCard, {}) }),
          shouldMountContent ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: Gallery_default.entryInner, children: contentNode }) : null
        ]
      },
      entry.key ?? entry.id ?? entryIndex
    );
  });
  const containerProps = {
    className: [Gallery_default.entryList].filter(Boolean).join(" "),
    style: {
      ["--rmg-entry-intro-stagger"]: `${introN.staggerMs}ms`,
      ["--rmg-entry-intro-transform"]: introN.transform,
      ["--rmg-entry-intro-duration"]: `${introN.durationMs}ms`,
      ["--rmg-entry-intro-easing"]: introN.easing
    },
    "aria-busy": showGlobalLoading ? true : void 0
  };
  const inner = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { ...containerProps, children: entryRows });
  return introN.renderIntro ? introN.renderIntro({ active: !showGlobalLoading, containerProps }, inner) : inner;
}

// src/Gallery/shared/hooks/useViewportWidth.ts
var React16 = __toESM(require("react"));
function useViewportWidth() {
  const [vw, setVw] = React16.useState(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth;
  });
  React16.useEffect(() => {
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

// src/Gallery/entries/overlay/useFsEntryOverlay.tsx
var React17 = __toESM(require("react"));
var import_client2 = require("react-dom/client");
var import_jsx_runtime16 = require("react/jsx-runtime");
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
  const mountRef = React17.useRef(null);
  const rootRef = React17.useRef(null);
  const rootMountRef = React17.useRef(null);
  const fsIndexRef = React17.useRef(fsSub.get());
  const entryOpacityRef = React17.useRef(1);
  const overlayElRef = React17.useRef(null);
  const openTokenRef = React17.useRef(0);
  const enteredTokenRef = React17.useRef(0);
  const enterRafRef = React17.useRef(0);
  const pendingUnmountRef = React17.useRef(0);
  const swapJobRef = React17.useRef(null);
  const cancelSwapJob = React17.useCallback(() => {
    const job = swapJobRef.current;
    if (!job) return;
    if (job.raf) cancelAnimationFrame(job.raf);
    if (job.t) clearTimeout(job.t);
    swapJobRef.current = null;
  }, []);
  const setEntryOverlayOpacity = React17.useCallback((next) => {
    const el = overlayElRef.current;
    if (!el) return;
    el.style.setProperty("--rmg-entry-opacity", String(next));
  }, []);
  const getEntryIndexForFsIndex = React17.useCallback(
    (fsIndex) => {
      const map = entryMapRef.current;
      const link = map?.[fsIndex];
      return link?.entryIndex ?? -1;
    },
    [entryMapRef]
  );
  const renderEntryOverlayForIndex = React17.useCallback(
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
        rootRef.current = (0, import_client2.createRoot)(mount);
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
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
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
  const fadeSwapToIndex = React17.useCallback(
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
  const setMountEl = React17.useCallback(
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
  React17.useEffect(() => {
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

// src/Gallery/entries/overlay/FsEntryOverlayMount.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
function FsEntryOverlayMount({ setMountEl, style, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
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

// src/Gallery/masonry/buildMasonryChildren.tsx
var React18 = __toESM(require("react"));
var import_jsx_runtime18 = require("react/jsx-runtime");
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
    if (!React18.isValidElement(original)) {
      return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
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
    return React18.cloneElement(originalEl, {
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

// src/Gallery/zoomPan/core/utils.ts
function getCurrentTransform(slide) {
  if (!slide) return { x: 0, y: 0 };
  const computedStyle = window.getComputedStyle(slide);
  const transform = computedStyle.transform;
  if (!transform || transform === "none") return { x: 0, y: 0 };
  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (!matrixMatch) return { x: 0, y: 0 };
  const matrixValues = matrixMatch[1].split(",").map(parseFloat);
  const tx = matrixValues[4] || 0;
  const ty = matrixValues[5] || 0;
  return { x: tx, y: ty };
}
function baseFitSizeC(imgEl, containerW, containerH) {
  const natW = imgEl.naturalWidth || imgEl.width || containerW;
  const natH = imgEl.naturalHeight || imgEl.height || containerH;
  const fit = Math.min(containerW / natW, containerH / natH);
  return { baseW: natW * fit, baseH: natH * fit };
}
function clampNum(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function midpoint(a, b) {
  if (!b) return { x: a.clientX, y: a.clientY };
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}
function distance(a, b) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

// src/Gallery/zoomPan/core/dom.ts
function getPrimaryImgEl(container) {
  if (!container) return null;
  const child0 = container.children[0];
  if (child0 && child0.tagName && String(child0.tagName).toLowerCase() === "img") {
    return child0;
  }
  return container.querySelector("img");
}
function getClientXY(evt) {
  const clientX = evt?.touches?.[0]?.clientX ?? evt?.changedTouches?.[0]?.clientX ?? evt?.clientX ?? 0;
  const clientY = evt?.touches?.[0]?.clientY ?? evt?.changedTouches?.[0]?.clientY ?? evt?.clientY ?? 0;
  return { clientX, clientY };
}
function findImgAtPoint(doc, x, y) {
  const el = doc.elementFromPoint(x, y);
  if (!el) return null;
  if (el.tagName?.toLowerCase() === "img") return el;
  const img = el.querySelector?.("img");
  return img || null;
}
function readDataIndex(img) {
  if (!img) return null;
  const v = img.dataset.index;
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function gapAllEdges(containerRect, imgEl) {
  const cw = containerRect.width;
  const ch = containerRect.height;
  const iw = imgEl.offsetWidth;
  const ih = imgEl.offsetHeight;
  return cw > 0 && ch > 0 && iw > 0 && ih > 0 && iw < cw && ih < ch;
}

// src/Gallery/zoomPan/zoom/zoomTo.ts
function applySmoothTransform(ctx, x, y, scale, durationMs = 300) {
  const container = ctx.currentImage.current;
  if (!container) return;
  const primary = container.children[0];
  if (!primary) return;
  const transition = `transform ${durationMs}ms cubic-bezier(.4,0,.22,1)`;
  const toTransform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  primary.style.transition = transition;
  primary.style.transform = toTransform;
  ctx.offX.current?.set(x);
  ctx.offY.current?.set(y);
  ctx.locX.current?.set(x);
  ctx.locY.current?.set(y);
  ctx.prevX.current?.set(x);
  ctx.prevY.current?.set(y);
  ctx.tgtX.current?.set(x);
  ctx.tgtY.current?.set(y);
  ctx.scaleRef.current = scale;
  ctx.setScale(scale);
  window.setTimeout(() => {
    primary.style.transition = "";
  }, durationMs + 30);
}
function zoomTo(ctx, args) {
  const { destZoomLevel, centerPoint, imageRef } = args;
  if (!imageRef.current) return;
  ctx.currentImage.current = imageRef.current;
  const container = ctx.currentImage.current;
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
  const s1 = clampNum(destZoomLevel, 1, ctx.fs.zoom.maxZoomLevel);
  if (s1 === s0) return;
  const ZOOM_EPS = 1.01;
  const wasZoomed = s0 > ZOOM_EPS;
  const willBeZoomed = s1 > ZOOM_EPS;
  if (!wasZoomed && willBeZoomed) ctx.suppressLoopRef.current = true;
  else if (wasZoomed && !willBeZoomed) ctx.suppressLoopRef.current = false;
  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;
  const cx = centerPoint.x - rect.left;
  const cy = centerPoint.y - rect.top;
  const { baseW, baseH } = baseFitSizeC(imgEl, containerW, containerH);
  const offXc = (containerW - baseW) / 2;
  const offYc = (containerH - baseH) / 2;
  const tx0 = ctx.offX.current.get();
  const ty0 = ctx.offY.current.get();
  const k = s1 / s0;
  let tx1 = tx0 + (1 - k) * (cx - offXc - tx0);
  let ty1 = ty0 + (1 - k) * (cy - offYc - ty0);
  const { x: limX, y: limY, povX, povY } = ctx.boundsForCurrent(
    s1,
    baseW,
    baseH,
    containerW,
    containerH
  );
  tx1 = limX.constrain(tx1);
  ty1 = limY.constrain(ty1);
  ctx.scaleRef.current = s1;
  ctx.setScale(s1);
  ctx.previousZoom.current.x = cx;
  ctx.previousZoom.current.y = cy;
  ctx.tgtX.current.set(tx1);
  ctx.locX.current.set(tx1);
  ctx.prevX.current.set(tx1);
  ctx.offX.current.set(tx1);
  ctx.tgtY.current.set(ty1);
  ctx.locY.current.set(ty1);
  ctx.prevY.current.set(ty1);
  ctx.offY.current.set(ty1);
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
  ctx.bodyX.current?.useDuration(0).useFriction(1);
  ctx.bodyY.current?.useDuration(0).useFriction(1);
  ctx.renderPan(tx1, ty1);
  ctx.animRef.current?.start();
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

// src/Gallery/zoomPan/pan/usePanAnimation.ts
var React19 = __toESM(require("react"));
function usePanAnimation(d) {
  React19.useEffect(() => {
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

// src/Gallery/zoomPan/pan/usePanDrag.ts
var React20 = __toESM(require("react"));
function Axis2() {
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
function DragTracker4(axis, ownerWindow) {
  return createDragTracker({ ownerWindow, axis });
}
function usePanDrag(d) {
  const freeBoost = React20.useMemo(() => ({ mouse: 400, touch: 400 }), []);
  const trackerRef = React20.useRef(null);
  const dragStore = React20.useRef(EventStore()).current;
  const moveStore = React20.useRef(EventStore()).current;
  const forceBoost = React20.useCallback(
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
  React20.useEffect(() => {
    ensurePanCursorStyle();
  }, []);
  const setGrabbing = React20.useCallback((on) => {
    const root = document.documentElement;
    if (on) root.classList.add("rmg-pan-grabbing");
    else root.classList.remove("rmg-pan-grabbing");
  }, []);
  const handlePanPointerStart = React20.useCallback(
    (e, imageRef) => {
      if (!d.isZoomed) return;
      if (!imageRef.current) return;
      d.currentImage.current = imageRef.current;
      d.getImageAspectRatio(imageRef.current);
      d.rebuildPanBodies();
      const ownerWin = window;
      const axis = d.axisRef.current || Axis2();
      trackerRef.current = DragTracker4(axis, ownerWin);
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
  React20.useEffect(() => {
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

// src/Gallery/video/plyr.ts
var defaultPlyrOptions = {
  controls: ["play-large", "play", "progress", "current-time", "volume", "fullscreen"],
  ratio: "16:9",
  fullscreen: { enabled: true, fallback: true, iosNative: true }
};
var defaultPlyrSource = (item) => ({
  type: "video",
  poster: item.thumb,
  sources: [{ src: item.src, type: "video/mp4" }]
});
var isVideoItem = (m) => m.kind === "video";
function buildPlyrProps(items, getSource, resolveOptions) {
  return items.map((item, index) => {
    if (!isVideoItem(item)) return null;
    return { source: getSource(item, index), options: resolveOptions(item, index) };
  });
}
function mergePlyrOptions(base, options) {
  return (item, index) => {
    const resolved = typeof options === "function" ? options(item, index) : options ?? base;
    return { ...base, ...resolved };
  };
}
function detectProvider(source) {
  const provider = String(source?.sources?.[0]?.provider ?? "").toLowerCase();
  if (provider === "youtube") return "youtube";
  if (provider === "vimeo") return "vimeo";
  const src0 = String(source?.sources?.[0]?.src ?? "").toLowerCase();
  const looksMp4 = src0.endsWith(".mp4") || src0.includes(".mp4?");
  if (looksMp4) return "mp4";
  return "other";
}
function isVideoSlideElement(el) {
  if (!el) return false;
  if (el.classList?.contains("rmg__player")) return true;
  if (el.tagName.toLowerCase() === "video") return true;
  return false;
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

// src/Gallery/fullscreen/hooks/useWrappedItemsAndRefs.ts
var React21 = __toESM(require("react"));
function useWrappedItemsAndRefs(args) {
  const { normalizedItems, wrappedItems, setWrappedItems, imageRefs } = args;
  React21.useEffect(() => {
    if (!normalizedItems.length) return;
    const first = normalizedItems[0];
    const last = normalizedItems[normalizedItems.length - 1];
    setWrappedItems([last, ...normalizedItems, first]);
  }, [normalizedItems, setWrappedItems]);
  React21.useEffect(() => {
    if (!wrappedItems.length) return;
    imageRefs.current = wrappedItems.map(() => React21.createRef());
  }, [wrappedItems, imageRefs]);
}

// src/Gallery/shared/hooks/useWindowSize.ts
var React22 = __toESM(require("react"));
function readSize() {
  return {
    width: document.documentElement.clientWidth,
    height: window.innerHeight
  };
}
function useWindowSize() {
  const [size, setSize] = React22.useState(() => {
    if (typeof window === "undefined") return { width: 1024, height: 768 };
    return readSize();
  });
  React22.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setSize(readSize());
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// src/Gallery/video/usePlyrProps.ts
var React23 = __toESM(require("react"));
function usePlyrProps(args) {
  const { items, source, options } = args;
  return React23.useMemo(() => {
    if (!items?.length) return [];
    const getSource = (item, index) => (source ?? defaultPlyrSource)(item, index);
    const getOptions = mergePlyrOptions(defaultPlyrOptions, options);
    return buildPlyrProps(items, getSource, getOptions);
  }, [items, source, options]);
}

// src/Gallery/video/plyrGuards.ts
function installDragClickSwallower(plyr) {
  const container = plyr?.elements?.container;
  const controls = plyr?.elements?.controls;
  if (!container) return;
  if (plyr.__rmgDragSwallowCleanup) return;
  const THRESH_PX = 6;
  let downX = 0;
  let downY = 0;
  let didDrag = false;
  let activePointerId = null;
  const isInControls = (t) => !!(controls && t instanceof Node && controls.contains(t));
  const stopAll = (e) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
  };
  const onPointerDownCapture = (e) => {
    if (isInControls(e.target)) return;
    activePointerId = e.pointerId;
    downX = e.clientX;
    downY = e.clientY;
    didDrag = false;
  };
  const onPointerMoveCapture = (e) => {
    if (activePointerId == null || e.pointerId !== activePointerId) return;
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (!didDrag && Math.hypot(dx, dy) > THRESH_PX) didDrag = true;
  };
  const onPointerUpCapture = (e) => {
    if (activePointerId == null || e.pointerId !== activePointerId) return;
    if (didDrag && !isInControls(e.target)) stopAll(e);
    activePointerId = null;
    if (didDrag) {
      window.setTimeout(() => {
        didDrag = false;
      }, 0);
    }
  };
  const onClickCapture = (e) => {
    if (didDrag && !isInControls(e.target)) stopAll(e);
  };
  const onTouchEndCapture = (e) => {
    if (didDrag && !isInControls(e.target)) stopAll(e);
  };
  container.addEventListener("pointerdown", onPointerDownCapture, { capture: true });
  container.addEventListener("pointermove", onPointerMoveCapture, { capture: true });
  container.addEventListener("pointerup", onPointerUpCapture, { capture: true });
  container.addEventListener("pointercancel", onPointerUpCapture, { capture: true });
  container.addEventListener("click", onClickCapture, { capture: true });
  container.addEventListener("touchend", onTouchEndCapture, { capture: true, passive: false });
  plyr.__rmgDragSwallowCleanup = () => {
    container.removeEventListener("pointerdown", onPointerDownCapture, { capture: true });
    container.removeEventListener("pointermove", onPointerMoveCapture, { capture: true });
    container.removeEventListener("pointerup", onPointerUpCapture, { capture: true });
    container.removeEventListener("pointercancel", onPointerUpCapture, { capture: true });
    container.removeEventListener("click", onClickCapture, { capture: true });
    container.removeEventListener("touchend", onTouchEndCapture, { capture: true });
    delete plyr.__rmgDragSwallowCleanup;
  };
}
function installDblclickGuardWhenReady(player) {
  if (!player) return;
  const inst = player;
  const plyr = inst?.plyr;
  if (!plyr) return;
  const attach = () => {
    const container = plyr?.elements?.container;
    const controls = plyr?.elements?.controls;
    if (!container) {
      requestAnimationFrame(attach);
      return;
    }
    plyr.__rmgGuardCleanup?.();
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    let shield = container.querySelector(".rmg-plyr-gesture-shield");
    if (!shield) {
      shield = document.createElement("div");
      shield.className = "rmg-plyr-gesture-shield";
      Object.assign(shield.style, {
        position: "absolute",
        inset: "0",
        zIndex: "2",
        background: "transparent",
        pointerEvents: "none"
      });
      container.appendChild(shield);
    }
    if (controls) {
      const currentZ = getComputedStyle(controls).zIndex;
      if (!currentZ || currentZ === "auto" || Number(currentZ) < 3) {
        controls.style.zIndex = "3";
      }
    }
    const stop = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    const onDbl = (e) => stop(e);
    shield.addEventListener("dblclick", onDbl, { capture: true });
    let lastTap = 0;
    const onTouchEnd = (e) => {
      const now = Date.now();
      if (now - lastTap < 320) stop(e);
      lastTap = now;
    };
    shield.addEventListener("touchend", onTouchEnd, { capture: true, passive: false });
    const onClick = (e) => {
      const p = plyr;
      if (p?.paused) p.play();
      else p?.pause();
      e.stopPropagation();
      e.preventDefault();
    };
    shield.addEventListener("click", onClick, { capture: true });
    const onContainerDbl = (e) => {
      if (!controls || !controls.contains(e.target)) stop(e);
    };
    container.addEventListener("dblclick", onContainerDbl, { capture: true });
    installDragClickSwallower(plyr);
    plyr.__rmgGuardCleanup = () => {
      shield.removeEventListener("dblclick", onDbl, { capture: true });
      shield.removeEventListener("touchend", onTouchEnd, { capture: true });
      shield.removeEventListener("click", onClick, { capture: true });
      container.removeEventListener("dblclick", onContainerDbl, { capture: true });
    };
  };
  plyr.on?.("ready", attach);
  requestAnimationFrame(attach);
  plyr.on?.("destroyed", () => plyr.__rmgGuardCleanup?.());
}

// src/Gallery/video/LazyPlyr.tsx
var React24 = __toESM(require("react"));
var import_jsx_runtime19 = require("react/jsx-runtime");
function resolvePlyrComponent(mod2) {
  return mod2?.Plyr ?? mod2?.default?.Plyr ?? mod2?.default;
}
var LazyPlyr = React24.lazy(async () => {
  const mod2 = await import("plyr-react");
  const Comp = resolvePlyrComponent(mod2);
  if (!Comp) {
    throw new Error(
      `LazyPlyr: could not resolve Plyr component from plyr-react import. Keys: ${Object.keys(mod2 ?? {}).join(
        ", "
      )}`
    );
  }
  return { default: Comp };
});
var Plyr = React24.forwardRef(function PlyrForwarded(props, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(LazyPlyr, { ...props, ref });
});

// src/Gallery/fullscreen/renderFullscreenSlides.tsx
var import_jsx_runtime20 = require("react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
        children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
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
              captionNode && captionFirst && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
                  children: item.kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                    "div",
                    {
                      "data-index": index,
                      style: { ...defaultPlayerStyle2, ...fsVideoStyle ?? {} },
                      className: ["rmg__player", fsVideoClassName].filter(Boolean).join(" "),
                      "data-rmg-plyr": "true",
                      "data-rmg-plyr-index": String(index),
                      "data-rmg-plyr-provider": provider,
                      children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
                  }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
              captionNode && !captionFirst && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
    if (index === 0) return `translateX(${-100 * sign}%)`;
    if (index === length - 1) return `translateX(${originalCount * 100 * sign}%)`;
    return `translateX(${(index - 1) * 100 * sign}%)`;
  };
}
function createSingleTransform() {
  return () => `translateX(0%)`;
}

// src/Gallery/zoomPan/zoom/useGlobalPinchZoom.ts
var React25 = __toESM(require("react"));
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
  const isPinching = React25.useRef(false);
  const isTouchPinching = React25.useRef(false);
  const pinchJustEnded = React25.useRef(false);
  const startDist = React25.useRef(0);
  const startScale = React25.useRef(1);
  const handlePinchWheel = React25.useCallback(
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
  const handleWheelPan = React25.useCallback(
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
  React25.useEffect(() => {
    window.addEventListener("wheel", handleWheelPan, { passive: false });
    return () => window.removeEventListener("wheel", handleWheelPan);
  }, [handleWheelPan]);
  React25.useLayoutEffect(() => {
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
  const onTouchStart = React25.useCallback(
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
  const onTouchMove = React25.useCallback(
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
  const endPinch = React25.useCallback(() => {
    if (!isTouchPinching.current) return;
    isTouchPinching.current = false;
    pinchJustEnded.current = true;
  }, []);
  React25.useLayoutEffect(() => {
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

// src/Gallery/shared/types/media.ts
var toMediaItems = (urls) => urls.map(
  (u) => /\.(mp4|webm|ogg)$/i.test(u) ? { kind: "video", src: u } : { kind: "image", src: u }
);

// src/Gallery/fullscreen/defaults.ts
var DEFAULT_FULLSCREEN = {
  enabled: true,
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

// src/Gallery/index.tsx
var import_jsx_runtime21 = require("react/jsx-runtime");
function useOpenEpoch(open) {
  const [epoch, setEpoch] = (0, import_react6.useState)(0);
  const prev = (0, import_react6.useRef)(open);
  (0, import_react6.useEffect)(() => {
    if (open && !prev.current) setEpoch((e) => e + 1);
    prev.current = open;
  }, [open]);
  return epoch;
}
var Gallery = import_react6.default.forwardRef(function Gallery2({
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
  const indexChannel = (0, import_react6.useMemo)(() => createIndexChannel(), []);
  const fsSub = (0, import_react6.useMemo)(() => createFullscreenSliderSub(0), []);
  const [slideIndex, setSlideIndex] = (0, import_react6.useState)(0);
  const isClick = (0, import_react6.useRef)(false);
  const isZoomClick = (0, import_react6.useRef)(false);
  const imageRefs = (0, import_react6.useRef)([]);
  const [showFullscreenSlider, setShowFullscreenSlider] = (0, import_react6.useState)(false);
  const fullscreenSliderApi = (0, import_react6.useRef)(null);
  const isZooming = (0, import_react6.useRef)(false);
  const expandableImgRefs = (0, import_react6.useRef)([]);
  const overlayDivRef = (0, import_react6.useRef)(null);
  const duplicateImgRef = (0, import_react6.useRef)(null);
  const closeButtonRef = (0, import_react6.useRef)(null);
  const counterRef = (0, import_react6.useRef)(null);
  const leftChevronRef = (0, import_react6.useRef)(null);
  const rightChevronRef = (0, import_react6.useRef)(null);
  const [showFullscreenModal, setShowFullscreenModal] = (0, import_react6.useState)(false);
  const [wrappedItems, setWrappedItems] = (0, import_react6.useState)([]);
  const windowSize = useWindowSize();
  const scaleRef = (0, import_react6.useRef)(1);
  const panRef = (0, import_react6.useRef)({ x: 0, y: 0 });
  const previousZoom = (0, import_react6.useRef)({ x: 0, y: 0 });
  const sliderForFullscreen = (0, import_react6.useRef)(null);
  const slidesForFullscreen = (0, import_react6.useRef)([]);
  const visibleImagesForFullscreen = (0, import_react6.useRef)(1);
  const selectedIndexForFullscreen = (0, import_react6.useRef)(0);
  const sliderXForFullscreen = (0, import_react6.useRef)(0);
  const sliderVelocityForFullscreen = (0, import_react6.useRef)(0);
  const isWrappingForFullscreen = (0, import_react6.useRef)(false);
  const fsIndexRef = (0, import_react6.useRef)(fsSub.get());
  const [fsFadeOpening, setFsFadeOpening] = (0, import_react6.useState)(false);
  const entryMapRef = (0, import_react6.useRef)(null);
  const entryFlatIndexRef = (0, import_react6.useRef)(null);
  const fsOwnersRef = (0, import_react6.useRef)([]);
  const [closingModal, setClosingModal] = (0, import_react6.useState)(false);
  const changingSlides = (0, import_react6.useRef)(false);
  const [isZoomed, setIsZoomed] = (0, import_react6.useState)(false);
  const isZoomedRef = (0, import_react6.useRef)(false);
  const currentImage = (0, import_react6.useRef)(null);
  const aspectRatioRef = (0, import_react6.useRef)(1);
  const axisRef = (0, import_react6.useRef)(null);
  const pointerDownRef = (0, import_react6.useRef)(false);
  const interactionModeRef = (0, import_react6.useRef)("idle");
  const locX = (0, import_react6.useRef)(null);
  const locY = (0, import_react6.useRef)(null);
  const prevX = (0, import_react6.useRef)(null);
  const prevY = (0, import_react6.useRef)(null);
  const offX = (0, import_react6.useRef)(null);
  const offY = (0, import_react6.useRef)(null);
  const tgtX = (0, import_react6.useRef)(null);
  const tgtY = (0, import_react6.useRef)(null);
  const sliderApiRef = (0, import_react6.useRef)(null);
  const entrySliderRefs = (0, import_react6.useRef)([]);
  const overlayCaptionRef = (0, import_react6.useRef)(null);
  const overlayCaptionRootRef = (0, import_react6.useRef)(null);
  const fsThumbContainerRef = (0, import_react6.useRef)(null);
  const epoch = useOpenEpoch(showFullscreenModal);
  const [isReady, setIsReady] = (0, import_react6.useState)(false);
  const suppressLoopRef = (0, import_react6.useRef)(false);
  const shieldCleanupRef = import_react6.default.useRef(null);
  const shieldRef = (0, import_react6.useRef)(null);
  const bodyX = (0, import_react6.useRef)(null);
  const bodyY = (0, import_react6.useRef)(null);
  const boundsX = (0, import_react6.useRef)(null);
  const boundsY = (0, import_react6.useRef)(null);
  const isAnimatingRef = (0, import_react6.useRef)(false);
  const animRef = (0, import_react6.useRef)(null);
  const wrappedModePlyrRefs = (0, import_react6.useRef)([]);
  const singleModePlyrRefs = (0, import_react6.useRef)([]);
  const suppressNextClickRef = (0, import_react6.useRef)(false);
  const cells = (0, import_react6.useRef)([]);
  const idSeqRef = (0, import_react6.useRef)(0);
  const asArray = (x) => Array.isArray(x) ? x : [x];
  const newId = (0, import_react6.useCallback)(() => `rmg-${++idSeqRef.current}`, []);
  function nodeFromMedia(m) {
    if (m.kind === "image") return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("img", { src: m.src, alt: m.alt ?? "" });
    if (m.kind === "video") {
      return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("video", { src: m.src, controls: true, preload: "metadata" });
    }
    return null;
  }
  const initialCells = (0, import_react6.useMemo)(() => {
    const kids = import_react6.default.Children.toArray(children);
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
  const cellsRef = import_react6.default.useRef(initialCells);
  const [cellsState, setCellsState] = import_react6.default.useState(initialCells);
  const effectiveBreakpoints = (0, import_react6.useMemo)(
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
  const { flattenedEntryMedia, flattenedEntryMap } = (0, import_react6.useMemo)(() => {
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
  const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");
  const normalizeFsItems = (v) => {
    if (!v || !v.length) return [];
    return isStringArray(v) ? toMediaItems(v) : v;
  };
  const [normalizedItems, setNormalizedItems] = (0, import_react6.useState)(() => {
    const fs2 = normalizeFsItems(fullscreen?.items);
    if (fs2.length) return fs2;
    if (flattenedEntryMedia?.length) return flattenedEntryMedia;
    return [];
  });
  function usePredecodeImages(urls, enabled) {
    const [ready, setReady] = (0, import_react6.useState)(
      !enabled || urls.length === 0
    );
    (0, import_react6.useEffect)(() => {
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
  const fullscreenImageUrls = (0, import_react6.useMemo)(
    () => normalizedItems.filter((m) => m.kind === "image").map((m) => m.src),
    [normalizedItems]
  );
  usePredecodeImages(
    fullscreenImageUrls,
    fs.enabled
  );
  const sliderImageUrls = (0, import_react6.useMemo)(
    () => normalizedItems.filter((m) => m.kind === "image").map((m) => m.src),
    [normalizedItems]
  );
  const sliderImagesReady = usePredecodeImages(
    sliderImageUrls,
    sliderImageUrls.length > 0
  );
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
    console.log("internals", internals);
    if (!internals) return;
    sliderForFullscreen.current = internals.slider.current;
    slidesForFullscreen.current = internals.slides.current;
    visibleImagesForFullscreen.current = internals.visibleImages.current;
    selectedIndexForFullscreen.current = internals.selectedIndex.current;
    sliderXForFullscreen.current = internals.sliderX.current;
    sliderVelocityForFullscreen.current = internals.sliderVelocity.current;
    isWrappingForFullscreen.current = internals.isWrapping.current;
  }
  (0, import_react6.useEffect)(() => {
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
  const setScale = (0, import_react6.useCallback)((newScale) => {
    scaleRef.current = newScale;
    const prev = isZoomedRef.current;
    const next = newScale > 1.01;
    if (next !== prev) {
      isZoomedRef.current = next;
      setIsZoomed(next);
    }
  }, []);
  const attachEntrySliderRef = (0, import_react6.useCallback)(
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
      if (!import_react6.default.isValidElement(node)) return null;
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
        for (const child of import_react6.default.Children.toArray(p.children)) {
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
  function clamp2(n, lo, hi) {
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
      adjustIndex: (cur) => clamp2(cur + addLen, 0, prevLen + addLen - 1)
    });
    return prevLen + addLen;
  }
  function insert(index, nodes) {
    const arr = cellsRef.current.slice();
    const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
    const to = clamp2(index | 0, 0, arr.length);
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
      const idx = clamp2(indexOrPredicate, 0, arr.length - 1);
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
      adjustIndex: (cur) => clamp2(cur - Math.max(0, removedBeforeOrAt), 0, Math.max(0, next.length - 1))
    });
    return next.length;
  }
  function replace(index, node) {
    const arr = cellsRef.current;
    if (!arr.length) return;
    const i = clamp2(index | 0, 0, arr.length - 1);
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
      adjustIndex: (cur) => clamp2(cur, 0, Math.max(0, nextCells.length - 1))
    });
    return nextCells.length;
  }
  (0, import_react6.useImperativeHandle)(ref, () => {
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
  const renderedCells = import_react6.default.useMemo(() => {
    return cellsState.map((c) => {
      const n = c.node;
      return import_react6.default.isValidElement(n) ? import_react6.default.cloneElement(n, { key: c.id }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { style: { display: "block" }, children: n }, c.id);
    });
  }, [cellsState]);
  (0, import_react6.useEffect)(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(1e4);
  }, []);
  const addShield = (0, import_react6.useCallback)((timeoutMs) => {
    shieldCleanupRef.current?.();
    const teardown = shieldRef.current?.add(timeoutMs);
    shieldCleanupRef.current = teardown ?? null;
  }, []);
  const openFullscreenAt = (0, import_react6.useCallback)(
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
      runFullscreenIntro({
        origImg: imgEl,
        index: fullscreenIndex,
        normalizedItems,
        isRtl: sliderObject.direction.dir === "rtl",
        styles: Gallery_default,
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
  const gridLoading = (0, import_react6.useMemo)(() => normalizeLoading(gridObject.loading), [gridObject.loading]);
  const gridIntro = (0, import_react6.useMemo)(() => normalizeIntro(gridObject.intro), [gridObject.intro]);
  const masonryLoading = (0, import_react6.useMemo)(() => normalizeLoading(masonryObject.loading), [masonryObject.loading]);
  const masonryIntro = (0, import_react6.useMemo)(() => normalizeIntro(masonryObject.intro), [masonryObject.intro]);
  const resolvedCellsPerSlide = (0, import_react6.useMemo)(() => {
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
  const resolvedGap = (0, import_react6.useMemo)(() => {
    const raw = resolveNumberFromResponsive(
      sliderObject.layout.gap,
      20,
      viewportWidth,
      effectiveBreakpoints
    );
    return Math.max(0, raw | 0);
  }, [sliderObject.layout.gap, viewportWidth, effectiveBreakpoints]);
  const fsEnabled = fs.enabled;
  const openFullscreenAtStable = (0, import_react6.useCallback)(
    (index) => {
      openFullscreenAt(index);
    },
    [openFullscreenAt]
  );
  const registerExpandableImgStable = (0, import_react6.useCallback)(
    (index, node) => {
      registerExpandableImg(index, node);
    },
    [registerExpandableImg]
  );
  const itemClassName = masonryObject.classNames?.item ?? "";
  const masonryChildren = (0, import_react6.useMemo)(() => {
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
  const isRtl = sliderObject.direction.dir === "rtl" ? true : false;
  const sign = isRtl ? -1 : 1;
  (0, import_react6.useEffect)(() => {
    if (animRef.current) {
      animRef.current.stop();
      setScale(1);
      ;
      previousZoom.current.x = 0;
      previousZoom.current.y = 0;
      panRef.current = { x: 0, y: 0 };
      scaleRef.current = 1;
      setFsEntryOverlayOpacity(0);
    }
  }, [closingModal]);
  function boundsForCurrent2(scale, imgW, imgH, viewW, viewH) {
    return boundsForCurrent({
      scale,
      imgW,
      imgH,
      currentImageEl: currentImage.current,
      viewW,
      viewH
    });
  }
  function renderPan(xPx, yPx) {
    if (!currentImage.current) return;
    const img = currentImage.current.children[0];
    if (!img) return;
    img.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`;
  }
  (0, import_react6.useEffect)(() => {
    axisRef.current = PanAxis();
  }, []);
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
  const rebuildPanBodies = (0, import_react6.useCallback)(() => {
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
  }, [fs.zoom.panDuration, fs.zoom.panFriction]);
  const zoomCtx = (0, import_react6.useMemo)(() => ({
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
  const pan = usePanRuntime({
    fs,
    isZoomed,
    zoomCtx,
    currentImage,
    getImageAspectRatio,
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
  const wrappedTransform = import_react6.default.useMemo(
    () => createWrappedTransform({ length: wrappedItems.length, sign }),
    [wrappedItems.length, sign]
  );
  const singleTransform = import_react6.default.useMemo(
    () => createSingleTransform(),
    []
  );
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
      imgMargin: Gallery_default.imgMargin,
      fullscreenImages: Gallery_default.fullscreenImages
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
      imgMargin: Gallery_default.imgMargin,
      fullscreenImages: Gallery_default.fullscreenImages
    },
    renderImage: fs.renderImage
  });
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
      panDuration: fs.zoom.panDuration,
      panFriction: fs.zoom.panFriction,
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
  function getImageAspectRatio(image) {
    if (!image) return;
    const imgElement = getPrimaryImgEl(image);
    if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
      aspectRatioRef.current = imgElement.naturalWidth / imgElement.naturalHeight;
    }
  }
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
    panDuration: fs.zoom.panDuration,
    findImgAtPoint,
    readDataIndex,
    distance,
    midpoint
  });
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
  const resolvedThumbPos = (0, import_react6.useMemo)(() => {
    if (!slider?.thumbnails?.layout?.position) return void 0;
    return resolvePositionFromResponsive(
      slider?.thumbnails?.layout?.position,
      "bottom",
      vw,
      effectiveBreakpoints
    );
  }, [slider?.thumbnails?.layout?.position, vw, effectiveBreakpoints]);
  const fsResolvedThumbPos = (0, import_react6.useMemo)(
    () => resolvePositionFromResponsive(
      fs.thumbnails?.layout?.position,
      "bottom",
      vw,
      effectiveBreakpoints
    ),
    [fs.thumbnails?.layout?.position, vw, effectiveBreakpoints]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(import_jsx_runtime21.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: root?.className, style: root?.style, children: [
      layout === "slider" && (resolvedThumbPos === "top" || resolvedThumbPos === "left") && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        ThumbnailSlider,
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
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: container?.className, style: container?.style, children: layout === "slider" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        Slider_default2,
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
      ) : layout === "masonry" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        MasonryLayout,
        {
          items: masonryChildren,
          masonry: masonryObject,
          breakpoints: effectiveBreakpoints,
          viewportWidth,
          loading: masonryLoading,
          intro: masonryIntro,
          skeletonCount: cellsState.length
        }
      ) : layout === "entries" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        EntryList,
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
              return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: Gallery_default.entryMasonry, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
                MasonryLayout,
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
              return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
                Slider_default2,
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
            return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
              GridLayout,
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
      ) : layout === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        GridLayout,
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
      layout === "slider" && (resolvedThumbPos === "bottom" || resolvedThumbPos === "right") && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        ThumbnailSlider,
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
    fs.enabled && /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
      FullscreenModal_default,
      {
        fsSub,
        open: showFullscreenModal,
        onClose: () => setShowFullscreenModal(false),
        isClick,
        isAnimating: isAnimatingRef,
        overlayDivRef,
        cells,
        setShowFullscreenSlider,
        imageCount: cellsState.length,
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
        centerAlign: sliderObject.align === "center",
        centerSlider: centerSliderForFullscreen,
        setSliderIndex: setSliderIndexForFullscreen,
        onForceResetZoom: () => onForceResetZoom(),
        layout,
        expandableImgRefs,
        entryMapRef,
        entryMediaLayout: entriesObject.mediaLayout,
        introFade: fs.effects.introFade,
        introDuration: fs.effects.introDuration,
        introEasing: fs.effects.introEasing,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
            "div",
            {
              style: {
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
                  "div",
                  {
                    style: {
                      flex: "1 1 auto",
                      position: "relative",
                      minHeight: 0
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
                      FullscreenSlider_default2,
                      {
                        sub: fsSub,
                        ref: fullscreenSliderApi,
                        imageCount: cellsState.length,
                        slideIndex,
                        isClick: isZoomClick,
                        isZoomed,
                        windowSize,
                        show: showFullscreenModal,
                        handleZoomToggle: (e, imageRef) => handleZoomToggle(zoomCtx, e, imageRef),
                        imageRefs: imageRefs.current,
                        cells,
                        isPinching,
                        scale: scaleRef.current,
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
                        direction: sliderObject.direction.dir,
                        isWrapping: isWrappingForFullscreen,
                        sliderDuration: fs.slider.duration,
                        sliderFriction: fs.slider.friction,
                        suppressLoopRef,
                        fadeOpening: fsFadeOpening,
                        introFade: fs.effects.introFade,
                        slideFade: fs.effects.slideFade,
                        slideFadeDuration: fs.effects.slideFadeDuration,
                        slideFadeEasing: fs.effects.slideFadeEasing,
                        normalizedItems,
                        introDuration: fs.effects.introDuration,
                        introEasing: fs.effects.introEasing,
                        resetAllZoomDom: () => resetZoomForSlideChange2(),
                        children: normalizedItems.length > 1 ? wrappedFullscreenImages : oneFullscreenImage
                      },
                      epoch
                    )
                  }
                ),
                fs.thumbnails?.layout?.position !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
                  "div",
                  {
                    ref: fsThumbContainerRef,
                    className: fs.thumbnails.elements?.container?.className,
                    style: {
                      flex: fs.thumbnails?.layout?.position === "left" || fs.thumbnails?.layout?.position === "right" ? "0 0 auto" : "0 0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: fs.thumbnails?.layout?.position === "top" || fs.thumbnails?.layout?.position === "bottom" ? "0.75rem 1rem" : "0.75rem 0.5rem",
                      transition: `background-color ${fsThumbFadeDuration}ms ${fsThumbFadeEasing}`,
                      backgroundColor: fsThumbsOpen ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
                      ...fs.thumbnails.elements?.container?.style || {}
                    },
                    children: normalizedItems.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
                      FullscreenThumbnailSlider,
                      {
                        items: normalizedItems.map((item) => ({
                          thumbSrc: item.thumbSrc ?? item.src,
                          alt: item.alt
                        })),
                        position: fsResolvedThumbPos,
                        fsSub,
                        thumbnailWidth: fs.thumbnails.layout?.thumbnail?.width,
                        thumbnailHeight: fs.thumbnails.layout?.thumbnail?.height,
                        thumbnailsCenter: fs.thumbnails.layout?.center,
                        thumbnailsContainerWidth: fs.thumbnails.layout?.container?.width,
                        thumbnailsContainerHeight: fs.thumbnails.layout?.container?.height,
                        visible: showFullscreenModal,
                        invisible: closingModal,
                        thumbnailItemClassName: fs.thumbnails.elements?.thumbnail?.className,
                        thumbnailItemStyle: fs.thumbnails.elements?.thumbnail?.style,
                        gap: fs.thumbnails.layout?.gap,
                        freeScroll: fs.thumbnails.scroll?.freeScroll,
                        groupCells: fs.thumbnails.scroll?.groupCells,
                        loop: fs.thumbnails.scroll?.loop,
                        direction: sliderObject.direction.dir,
                        skipSnaps: fs.thumbnails.scroll?.skipSnaps,
                        centerActiveThumb: fs.thumbnails.scroll?.centerActiveThumb,
                        selectDuration: fs.thumbnails.motion?.selectDuration,
                        freeScrollDuration: fs.thumbnails.motion?.freeScrollDuration,
                        sliderFriction: fs.thumbnails.motion?.friction,
                        breakpointMap: fs.thumbnails.breakpointMap,
                        rippleEnabled: fs.thumbnails.controls?.ripple?.enabled,
                        rippleClassName: fs.thumbnails.controls?.ripple?.className,
                        showArrows: fs.thumbnails.controls?.enabled,
                        arrowStyles: sliderObject.thumbnails.controls?.arrow?.style,
                        arrowClassName: sliderObject.thumbnails.controls?.arrow?.className,
                        prevArrowStyles: fs.thumbnails.controls?.prev?.style,
                        prevArrowClassName: fs.thumbnails.controls?.prev?.className,
                        nextArrowStyles: fs.thumbnails.controls?.next?.style,
                        nextArrowClassName: fs.thumbnails.controls?.next?.className,
                        renderArrows: sliderObject.thumbnails.controls?.render,
                        renderPrevArrow: fs.thumbnails.controls?.renderPrev,
                        renderNextArrow: fs.thumbnails.controls?.renderNext
                      }
                    )
                  }
                )
              ]
            }
          ),
          showFullscreenModal && layout === "entries" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(FsEntryOverlayMount, { setMountEl: setFsEntryOverlayMountEl }) : null
        ]
      }
    )
  ] });
});
var Gallery_default2 = Gallery;

// src/Gallery/video/RmgPlyrVideo.tsx
var import_jsx_runtime22 = require("react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
    "div",
    {
      className: ["rmg__plyr__video", props.className].filter(Boolean).join(" "),
      style: { ...baseWrap, ...props.style || {} },
      "data-rmg-plyr": "true",
      "data-rmg-plyr-index": String(index),
      "data-rmg-plyr-provider": provider,
      children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Gallery,
  RmgPlyrVideo
});
//# sourceMappingURL=index.js.map