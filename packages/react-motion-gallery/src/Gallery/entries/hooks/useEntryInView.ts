import * as React from "react";

export type UseEntryInViewOpts = IntersectionObserverInit & {
  nearMargin?: string;
  viewMargin?: string;
};

export function useEntryInView(len: number, opts?: UseEntryInViewOpts) {
  const nearMargin = opts?.nearMargin ?? "700px 0px";
  const viewMargin = opts?.viewMargin ?? "0px 0px";
  const nearThreshold = opts?.threshold ?? 0.01;
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

    return () => {
      nearIORef.current?.disconnect();
      viewIORef.current?.disconnect();
      nearIORef.current = null;
      viewIORef.current = null;
    };
  }, [root, nearMargin, viewMargin, nearThreshold, everThreshold, len]);

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
      nearIORef.current?.observe(node);
      viewIORef.current?.observe(node);
    },
    []
  );

  return { nearView, everInView, setEntryRef };
}