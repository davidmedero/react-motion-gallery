'use client';

import * as React from 'react';

const ACTIVE_LAYER_SELECTOR = '[data-rmg-overlay-height-active="true"]';
const FROZEN_LAYER_ATTR = 'data-rmg-overlay-height-frozen';
const HEIGHT_EPSILON = 0.5;
const HEIGHT_PRECISION = 1000;

function roundHeight(value: number) {
  return Math.round((value + Number.EPSILON) * HEIGHT_PRECISION) / HEIGHT_PRECISION;
}

function readPrefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(readPrefersReducedMotion);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(media.matches);

    onChange();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

type OverlayContentHeightStackProps = {
  children: React.ReactNode;
  activeKey: React.Key;
  activeReady: boolean;
  durationMs: number;
  easing: string;
};

export function OverlayContentHeightStack({
  children,
  activeKey,
  activeReady,
  durationMs,
  easing,
}: OverlayContentHeightStackProps) {
  const stackRef = React.useRef<HTMLDivElement | null>(null);
  const heightRef = React.useRef<number | null>(null);
  const activeReadyRef = React.useRef(activeReady);
  const [height, setHeight] = React.useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const canTransition = !reducedMotion && durationMs > 0;
  activeReadyRef.current = activeReady;

  const getActiveLayer = React.useCallback(() => {
    const stack = stackRef.current;
    if (!stack) return null;

    return (
      stack.querySelector<HTMLElement>(ACTIVE_LAYER_SELECTOR) ??
      (stack.lastElementChild instanceof HTMLElement ? stack.lastElementChild : null)
    );
  }, []);

  const measureActiveLayer = React.useCallback(() => {
    const stack = stackRef.current;
    const activeLayer = getActiveLayer();
    if (!stack || !activeLayer) return null;

    const layerNodes = Array.from(stack.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
    const restoredLayerStyles = layerNodes.map((layer) => ({
      layer,
      bottom: layer.style.bottom,
      height: layer.style.height,
      inset: layer.style.inset,
      left: layer.style.left,
      maxHeight: layer.style.maxHeight,
      minHeight: layer.style.minHeight,
      position: layer.style.position,
      right: layer.style.right,
      top: layer.style.top,
      transform: layer.style.transform,
      visibility: layer.style.visibility,
      width: layer.style.width,
      zIndex: layer.style.zIndex,
    }));
    const previousStackHeight = stack.style.height;
    const previousStackOverflow = stack.style.overflow;
    const previousStackTransition = stack.style.transition;

    stack.style.transition = 'none';
    stack.style.height = 'auto';
    stack.style.overflow = 'visible';

    for (const layer of layerNodes) {
      if (layer === activeLayer) {
        layer.style.height = 'auto';
        layer.style.minHeight = '0';
        layer.style.maxHeight = 'none';
        continue;
      }

      layer.style.position = 'absolute';
      layer.style.inset = '0 0 auto 0';
      layer.style.visibility = 'hidden';
    }

    try {
      const rect = activeLayer.getBoundingClientRect();
      return roundHeight(Math.max(0, rect.height, activeLayer.scrollHeight));
    } finally {
      for (const saved of restoredLayerStyles) {
        saved.layer.style.bottom = saved.bottom;
        saved.layer.style.height = saved.height;
        saved.layer.style.inset = saved.inset;
        saved.layer.style.left = saved.left;
        saved.layer.style.maxHeight = saved.maxHeight;
        saved.layer.style.minHeight = saved.minHeight;
        saved.layer.style.position = saved.position;
        saved.layer.style.right = saved.right;
        saved.layer.style.top = saved.top;
        saved.layer.style.transform = saved.transform;
        saved.layer.style.visibility = saved.visibility;
        saved.layer.style.width = saved.width;
        saved.layer.style.zIndex = saved.zIndex;
      }

      stack.style.height = previousStackHeight;
      stack.style.overflow = previousStackOverflow;
      stack.style.transition = previousStackTransition;
    }
  }, [getActiveLayer]);

  const syncHeight = React.useCallback(() => {
    if (!activeReadyRef.current) return;

    const stack = stackRef.current;
    const nextHeight = measureActiveLayer();
    if (!stack || nextHeight == null) return;

    const previousHeight = heightRef.current;
    if (previousHeight != null && Math.abs(previousHeight - nextHeight) <= HEIGHT_EPSILON) {
      return;
    }

    if (previousHeight != null) {
      stack.style.height = `${previousHeight}px`;
      void stack.offsetHeight;
    }

    heightRef.current = nextHeight;
    setHeight(nextHeight);
  }, [measureActiveLayer]);

  React.useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const layerNodes = Array.from(stack.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );

    for (const layer of layerNodes) {
      if (layer.getAttribute(FROZEN_LAYER_ATTR) === 'true') {
        layer.removeAttribute(FROZEN_LAYER_ATTR);
        layer.style.inset = '';
        layer.style.bottom = '';
        layer.style.left = '';
        layer.style.right = '';
        layer.style.top = '';
        layer.style.transform = '';
        layer.style.width = '';
        layer.style.height = '';
      }
    }
  });

  React.useLayoutEffect(() => {
    if (!activeReady) return;
    syncHeight();
  }, [activeKey, activeReady, syncHeight]);

  React.useEffect(() => {
    if (!activeReady) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer || typeof ResizeObserver === 'undefined') return;

    let raf = 0;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncHeight();
      });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(activeLayer);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [activeKey, activeReady, getActiveLayer, syncHeight]);

  const transition =
    canTransition && height != null ? `height ${durationMs}ms ${easing}` : undefined;

  return (
    <div
      ref={stackRef}
      data-rmg-overlay-height-stack="true"
      style={{
        display: 'grid',
        alignItems: 'center',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: 'minmax(0, 1fr)',
        minWidth: 0,
        position: 'relative',
        height: height == null ? undefined : height,
        overflow: 'visible',
        transition,
        willChange: transition ? 'height' : undefined,
      }}
    >
      {children}
    </div>
  );
}
