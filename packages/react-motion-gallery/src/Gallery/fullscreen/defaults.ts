export const DEFAULT_FULLSCREEN = {
  enabled: false,
  controls: {
    close: {
      enabled: true,
      style: {},
      className: '',
      render: undefined
    },
    arrows: {
      enabled: true,
      arrow: {},
      prev: {},
      next: {},
      render: undefined,
      renderPrev: undefined,
      renderNext: undefined
    },
    counter: {
      enabled: true,
      style: {},
      className: '',
      render: undefined
    }
  },
  effects: {
    introDuration: 300,
    introEasing: "cubic-bezier(.4,0,.22,1)",
    introFade: false,
    slideFade: false,
    slideFadeDuration: 120,
    slideFadeEasing: "cubic-bezier(.4,0,.22,1)",
  },
  slider: {
    duration: 25,
    friction: 0.68,
    direction: "ltr",
  },
  zoom: {
    clickZoomLevel: 2.5,
    maxZoomLevel: 3,
    panDuration: 43,
    panFriction: 0.68,
  },
  caption: {}
} as const;
