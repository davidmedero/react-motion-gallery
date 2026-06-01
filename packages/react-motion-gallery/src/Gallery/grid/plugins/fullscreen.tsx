"use client";

import * as React from "react";

import { useOptionalGalleryCore } from "../../core";
import type { GridFullscreenTrigger, GridPluginRuntimeProps } from "../types";
import { createGridPlugin } from "./create";

const DRAG_CLICK_THRESHOLD = 6;
const FULLSCREEN_TRIGGER_SELECTOR = "[data-rmg-fullscreen-trigger]";
const ITEM_SELECTOR = "[data-rmg-idx]";
const VIDEO_SURFACE_SELECTOR = "[data-rmg-plyr='true'],.plyr,video,iframe";

type PointerDownPoint = { x: number; y: number; id: number } | null;

function getElement(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function getFullscreenTrigger(target: EventTarget | null) {
  return getElement(target)?.closest<HTMLElement>(FULLSCREEN_TRIGGER_SELECTOR) ?? null;
}

function getItem(target: EventTarget | null, trigger: HTMLElement | null) {
  const targetEl = getElement(target);
  return (
    trigger?.closest<HTMLElement>(ITEM_SELECTOR) ??
    targetEl?.closest<HTMLElement>(ITEM_SELECTOR) ??
    null
  );
}

function hasVideoSurface(item: HTMLElement) {
  return !!item.querySelector(VIDEO_SURFACE_SELECTOR);
}

function getOriginImage(
  target: EventTarget | null,
  item: HTMLElement,
  trigger: HTMLElement | null,
  fullscreenTrigger: GridFullscreenTrigger
) {
  if (trigger instanceof HTMLImageElement) return trigger;
  const triggerImage = trigger?.querySelector<HTMLImageElement>("img") ?? null;
  if (triggerImage) return triggerImage;

  const targetEl = getElement(target);
  if (targetEl instanceof HTMLImageElement) return targetEl;

  if (fullscreenTrigger === "media" && !trigger) return null;

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

export function shouldSuppressGridFullscreenClick(
  down: PointerDownPoint,
  event: Pick<MouseEvent, "clientX" | "clientY">
) {
  if (!down) return false;
  const dx = event.clientX - down.x;
  const dy = event.clientY - down.y;
  return Math.hypot(dx, dy) > DRAG_CLICK_THRESHOLD;
}

export function resolveGridFullscreenClick(
  target: EventTarget | null,
  options: { fullscreenTrigger?: GridFullscreenTrigger } = {}
) {
  const fullscreenTrigger = options.fullscreenTrigger ?? "media";
  const trigger = getFullscreenTrigger(target);
  if (!trigger && isInteractiveTarget(target)) return null;

  const item = getItem(target, trigger);
  if (!item) return null;
  if (hasVideoSurface(item) && !trigger) return null;

  const index = Number.parseInt(item.getAttribute("data-rmg-idx") ?? "", 10);
  if (!Number.isFinite(index)) return null;

  const image = getOriginImage(target, item, trigger, fullscreenTrigger);
  if (!image) return null;

  return { index, image };
}

function GridFullscreenRuntime({ host }: GridPluginRuntimeProps) {
  const core = useOptionalGalleryCore();
  const pointerDownRef = React.useRef<PointerDownPoint>(null);
  const visibleSeenRef = React.useRef(new Set<number>());

  React.useEffect(() => {
    visibleSeenRef.current.clear();
  }, [host.itemCount]);

  React.useEffect(() => {
    if (!core || core.layout !== "grid" || !host.handle || !core.fsEnabled) return;

    const root = host.handle.getRootNode();
    if (!root) return;

    core.registerFullscreenAdapter("grid", {
      closestSelector: ".rmg__grid-item",
    });

    const originalAttrs = new Map<
      HTMLElement,
      { tabIndex: string | null; ariaLabel: string | null }
    >();
    const registeredIndicesRef = { current: new Set<number>() };

    const prepareNodes = () => {
      host.handle?.getItemNodes().forEach((node) => {
        const rawIndex = Number.parseInt(node.getAttribute("data-rmg-idx") ?? "", 10);
        if (!Number.isFinite(rawIndex)) return;

        if (!originalAttrs.has(node)) {
          originalAttrs.set(node, {
            tabIndex: node.getAttribute("tabindex"),
            ariaLabel: node.getAttribute("aria-label"),
          });
        }

        node.setAttribute("data-rmg-fullscreen-enabled", "true");
        node.setAttribute("data-rmg-fullscreen-trigger-mode", host.fullscreenTrigger);
        if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "0");
        if (!node.hasAttribute("aria-label")) {
          node.setAttribute("aria-label", `View image ${rawIndex + 1}`);
        }

        registeredIndicesRef.current.add(rawIndex);
        core.registerExpandableImage(rawIndex, node);
      });
    };

    prepareNodes();
    const unsubscribeReady = host.handle.onReady(prepareNodes);

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      pointerDownRef.current = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
      };
    };

    const openFromTarget = (target: EventTarget | null, event: MouseEvent | KeyboardEvent) => {
      const request = resolveGridFullscreenClick(target, {
        fullscreenTrigger: host.fullscreenTrigger,
      });
      if (!request) return false;

      core.requestFullscreenOpen({
        source: "grid",
        index: request.index,
        image: request.image,
        event,
      });
      return true;
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const down = pointerDownRef.current;
      pointerDownRef.current = null;
      if (shouldSuppressGridFullscreenClick(down, event)) return;

      if (openFromTarget(event.target, event)) {
        event.preventDefault();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      if (openFromTarget(event.target, event)) {
        event.preventDefault();
      }
    };

    const viewportRoot = root.closest('[data-rmg-viewport="true"]') as Element | null;
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;

                const item = entry.target;
                if (!(item instanceof HTMLElement)) {
                  io?.unobserve(entry.target);
                  continue;
                }

                const idxAttr = item.getAttribute("data-rmg-idx");
                const index = idxAttr != null ? parseInt(idxAttr, 10) : NaN;
                if (!Number.isFinite(index)) {
                  io?.unobserve(item);
                  continue;
                }

                if (!visibleSeenRef.current.has(index)) {
                  visibleSeenRef.current.add(index);
                  core.notifyBaseVisibleIndex(index);
                }

                io?.unobserve(item);
              }
            },
            { root: viewportRoot, rootMargin: "200px", threshold: 0.15 }
          );

    if (io) {
      host.handle.getItemNodes().forEach((node, index) => {
        if (visibleSeenRef.current.has(index)) return;
        io.observe(node);
      });
    }

    root.addEventListener("pointerdown", onPointerDown, true);
    root.addEventListener("click", onClick, true);
    root.addEventListener("keydown", onKeyDown, true);

    return () => {
      root.removeEventListener("pointerdown", onPointerDown, true);
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("keydown", onKeyDown, true);
      io?.disconnect();
      unsubscribeReady();

      originalAttrs.forEach((attrs, node) => {
        node.removeAttribute("data-rmg-fullscreen-enabled");
        node.removeAttribute("data-rmg-fullscreen-trigger-mode");

        if (attrs.tabIndex == null) node.removeAttribute("tabindex");
        else node.setAttribute("tabindex", attrs.tabIndex);

        if (attrs.ariaLabel == null) node.removeAttribute("aria-label");
        else node.setAttribute("aria-label", attrs.ariaLabel);
      });

      registeredIndicesRef.current.forEach((index) => {
        core.registerExpandableImage(index, null);
      });
      registeredIndicesRef.current.clear();
    };
  }, [
    core,
    core?.fsEnabled,
    host.fullscreenTrigger,
    host.handle,
    host.itemCount,
    host.ready,
  ]);

  return null;
}

export function gridFullscreen() {
  return createGridPlugin("fullscreen", {
    Runtime: GridFullscreenRuntime,
  });
}
