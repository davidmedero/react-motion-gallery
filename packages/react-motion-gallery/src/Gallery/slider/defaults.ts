export const DEFAULT_SLIDER = {
  layout: { gap: 20 },
  direction: { dir: "ltr" as const, axis: "x" as const },
  align: "start" as const,

  scroll: {
    groupCells: false,
    skipSnaps: false,
    freeScroll: false,
    loop: false,
  },

  lazyLoad: {
    enabled: false,
    spinner: true,
    spinnerClassName: "",
    spinnerStyle: {}
  },

  controls: {
    arrows: { enabled: true, arrow: {}, prev: {}, next: {} },
    dots: { enabled: true, root: {}, dot: {} },
    progress: { enabled: false, root: {}, bar: {} },
    ripple: { enabled: true, className: "" },
  },

  auto: {
    play: { enabled: false, speedMs: 3000, pauseMs: 1000, pauseOnHover: true },
    scroll: { enabled: false, speedMs: 3000, pauseMs: 1000, pauseOnHover: true },
  },

  motion: {
    selectDuration: 25,
    freeScrollDuration: 43,
    friction: 0.68,
  },
} as const;
