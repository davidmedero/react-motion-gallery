import * as React from 'react';
import { jsx } from 'react/jsx-runtime';

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
function resolvePlyrComponent(mod) {
  return mod?.Plyr ?? mod?.default?.Plyr ?? mod?.default;
}
var LazyPlyr = React.lazy(async () => {
  const mod = await import('plyr-react');
  const Comp = resolvePlyrComponent(mod);
  if (!Comp) {
    throw new Error(
      `LazyPlyr: could not resolve Plyr component from plyr-react import. Keys: ${Object.keys(mod ?? {}).join(
        ", "
      )}`
    );
  }
  return { default: Comp };
});
var Plyr = React.forwardRef(function PlyrForwarded(props, ref) {
  return /* @__PURE__ */ jsx(LazyPlyr, { ...props, ref });
});

export { Plyr, applySmoothTransform, baseFitSizeC, buildPlyrProps, defaultPlyrOptions, defaultPlyrSource, detectProvider, distance, findImgAtPoint, gapAllEdges, getClientXY, getCurrentTransform, getPrimaryImgEl, installDblclickGuardWhenReady, isVideoSlideElement, mergePlyrOptions, midpoint, readDataIndex, zoomTo };
//# sourceMappingURL=chunk-BK66FVWK.mjs.map
//# sourceMappingURL=chunk-BK66FVWK.mjs.map