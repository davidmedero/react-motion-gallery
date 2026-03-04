"use client";

import * as React from "react";

function useEmitVisibleOnce(opts: {
  enabled: boolean;
  index: number;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  onVisible: (index: number) => void;
}) {
  const { enabled, index, root, rootMargin = "200px", threshold = 0.15, onVisible } = opts;

  const ref = React.useRef<HTMLElement | null>(null);
  const didFireRef = React.useRef(false);

  React.useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    if (didFireRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          didFireRef.current = true;
          onVisible(index);

          // fire once
          obs.unobserve(el);
          obs.disconnect();
        }
      },
      { root: root ?? null, rootMargin, threshold }
    );

    obs.observe(el);

    return () => {
      try { obs.unobserve(el); } catch {}
      obs.disconnect();
    };
  }, [enabled, index, root, rootMargin, threshold, onVisible]);

  return ref;
}