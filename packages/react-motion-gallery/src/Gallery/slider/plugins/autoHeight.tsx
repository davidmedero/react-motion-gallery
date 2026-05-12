"use client";

import * as React from "react";
import type { SliderAutoHeight, SliderHandle, SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

const AUTO_HEIGHT_PIXEL_PRECISION = 1000;
const AUTO_HEIGHT_PIXEL_EPSILON = 0.01;

function parseCssPixelValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStableAutoHeightPx(value: number) {
  return (
    Math.round((value + Number.EPSILON) * AUTO_HEIGHT_PIXEL_PRECISION) /
    AUTO_HEIGHT_PIXEL_PRECISION
  );
}

function readOuterHeight(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);
  return Math.max(
    0,
    rect.height +
      parseCssPixelValue(style.marginTop) +
      parseCssPixelValue(style.marginBottom)
  );
}

function getAutoHeightTargets(slide: HTMLElement) {
  const directChildren = Array.from(slide.children) as HTMLElement[];
  const parallaxLayer = directChildren.find((child) =>
    child.classList.contains("rmg__parallax")
  );

  if (parallaxLayer) return [parallaxLayer];

  const contentChildren = directChildren.filter(
    (child) => !child.hasAttribute("data-rmg-spinner")
  );

  return contentChildren.length ? contentChildren : [slide];
}

function measureSlide(node: HTMLElement | null) {
  if (!node) return 0;
  const targets = getAutoHeightTargets(node);
  if (!targets.length) return readOuterHeight(node);

  let minTop = Infinity;
  let maxBottom = -Infinity;

  for (const target of targets) {
    const rect = target.getBoundingClientRect();
    if (!Number.isFinite(rect.height) || rect.height <= 0) continue;

    const style = window.getComputedStyle(target);
    minTop = Math.min(minTop, rect.top - parseCssPixelValue(style.marginTop));
    maxBottom = Math.max(maxBottom, rect.bottom + parseCssPixelValue(style.marginBottom));
  }

  if (!Number.isFinite(minTop) || !Number.isFinite(maxBottom)) {
    return readOuterHeight(node);
  }

  return Math.max(0, maxBottom - minTop);
}

function normalizeIndex(index: number, length: number) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function getSlideElementsForIndex(handle: SliderHandle, index: number) {
  const pages = handle.getInternals().slides.current ?? [];
  if (pages.length) {
    const page = pages[normalizeIndex(index, pages.length)];
    const cells = page?.cells
      .map((cell) => cell.element)
      .filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (cells?.length) return cells;
  }

  const nodes = handle
    .getSlideNodes()
    .filter((node) => node.getAttribute("data-rmg-clone") !== "true");

  if (!nodes.length) return [];
  return [nodes[normalizeIndex(index, nodes.length)]].filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  );
}

function AutoHeightRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderAutoHeight }) {
  const lastHeight = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const enabled = options.enabled !== false;
  const duration = options.duration ?? "320ms";
  const easing = options.easing ?? "cubic-bezier(.2,.7,.2,1)";
  const handle = host.handle;
  const handledByCore = handle?._usesLegacyEngine === true;
  const index = host.index;
  const setReady = host.setPluginReady;
  const setReadyRef = React.useRef(setReady);

  React.useEffect(() => {
    setReadyRef.current = setReady;
  }, [setReady]);

  const measure = React.useCallback((animate: boolean) => {
    if (!enabled || handledByCore || !handle) return;
    const viewport = handle.getViewportNode();
    if (!viewport) return;

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const selectedIndex = handle.getIndex() ?? index;
      const slideElements = getSlideElementsForIndex(handle, selectedIndex);
      const nextHeight = slideElements.reduce(
        (max, slide) => Math.max(max, measureSlide(slide)),
        0
      );
      if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;

      const rounded = toStableAutoHeightPx(nextHeight);
      if (
        lastHeight.current != null &&
        Math.abs(lastHeight.current - rounded) < AUTO_HEIGHT_PIXEL_EPSILON
      ) {
        setReadyRef.current(true);
        return;
      }

      const hasMeasured = lastHeight.current != null;
      lastHeight.current = rounded;
      viewport.style.transition =
        animate && hasMeasured ? `height ${duration} ${easing}` : "none";
      viewport.style.willChange = "height";
      viewport.style.height = `${rounded}px`;
      setReadyRef.current(true);
    });
  }, [duration, easing, enabled, handle, handledByCore, index]);

  React.useLayoutEffect(() => {
    if (handledByCore) {
      setReadyRef.current(true);
      return;
    }
    if (!enabled) {
      setReadyRef.current(true);
      return;
    }
    setReadyRef.current(false);
    measure(false);
    const off = handle?.onSlidesBuilt(() => measure(false));
    return () => {
      off?.();
    };
  }, [enabled, handle, handledByCore, measure]);

  React.useLayoutEffect(() => {
    if (!enabled || handledByCore) return;
    measure(true);
  }, [enabled, handledByCore, index, measure]);

  React.useLayoutEffect(() => {
    if (!enabled || handledByCore || !handle || typeof ResizeObserver === "undefined") return;
    const nodes = handle
      .getSlideNodes()
      .filter((node) => node.getAttribute("data-rmg-clone") !== "true");
    const observer = new ResizeObserver(() => measure(true));
    nodes.forEach((node) => {
      getAutoHeightTargets(node).forEach((target) => observer.observe(target));
    });
    return () => observer.disconnect();
  }, [enabled, handle, handledByCore, host.slideCount, measure]);

  React.useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return null;
}

export function sliderAutoHeight(options: SliderAutoHeight = {}) {
  return createSliderPlugin("auto-height", {
    options,
    blocksReady: true,
    Runtime: AutoHeightRuntime as React.ComponentType<any>,
  });
}

export type { SliderAutoHeight };
