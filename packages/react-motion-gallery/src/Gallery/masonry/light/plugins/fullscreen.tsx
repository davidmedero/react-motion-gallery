"use client";

import * as React from "react";

import { useOptionalGalleryCore } from "../../../core";
import type { MasonryPluginRuntimeProps } from "../types";
import { createMasonryPlugin } from "./create";

const DRAG_CLICK_THRESHOLD = 6;
const FULLSCREEN_TRIGGER_SELECTOR = "[data-rmg-fullscreen-trigger]";
const ITEM_SELECTOR = "[data-rmg-idx]";
const VIDEO_SURFACE_SELECTOR = "[data-rmg-plyr='true'],.plyr,video,iframe";

function getElement(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function getFullscreenTrigger(target: EventTarget | null) {
  return getElement(target)?.closest<HTMLElement>(FULLSCREEN_TRIGGER_SELECTOR) ?? null;
}

function hasVideoSurface(item: HTMLElement) {
  return !!item.querySelector(VIDEO_SURFACE_SELECTOR);
}

function getOriginImage(
  target: EventTarget | null,
  item: HTMLElement,
  trigger: HTMLElement | null
) {
  if (trigger instanceof HTMLImageElement) return trigger;
  const triggerImage = trigger?.querySelector<HTMLImageElement>("img") ?? null;
  if (triggerImage) return triggerImage;

  const targetEl = getElement(target);
  if (targetEl instanceof HTMLImageElement) return targetEl;

  return item.querySelector<HTMLImageElement>("img");
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
      VIDEO_SURFACE_SELECTOR,
      ".plyr__controls",
    ].join(",")
  );
}

export function resolveMasonryFullscreenClick(target: EventTarget | null) {
  const trigger = getFullscreenTrigger(target);
  if (!trigger && isInteractiveTarget(target)) return null;

  const targetEl = getElement(target);
  const item =
    trigger?.closest<HTMLElement>(ITEM_SELECTOR) ??
    targetEl?.closest<HTMLElement>(ITEM_SELECTOR) ??
    null;
  if (!item) return null;
  if (hasVideoSurface(item) && !trigger) return null;

  const index = Number.parseInt(item.getAttribute("data-rmg-idx") ?? "", 10);
  if (!Number.isFinite(index)) return null;

  const image = getOriginImage(target, item, trigger);
  if (!image) return null;

  return { index, image };
}

function MasonryFullscreenRuntime({ host }: MasonryPluginRuntimeProps) {
  const core = useOptionalGalleryCore();
  const pointerDownRef = React.useRef<{ x: number; y: number; id: number } | null>(null);

  React.useEffect(() => {
    if (!core || core.layout !== "masonry" || !host.handle || !core.fsEnabled) return;

    const root = host.handle.getRootNode();
    if (!root) return;

    root.setAttribute("data-rmg-fullscreen-enabled", "true");
    core.registerFullscreenAdapter("masonry", {
      closestSelector: ".rmg__masonry-item",
    });

    const registerNodes = () => {
      host.handle?.getItemNodes().forEach((node, index) => {
        core.registerExpandableImage(index, node);
      });
    };

    registerNodes();
    const unsubscribeReady = host.handle.onReady(registerNodes);

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

      const request = resolveMasonryFullscreenClick(event.target);
      if (!request) return;

      core.requestFullscreenOpen({
        source: "masonry",
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
      unsubscribeReady();
      for (let index = 0; index < host.itemCount; index++) {
        core.registerExpandableImage(index, null);
      }
    };
  }, [core, core?.fsEnabled, host.handle, host.itemCount, host.ready]);

  return null;
}

export function masonryFullscreen() {
  return createMasonryPlugin("fullscreen", {
    Runtime: MasonryFullscreenRuntime,
  });
}
