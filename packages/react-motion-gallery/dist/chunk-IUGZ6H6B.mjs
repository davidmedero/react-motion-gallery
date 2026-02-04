import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { jsx, Fragment } from 'react/jsx-runtime';

// src/Gallery/fullscreen/fullscreenIntro.tsx

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
  const insetForRect = (r) => {
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
  const startInset = insetForRect(visibleImgRect);
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
      const root = createRoot(overlayCaption);
      overlayCaptionRootRef.current = root;
      const item2 = normalizedItems[index];
      const captionNode = fs.caption.render({
        item: item2,
        index,
        isZoomed: false
      });
      root.render(/* @__PURE__ */ jsx(Fragment, { children: captionNode }));
    } catch (err) {
      console.error("[RMG] Failed to render overlay caption", err);
    }
  }
  normalizedItems.length;
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
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
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
  flushSync(() => {
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

export { containTransformForRect, coverTransformForRect, createSliderFullscreenIntroRunner, objectFitContentRect, parseObjectPosition, runFullscreenIntro };
//# sourceMappingURL=chunk-IUGZ6H6B.mjs.map
//# sourceMappingURL=chunk-IUGZ6H6B.mjs.map