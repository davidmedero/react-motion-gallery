'use client';

import * as React from 'react';

const DEFAULT_IN_VIEW_THRESHOLD = 0.1;

type InViewOnceOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
};

function getViewportRect() {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    top: 0,
    left: 0,
    right: viewportWidth,
    bottom: viewportHeight,
    width: viewportWidth,
    height: viewportHeight,
  };
}

function resolveMarginValue(raw: string | undefined, size: number) {
  if (!raw) return 0;
  if (raw.endsWith('%')) return (size * parseFloat(raw)) / 100;
  return parseFloat(raw) || 0;
}

function expandRootMargin(rootMargin: string, rootRect: { width: number; height: number }) {
  const tokens = rootMargin.trim().split(/\s+/).filter(Boolean);
  const [top, right = top, bottom = top, left = right] = [
    tokens[0] ?? '0px',
    tokens[1],
    tokens[2],
    tokens[3],
  ];

  return {
    top: resolveMarginValue(top, rootRect.height),
    right: resolveMarginValue(right, rootRect.width),
    bottom: resolveMarginValue(bottom, rootRect.height),
    left: resolveMarginValue(left, rootRect.width),
  };
}

function approximateIntersectionRatio(
  el: HTMLElement,
  root: Element | null,
  rootMargin: string
) {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return 0;

  const rawRootRect = root instanceof Element ? root.getBoundingClientRect() : getViewportRect();
  const margin = expandRootMargin(rootMargin, rawRootRect);
  const rootRect = {
    top: rawRootRect.top - margin.top,
    left: rawRootRect.left - margin.left,
    right: rawRootRect.right + margin.right,
    bottom: rawRootRect.bottom + margin.bottom,
  };

  const visibleWidth = Math.max(0, Math.min(rect.right, rootRect.right) - Math.max(rect.left, rootRect.left));
  const visibleHeight = Math.max(0, Math.min(rect.bottom, rootRect.bottom) - Math.max(rect.top, rootRect.top));
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = rect.width * rect.height;

  return totalArea > 0 ? visibleArea / totalArea : 0;
}

function isVisibleEnough(ratio: number, threshold: number) {
  return threshold <= 0 ? ratio > 0 : ratio >= threshold;
}

export function useInViewOnce(
  enabled: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onInView: () => void,
  options?: InViewOnceOptions
) {
  const seenRef = React.useRef(false);
  const root = options?.root ?? null;
  const rootMargin = options?.rootMargin ?? '0px';
  const threshold = options?.threshold ?? DEFAULT_IN_VIEW_THRESHOLD;

  React.useEffect(() => {
    if (!enabled) {
      seenRef.current = false;
    }
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled || seenRef.current) return;
    const el = ref.current;
    if (!el) return;

    if (isVisibleEnough(approximateIntersectionRatio(el, root, rootMargin), threshold)) {
      seenRef.current = true;
      onInView();
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      seenRef.current = true;
      onInView();
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (seenRef.current) {
        io.disconnect();
        return;
      }

      if (entry.isIntersecting && isVisibleEnough(entry.intersectionRatio, threshold)) {
        seenRef.current = true;
        onInView();
        io.disconnect();
      }
    }, { root, rootMargin, threshold });

    io.observe(el);
    return () => io.disconnect();
  }, [enabled, onInView, ref, root, rootMargin, threshold]);
}
