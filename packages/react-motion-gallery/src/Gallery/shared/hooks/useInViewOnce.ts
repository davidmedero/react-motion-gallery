'use client';

import * as React from 'react';

export function useInViewOnce(
  enabled: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onInView: () => void
) {
  React.useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onInView();
        io.disconnect();
      }
    }, { threshold: 0.1 });

    io.observe(el);
    return () => io.disconnect();
  }, [enabled, ref, onInView]);
}