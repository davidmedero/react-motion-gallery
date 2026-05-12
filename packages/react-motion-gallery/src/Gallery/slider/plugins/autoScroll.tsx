"use client";

import * as React from "react";
import type { SliderAutoScroll, SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

function AutoScrollRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderAutoScroll }) {
  const enabled = options.enabled !== false;
  const speed = Math.max(0.02, options.speedMs ?? 0.3);
  const pause = Math.max(0, options.pauseMs ?? 1000);
  const pauseOnHover = options.pauseOnHover !== false;
  const pausedUntil = React.useRef(0);
  const hovering = React.useRef(false);
  const handledByCore = host.handle?._usesLegacyEngine === true;

  React.useEffect(() => {
    if (handledByCore) return;
    if (!pauseOnHover) return;
    const root = host.handle?.getRootNode();
    if (!root) return;
    const enter = () => {
      hovering.current = true;
    };
    const leave = () => {
      hovering.current = false;
    };
    root.addEventListener("mouseenter", enter);
    root.addEventListener("mouseleave", leave);
    return () => {
      root.removeEventListener("mouseenter", enter);
      root.removeEventListener("mouseleave", leave);
    };
  }, [handledByCore, host.handle, pauseOnHover]);

  React.useEffect(() => {
    if (handledByCore) return;
    if (!enabled || host.slideCount <= 1 || !host.handle) return;
    const handle = host.handle;
    const root = handle.getRootNode();
    let frame = 0;
    let last = performance.now();

    const pauseNow = () => {
      pausedUntil.current = performance.now() + pause;
    };

    root?.addEventListener("pointerdown", pauseNow, true);
    root?.addEventListener("wheel", pauseNow, true);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(48, Math.max(0, now - last));
      last = now;
      if (hovering.current || now < pausedUntil.current) return;
      const moved = handle._scrollByPixels?.(speed * dt) ?? false;
      if (!moved) {
        if (host.loop) {
          handle.setIndex(0, "instant");
        }
        pausedUntil.current = now + pause;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      root?.removeEventListener("pointerdown", pauseNow, true);
      root?.removeEventListener("wheel", pauseNow, true);
    };
  }, [enabled, handledByCore, host.handle, host.loop, host.slideCount, pause, speed]);

  return null;
}

export function sliderAutoScroll(options: SliderAutoScroll = {}) {
  return createSliderPlugin("auto-scroll", {
    options,
    Runtime: AutoScrollRuntime as React.ComponentType<any>,
  });
}

export type { SliderAutoScroll };
