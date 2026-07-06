"use client";

import * as React from "react";
import type { SliderHandle } from "./types";

export type SliderReadyController = {
  ref: React.RefCallback<SliderHandle>;
  ready: boolean;
  handleRef: React.MutableRefObject<SliderHandle | null>;
};

const MEDIA_READY_TIMEOUT_MS = 4000;

function isMediaReady(node: Element) {
  if (node instanceof HTMLImageElement) {
    return node.complete;
  }

  if (node instanceof HTMLVideoElement) {
    return node.readyState >= 2;
  }

  return true;
}

function waitForImageDecode(image: HTMLImageElement) {
  const decode = (
    image as HTMLImageElement & { decode?: () => Promise<void> }
  ).decode;

  if (typeof decode === "function") {
    return decode.call(image).catch(() => undefined);
  }

  return Promise.resolve();
}

function visibleSlideNodes(handle: SliderHandle) {
  const nodes = handle.getSlideNodes();

  try {
    const visibleCells = new Set(handle.cellsInView());
    if (visibleCells.size === 0) return nodes;

    const visibleNodes = nodes.filter((node, fallbackIndex) => {
      const rawIndex = node.getAttribute("data-rmg-idx");
      const index = rawIndex == null ? fallbackIndex : Number(rawIndex);
      return Number.isFinite(index) && visibleCells.has(index);
    });

    return visibleNodes.length > 0 ? visibleNodes : nodes;
  } catch {
    return nodes;
  }
}

function waitForVisibleMedia(handle: SliderHandle, onReady: () => void) {
  const slides = visibleSlideNodes(handle);
  const media = slides.flatMap((slide) =>
    Array.from(slide.querySelectorAll("img,video"))
  );
  const pending = new Set(media);

  if (pending.size === 0) {
    onReady();
    return () => {};
  }

  let done = false;
  const cleanups: Array<() => void> = [];

  const finish = () => {
    if (done) return;
    done = true;
    cleanups.splice(0).forEach((cleanup) => cleanup());
    onReady();
  };

  const timeoutId = window.setTimeout(finish, MEDIA_READY_TIMEOUT_MS);
  cleanups.push(() => window.clearTimeout(timeoutId));

  const markReady = (node: Element) => {
    pending.delete(node);
    if (pending.size === 0) finish();
  };

  for (const node of pending) {
    if (node instanceof HTMLImageElement && node.complete) {
      void waitForImageDecode(node).then(() => markReady(node));
      continue;
    }

    if (!(node instanceof HTMLImageElement) && isMediaReady(node)) {
      markReady(node);
      continue;
    }

    const events =
      node instanceof HTMLVideoElement
        ? ["loadeddata", "canplay", "error"]
        : ["load", "error"];
    const listener = () => {
      if (node instanceof HTMLImageElement) {
        void waitForImageDecode(node).then(() => markReady(node));
        return;
      }

      markReady(node);
    };

    for (const event of events) {
      node.addEventListener(event, listener, { once: true });
      cleanups.push(() => node.removeEventListener(event, listener));
    }

    if (isMediaReady(node)) markReady(node);
  }

  return () => {
    if (done) return;
    done = true;
    cleanups.splice(0).forEach((cleanup) => cleanup());
  };
}

export function useSliderReady(): SliderReadyController {
  const handleRef = React.useRef<SliderHandle | null>(null);
  const rootNodeRef = React.useRef<HTMLElement | null>(null);
  const unsubscribeRef = React.useRef<(() => void) | null>(null);
  const mediaCleanupRef = React.useRef<(() => void) | null>(null);
  const readyTokenRef = React.useRef(0);
  const readyRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  const setReadyState = React.useCallback((value: boolean) => {
    readyRef.current = value;
    setReady(value);
  }, []);

  const markReadyAfterMedia = React.useCallback((handle: SliderHandle) => {
    const rootNode = handle.getRootNode() ?? handle.getContainerNode();
    const token = ++readyTokenRef.current;

    mediaCleanupRef.current?.();
    mediaCleanupRef.current = null;
    mediaCleanupRef.current = waitForVisibleMedia(handle, () => {
      mediaCleanupRef.current = null;
      if (readyTokenRef.current !== token || rootNodeRef.current !== rootNode) return;
      setReadyState(true);
    });
  }, [setReadyState]);

  const ref = React.useCallback((handle: SliderHandle | null) => {
    const previousRoot = rootNodeRef.current;
    const nextRoot = handle?.getRootNode() ?? handle?.getContainerNode() ?? null;
    const sameSlider = !!handle && !!previousRoot && previousRoot === nextRoot;

    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    handleRef.current = handle;
    rootNodeRef.current = nextRoot;

    if (!handle) {
      mediaCleanupRef.current?.();
      mediaCleanupRef.current = null;
      readyTokenRef.current += 1;
      rootNodeRef.current = null;
      setReadyState(false);
      return;
    }

    if (!sameSlider) {
      mediaCleanupRef.current?.();
      mediaCleanupRef.current = null;
      readyTokenRef.current += 1;
      setReadyState(false);
    }

    if (!readyRef.current && !mediaCleanupRef.current && handle.isReady()) {
      markReadyAfterMedia(handle);
    }

    unsubscribeRef.current = handle.onReady(() => {
      if (!readyRef.current && !mediaCleanupRef.current) {
        markReadyAfterMedia(handle);
      }
    });
  }, [markReadyAfterMedia, setReadyState]);

  React.useEffect(
    () => () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      mediaCleanupRef.current?.();
      mediaCleanupRef.current = null;
      rootNodeRef.current = null;
      readyTokenRef.current += 1;
      readyRef.current = false;
    },
    []
  );

  return React.useMemo(
    () => ({
      ref,
      ready,
      handleRef,
    }),
    [ref, ready]
  );
}
