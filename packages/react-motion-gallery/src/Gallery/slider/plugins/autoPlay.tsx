"use client";

import * as React from "react";
import type { SliderAutoPlay, SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

function AutoPlayRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderAutoPlay }) {
  const enabled = options.enabled !== false;
  const speed = Math.max(1, options.speedMs ?? 3000);
  const pause = Math.max(0, options.pauseMs ?? 1000);
  const pauseOnHover = options.pauseOnHover !== false;
  const pausedUntil = React.useRef(0);
  const hovering = React.useRef(false);
  const pointerDown = React.useRef(false);
  const timerActive = React.useRef(false);
  const timerStartedAt = React.useRef<number | null>(null);
  const pausedProgress = React.useRef(0);
  const handle = host.handle;
  const handledByCore = handle?._usesLegacyEngine === true;
  const setAutoPlayTimer = host.setAutoPlayTimer;
  const nowMs = React.useCallback(() => {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }, []);
  const getProgress = React.useCallback(
    (now = nowMs()) => {
      const startedAt = timerStartedAt.current;
      if (!timerActive.current || startedAt == null) return pausedProgress.current;
      return Math.max(0, Math.min(1, (now - startedAt) / speed));
    },
    [nowMs, speed]
  );
  const publishTimer = React.useCallback(
    (active: boolean, startedAt: number | null, progress: number) => {
      const elapsedMs = active && startedAt != null ? Math.max(0, nowMs() - startedAt) : 0;
      setAutoPlayTimer({
        active,
        speedMs: speed,
        startedAt,
        elapsedMs,
        remainingMs: Math.max(0, speed - elapsedMs),
        progress,
      });
    },
    [nowMs, setAutoPlayTimer, speed]
  );
  const pauseTimer = React.useCallback(
    (now = nowMs()) => {
      const progress = getProgress(now);
      timerActive.current = false;
      timerStartedAt.current = null;
      pausedProgress.current = progress;
      publishTimer(false, null, progress);
    },
    [getProgress, nowMs, publishTimer]
  );
  const resumeTimer = React.useCallback(
    (reset = false, now = nowMs()) => {
      const progress = reset ? 0 : pausedProgress.current;
      const startedAt = now - progress * speed;
      timerActive.current = true;
      timerStartedAt.current = startedAt;
      pausedProgress.current = progress;
      publishTimer(true, startedAt, progress);
    },
    [nowMs, publishTimer, speed]
  );
  const resetTimer = React.useCallback(
    (now = nowMs()) => {
      timerActive.current = false;
      timerStartedAt.current = null;
      pausedProgress.current = 0;
      resumeTimer(true, now);
    },
    [nowMs, resumeTimer]
  );

  React.useEffect(() => {
    if (handledByCore) return;
    if (!pauseOnHover) return;
    const root = handle?.getRootNode();
    if (!root) return;
    const enter = () => {
      hovering.current = true;
      pauseTimer();
    };
    const leave = () => {
      hovering.current = false;
      if (!pointerDown.current && nowMs() >= pausedUntil.current) resumeTimer();
    };
    root.addEventListener("mouseenter", enter);
    root.addEventListener("mouseleave", leave);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    return () => {
      root.removeEventListener("mouseenter", enter);
      root.removeEventListener("mouseleave", leave);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
    };
  }, [handle, handledByCore, nowMs, pauseOnHover, pauseTimer, resumeTimer]);

  React.useEffect(() => {
    if (handledByCore) return;
    const root = handle?.getRootNode();
    if (!root) return;

    const down = () => {
      pointerDown.current = true;
      pauseTimer();
    };
    const up = () => {
      if (!pointerDown.current) return;
      pointerDown.current = false;
      const now = nowMs();
      pausedUntil.current = now + pause;
      pauseTimer(now);
    };

    root.addEventListener("pointerdown", down, true);
    root.addEventListener("mousedown", down, true);
    root.addEventListener("touchstart", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    window.addEventListener("mouseup", up, true);
    window.addEventListener("touchend", up, true);
    window.addEventListener("touchcancel", up, true);

    return () => {
      root.removeEventListener("pointerdown", down, true);
      root.removeEventListener("mousedown", down, true);
      root.removeEventListener("touchstart", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
      window.removeEventListener("mouseup", up, true);
      window.removeEventListener("touchend", up, true);
      window.removeEventListener("touchcancel", up, true);
    };
  }, [handle, handledByCore, nowMs, pause, pauseTimer]);

  React.useEffect(() => {
    if (handledByCore) {
      setAutoPlayTimer(null);
      return;
    }
    if (!enabled || host.slideCount <= 1 || !handle) {
      setAutoPlayTimer(null);
      return;
    }
    resetTimer();
    const id = window.setInterval(() => {
      const now = nowMs();
      if (hovering.current || pointerDown.current || now < pausedUntil.current) {
        if (timerActive.current) pauseTimer(now);
        return;
      }

      if (!timerActive.current) {
        resetTimer(now);
        return;
      }

      const canScroll = host.dir === "rtl" ? handle.canScrollPrev() : handle.canScrollNext();
      if (!canScroll) {
        pauseTimer(now);
        return;
      }

      if (host.dir === "rtl") handle.scrollPrev();
      else handle.scrollNext();
      pausedUntil.current = now + pause;
      resetTimer(now);
    }, speed);
    return () => {
      window.clearInterval(id);
      timerActive.current = false;
      timerStartedAt.current = null;
      pausedProgress.current = 0;
      setAutoPlayTimer(null);
    };
  }, [
    enabled,
    handle,
    handledByCore,
    host.dir,
    host.slideCount,
    nowMs,
    pause,
    pauseTimer,
    resetTimer,
    setAutoPlayTimer,
    speed,
  ]);

  return null;
}

export function sliderAutoPlay(options: SliderAutoPlay = {}) {
  return createSliderPlugin("auto-play", {
    options,
    Runtime: AutoPlayRuntime as React.ComponentType<any>,
  });
}

export type { SliderAutoPlay };
