import {
  DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS,
  DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING,
} from "./captionZoomMotion";
import { DEFAULT_ZOOM_PAN } from "../zoomPan/defaults";

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
    controlsFade: false,
    dragFade: false,
    slideFadeDuration: 120,
    slideFadeEasing: "cubic-bezier(.4,0,.22,1)",
  },
  slider: {
    duration: 25,
    friction: 0.68,
    direction: "ltr",
  },
  zoom: {
    ...DEFAULT_ZOOM_PAN,
  },
  caption: {
    overlayCrossfadeTarget: "content",
    zoomFade: true,
    zoomFadeDurationMs: DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS,
    zoomFadeEasing: DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING,
    zoomInTransform: "",
    zoomOutTransform: "",
  }
} as const;
