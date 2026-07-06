import * as React from "react";

export type UseEntryInViewOpts = IntersectionObserverInit & {
  nearMargin?: string;
  viewMargin?: string;
  keys?: readonly string[];
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
  const viewThreshold = normalizeThreshold(opts?.threshold, 0.01);
  const root = opts?.root ?? null;
  const keys = opts?.keys;
  const entryKeys = React.useMemo(
    () => Array.from({ length: len }, (_, index) => keys?.[index] ?? String(index)),
    [keys, len]
  );
  const entryKeySignature = entryKeys.join("\u0000");

  const [nearViewByKey, setNearViewByKey] = React.useState<Record<string, boolean>>({});
  const [inViewByKey, setInViewByKey] = React.useState<Record<string, boolean>>({});
  const [everInViewByKey, setEverInViewByKey] = React.useState<Record<string, boolean>>({});

  const nearIORef = React.useRef<IntersectionObserver | null>(null);
  const viewIORef = React.useRef<IntersectionObserver | null>(null);
  const nodeToIndexRef = React.useRef(new Map<Element, number>());
  const indexToNodeRef = React.useRef<(Element | null)[]>([]);
  const entryKeysRef = React.useRef(entryKeys);
  const previousEntryKeysRef = React.useRef(entryKeys);
  const nearViewByKeyRef = React.useRef(nearViewByKey);
  entryKeysRef.current = entryKeys;
  nearViewByKeyRef.current = nearViewByKey;

  const nearView = React.useMemo(
    () =>
      entryKeys.map((key, index) => {
        const current = nearViewByKey[key];
        if (current != null) return current;

        const previousKey = previousEntryKeysRef.current[index];
        return previousKey ? nearViewByKey[previousKey] ?? false : false;
      }),
    [entryKeys, nearViewByKey]
  );
  const everInView = React.useMemo(
    () =>
      entryKeys.map((key, index) => {
        if (everInViewByKey[key]) return true;

        const previousKey = previousEntryKeysRef.current[index];
        return previousKey
          ? everInViewByKey[previousKey] === true &&
              nearViewByKey[previousKey] === true
          : false;
      }),
    [entryKeys, everInViewByKey, nearViewByKey]
  );
  const inView = React.useMemo(
    () =>
      entryKeys.map((key, index) => {
        const current = inViewByKey[key];
        if (current != null) return current;

        const previousKey = previousEntryKeysRef.current[index];
        return previousKey ? inViewByKey[previousKey] ?? false : false;
      }),
    [entryKeys, inViewByKey]
  );

  const setNearViewForIndex = React.useCallback((index: number, value: boolean) => {
    const key = entryKeysRef.current[index] ?? String(index);
    setNearViewByKey((prev) => {
      if ((prev[key] ?? false) === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const setEverInViewForIndex = React.useCallback((index: number) => {
    const key = entryKeysRef.current[index] ?? String(index);
    setEverInViewByKey((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  }, []);

  const setInViewForIndex = React.useCallback(
    (index: number, value: boolean) => {
      const key = entryKeysRef.current[index] ?? String(index);
      setInViewByKey((prev) => {
        if ((prev[key] ?? false) === value) return prev;
        return { ...prev, [key]: value };
      });

      if (value) setEverInViewForIndex(index);
    },
    [setEverInViewForIndex]
  );

  const syncNodeVisibility = React.useCallback(
    (node: Element | null, index: number) => {
      if (typeof window === "undefined" || !node) return;

      const nearRatio = approximateIntersectionRatio(node, root, nearMargin);
      setNearViewForIndex(index, passesThreshold(nearRatio, nearThreshold));

      const viewRatio = approximateIntersectionRatio(node, root, viewMargin);
      setInViewForIndex(index, passesThreshold(viewRatio, viewThreshold));
    },
    [
      nearMargin,
      nearThreshold,
      root,
      setInViewForIndex,
      setNearViewForIndex,
      viewMargin,
      viewThreshold,
    ]
  );

  React.useEffect(() => {
    indexToNodeRef.current = Array.from(
      { length: len },
      (_, index) => indexToNodeRef.current[index] ?? null
    );

    for (const [node, index] of nodeToIndexRef.current.entries()) {
      if (index >= len) {
        nodeToIndexRef.current.delete(node);
        nearIORef.current?.unobserve(node);
        viewIORef.current?.unobserve(node);
      }
    }
  }, [len]);

  React.useEffect(() => {
    const previousKeys = previousEntryKeysRef.current;
    const currentKeys = new Set(entryKeys);

    setNearViewByKey((prev) => {
      let changed = false;
      const next: Record<string, boolean> = {};

      entryKeys.forEach((key, index) => {
        const currentValue = prev[key];
        if (currentValue != null) {
          next[key] = currentValue;
          return;
        }

        const previousKey = previousKeys[index];
        const previousWasNear =
          previousKey != null ? prev[previousKey] === true : false;
        if (previousWasNear) {
          next[key] = true;
          changed = true;
        }
      });

      Object.keys(prev).forEach((key) => {
        if (!currentKeys.has(key)) changed = true;
      });

      return changed ? next : prev;
    });

    setEverInViewByKey((prev) => {
      let changed = false;
      const next: Record<string, boolean> = {};

      entryKeys.forEach((key, index) => {
        if (prev[key]) {
          next[key] = true;
          return;
        }

        const previousKey = previousKeys[index];
        const previousWasEver =
          previousKey != null ? prev[previousKey] === true : false;
        const previousWasNear =
          previousKey != null ? nearViewByKeyRef.current[previousKey] === true : false;
        if (previousWasEver && previousWasNear) {
          next[key] = true;
          changed = true;
        }
      });

      Object.keys(prev).forEach((key) => {
        if (!currentKeys.has(key)) {
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    setInViewByKey((prev) => {
      let changed = false;
      const next: Record<string, boolean> = {};

      entryKeys.forEach((key, index) => {
        const currentValue = prev[key];
        if (currentValue != null) {
          next[key] = currentValue;
          return;
        }

        const previousKey = previousKeys[index];
        const previousWasInView =
          previousKey != null ? prev[previousKey] === true : false;
        if (previousWasInView) {
          next[key] = true;
          changed = true;
        }
      });

      Object.keys(prev).forEach((key) => {
        if (!currentKeys.has(key)) changed = true;
      });

      return changed ? next : prev;
    });

    previousEntryKeysRef.current = entryKeys;
  }, [entryKeySignature, entryKeys]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    nearIORef.current?.disconnect();
    viewIORef.current?.disconnect();
    nearIORef.current = null;
    viewIORef.current = null;

    if (typeof IntersectionObserver === "undefined") {
      for (const [node, index] of nodeToIndexRef.current.entries()) {
        syncNodeVisibility(node, index);
      }
      return;
    }

    nearIORef.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = nodeToIndexRef.current.get(e.target);
          if (idx == null || idx < 0 || idx >= len) continue;
          setNearViewForIndex(
            idx,
            !!e.isIntersecting &&
              passesThreshold(e.intersectionRatio, nearThreshold)
          );
        }
      },
      { root, rootMargin: nearMargin, threshold: nearThreshold }
    );

    viewIORef.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = nodeToIndexRef.current.get(e.target);
          if (idx == null || idx < 0 || idx >= len) continue;
          setInViewForIndex(
            idx,
            !!e.isIntersecting &&
              passesThreshold(e.intersectionRatio, viewThreshold)
          );
        }
      },
      { root, rootMargin: viewMargin, threshold: viewThreshold }
    );

    for (const [node, index] of nodeToIndexRef.current) {
      syncNodeVisibility(node, index);
      nearIORef.current.observe(node);
      viewIORef.current.observe(node);
    }

    return () => {
      nearIORef.current?.disconnect();
      viewIORef.current?.disconnect();
      nearIORef.current = null;
      viewIORef.current = null;
    };
  }, [
    len,
    nearMargin,
    nearThreshold,
    root,
    setInViewForIndex,
    setNearViewForIndex,
    syncNodeVisibility,
    viewMargin,
    viewThreshold,
  ]);

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

      if (typeof IntersectionObserver === "undefined") {
        return;
      }

      nearIORef.current?.observe(node);
      viewIORef.current?.observe(node);
    },
    [syncNodeVisibility]
  );

  return { nearView, inView, everInView, setEntryRef };
}
