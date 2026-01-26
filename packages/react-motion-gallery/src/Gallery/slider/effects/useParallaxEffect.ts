import * as React from "react";

const TWEEN_FACTOR_BASE = 0.2;

type AxisMain = "x" | "y";

type Gettable = { get(): number };

type Args = {
  enabled?: boolean;
  wrap: boolean;
  axisMain: AxisMain;
  sliderRef: React.RefObject<HTMLElement | null>;
  sliderWidthRef: React.RefObject<number>;
  offsetLocationRef: React.RefObject<Gettable | null>;
  visibleImagesRef: React.RefObject<number>;
  slidesLen: number;
  clonedLen: number;
  isReady: boolean;
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function useParallaxEffect({
  enabled,
  wrap,
  axisMain,
  sliderRef,
  sliderWidthRef,
  offsetLocationRef,
  visibleImagesRef,
  slidesLen,
  clonedLen,
  isReady,
}: Args) {
  const tweenNodesRef = React.useRef<HTMLElement[]>([]);
  const parallaxNodesRef = React.useRef<HTMLElement[]>([]);
  const parallaxSnapsRef = React.useRef<number[]>([]);

  const collectParallaxForAll = React.useCallback(() => {
    const track = sliderRef.current;
    if (!track) return;

    const W = sliderWidthRef.current || 0;
    const nodes: HTMLElement[] = [];
    const snaps: number[] = [];

    const kids = Array.from(track.children) as HTMLElement[];

    for (const el of kids) {
      const layer = el.querySelector<HTMLElement>(".rmg__parallax__layer");
      if (!layer) continue;

      // your original behavior: read translateX(...) if present, else offsetLeft
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

  const scrollProgressNorm = React.useCallback((): number => {
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

    function circDiff(a: number, b: number) {
      let d = a - b;
      if (d > 0.5) d -= 1;
      if (d < -0.5) d += 1;
      return d;
    }

    for (let i = 0; i < nodes.length; i++) {
      const snap = snaps[i];
      const diff = wrap ? circDiff(snap, p) : snap - p;
      const translatePct = diff * (-1 * factor) * 100;

      nodes[i].style.transform =
        axisMain === "x"
          ? `translateX(${translatePct}%)`
          : `translateY(${translatePct}%)`;
    }
  }, [enabled, wrap, axisMain, scrollProgressNorm, currentTweenFactor]);

  // collect whenever structure changes
  React.useEffect(() => {
    if (!enabled) return;
    collectParallaxForAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, slidesLen, clonedLen, wrap, isReady, collectParallaxForAll]);

  // cleanup styles when disabled
  React.useEffect(() => {
    if (enabled) return;
    tweenNodesRef.current.forEach((n) => n && n.removeAttribute("style"));
  }, [enabled]);

  // initial tween after paint
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
    parallaxSnapsRef,
  };
}