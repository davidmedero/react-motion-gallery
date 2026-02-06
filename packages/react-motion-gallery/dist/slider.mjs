import * as React7 from 'react';
import { forwardRef, useRef, useState, useMemo, useId, Children, useEffect, isValidElement, useLayoutEffect, useCallback, useImperativeHandle, cloneElement } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

// src/Gallery/slider/index.tsx

// src/Gallery/styles.module.css
var styles_default = {};

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

// src/Gallery/shared/input/pointerTypes.ts
function isMouseEvent(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}

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

// src/Gallery/shared/motion/scrollBounds.ts
function ScrollBounds(limit, location, target, body, pov, selectDuration) {
  const pullBack = pov.measure(10);
  const edgeTol = pov.measure(50);
  const fricLim = Limit(0.5, 1);
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
    const distance = loop ? removeOffset(target) : constrain(target);
    const ascDiffsToSnaps = scrollSnaps.map((snap, index2) => ({
      diff: shortcut(snap - distance, 0),
      index: index2
    })).sort((d1, d2) => Math.abs(d1.diff) - Math.abs(d2.diff));
    const { index } = ascDiffsToSnaps[0];
    return { index, distance };
  }
  function byIndex(index, direction) {
    const diffToSnap = scrollSnaps[index] - targetVector.get();
    const distance = shortcut(diffToSnap, direction);
    return { index, distance };
  }
  function byDistance(distance, snap) {
    const target = targetVector.get() + distance;
    const { index, distance: targetSnapDistance } = findTargetSnap(target);
    const reachedBound = !loop && reachedAny(target);
    if (!snap || reachedBound) return { index, distance };
    const diffToSnap = scrollSnaps[index] - targetSnapDistance;
    const snapDistance = distance + shortcut(diffToSnap, 0);
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
var RmgSlideContext = React7.createContext(null);
function RmgSlideProvider({
  value,
  children
}) {
  return /* @__PURE__ */ jsx(RmgSlideContext.Provider, { value, children });
}

// src/Gallery/shared/motion/counter.ts
var mathAbs2 = Math.abs;
function Counter(max, start, loop) {
  const { constrain } = Limit(0, max);
  const loopEnd = max + 1;
  let counter = withinLimit(start);
  function withinLimit(n) {
    return mathAbs2((loopEnd + n) % loopEnd);
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
    return Counter(max, get());
  }
  const self = {
    get,
    set,
    add,
    clone
  };
  return self;
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
  const tweenNodesRef = React7.useRef([]);
  const parallaxNodesRef = React7.useRef([]);
  const parallaxSnapsRef = React7.useRef([]);
  const collectParallaxForAll = React7.useCallback(() => {
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
  const currentTweenFactor = React7.useCallback(() => {
    const count = parallaxSnapsRef.current.length || 1;
    const visible = Math.max(visibleImagesRef.current || 1, 1);
    return TWEEN_FACTOR_BASE * (count / visible);
  }, [visibleImagesRef]);
  const scrollProgressNorm = React7.useCallback(() => {
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
  const tweenParallax = React7.useCallback(() => {
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
  React7.useEffect(() => {
    if (!enabled) return;
    collectParallaxForAll();
  }, [enabled, slidesLen, clonedLen, wrap, isReady, collectParallaxForAll]);
  React7.useEffect(() => {
    if (enabled) return;
    tweenNodesRef.current.forEach((n) => n && n.removeAttribute("style"));
  }, [enabled]);
  React7.useEffect(() => {
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
  const slideCenterX = React7.useCallback(
    (logicalIdx) => {
      const s = slidesRef.current?.[logicalIdx];
      if (!s || !sliderRef.current) return 0;
      const centerOffset = getCenterOffsetForIndex(logicalIdx);
      return s.target - centerOffset;
    },
    [slidesRef, sliderRef, getCenterOffsetForIndex]
  );
  const getCenters = React7.useCallback(() => {
    const L = slidesRef.current?.length ?? 0;
    const arr = [];
    for (let i = 0; i < L; i++) arr.push(slideCenterX(i));
    return arr;
  }, [slidesRef, slideCenterX]);
  const findBoundingPair = React7.useCallback(
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
  const applyPairScaleTween = React7.useCallback(() => {
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
  React7.useEffect(() => {
    applyPairScaleTween();
  }, [enabled, scaleAmount, slidesLen, clonedLen]);
  React7.useEffect(() => {
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
  const slideCenterX = React7.useCallback(
    (logicalIdx) => {
      const s = slidesRef.current?.[logicalIdx];
      if (!s || !sliderRef.current) return 0;
      const centerOffset = getCenterOffsetForIndex(logicalIdx);
      return s.target - centerOffset;
    },
    [slidesRef, sliderRef, getCenterOffsetForIndex]
  );
  const getCenters = React7.useCallback(() => {
    const L = slidesRef.current?.length ?? 0;
    const arr = [];
    for (let i = 0; i < L; i++) arr.push(slideCenterX(i));
    return arr;
  }, [slidesRef, slideCenterX]);
  const applyFadeTween = React7.useCallback(() => {
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
  React7.useEffect(() => {
    applyFadeTween();
  }, [enabled, slidesLen, clonedLen, wrap]);
  React7.useEffect(() => {
    if (enabled) return;
    const track = sliderRef.current;
    if (!track) return;
    const kids = Array.from(track.children);
    for (const el of kids) el.style.opacity = "1";
  }, [enabled, sliderRef]);
  return { applyFadeTween, getCenters };
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
function DefaultChevron({
  axisMain,
  direction,
  size = 32
}) {
  const pathPrev = /* @__PURE__ */ jsx("path", { d: "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" });
  const pathNext = /* @__PURE__ */ jsx("path", { d: "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" });
  if (axisMain === "y") {
    return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsx(
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
    return /* @__PURE__ */ jsx(
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
        children: /* @__PURE__ */ jsx(DefaultChevron, { axisMain, direction: dir, size: 32 })
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    prevArrowNode,
    nextArrowNode
  ] });
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
var SliderCore = forwardRef(function SliderCore2({
  children,
  imageCount,
  isClick,
  expandableImgRefs,
  setSlideIndex,
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
  showProgress,
  progressClassName,
  progressStyle,
  progressInnerClassName,
  progressInnerStyle,
  renderProgress,
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
  introOptions,
  lazyLoad,
  rippleEnabled,
  rippleClassName,
  sliderImagesReady,
  enableFullscreen,
  requestFullscreenOpen,
  isFullscreenOpen,
  setFullscreenOpen
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
      if (isPointerDown.current || isFullscreenOpen || !isWrapping.current || !autoPlay || !isReady || pauseAutoPlayOnHover && isHoveringRef.current) {
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
  }, [isFullscreenOpen, slidesState, clonedChildren, isWrapping.current]);
  useEffect(() => {
    let lastTime = performance.now();
    let frameId;
    function loop2(now) {
      frameId = requestAnimationFrame(loop2);
      const dt = now - lastTime;
      lastTime = now;
      if (!slider.current || !isWrapping.current || isPointerDown.current || isAnimatingRef.current || isFullscreenOpen || !autoScroll || pauseAutoScrollOnHover && isHoveringRef.current) {
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
  }, [isFullscreenOpen]);
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
    const imagesOk = lazyLoad ? true : sliderImagesReady ?? true;
    if (!engineReady || !imagesOk) return;
    setIsReady(true);
  }, [lazyLoad, sliderImagesReady, engineReady, isReady]);
  useLayoutEffect(() => {
    if (!slider.current || cells.current.length === 0 || sliderWidth.current === 0 || !slides.current || !slides.current[0] || !slides.current[0].cells[0]?.element) return;
    const containerSize = slider.current[AX.clientKey];
    if (!wrap && sliderWidth.current <= containerSize) {
      trackCenterOffsetRef.current = Math.round((containerSize - sliderWidth.current) / 2);
      positionSlider(offsetLocationRef.current?.get() ?? xRef.current);
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
    const root = slider.current;
    if (!root) return;
    const childrenArray = Children.toArray(children);
    const imgOffset = !wrap ? 0 : visibleImages * 2;
    if (clonedChildren.length !== childrenArray.length + imgOffset) return;
    if (!expandableImgRefs) return;
    const len = childrenArray.length + imgOffset;
    expandableImgRefs.current = Array(len).fill(null);
    const images = root.querySelectorAll("img");
    images.forEach((img, index) => {
      if (index < len) expandableImgRefs.current[index] = img;
    });
    return () => {
      expandableImgRefs.current = [];
    };
  }, [children, clonedChildren, visibleImages, wrap]);
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
  const trackCenterOffsetRef = useRef(0);
  function positionSlider(loc) {
    const x = loc ?? xRef.current;
    translateRef.current?.to((x + trackCenterOffsetRef.current) * sign);
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
    const indexCurrent = Counter(counterMax, startIndex);
    const indexPrevious = Counter(counterMax, startIndex);
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
    positionSlider(initialSnap);
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
          if (!expandableImgRefs) {
            scrollToIndex(selectedIndex.current);
            return;
          }
          const index = expandableImgRefs.current.findIndex((el) => el === img);
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
    [centerSlider, indexChannel, wrap, imageCount, isRtl, isFullscreenOpen]
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
    const root = sliderContainer.current;
    const track = slider.current;
    if (!root || !track || !slides.current?.length || !layoutReady || !isMeasured || sliderWidth.current === 0 || !isReady) {
      return;
    }
    const ro = new ResizeObserver(() => {
      const cw = track[AX.clientKey];
      const contentW = sliderWidth.current || 0;
      if (!wrap) {
        if (contentW <= cw) {
          const center = Math.round((cw - contentW) / 2);
          trackCenterOffsetRef.current = center;
          if (!locationRef.current || !previousLocationRef.current || !offsetLocationRef.current || !targetRef.current || !bodyRef.current) {
            positionSlider(offsetLocationRef.current?.get() ?? xRef.current);
            return;
          }
          scrollSnapsRef.current = [0];
          selectedIndex.current = 0;
          indexCurrentRef.current?.set(0);
          indexPreviousRef.current?.set(0);
          indexChannel.set(0, "instant");
          limitRef.current = Limit(0, 0);
          povRef.current = PercentOfView(cw);
          boundsRef.current = ScrollBounds(
            limitRef.current,
            offsetLocationRef.current,
            targetRef.current,
            bodyRef.current,
            povRef.current,
            selectDuration
          );
          bodyRef.current.useDuration(0).useFriction(1);
          isAnimatingRef.current = false;
          animRef.current?.stop();
          locationRef.current.set(0);
          previousLocationRef.current.set(0);
          offsetLocationRef.current.set(0);
          targetRef.current.set(0);
          xRef.current = 0;
          positionSlider(0);
          progressApi.updateProgressInFrame();
          tweenParallax();
          applyPairScaleTween();
          applyFadeTween();
          updateControlsImperatively();
          return;
        }
        trackCenterOffsetRef.current = 0;
        const min = -Math.max(0, contentW - cw);
        const max = 0;
        limitRef.current = Limit(isNaN(min) ? 0 : min, max);
        if (offsetLocationRef.current && targetRef.current && bodyRef.current) {
          povRef.current = PercentOfView(cw);
          boundsRef.current = ScrollBounds(
            limitRef.current,
            offsetLocationRef.current,
            targetRef.current,
            bodyRef.current,
            povRef.current,
            selectDuration
          );
          const cur = offsetLocationRef.current?.get() ?? xRef.current ?? 0;
          const clamped = limitRef.current.constrain(cur);
          locationRef.current?.set(clamped);
          previousLocationRef.current?.set(clamped);
          offsetLocationRef.current?.set(clamped);
          targetRef.current?.set(clamped);
          xRef.current = clamped;
          positionSlider(clamped);
          animRef.current?.start();
        } else {
          positionSlider(offsetLocationRef.current?.get() ?? xRef.current);
        }
        updateControlsImperatively();
        return;
      }
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
        positionSlider(offsetLocationRef.current?.get() ?? xRef.current);
        progressApi.updateProgressInFrame();
        tweenParallax();
        applyPairScaleTween();
        applyFadeTween();
        updateControlsImperatively();
      }
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [wrap, layoutReady, isMeasured, isReady]);
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
  function handleImageClick(e, parsedImgIndex) {
    isClick.current = true;
    const originalIndex = ((parsedImgIndex - visibleImagesRef.current) % imageCount + imageCount) % imageCount;
    const fullscreenIndex = originalIndex + 1;
    const finalIndex = !wrap ? parsedImgIndex : fullscreenIndex;
    setFullscreenOpen(true);
    const imgEl = expandableImgRefs?.current?.[parsedImgIndex] ?? null;
    requestFullscreenOpen?.({
      index: finalIndex,
      img: imgEl,
      event: e
    });
    setSlideIndex(finalIndex);
  }
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
  const introWrapped = normalizedIntro.renderIntro ? /* @__PURE__ */ jsx("div", { ...baseContainerProps, children: normalizedIntro.renderIntro(
    { active: isReady && inView, containerProps: baseContainerProps },
    inner
  ) }) : /* @__PURE__ */ jsx("div", { ...baseContainerProps, children: inner });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    responsiveCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: responsiveCss } }),
    baseCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: baseCss } }),
    /* @__PURE__ */ jsx(
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
          maxHeight: responsiveSliderHeight,
          ["--rmg-intro-stagger"]: `${normalizedIntro.staggerMs}ms`,
          ["--rmg-intro-transform"]: `${normalizedIntro.transform}px`,
          ["--rmg-intro-duration"]: `${normalizedIntro.durationMs}ms`,
          ["--rmg-intro-easing"]: normalizedIntro.easing,
          zIndex: 1,
          ...sliderContainerStyles
        },
        children: introWrapped
      }
    )
  ] });
});
var Slider_default2 = SliderCore;

// src/Gallery/slider/thumbnails/ThumbnailSlider.module.css
var ThumbnailSlider_default = {};

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
var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function DragTracker2(axis, ownerWindow) {
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
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const scopeId = useId().replace(/:/g, "-");
  const channelRef = useRef(indexChannel ?? createIndexChannel());
  const [thumbLong, setThumbLong] = useState(thumbSize ?? 0);
  const [thumbCross, setThumbCross] = useState(0);
  const [contentLength, setContentLength] = useState(0);
  const [containerLength, setContainerLength] = useState(0);
  const locationRef = useRef(null);
  const previousLocationRef = useRef(null);
  const offsetLocationRef = useRef(null);
  const targetRef = useRef(null);
  const bodyRef = useRef(null);
  const translateRef = useRef(null);
  const animRef = useRef(null);
  const limitRef = useRef(null);
  const boundsRef = useRef(null);
  const povRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const pagesRef = useRef([]);
  const snapModeRef = useRef("base");
  const pointerDownRef = useRef(false);
  const isPointerDown = useRef(false);
  const isClickRef = useRef(true);
  const xRef = useRef(0);
  const dragX = useRef(0);
  const previousDragX = useRef(0);
  const dragMoveTime = useRef(null);
  const sliderVelocity = useRef(0);
  const selectedIndexRef = useRef(channelRef.current.get().index ?? 0);
  const rawKids = Children.toArray(children).filter(isValidElement);
  const count = rawKids.length;
  const baseOffsetRef = useRef(0);
  const downTargetRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const readyRafRef = useRef(null);
  const readyPaintedRef = useRef(false);
  const contentSizeRef = useRef(0);
  const loopLimitRef = useRef(null);
  const scrollSnapsRef = useRef([]);
  const scrollContentSizeRef = useRef(0);
  const scrollLimitRef = useRef(null);
  const scrollTargetRef = useRef(null);
  const scrollToRef = useRef(null);
  const indexCurrentRef = useRef(null);
  const indexPreviousRef = useRef(null);
  const [buildKey, setBuildKey] = useState(0);
  const loopStableRef = useRef(null);
  const [geomKey, setGeomKey] = useState(0);
  const lastGeomSigRef = useRef("");
  const [wrap, setWrap] = useState(false);
  const isWrapping = useRef(false);
  const clonesCountRef = useRef(0);
  const visibleThumbsRef = useRef(1);
  const layoutRef = useRef(null);
  const thumbCells = useRef([]);
  const [clonedChildren, setClonedChildren] = useState([]);
  const lastCloneSigRef = useRef("");
  const slidesRef = useRef([]);
  const [slidesState, setSlidesState] = useState([]);
  const [isMeasured, setIsMeasured] = useState(false);
  const cellToSlideRef = useRef([]);
  const sliderWidth = useRef(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const prevActiveRef = useRef(-1);
  const draggingAttr = "data-rmg-drag";
  const activePointerIdRef = useRef(null);
  const guardsStoreRef = useRef(null);
  const AX = useMemo(() => {
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
  useEffect(() => {
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
    return cloneElement(child, {
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
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rawKids2 = Children.toArray(children).filter(isValidElement);
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
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
    const rawKids2 = Children.toArray(children).filter(isValidElement);
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
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
    const indexCurrent = Counter(counterMax, startIndex);
    const indexPrevious = Counter(counterMax, startIndex);
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
    const tracker = DragTracker2(axis, window);
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
          if (!baseScrollTarget) return 0;
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
          const dirBump = slidesRef.current.length === 2 ? dir : 0;
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
  useEffect(() => {
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
  useEffect(() => {
    if (!contentLength || !containerLength || !(thumbSize || thumbLong)) return;
    const i = clamp(channelRef.current.get().index ?? 0, 0, Math.max(0, count - 1));
    animateToScroll(getScrollForIndex(i));
  }, [contentLength, containerLength, thumbLong, thumbSize, count]);
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
  const renderedThumbs = clonedChildren.length ? clonedChildren : rawKids.map((c, i) => cloneThumb(c, `fallback-${i}`, i, i));
  const introChildren = useMemo(() => {
    return renderedThumbs.map((child, i) => {
      if (!isValidElement(child)) return child;
      const el = child;
      const prevStyle = el.props?.style || {};
      return cloneElement(el, {
        ...el.props,
        "data-rmg-index": i,
        style: {
          ...prevStyle,
          ["--rmg-intro-index"]: i
        }
      });
    });
  }, [renderedThumbs]);
  const fadeClass = isReady && inView ? ThumbnailSlider_default.fadeInActive : ThumbnailSlider_default.fadeInStart;
  const baseContainerProps = {
    className: [ThumbnailSlider_default.fade_container, fadeClass].filter(Boolean).join(" ")
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
  const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
    arrowNodes,
    /* @__PURE__ */ jsx("div", { ref: trackRef, style: trackStyle, children: introChildren })
  ] });
  const root = /* @__PURE__ */ jsx(
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
      children: normalizedIntro.renderIntro ? normalizedIntro.renderIntro(
        { active: isReady && inView, containerProps: baseContainerProps },
        inner
      ) : inner
    }
  );
  return /* @__PURE__ */ jsx(Fragment, { children: root });
}

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
function useViewportWidth() {
  const [vw, setVw] = React7.useState(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth;
  });
  React7.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vw;
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
var GalleryCoreContext = React7.createContext(null);
function useOptionalGalleryCore() {
  return React7.useContext(GalleryCoreContext);
}
function cssHeightValue(h) {
  return typeof h === "number" ? `${h}px` : h;
}
function parseAspectRatio(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const s = value.trim();
    const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const w = Number(m[1]);
      const h = Number(m[2]);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return w / h;
    }
    const n = Number(s);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
function buildScopedAutoInitialHeightCssFromAspectRatio(args) {
  const { scope, aspectRatioWOverH, cellsPerSlide, gap, baseCells, baseGap } = args;
  const rootSel = `[data-rmg-scope="${scope}"]`;
  const lines = [];
  lines.push(
    `${rootSel}{container-type:inline-size;--rmg-slider-ar:${aspectRatioWOverH};--rmg-slider-cells:${baseCells};--rmg-slider-gap:${baseGap}px;--rmg-slider-initial-height:calc(((100cqw - ((var(--rmg-slider-cells) - 1) * var(--rmg-slider-gap))) / var(--rmg-slider-cells)) / var(--rmg-slider-ar));}`
  );
  if (cellsPerSlide && typeof cellsPerSlide === "object") {
    Object.entries(cellsPerSlide).forEach(([k, v]) => {
      const min = Number(k);
      const cells = Math.max(1, Number(v) | 0);
      if (!Number.isFinite(min) || !Number.isFinite(cells)) return;
      lines.push(`@media (min-width:${min}px){${rootSel}{--rmg-slider-cells:${cells};}}`);
    });
  }
  if (gap && typeof gap === "object") {
    Object.entries(gap).forEach(([k, v]) => {
      const min = Number(k);
      const g = Math.max(0, Number(v) | 0);
      if (!Number.isFinite(min) || !Number.isFinite(g)) return;
      lines.push(`@media (min-width:${min}px){${rootSel}{--rmg-slider-gap:${g}px;}}`);
    });
  }
  return lines.join("\n");
}
function useScopedSkeleton(args) {
  const {
    enabled,
    scopeId,
    layout,
    loading,
    fallbackCount,
    breakpointMap,
    maxSlots = 12,
    showLoadingFallback,
    defaultNode
  } = args;
  const showLoading = enabled && (loading.isLoading != null ? !!loading.isLoading : showLoadingFallback);
  const { cssText, ssrBaseCount } = React7.useMemo(() => {
    if (!enabled) return { cssText: "", ssrBaseCount: fallbackCount };
    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: loading.skeletonCount,
      fallbackCount,
      breakpointMap,
      maxSlots
    });
  }, [enabled, scopeId, loading.skeletonCount, fallbackCount, breakpointMap, maxSlots]);
  const node = showLoading ? loading.renderLoading ? loading.renderLoading({ layout, count: ssrBaseCount }) : defaultNode(maxSlots, ssrBaseCount) : null;
  return { cssText, ssrBaseCount, node, showLoading };
}
var Slider = React7.forwardRef(function Slider2(props, forwardedRef) {
  const { children, breakpoints, ...sliderOptions } = props;
  const core = useOptionalGalleryCore();
  const indexChannel = React7.useMemo(() => createIndexChannel(), []);
  const isClick = React7.useRef(false);
  const localExpandableImgRefs = React7.useRef([]);
  const expandableImgRefs = props.expandableImgRefs !== void 0 ? props.expandableImgRefs : core?.expandableImgRefs ?? localExpandableImgRefs;
  const overlayDivRef = React7.useRef(null);
  const duplicateImgRef = React7.useRef(null);
  const closeButtonRef = React7.useRef(null);
  const counterRef = React7.useRef(null);
  const leftChevronRef = React7.useRef(null);
  const rightChevronRef = React7.useRef(null);
  const localSliderApiRef = React7.useRef(null);
  const setSliderHandle = React7.useCallback(
    (inst) => {
      localSliderApiRef.current = inst;
      if (core?.sliderApiRef) {
        core.sliderApiRef.current = inst;
      }
      if (!forwardedRef) return;
      if (typeof forwardedRef === "function") forwardedRef(inst);
      else forwardedRef.current = inst;
    },
    [core, forwardedRef]
  );
  const [slideIndex, setSlideIndex] = React7.useState(0);
  const [isReady, setIsReady] = React7.useState(false);
  const effectiveBreakpoints = React7.useMemo(
    () => core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP, ...breakpoints || {} },
    [core?.effectiveBreakpoints, breakpoints]
  );
  const sliderObject = React7.useMemo(() => {
    return {
      ...DEFAULT_SLIDER,
      ...sliderOptions ?? {},
      layout: { ...DEFAULT_SLIDER.layout, ...sliderOptions?.layout ?? {} },
      direction: { ...DEFAULT_SLIDER.direction, ...sliderOptions?.direction ?? {} },
      align: sliderOptions?.align ?? DEFAULT_SLIDER.align,
      scroll: { ...DEFAULT_SLIDER.scroll, ...sliderOptions?.scroll ?? {} },
      controls: {
        ...DEFAULT_SLIDER.controls,
        ...sliderOptions?.controls ?? {},
        arrows: {
          ...DEFAULT_SLIDER.controls.arrows,
          ...sliderOptions?.controls?.arrows ?? {},
          arrow: {
            ...DEFAULT_SLIDER.controls.arrows.arrow,
            ...sliderOptions?.controls?.arrows?.arrow ?? {}
          },
          prev: {
            ...DEFAULT_SLIDER.controls.arrows.prev,
            ...sliderOptions?.controls?.arrows?.prev ?? {}
          },
          next: {
            ...DEFAULT_SLIDER.controls.arrows.next,
            ...sliderOptions?.controls?.arrows?.next ?? {}
          }
        },
        dots: {
          ...DEFAULT_SLIDER.controls.dots,
          ...sliderOptions?.controls?.dots ?? {},
          root: {
            ...DEFAULT_SLIDER.controls.dots.root,
            ...sliderOptions?.controls?.dots?.root ?? {}
          },
          dot: {
            ...DEFAULT_SLIDER.controls.dots.dot,
            ...sliderOptions?.controls?.dots?.dot ?? {}
          }
        },
        progress: {
          ...DEFAULT_SLIDER.controls.progress,
          ...sliderOptions?.controls?.progress ?? {},
          root: {
            ...DEFAULT_SLIDER.controls.progress.root,
            ...sliderOptions?.controls?.progress?.root ?? {}
          },
          bar: {
            ...DEFAULT_SLIDER.controls.progress.bar,
            ...sliderOptions?.controls?.progress?.bar ?? {}
          }
        },
        ripple: {
          ...DEFAULT_SLIDER.controls.ripple,
          ...sliderOptions?.controls?.ripple ?? {}
        }
      },
      thumbnails: { ...DEFAULT_SLIDER.thumbnails, ...sliderOptions?.thumbnails ?? {} },
      lazyLoad: sliderOptions?.lazyLoad ?? DEFAULT_SLIDER.lazyLoad,
      auto: {
        ...DEFAULT_SLIDER.auto,
        ...sliderOptions?.auto ?? {},
        play: { ...DEFAULT_SLIDER.auto.play, ...sliderOptions?.auto?.play ?? {} },
        scroll: { ...DEFAULT_SLIDER.auto.scroll, ...sliderOptions?.auto?.scroll ?? {} }
      },
      motion: { ...DEFAULT_SLIDER.motion, ...sliderOptions?.motion ?? {} }
    };
  }, [sliderOptions]);
  const idSeqRef = React7.useRef(0);
  const newId = React7.useCallback(() => `rmg-${++idSeqRef.current}`, []);
  const initialCells = React7.useMemo(() => {
    const kids = React7.Children.toArray(children);
    return kids.map((n) => ({ id: newId(), node: n }));
  }, []);
  const [cellsState] = React7.useState(initialCells);
  const renderedCells = React7.useMemo(() => {
    return cellsState.map((c) => {
      const n = c.node;
      return React7.isValidElement(n) ? React7.cloneElement(n, { key: c.id }) : /* @__PURE__ */ jsx("span", { style: { display: "block" }, children: n }, c.id);
    });
  }, [cellsState]);
  const vw = useViewportWidth();
  const resolvedCellsPerSlide = React7.useMemo(() => {
    const hasCellsPerSlideProp2 = sliderObject.layout.cellsPerSlide != null;
    if (!hasCellsPerSlideProp2) return void 0;
    const raw = resolveNumberFromResponsive(
      sliderObject.layout.cellsPerSlide,
      1,
      vw,
      effectiveBreakpoints
    );
    return Math.max(1, raw | 0);
  }, [sliderObject.layout.cellsPerSlide, vw, effectiveBreakpoints]);
  const sliderResponsiveColumns = typeof resolvedCellsPerSlide === "number" ? resolvedCellsPerSlide : void 0;
  const resolvedGap = React7.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      sliderObject.layout.gap,
      20,
      vw,
      effectiveBreakpoints
    );
    return Math.max(0, raw | 0);
  }, [sliderObject.layout.gap, vw, effectiveBreakpoints]);
  const resolvedThumbPos = React7.useMemo(() => {
    if (!sliderOptions?.thumbnails?.layout?.position) return void 0;
    return resolvePositionFromResponsive(
      sliderOptions?.thumbnails?.layout?.position,
      "bottom",
      vw,
      effectiveBreakpoints
    );
  }, [sliderOptions?.thumbnails?.layout?.position, vw, effectiveBreakpoints]);
  const sliderScopeId = React7.useId();
  const sliderScope = `rmg-slider-${sliderScopeId.replace(/:/g, "")}`;
  const sliderLoading = React7.useMemo(() => {
    const src = sliderObject.transitions?.loading ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading
    };
  }, [sliderObject.transitions?.loading]);
  const responsiveCss = React7.useMemo(() => {
    const rules = Array.isArray(sliderObject.size?.heightRules) ? sliderObject.size?.heightRules : [];
    if (!rules.length) return "";
    const rootSel = `[data-rmg-scope="${sliderScope}"]`;
    return rules.map((r) => `@media ${r.query} { ${rootSel} { --rmg-slider-height: ${r.height} !important; } }`).join("\n");
  }, [sliderObject.size?.heightRules, sliderScope]);
  function pickSsrBaseResponsiveValue(v, fallback) {
    if (typeof v === "number") return v;
    if (v && typeof v === "object") {
      const entries = Object.entries(v).map(([k, val]) => [Number(k), Number(val)]).filter(([k, val]) => Number.isFinite(k) && Number.isFinite(val)).sort((a, b) => a[0] - b[0]);
      if (entries.length) return entries[0][1];
    }
    return fallback;
  }
  const ssrCellsBase = Math.max(
    1,
    pickSsrBaseResponsiveValue(sliderObject.layout?.cellsPerSlide, 1) | 0
  );
  const [cellsPerSlideLive, setCellsPerSlideLive] = React7.useState(ssrCellsBase);
  React7.useEffect(() => {
    if (typeof sliderResponsiveColumns === "number") {
      setCellsPerSlideLive(sliderResponsiveColumns);
    }
  }, [sliderResponsiveColumns]);
  const sliderSkeleton = useScopedSkeleton({
    enabled: true,
    scopeId: sliderScope,
    layout: "slider",
    loading: sliderLoading,
    fallbackCount: ssrCellsBase,
    breakpointMap: effectiveBreakpoints,
    maxSlots: 12,
    showLoadingFallback: !isReady,
    defaultNode: (MAX_SKELETONS) => /* @__PURE__ */ jsx("div", { className: styles_default.sliderSkeletonOverlay, "data-rmg-skel-part": "overlay", children: /* @__PURE__ */ jsx("div", { className: styles_default.sliderSkeletonRow, "data-rmg-skel-part": "row", children: Array.from({ length: MAX_SKELETONS }).map((_, i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: styles_default.sliderSkeleton,
        "data-rmg-skel-slot": i + 1
      },
      `rmg-slider-skel-${i}`
    )) }) })
  });
  const initialHeightCss = React7.useMemo(() => {
    const rules = Array.isArray(sliderObject.size?.initialHeightRules) ? sliderObject.size.initialHeightRules : [];
    const hasRules = rules.length > 0;
    const hasValue = sliderObject.size?.initialHeight != null;
    if (hasRules || hasValue) {
      const rootSel = `[data-rmg-scope="${sliderScope}"]`;
      const base = hasValue ? `${rootSel} { --rmg-slider-initial-height: ${cssHeightValue(sliderObject.size.initialHeight)}; }` : "";
      const media = rules.map((r) => `@media ${r.query} { ${rootSel} { --rmg-slider-initial-height: ${cssHeightValue(r.height)} !important; } }`).join("\n");
      return [base, media].filter(Boolean).join("\n");
    }
    const ar = parseAspectRatio(sliderObject.size?.aspectRatio);
    if (!ar) return "";
    const baseCells = Math.max(1, pickSsrBaseResponsiveValue(sliderObject.layout?.cellsPerSlide, 1) | 0);
    const baseGap = Math.max(0, pickSsrBaseResponsiveValue(sliderObject.layout?.gap, 12) | 0);
    return buildScopedAutoInitialHeightCssFromAspectRatio({
      scope: sliderScope,
      aspectRatioWOverH: ar,
      // w/h
      cellsPerSlide: sliderObject.layout?.cellsPerSlide,
      gap: sliderObject.layout?.gap,
      baseCells,
      baseGap
    });
  }, [
    sliderObject.size?.initialHeight,
    sliderObject.size?.initialHeightRules,
    sliderObject.size?.aspectRatio,
    sliderObject.layout?.cellsPerSlide,
    sliderObject.layout?.gap,
    sliderScope,
    effectiveBreakpoints
  ]);
  const thumbsScopeId = React7.useId();
  const thumbsScope = `rmg-thumbs-${thumbsScopeId.replace(/:/g, "")}`;
  const thumbsLoading = React7.useMemo(() => {
    const src = sliderObject.thumbnails.transitions?.loading ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading
    };
  }, [sliderObject.thumbnails.transitions?.loading]);
  const isHorizontalThumbs = resolvedThumbPos === "top" || resolvedThumbPos === "bottom";
  const thumbsGap = sliderObject.thumbnails.layout?.gap ?? 10;
  const thumbW = sliderObject.thumbnails.layout?.thumbnail?.width ?? 64;
  const thumbH = sliderObject.thumbnails.layout?.thumbnail?.height ?? 64;
  const thumbsSkeleton = useScopedSkeleton({
    enabled: true,
    scopeId: thumbsScope,
    layout: "thumbnails",
    loading: thumbsLoading,
    fallbackCount: 6,
    breakpointMap: effectiveBreakpoints,
    maxSlots: 12,
    showLoadingFallback: !isReady,
    defaultNode: (MAX_SKELETONS) => /* @__PURE__ */ jsx(
      "div",
      {
        className: styles_default.thumbSkeletonOverlay,
        "data-rmg-skel-part": "overlay",
        style: {
          height: sliderObject.thumbnails.layout?.container?.height,
          width: sliderObject.thumbnails.layout?.container?.width
        },
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: styles_default.thumbSkeletonRow,
            "data-rmg-skel-part": "row",
            style: {
              gap: thumbsGap,
              flexDirection: isHorizontalThumbs ? "row" : "column"
            },
            children: Array.from({ length: MAX_SKELETONS }).map((_, i) => /* @__PURE__ */ jsx(
              "div",
              {
                className: styles_default.thumbSkeleton,
                "data-rmg-skel-slot": i + 1,
                style: {
                  width: isHorizontalThumbs ? thumbW : "100%",
                  height: isHorizontalThumbs ? "100%" : thumbH
                }
              },
              `rmg-thumb-skel-${i}`
            ))
          }
        )
      }
    )
  });
  const sliderShellRef = React7.useRef(null);
  sliderObject.size?.initialHeight;
  const sliderImagesReady = true;
  const normalizedItems = core?.normalizedItems ?? [];
  const shimmerStyleVars = React7.useMemo(() => {
    const s = sliderObject.transitions?.loading?.shimmer;
    if (!s) return void 0;
    const px = (v) => v == null ? void 0 : typeof v === "number" ? `${v}px` : v;
    return {
      ...s.radius != null ? { ["--rmg-shimmer-radius"]: px(s.radius) } : {},
      ...s.c1 != null ? { ["--rmg-shimmer-c1"]: s.c1 } : {},
      ...s.c2 != null ? { ["--rmg-shimmer-c2"]: s.c2 } : {},
      ...s.c3 != null ? { ["--rmg-shimmer-c3"]: s.c3 } : {},
      ...s.size != null ? { ["--rmg-shimmer-size"]: s.size } : {},
      ...s.duration != null ? { ["--rmg-shimmer-duration"]: s.duration } : {},
      ...s.timing != null ? { ["--rmg-shimmer-timing"]: s.timing } : {}
    };
  }, [sliderObject.transitions?.loading?.shimmer]);
  const userProvidedHeight = sliderOptions?.size?.height != null || Array.isArray(sliderOptions?.size?.heightRules) && sliderOptions.size.heightRules.length > 0;
  const userProvidedInitialHeight = sliderOptions?.size?.initialHeight != null || Array.isArray(sliderOptions?.size?.initialHeightRules) && sliderOptions.size.initialHeightRules.length > 0;
  !userProvidedInitialHeight && !userProvidedHeight && !!parseAspectRatio(sliderObject.size?.aspectRatio);
  const sliderHeightProp = userProvidedHeight ? sliderObject.size?.height : void 0;
  const responsiveHeightsProp = userProvidedHeight ? sliderObject.size?.heightRules : void 0;
  const initialHeightProp = userProvidedInitialHeight ? sliderObject.size?.initialHeight : void 0;
  const hasCellsPerSlideProp = sliderObject.layout.cellsPerSlide != null;
  const cellsPerSlideProp = hasCellsPerSlideProp ? cellsPerSlideLive : void 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    (resolvedThumbPos === "top" || resolvedThumbPos === "left") && /* @__PURE__ */ jsxs(Fragment, { children: [
      thumbsSkeleton.cssText && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: thumbsSkeleton.cssText } }),
      /* @__PURE__ */ jsxs("div", { id: thumbsScope, "data-rmg-scope": thumbsScope, style: { position: "relative" }, children: [
        thumbsSkeleton.node,
        /* @__PURE__ */ jsx(
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
      ] })
    ] }),
    sliderSkeleton.cssText && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: sliderSkeleton.cssText } }),
    responsiveCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: responsiveCss } }),
    initialHeightCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: initialHeightCss } }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        id: sliderScope,
        ref: sliderShellRef,
        "data-rmg-scope": sliderScope,
        className: styles_default.sliderShell,
        style: {
          position: "relative",
          ...userProvidedHeight && sliderObject.size?.height != null ? { ["--rmg-slider-height"]: sliderObject.size.height } : {},
          ...userProvidedInitialHeight && sliderObject.size?.initialHeight != null ? { ["--rmg-slider-initial-height"]: sliderObject.size.initialHeight } : {},
          ...shimmerStyleVars ?? {}
        },
        children: [
          sliderSkeleton.node,
          /* @__PURE__ */ jsx(
            Slider_default2,
            {
              imageCount: cellsState.length,
              isClick,
              expandableImgRefs,
              overlayDivRef,
              setSlideIndex,
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
              sliderHeight: sliderHeightProp,
              responsiveHeights: responsiveHeightsProp,
              initialHeight: initialHeightProp,
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
              showProgress: sliderObject.controls.progress.enabled,
              progressClassName: sliderObject.controls.progress.root.className,
              progressStyle: sliderObject.controls.progress.root.style,
              progressInnerClassName: sliderObject.controls.progress.bar.className,
              progressInnerStyle: sliderObject.controls.progress.bar.style,
              renderProgress: sliderObject.controls.progress.render,
              parallax: sliderObject.effects?.parallax?.enabled,
              parallaxBleedPct: sliderObject.effects?.parallax?.bleedPct,
              parallaxBorderRadius: sliderObject.effects?.parallax?.borderRadius,
              parallaxSideWidth: sliderObject.effects?.parallax?.sideWidth,
              ref: setSliderHandle,
              scaleEffect: sliderObject.effects?.scale?.enabled,
              scaleAmount: sliderObject.effects?.scale?.amount,
              fadeEffect: sliderObject.effects?.fade?.enabled,
              cellsPerSlide: cellsPerSlideProp,
              direction: sliderObject.direction.dir,
              axis: sliderObject.direction.axis,
              skipSnaps: sliderObject.scroll.skipSnaps,
              selectDuration: sliderObject.motion.selectDuration,
              freeScrollDuration: sliderObject.motion.freeScrollDuration,
              sliderFriction: sliderObject.motion.friction,
              indexChannel,
              introOptions: sliderObject.transitions?.intro,
              lazyLoad: sliderObject.lazyLoad,
              rippleEnabled: sliderObject.controls.ripple.enabled,
              rippleClassName: sliderObject.controls.ripple.className,
              normalizedItems,
              sliderImagesReady,
              breakpointMap: effectiveBreakpoints,
              enableFullscreen: !!core?.requestFullscreenOpen,
              requestFullscreenOpen: core ? ({ index, img, event }) => core.requestFullscreenOpen({ source: "slider", index, img, event }) : void 0,
              isFullscreenOpen: !!core?.isFullscreenOpen,
              setFullscreenOpen: core?.setFullscreenOpen,
              children: renderedCells
            }
          )
        ]
      }
    ),
    (resolvedThumbPos === "bottom" || resolvedThumbPos === "right") && /* @__PURE__ */ jsxs(Fragment, { children: [
      thumbsSkeleton.cssText && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: thumbsSkeleton.cssText } }),
      /* @__PURE__ */ jsxs("div", { id: thumbsScope, "data-rmg-scope": thumbsScope, style: { position: "relative" }, children: [
        thumbsSkeleton.node,
        /* @__PURE__ */ jsx(
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
      ] })
    ] })
  ] });
});

export { Slider };
