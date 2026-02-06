import * as React from "react";

type Gettable = { get(): number };

type SlideLike = { target: number };

type Args = {
  enabled?: boolean;
  scaleAmount?: number;
  wrap: boolean;
  sliderRef: React.RefObject<HTMLElement | null>;
  sliderWidthRef: React.RefObject<number>;
  offsetLocationRef: React.RefObject<Gettable | null>;
  slidesRef: React.RefObject<SlideLike[] | null>;
  getCenterOffsetForIndex: (logicalIdx: number) => number;
  slidesLen: number;
  clonedLen: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function useScaleEffect({
  enabled,
  scaleAmount,
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

  const findBoundingPair = React.useCallback(
    (loc: number) => {
      const centers = getCenters();
      const L = centers.length;
      if (!L) return { iL: 0, iR: 0, t: 0 };

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
        rightIdx = 0;
      for (let k = 0; k < nodes.length - 1; k++) {
        const a = nodes[k],
          b = nodes[k + 1];
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
    const kids = Array.from(track.children) as HTMLElement[];
    const loc = -(offsetLocationRef.current?.get() ?? 0);

    const { iL, iR, t } = findBoundingPair(loc);
    const wL = 1 - t;
    const wR = t;

    const L = slidesRef.current.length;
    const sByIdx = new Array<number>(L).fill(1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, scaleAmount, slidesLen, clonedLen]);

  React.useEffect(() => {
    if (enabled) return;
    const track = sliderRef.current;
    if (!track) return;
    const kids = Array.from(track.children) as HTMLElement[];
    for (const el of kids) {
      el.style.setProperty("--rmg-scale", "1");
      el.style.zIndex = "0";
    }
  }, [enabled, sliderRef]);

  return { applyPairScaleTween, getCenters };
}