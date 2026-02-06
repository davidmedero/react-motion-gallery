import * as React from "react";

type Gettable = { get(): number };

type SlideLike = { target: number };

type Args = {
  enabled?: boolean;
  wrap: boolean;
  sliderRef: React.RefObject<HTMLElement | null>;
  sliderWidthRef: React.RefObject<number>;
  offsetLocationRef: React.RefObject<Gettable | null>;
  slidesRef: React.RefObject<SlideLike[] | null>;
  getCenterOffsetForIndex: (logicalIdx: number) => number;
  slidesLen: number;
  clonedLen: number;
};

const MIN_FADE_OPACITY = 0.5;

function circularDist(x: number, c: number, W: number) {
  let d = Math.abs(x - c);
  if (W > 0) {
    d = Math.min(d, Math.abs(x - (c - W)), Math.abs(x - (c + W)));
  }
  return d;
}

export function useFadeEffect({
  enabled,
  wrap,
  sliderRef,
  sliderWidthRef,
  offsetLocationRef,
  slidesRef,
  getCenterOffsetForIndex,
  slidesLen,
  clonedLen,
}: Args) {
  const slideCenterX = React.useCallback(
    (logicalIdx: number) => {
      const s = slidesRef.current?.[logicalIdx];
      if (!s || !sliderRef.current) return 0;
      const centerOffset = getCenterOffsetForIndex(logicalIdx);
      return s.target - centerOffset;
    },
    [slidesRef, sliderRef, getCenterOffsetForIndex]
  );

  const getCenters = React.useCallback((): number[] => {
    const L = slidesRef.current?.length ?? 0;
    const arr: number[] = [];
    for (let i = 0; i < L; i++) arr.push(slideCenterX(i));
    return arr;
  }, [slidesRef, slideCenterX]);

  const applyFadeTween = React.useCallback(() => {
    if (!enabled || !sliderRef.current || !slidesRef.current?.length) return;

    const track = sliderRef.current;
    const kids = Array.from(track.children) as HTMLElement[];
    const loc = -(offsetLocationRef.current?.get() ?? 0);

    const centers = getCenters();
    const L = centers.length;
    if (!L) return;

    const W = sliderWidthRef.current || 0;
    const useWrap = wrap && W > 0;

    type Node = { x: number; i: number };
    const nodes: Node[] = [];
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

    let leftIdx = 0,
      rightIdx = 1;
    for (let k = 0; k < nodes.length - 1; k++) {
      const a = nodes[k],
        b = nodes[k + 1];
      if (loc >= a.x && loc <= b.x) {
        leftIdx = k;
        rightIdx = k + 1;
        break;
      }
    }

    const span = Math.max(1, nodes[rightIdx].x - nodes[leftIdx].x);

    const opacityByIdx = new Array<number>(L).fill(MIN_FADE_OPACITY);
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
    wrap,
  ]);

  React.useEffect(() => {
    applyFadeTween();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, slidesLen, clonedLen, wrap]);

  React.useEffect(() => {
    if (enabled) return;
    const track = sliderRef.current;
    if (!track) return;
    const kids = Array.from(track.children) as HTMLElement[];
    for (const el of kids) el.style.opacity = "1";
  }, [enabled, sliderRef]);

  return { applyFadeTween, getCenters };
}