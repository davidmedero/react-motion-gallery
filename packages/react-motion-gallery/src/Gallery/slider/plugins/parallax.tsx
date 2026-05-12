"use client";

import * as React from "react";
import type { SliderParallax, SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

const TWEEN_FACTOR_BASE = 0.2;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function circularDiff(a: number, b: number) {
  let d = a - b;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

function resolveBleedScale(value: string | undefined, viewportSize: number) {
  const raw = value ?? "8%";
  if (raw.trim().endsWith("%")) {
    const pct = Number.parseFloat(raw);
    if (!Number.isFinite(pct)) return 1.08;
    return pct > 50 ? pct / 100 : 1 + pct / 100;
  }
  const px = Number.parseFloat(raw);
  if (!Number.isFinite(px)) return 1.08;
  return 1 + px / Math.max(1, viewportSize || 1);
}

function wrapParallax(children: React.ReactNode, rawOptions?: unknown) {
  const options = (rawOptions ?? {}) as SliderParallax;
  const radius = options.borderRadius;
  const scale = resolveBleedScale(options.bleedPct, 0);
  return React.Children.map(children, (child) => (
    <div
      className="rmg__parallax"
      style={{
        overflow: "hidden",
        borderRadius: radius,
        height: "100%",
        width: options.sideWidth ?? "100%",
      }}
    >
      <div
        className="rmg__parallax__layer"
        style={{
          height: "100%",
          width: "100%",
          willChange: "transform",
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {child}
      </div>
    </div>
  ));
}

function ParallaxRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderParallax }) {
  const enabled = options.enabled !== false;
  const parallaxNodesRef = React.useRef<HTMLElement[]>([]);
  const parallaxSnapsRef = React.useRef<number[]>([]);

  const collectParallaxForAll = React.useCallback(() => {
    const handle = host.handle;
    if (!enabled || !handle || handle._usesLegacyEngine) return;

    const internals = handle.getInternals();
    const track = handle.getContainerNode();
    const sliderWidth = internals.sliderWidth.current || 0;
    const nodes: HTMLElement[] = [];
    const snaps: number[] = [];

    if (!track || sliderWidth <= 0) {
      parallaxNodesRef.current = nodes;
      parallaxSnapsRef.current = snaps;
      return;
    }

    const kids = Array.from(track.children) as HTMLElement[];

    for (const el of kids) {
      const layer = el.querySelector<HTMLElement>(".rmg__parallax__layer");
      if (!layer) continue;

      const idxAttr = el.getAttribute("data-rmg-idx");
      if (idxAttr == null) continue;

      const canonicalCellIndex = Number.parseInt(idxAttr, 10);
      if (!Number.isFinite(canonicalCellIndex)) continue;

      const pageIndex = handle.slideIndexForCell(canonicalCellIndex);
      const slide = internals.slides.current?.[pageIndex];
      if (!slide) continue;

      const centerOffset = internals.getCenterOffsetForIndex(pageIndex);
      nodes.push(layer);
      snaps.push(mod((slide.target ?? 0) - centerOffset, sliderWidth) / sliderWidth);
    }

    parallaxNodesRef.current = nodes;
    parallaxSnapsRef.current = snaps;
  }, [enabled, host.handle]);

  const tweenParallax = React.useCallback(() => {
    const handle = host.handle;
    if (!enabled || !handle || handle._usesLegacyEngine) return;

    const internals = handle.getInternals();
    const track = handle.getContainerNode();
    const viewport = handle.getViewportNode();
    const sliderWidth = internals.sliderWidth.current || 0;
    const nodes = parallaxNodesRef.current;
    const snaps = parallaxSnapsRef.current;

    if (!track || !viewport || sliderWidth <= 0 || !nodes.length || nodes.length !== snaps.length) {
      return;
    }

    const offset = -(internals.offsetLocation.current?.get() ?? 0);
    const progress = host.loop
      ? mod(offset, sliderWidth) / sliderWidth
      : Math.min(1, Math.max(0, offset / Math.max(1, sliderWidth - track.clientWidth)));
    const visible = Math.max(internals.visibleImages.current || 1, 1);
    const factor = TWEEN_FACTOR_BASE * ((snaps.length || 1) / visible);
    const viewportSize = host.axis === "y" ? viewport.clientHeight : viewport.clientWidth;
    const scale = resolveBleedScale(options.bleedPct, viewportSize);

    for (let i = 0; i < nodes.length; i++) {
      const diff = host.loop
        ? circularDiff(snaps[i], progress)
        : snaps[i] - progress;
      const translatePct = diff * -factor * 100;
      nodes[i].style.transform =
        host.axis === "y"
          ? `translateY(${translatePct}%) scale(${scale})`
          : `translateX(${translatePct}%) scale(${scale})`;
    }
  }, [enabled, host.axis, host.handle, host.loop, options.bleedPct]);

  React.useLayoutEffect(() => {
    if (!enabled || !host.handle || host.handle._usesLegacyEngine) return;

    const track = host.handle.getContainerNode();
    if (!track) return;

    let raf = requestAnimationFrame(() => {
      collectParallaxForAll();
      tweenParallax();
    });

    const observer =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              collectParallaxForAll();
              tweenParallax();
            });
          });

    observer?.observe(track, { childList: true });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [
    collectParallaxForAll,
    enabled,
    host.coreReady,
    host.handle,
    host.slideCount,
    host.loop,
    tweenParallax,
  ]);

  React.useEffect(() => {
    if (!enabled || !host.handle || host.handle._usesLegacyEngine) return;
    let frame = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      tweenParallax();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [enabled, host.handle, tweenParallax]);

  return null;
}

export function sliderParallax(options: SliderParallax = {}) {
  return createSliderPlugin("parallax", {
    options,
    transformChildren:
      options.enabled === false
        ? undefined
        : wrapParallax,
    Runtime:
      options.enabled === false
        ? undefined
        : ParallaxRuntime as React.ComponentType<any>,
  });
}

export type { SliderParallax };
