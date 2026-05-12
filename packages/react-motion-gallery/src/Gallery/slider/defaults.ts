export const DEFAULT_SLIDER = {
  layout: { gap: 20 },
  direction: { dir: "ltr" as const, axis: "x" as const },
  align: "start" as const,

  scroll: {
    groupCells: false,
    skipSnaps: false,
    strictSnaps: false,
    freeScroll: false,
    loop: false,
    containScroll: false,
  },

  motion: {
    selectDuration: 25,
    freeScrollDuration: 43,
    friction: 0.68,
  },
} as const;
