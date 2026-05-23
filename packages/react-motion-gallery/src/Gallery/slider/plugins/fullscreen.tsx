"use client";

import * as React from "react";
import { useOptionalGalleryCore } from "../../core";
import type { SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

const DRAG_CLICK_THRESHOLD = 6;
const FULLSCREEN_TRIGGER_SELECTOR = "[data-rmg-fullscreen-trigger]";
const VIDEO_SURFACE_SELECTOR = "[data-rmg-plyr='true'],.plyr,video,iframe";

function getElement(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function getFullscreenTrigger(target: EventTarget | null) {
  return getElement(target)?.closest<HTMLElement>(FULLSCREEN_TRIGGER_SELECTOR) ?? null;
}

function hasVideoSurface(slide: HTMLElement) {
  return !!slide.querySelector(VIDEO_SURFACE_SELECTOR);
}

function getOriginImage(
  target: EventTarget | null,
  slide: HTMLElement,
  trigger: HTMLElement | null
) {
  if (trigger instanceof HTMLImageElement) return trigger;
  const triggerImage = trigger?.querySelector<HTMLImageElement>("img") ?? null;
  if (triggerImage) return triggerImage;

  const targetEl = getElement(target);
  if (targetEl instanceof HTMLImageElement) return targetEl;

  return slide.querySelector<HTMLImageElement>("img");
}

function isInteractiveTarget(target: EventTarget | null) {
  const node = getElement(target);
  return !!node?.closest(
    [
      "a",
      "button",
      "input",
      "select",
      "textarea",
      "summary",
      "[role='button']",
      "[data-rmg-part='dots']",
      ".rmgArrow",
      ".rmgDot",
      VIDEO_SURFACE_SELECTOR,
      ".plyr__controls",
    ].join(",")
  );
}

export function resolveSliderFullscreenClick(target: EventTarget | null) {
  const trigger = getFullscreenTrigger(target);
  if (!trigger && isInteractiveTarget(target)) return null;

  const targetEl = getElement(target);
  const slide =
    trigger?.closest<HTMLElement>('[data-rmg-slide="true"]') ??
    targetEl?.closest<HTMLElement>('[data-rmg-slide="true"]') ??
    null;
  if (!slide) return null;
  if (hasVideoSurface(slide) && !trigger) return null;

  const index = Number.parseInt(slide.getAttribute("data-rmg-idx") ?? "", 10);
  if (!Number.isFinite(index)) return null;

  const image = getOriginImage(target, slide, trigger);
  if (!image) return null;

  return { index, image };
}

function FullscreenRuntime({ host }: SliderPluginRuntimeProps) {
  const core = useOptionalGalleryCore();
  const pointerDownRef = React.useRef<{ x: number; y: number; id: number } | null>(null);

  React.useEffect(() => {
    if (!core || core.layout !== "slider" || !core.sliderApiRef) return;
    core.sliderApiRef.current = host.handle;
    return () => {
      if (core.sliderApiRef.current === host.handle) {
        core.sliderApiRef.current = null;
      }
    };
  }, [core, host.handle]);

  React.useEffect(() => {
    if (!core || core.layout !== "slider" || !host.handle || !core.fsEnabled) return;
    const root = host.handle.getRootNode();
    if (!root) return;
    root.setAttribute("data-rmg-fullscreen-enabled", "true");

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      pointerDownRef.current = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
      };
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const down = pointerDownRef.current;
      pointerDownRef.current = null;
      if (down) {
        const dx = event.clientX - down.x;
        const dy = event.clientY - down.y;
        if (Math.hypot(dx, dy) > DRAG_CLICK_THRESHOLD) return;
      }

      const request = resolveSliderFullscreenClick(event.target);
      if (!request) return;

      core.requestFullscreenOpen({
        source: "slider",
        index: request.index,
        image: request.image,
        event,
      });
    };

    root.addEventListener("pointerdown", onPointerDown, true);
    root.addEventListener("click", onClick, true);
    return () => {
      root.removeAttribute("data-rmg-fullscreen-enabled");
      root.removeEventListener("pointerdown", onPointerDown, true);
      root.removeEventListener("click", onClick, true);
    };
  }, [core, core?.fsEnabled, host.handle]);

  return null;
}

export function sliderFullscreen() {
  return createSliderPlugin("fullscreen", {
    Runtime: FullscreenRuntime,
  });
}
