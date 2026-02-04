import * as React2 from 'react';

// src/Gallery/shared/hooks/useInViewOnce.ts
function useInViewOnce(enabled, ref, onInView) {
  React2.useEffect(() => {
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
function useMediaReady(enabled, ref, setReady) {
  React2.useEffect(() => {
    if (!enabled) return;
    setReady(false);
  }, [enabled, setReady]);
  React2.useEffect(() => {
    if (!enabled) return;
    const root = ref.current;
    if (!root) return;
    const media = Array.from(root.querySelectorAll("img,video"));
    if (media.length === 0) {
      setReady(true);
      return;
    }
    let cancelled = false;
    let loadedCount = 0;
    const tryDone = () => {
      if (cancelled) return;
      if (loadedCount >= media.length) setReady(true);
    };
    const offs = [];
    for (const el of media) {
      const mark = () => {
        if (cancelled) return;
        loadedCount += 1;
        tryDone();
      };
      if (el instanceof HTMLImageElement) {
        if (el.complete && el.naturalWidth > 0) {
          mark();
          continue;
        }
        const onDone = () => {
          el.removeEventListener("load", onDone);
          el.removeEventListener("error", onDone);
          mark();
        };
        el.addEventListener("load", onDone);
        el.addEventListener("error", onDone);
        offs.push(() => {
          el.removeEventListener("load", onDone);
          el.removeEventListener("error", onDone);
        });
      } else {
        if (el.readyState >= 2) {
          mark();
          continue;
        }
        const onDone = () => {
          el.removeEventListener("loadeddata", onDone);
          el.removeEventListener("error", onDone);
          mark();
        };
        el.addEventListener("loadeddata", onDone);
        el.addEventListener("error", onDone);
        offs.push(() => {
          el.removeEventListener("loadeddata", onDone);
          el.removeEventListener("error", onDone);
        });
      }
    }
    tryDone();
    return () => {
      cancelled = true;
      offs.forEach((off) => off());
    };
  }, [enabled, ref, setReady]);
}

export { useInViewOnce, useMediaReady };
//# sourceMappingURL=chunk-5N4BKPSV.mjs.map
//# sourceMappingURL=chunk-5N4BKPSV.mjs.map