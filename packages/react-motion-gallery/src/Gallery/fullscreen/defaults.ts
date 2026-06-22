import { DEFAULT_ZOOM_PAN } from "../zoomPan/defaults";
import {
  DEFAULT_FULLSCREEN_INTRO_FADE_DURATION_MS,
  DEFAULT_FULLSCREEN_INTRO_TRANSFORM_DURATION_MS,
  DEFAULT_FULLSCREEN_INTRO_EASING,
} from "./introTiming";

const DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS = 300;
const DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING =
  "cubic-bezier(.4,0,.22,1)";

export const DEFAULT_FULLSCREEN = {
  enabled: false,
  closeScroll: false,
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
    transitionDuration: {
      transform: DEFAULT_FULLSCREEN_INTRO_TRANSFORM_DURATION_MS,
      fade: DEFAULT_FULLSCREEN_INTRO_FADE_DURATION_MS,
    },
    transitionEasing: DEFAULT_FULLSCREEN_INTRO_EASING,
    transitionFade: false,
    crossfade: {
      controls: false,
      drag: false,
      durationMs: 120,
      easing: "cubic-bezier(.4,0,.22,1)",
    },
  },
  slider: {
    gap: 0,
    duration: 25,
    friction: 0.68,
    direction: "ltr",
    skipSnaps: false,
    strictSnaps: false,
  },
  zoom: {
    ...DEFAULT_ZOOM_PAN,
  },
  caption: {
    overlayCrossfadeTarget: "content",
    overlayCrossfadeDurationMs: 300,
    overlayCrossfadeEasing: "cubic-bezier(.4,0,.22,1)",
    zoomFade: true,
    zoomFadeDurationMs: DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS,
    zoomFadeEasing: DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING,
    zoomInTransform: "",
    zoomOutTransform: "",
  }
} as const;
