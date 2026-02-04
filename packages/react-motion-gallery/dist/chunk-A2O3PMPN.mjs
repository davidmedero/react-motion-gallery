// src/Gallery/slider/sliderSub.tsx
function createIndexChannel(initialIndex = 0, initialMode = "animated") {
  let index = initialIndex;
  let mode = initialMode;
  let lastEvent = { type: "set", index: initialIndex, mode: initialMode };
  const subs = /* @__PURE__ */ new Set();
  const evtSubs = /* @__PURE__ */ new Set();
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const ev = lastEvent;
      evtSubs.forEach((fn) => fn(ev));
      subs.forEach((fn) => fn());
    });
  };
  return {
    get() {
      return { index, mode };
    },
    set(next, m = "animated", opts) {
      index = next;
      mode = m;
      lastEvent = { type: "set", index, mode: m };
      if (!opts?.silent) schedule();
    },
    bump(delta, m = "animated", opts) {
      lastEvent = { type: "bump", delta: delta | 0, mode: m };
      if (!opts?.silent) schedule();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    onEvent(fn) {
      evtSubs.add(fn);
      return () => {
        evtSubs.delete(fn);
      };
    }
  };
}

export { createIndexChannel };
//# sourceMappingURL=chunk-A2O3PMPN.mjs.map
//# sourceMappingURL=chunk-A2O3PMPN.mjs.map