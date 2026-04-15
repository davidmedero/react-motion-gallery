import * as React from "react";
import type { FullscreenCaptionOptions } from "./types";

export type FullscreenCaptionZoomPhase =
  | "visible"
  | "hiding"
  | "hidden"
  | "showingStart"
  | "showing";

export type FullscreenCaptionZoomSettings = {
  enabled: boolean;
  durationMs: number;
  easing: string;
  zoomInTransform: string;
  zoomOutTransform: string;
};

export type FullscreenCaptionZoomMotion = {
  phase: FullscreenCaptionZoomPhase;
  isZoomed: boolean;
  interactive: boolean;
  contentStyle: React.CSSProperties;
};

export const DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS = 300;
export const DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING =
  "cubic-bezier(.4,0,.22,1)";

export function resolveFullscreenCaptionZoomSettings(
  caption: FullscreenCaptionOptions | undefined
): FullscreenCaptionZoomSettings {
  return {
    enabled: caption?.zoomFade !== false,
    durationMs:
      caption?.zoomFadeDurationMs ??
      DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_DURATION_MS,
    easing:
      caption?.zoomFadeEasing ?? DEFAULT_FULLSCREEN_CAPTION_ZOOM_FADE_EASING,
    zoomInTransform: caption?.zoomInTransform ?? "",
    zoomOutTransform: caption?.zoomOutTransform ?? "",
  };
}

function transitionForSettings(settings: FullscreenCaptionZoomSettings) {
  if (!settings.enabled || settings.durationMs <= 0) return undefined;
  return `opacity ${settings.durationMs}ms ${settings.easing}, transform ${settings.durationMs}ms ${settings.easing}`;
}

export function buildFullscreenCaptionZoomMotion(args: {
  phase: FullscreenCaptionZoomPhase;
  isZoomed: boolean;
  settings: FullscreenCaptionZoomSettings;
}): FullscreenCaptionZoomMotion {
  const { phase, isZoomed, settings } = args;

  if (!settings.enabled) {
    return {
      phase: "visible",
      isZoomed,
      interactive: true,
      contentStyle: {},
    };
  }

  let opacity = 1;
  let transform = "";
  let transition: string | undefined;

  switch (phase) {
    case "hiding":
      opacity = 0;
      transform = settings.zoomInTransform;
      transition = transitionForSettings(settings);
      break;
    case "hidden":
      opacity = 0;
      transform = settings.zoomInTransform;
      break;
    case "showingStart":
      opacity = 0;
      transform = settings.zoomOutTransform;
      break;
    case "showing":
      opacity = 1;
      transform = "";
      transition = transitionForSettings(settings);
      break;
    case "visible":
    default:
      opacity = 1;
      transform = "";
      break;
  }

  return {
    phase,
    isZoomed,
    interactive: phase === "visible",
    contentStyle: {
      opacity,
      transform,
      transition,
      willChange: "opacity, transform",
    },
  };
}

export function useFullscreenCaptionZoomMotion(args: {
  caption: FullscreenCaptionOptions | undefined;
  isZoomed: boolean;
}): FullscreenCaptionZoomMotion {
  const { caption, isZoomed } = args;

  const settings = React.useMemo(
    () => resolveFullscreenCaptionZoomSettings(caption),
    [
      caption?.zoomFade,
      caption?.zoomFadeDurationMs,
      caption?.zoomFadeEasing,
      caption?.zoomInTransform,
      caption?.zoomOutTransform,
    ]
  );

  const [phase, setPhase] = React.useState<FullscreenCaptionZoomPhase>(() =>
    settings.enabled ? (isZoomed ? "hidden" : "visible") : "visible"
  );

  const initializedRef = React.useRef(false);
  const prevIsZoomedRef = React.useRef(isZoomed);
  const prevEnabledRef = React.useRef(settings.enabled);

  React.useEffect(() => {
    const prevIsZoomed = prevIsZoomedRef.current;
    const prevEnabled = prevEnabledRef.current;

    prevIsZoomedRef.current = isZoomed;
    prevEnabledRef.current = settings.enabled;

    if (!initializedRef.current) {
      initializedRef.current = true;
      setPhase(settings.enabled ? (isZoomed ? "hidden" : "visible") : "visible");
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    let timeoutId = 0;

    if (!settings.enabled) {
      setPhase("visible");
      return () => {
        if (raf1) cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    if (prevEnabled !== settings.enabled) {
      setPhase(isZoomed ? "hidden" : "visible");
      return () => {
        if (raf1) cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    if (prevIsZoomed === isZoomed) {
      return () => {
        if (raf1) cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    if (isZoomed) {
      setPhase("hiding");

      if (settings.durationMs <= 0) {
        setPhase("hidden");
      } else {
        timeoutId = window.setTimeout(() => {
          setPhase("hidden");
        }, settings.durationMs + 20);
      }
    } else {
      setPhase("showingStart");

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setPhase("showing");

          if (settings.durationMs <= 0) {
            setPhase("visible");
            return;
          }

          timeoutId = window.setTimeout(() => {
            setPhase("visible");
          }, settings.durationMs + 20);
        });
      });
    }

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isZoomed, settings.enabled, settings.durationMs]);

  return React.useMemo(
    () =>
      buildFullscreenCaptionZoomMotion({
        phase,
        isZoomed,
        settings,
      }),
    [phase, isZoomed, settings]
  );
}
