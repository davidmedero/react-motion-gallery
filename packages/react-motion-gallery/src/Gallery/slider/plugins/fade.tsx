"use client";

import * as React from "react";
import type { SliderFade, SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

const DEFAULT_MIN_FADE_OPACITY = 0.36;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function circularDist(x: number, c: number, width: number) {
  let d = Math.abs(x - c);
  if (width > 0) {
    d = Math.min(d, Math.abs(x - (c - width)), Math.abs(x - (c + width)));
  }
  return d;
}

function resolveMinOpacity(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_MIN_FADE_OPACITY;
  }
  return clamp01(value);
}

function FadeRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderFade }) {
  const enabled = options.enabled !== false;

  const applyFadeTween = React.useCallback(() => {
    const handle = host.handle;
    if (!enabled || !handle || handle._usesLegacyEngine) return;

    const internals = handle.getInternals();
    const track = handle.getContainerNode();
    const slides = internals.slides.current ?? [];
    const sliderWidth = internals.sliderWidth.current || 0;

    if (!track || !slides.length) return;

    const minOpacity = resolveMinOpacity(options.minOpacity);
    const useWrap = host.loop && sliderWidth > 0;
    const rawLocation = -(internals.offsetLocation.current?.get() ?? 0);
    const loc = useWrap ? mod(rawLocation, sliderWidth) : rawLocation;

    const centers = slides.map(
      (slide, index) => (slide.target ?? 0) - internals.getCenterOffsetForIndex(index)
    );

    type CenterNode = { x: number; index: number };
    const centerNodes: CenterNode[] = [];

    centers.forEach((center, index) => {
      if (useWrap) {
        centerNodes.push({ x: center - sliderWidth, index });
        centerNodes.push({ x: center, index });
        centerNodes.push({ x: center + sliderWidth, index });
      } else {
        centerNodes.push({ x: center, index });
      }
    });

    centerNodes.sort((a, b) => a.x - b.x);
    if (!centerNodes.length) return;

    let span = 1;
    if (centerNodes.length > 1) {
      if (loc <= centerNodes[0].x) {
        span = Math.max(1, centerNodes[1].x - centerNodes[0].x);
      } else if (loc >= centerNodes[centerNodes.length - 1].x) {
        span = Math.max(
          1,
          centerNodes[centerNodes.length - 1].x -
            centerNodes[centerNodes.length - 2].x
        );
      } else {
        for (let i = 0; i < centerNodes.length - 1; i++) {
          const left = centerNodes[i];
          const right = centerNodes[i + 1];
          if (loc >= left.x && loc <= right.x) {
            span = Math.max(1, right.x - left.x);
            break;
          }
        }
      }
    }

    const opacityByIndex = new Array<number>(slides.length).fill(minOpacity);
    for (let index = 0; index < centers.length; index++) {
      const distance = useWrap
        ? circularDist(loc, centers[index], sliderWidth)
        : Math.abs(loc - centers[index]);
      const t = clamp01(1 - distance / span);
      opacityByIndex[index] = minOpacity + (1 - minOpacity) * t;
    }

    const children = Array.from(track.children) as HTMLElement[];
    for (const el of children) {
      const idxAttr = el.getAttribute("data-rmg-idx");
      if (idxAttr == null) {
        el.style.opacity = "1";
        continue;
      }

      const canonicalCellIndex = Number.parseInt(idxAttr, 10);
      const pageIndex = Number.isFinite(canonicalCellIndex)
        ? handle.slideIndexForCell(canonicalCellIndex)
        : 0;
      const opacity = opacityByIndex[pageIndex] ?? 1;

      el.style.opacity = String(opacity);
      if (!el.style.transition) el.style.transition = "opacity 120ms linear";
    }
  }, [enabled, host.handle, host.loop, options.minOpacity]);

  React.useLayoutEffect(() => {
    if (!enabled || !host.handle || host.handle._usesLegacyEngine) return;

    const track = host.handle.getContainerNode();
    if (!track) return;

    let raf = requestAnimationFrame(applyFadeTween);

    const observer =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(applyFadeTween);
          });

    observer?.observe(track, { childList: true });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [
    applyFadeTween,
    enabled,
    host.coreReady,
    host.handle,
    host.loop,
    host.slideCount,
  ]);

  React.useEffect(() => {
    if (!enabled || !host.handle || host.handle._usesLegacyEngine) return;

    let frame = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      applyFadeTween();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);

      const track = host.handle?.getContainerNode();
      const nodes = track ? (Array.from(track.children) as HTMLElement[]) : [];
      nodes.forEach((node) => {
        node.style.removeProperty("opacity");
      });
    };
  }, [applyFadeTween, enabled, host.handle]);

  React.useEffect(() => {
    if (enabled || !host.handle) return;

    const track = host.handle.getContainerNode();
    const nodes = track ? (Array.from(track.children) as HTMLElement[]) : [];
    nodes.forEach((node) => {
      node.style.removeProperty("opacity");
    });
  }, [enabled, host.handle]);

  return null;
}

export function sliderFade(options: SliderFade = {}) {
  return createSliderPlugin("fade", {
    options,
    Runtime: FadeRuntime as React.ComponentType<any>,
  });
}

export type { SliderFade };
