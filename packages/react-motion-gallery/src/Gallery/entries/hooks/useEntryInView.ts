import * as React from "react";

export type UseEntryInViewOpts = IntersectionObserverInit & {
  nearMargin?: string;
  viewMargin?: string;
};

function getViewportRect() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
  };
}

function resolveMarginValue(raw: string | undefined, size: number) {
  if (!raw) return 0;
  if (raw.endsWith("%")) return (size * parseFloat(raw)) / 100;
  return parseFloat(raw) || 0;
}

function parseRootMargin(rootMargin: string, rootRect: { width: number; height: number }) {
  const tokens = rootMargin.trim().split(/\s+/).filter(Boolean);
  const [top, right = top, bottom = top, left = right] = [
    tokens[0] ?? "0px",
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
  node: Element,
  root: Element | Document | null | undefined,
  rootMargin: string
) {
  const targetRect = node.getBoundingClientRect();
  if (targetRect.width <= 0 || targetRect.height <= 0) return 0;

  const rawRootRect = root instanceof Element ? root.getBoundingClientRect() : getViewportRect();
  const margin = parseRootMargin(rootMargin, rawRootRect);
  const rootRect = {
    top: rawRootRect.top - margin.top,
    left: rawRootRect.left - margin.left,
    right: rawRootRect.right + margin.right,
    bottom: rawRootRect.bottom + margin.bottom,
  };

  const visibleWidth = Math.max(0, Math.min(targetRect.right, rootRect.right) - Math.max(targetRect.left, rootRect.left));
  const visibleHeight = Math.max(0, Math.min(targetRect.bottom, rootRect.bottom) - Math.max(targetRect.top, rootRect.top));
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = targetRect.width * targetRect.height;

  return totalArea > 0 ? visibleArea / totalArea : 0;
}

function passesThreshold(ratio: number, threshold: number) {
  return threshold <= 0 ? ratio > 0 : ratio >= threshold;
}

function normalizeThreshold(value: number | number[] | undefined, fallback: number) {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "number" ? first : fallback;
  }

  return typeof value === "number" ? value : fallback;
}

export function useEntryInView(len: number, opts?: UseEntryInViewOpts) {
  const nearMargin = opts?.nearMargin ?? "700px 0px";
  const viewMargin = opts?.viewMargin ?? "0px 0px";
  const nearThreshold = normalizeThreshold(opts?.threshold, 0.01);
  const everThreshold = 0;
  const root = opts?.root ?? null;

  const [nearView, setNearView] = React.useState<boolean[]>(
    () => Array.from({ length: len }, () => false)
  );
  const [everInView, setEverInView] = React.useState<boolean[]>(
    () => Array.from({ length: len }, () => false)
  );

  const nearIORef = React.useRef<IntersectionObserver | null>(null);
  const viewIORef = React.useRef<IntersectionObserver | null>(null);
  const nodeToIndexRef = React.useRef(new Map<Element, number>());
  const indexToNodeRef = React.useRef<(Element | null)[]>([]);

  const syncNodeVisibility = React.useCallback(
    (node: Element | null, index: number) => {
      if (typeof window === "undefined" || !node) return;

      const nearRatio = approximateIntersectionRatio(node, root, nearMargin);
      if (passesThreshold(nearRatio, nearThreshold)) {
        setNearView((prev) => {
          if (prev[index]) return prev;
          const next = prev.slice();
          next[index] = true;
          return next;
        });
      }

      const viewRatio = approximateIntersectionRatio(node, root, viewMargin);
      if (passesThreshold(viewRatio, everThreshold)) {
        setEverInView((prev) => {
          if (prev[index]) return prev;
          const next = prev.slice();
          next[index] = true;
          return next;
        });
      }
    },
    [everThreshold, nearMargin, nearThreshold, root, viewMargin]
  );

  React.useEffect(() => {
    indexToNodeRef.current = Array.from({ length: len }, () => null);
    setNearView(Array.from({ length: len }, () => false));
    setEverInView(Array.from({ length: len }, () => false));
    nodeToIndexRef.current.clear();

    nearIORef.current?.disconnect();
    viewIORef.current?.disconnect();
    nearIORef.current = null;
    viewIORef.current = null;
  }, [len]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    nearIORef.current?.disconnect();
    viewIORef.current?.disconnect();

    if (typeof IntersectionObserver === "undefined") {
      for (const [node, index] of nodeToIndexRef.current.entries()) {
        syncNodeVisibility(node, index);
      }
      return;
    }

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

    for (const [node, index] of nodeToIndexRef.current.entries()) {
      syncNodeVisibility(node, index);
    }

    return () => {
      nearIORef.current?.disconnect();
      viewIORef.current?.disconnect();
      nearIORef.current = null;
      viewIORef.current = null;
    };
  }, [everThreshold, len, nearMargin, nearThreshold, root, syncNodeVisibility, viewMargin]);

  const setEntryRef = React.useCallback(
    (index: number) => (node: HTMLElement | null) => {
      const prevNode = indexToNodeRef.current[index] ?? null;

      if (prevNode && prevNode !== node) {
        nodeToIndexRef.current.delete(prevNode);
        nearIORef.current?.unobserve(prevNode);
        viewIORef.current?.unobserve(prevNode);
      }

      indexToNodeRef.current[index] = node;

      if (!node) return;

      nodeToIndexRef.current.set(node, index);
      syncNodeVisibility(node, index);
      nearIORef.current?.observe(node);
      viewIORef.current?.observe(node);
    },
    [syncNodeVisibility]
  );

  return { nearView, everInView, setEntryRef };
}
