import { normalizeResponsiveToMinWidthRules } from './chunk-AD5YPMDD.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';

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

// src/Gallery/shared/input/pointerTypes.ts
function isMouseEvent(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
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

// src/Gallery/shared/skeleton/buildScopedSkeletonCountCss.ts
function buildScopedSkeletonCountCss(args) {
  const { scopeId, responsiveCount, fallbackCount, breakpointMap, maxSlots } = args;
  const rules = normalizeResponsiveToMinWidthRules(responsiveCount, fallbackCount, breakpointMap);
  const clamp = (n) => Math.max(0, Math.min(maxSlots, Math.floor(n)));
  const baseCount = clamp(rules[0]?.count ?? fallbackCount);
  const rootSel = `[data-rmg-scope="${scopeId}"]`;
  const slotSel = `${rootSel} [data-rmg-skel-slot]`;
  const lines = [];
  lines.push(`${slotSel}{ display:none; }`);
  const showFirstN = (count) => {
    const c = clamp(count);
    if (c <= 0) return "";
    return Array.from({ length: c }).map((_, i) => `${rootSel} [data-rmg-skel-slot="${i + 1}"]{ display:block; }`).join("\n");
  };
  lines.push(showFirstN(baseCount));
  for (const r of rules.slice(1)) {
    const c = clamp(r.count);
    lines.push(`@media (min-width:${r.minWidth}px){
${showFirstN(c)}
}`);
  }
  return { cssText: lines.join("\n"), ssrBaseCount: baseCount };
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

export { Animations, Counter, EventStore, Limit, PercentOfView, RmgArrows, ScrollBody, ScrollBounds, ScrollLooper, ScrollTarget, Translate, TranslateFullscreen, Vector1D, buildScopedSkeletonCountCss, createBaseLimit, createDragTracker, factorAbs, isMouseEvent, mathSign };
//# sourceMappingURL=chunk-PBZSDTG5.mjs.map
//# sourceMappingURL=chunk-PBZSDTG5.mjs.map