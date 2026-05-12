"use client";

import * as React from "react";
import type { SliderPluginRuntimeProps, SliderScale } from "../types";
import { createSliderPlugin } from "./create";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function resolveScaleAmount(value: number | undefined) {
  const raw = value ?? 1.12;
  if (!Number.isFinite(raw)) return 1.12;
  return raw > 1 ? raw : 1 + Math.max(0, raw);
}

function ScaleRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderScale }) {
  const enabled = options.enabled !== false;

  const applyScaleTween = React.useCallback(() => {
    const handle = host.handle;
    if (!enabled || !handle || handle._usesLegacyEngine) return;

    const internals = handle.getInternals();
    const track = handle.getContainerNode();
    const slides = internals.slides.current ?? [];
    const sliderWidth = internals.sliderWidth.current || 0;

    if (!track || !slides.length) return;

    const scaleAmount = resolveScaleAmount(options.amount);
    const useWrap = host.loop && sliderWidth > 0;
    const rawLocation = -(internals.offsetLocation.current?.get() ?? 0);
    const loc = useWrap ? mod(rawLocation, sliderWidth) : rawLocation;

    type CenterNode = { x: number; index: number };
    const centers: CenterNode[] = [];

    for (let index = 0; index < slides.length; index++) {
      const slide = slides[index];
      const center = (slide.target ?? 0) - internals.getCenterOffsetForIndex(index);
      if (useWrap) {
        centers.push({ x: center - sliderWidth, index });
        centers.push({ x: center, index });
        centers.push({ x: center + sliderWidth, index });
      } else {
        centers.push({ x: center, index });
      }
    }

    centers.sort((a, b) => a.x - b.x);

    if (!centers.length) return;

    let left = centers[0];
    let right = centers[centers.length - 1] ?? left;

    if (centers.length === 1) {
      right = left;
    } else if (loc <= centers[0].x) {
      left = centers[0];
      right = centers[1];
    } else if (loc >= centers[centers.length - 1].x) {
      left = centers[centers.length - 2];
      right = centers[centers.length - 1];
    } else {
      for (let i = 0; i < centers.length - 1; i++) {
        const a = centers[i];
        const b = centers[i + 1];
        if (loc >= a.x && loc <= b.x) {
          left = a;
          right = b;
          break;
        }
      }
    }

    const span = Math.max(1, right.x - left.x);
    const t = left === right ? 0 : clamp01((loc - left.x) / span);
    const scaleByIndex = new Array<number>(slides.length).fill(1);

    scaleByIndex[left.index] = 1 + (scaleAmount - 1) * (1 - t);
    scaleByIndex[right.index] = Math.max(
      scaleByIndex[right.index] ?? 1,
      1 + (scaleAmount - 1) * t
    );

    const children = Array.from(track.children) as HTMLElement[];
    for (const el of children) {
      const idxAttr = el.getAttribute("data-rmg-idx");
      if (idxAttr == null) {
        el.style.setProperty("--rmg-scale", "1");
        el.style.zIndex = "0";
        continue;
      }

      const canonicalCellIndex = Number.parseInt(idxAttr, 10);
      const pageIndex = Number.isFinite(canonicalCellIndex)
        ? handle.slideIndexForCell(canonicalCellIndex)
        : 0;
      const scale = scaleByIndex[pageIndex] ?? 1;

      el.style.setProperty("--rmg-scale", String(scale));
      el.style.zIndex = scale > 1.0001 ? "1" : "0";
      if (!el.style.transformOrigin) el.style.transformOrigin = "center";
      if (!el.style.transition) el.style.transition = "transform 120ms linear";
    }
  }, [enabled, host.handle, host.loop, options.amount]);

  React.useLayoutEffect(() => {
    if (!enabled || !host.handle || host.handle._usesLegacyEngine) return;

    const track = host.handle.getContainerNode();
    if (!track) return;

    let raf = requestAnimationFrame(applyScaleTween);

    const observer =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(applyScaleTween);
          });

    observer?.observe(track, { childList: true });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [
    applyScaleTween,
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
      applyScaleTween();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [applyScaleTween, enabled, host.handle]);

  React.useEffect(() => {
    if (enabled || !host.handle) return;

    const track = host.handle.getContainerNode();
    const children = track ? (Array.from(track.children) as HTMLElement[]) : [];
    children.forEach((node) => {
      node.style.setProperty("--rmg-scale", "1");
      node.style.zIndex = "0";
    });
  }, [enabled, host.handle]);

  return null;
}

export function sliderScale(options: SliderScale = {}) {
  return createSliderPlugin("scale", {
    options,
    Runtime: ScaleRuntime as React.ComponentType<any>,
  });
}

export type { SliderScale };
