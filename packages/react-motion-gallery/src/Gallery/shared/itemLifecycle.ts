"use client";

import * as React from "react";

const DEFAULT_DECODE_TIMEOUT_MS = 8000;

type FrameIds = {
  first: number | null;
  second: number | null;
};

type RootRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type UseElementInViewOnceOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  resetKey?: React.Key;
};

type WaitForElementMediaReadyOptions = {
  timeoutMs?: number;
  waitForLazy?: boolean;
};

const useIsoLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function getViewportRect(): RootRect {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height =
    window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
  };
}

function resolveMarginValue(raw: string | undefined, size: number) {
  if (!raw) return 0;
  if (raw.endsWith("%")) return (size * parseFloat(raw)) / 100;
  return parseFloat(raw) || 0;
}

function parseRootMargin(rootMargin: string, rootRect: RootRect) {
  const tokens = rootMargin.trim().split(/\s+/).filter(Boolean);
  const [top, right = top, bottom = top, left = right] = [
    tokens[0] ?? "0px",
    tokens[1],
    tokens[2],
    tokens[3],
  ];

  return {
    top: resolveMarginValue(top, rootRect.height),
    right: resolveMarginValue(right, rootRect.width),
    bottom: resolveMarginValue(bottom, rootRect.height),
    left: resolveMarginValue(left, rootRect.width),
  };
}

export function approximateIntersectionRatio(
  node: Element,
  root: Element | null,
  rootMargin: string,
) {
  const targetRect = node.getBoundingClientRect();
  if (targetRect.width <= 0 || targetRect.height <= 0) return 0;

  const rawRootRect =
    root instanceof Element ? root.getBoundingClientRect() : getViewportRect();
  const margin = parseRootMargin(rootMargin, rawRootRect);
  const rootRect = {
    top: rawRootRect.top - margin.top,
    left: rawRootRect.left - margin.left,
    right: rawRootRect.right + margin.right,
    bottom: rawRootRect.bottom + margin.bottom,
  };

  const visibleWidth = Math.max(
    0,
    Math.min(targetRect.right, rootRect.right) -
      Math.max(targetRect.left, rootRect.left),
  );
  const visibleHeight = Math.max(
    0,
    Math.min(targetRect.bottom, rootRect.bottom) -
      Math.max(targetRect.top, rootRect.top),
  );
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = targetRect.width * targetRect.height;

  return totalArea > 0 ? visibleArea / totalArea : 0;
}

export function passesIntersectionThreshold(ratio: number, threshold: number) {
  return threshold <= 0 ? ratio > 0 : ratio >= threshold;
}

export function useElementInViewOnce(
  enabled: boolean,
  node: Element | null,
  options: UseElementInViewOnceOptions = {},
) {
  const root = options.root ?? null;
  const rootMargin = options.rootMargin ?? "0px";
  const threshold = options.threshold ?? 0;
  const resetKey = options.resetKey;
  const [inView, setInView] = React.useState(!enabled);
  const seenRef = React.useRef(!enabled);

  React.useEffect(() => {
    seenRef.current = !enabled;
    setInView(!enabled);
  }, [enabled, resetKey]);

  React.useEffect(() => {
    if (!enabled || !node || seenRef.current) return;

    const mark = () => {
      seenRef.current = true;
      setInView(true);
    };

    if (typeof window === "undefined") return;

    const ratio = approximateIntersectionRatio(node, root, rootMargin);
    if (passesIntersectionThreshold(ratio, threshold)) {
      mark();
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      mark();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!passesIntersectionThreshold(entry.intersectionRatio, threshold))
            continue;
          mark();
          observer.disconnect();
          break;
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, node, resetKey, root, rootMargin, threshold]);

  return inView;
}

function clearFrames(frameRef: React.MutableRefObject<FrameIds>) {
  if (typeof window === "undefined") {
    frameRef.current.first = null;
    frameRef.current.second = null;
    return;
  }

  if (frameRef.current.first != null) {
    window.cancelAnimationFrame(frameRef.current.first);
    frameRef.current.first = null;
  }

  if (frameRef.current.second != null) {
    window.cancelAnimationFrame(frameRef.current.second);
    frameRef.current.second = null;
  }
}

export function useDoublePaintReady(enabled: boolean, resetKey?: React.Key) {
  const [painted, setPainted] = React.useState(!enabled);
  const frameRef = React.useRef<FrameIds>({ first: null, second: null });

  useIsoLayoutEffect(() => {
    clearFrames(frameRef);
    setPainted(!enabled);

    if (!enabled) return;

    if (
      typeof window === "undefined" ||
      typeof window.requestAnimationFrame !== "function"
    ) {
      const timeout = globalThis.setTimeout(() => setPainted(true), 0);
      return () => globalThis.clearTimeout(timeout);
    }

    frameRef.current.first = window.requestAnimationFrame(() => {
      frameRef.current.second = window.requestAnimationFrame(() => {
        setPainted(true);
        frameRef.current.first = null;
        frameRef.current.second = null;
      });
    });

    return () => clearFrames(frameRef);
  }, [enabled, resetKey]);

  React.useEffect(() => () => clearFrames(frameRef), []);

  return painted;
}

function withTimeout(promise: Promise<void>, timeoutMs: number) {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve();
    };
    const timeout = setTimeout(finish, Math.max(0, timeoutMs));
    promise.then(finish, finish);
  });
}

function isImageElement(node: Element): node is HTMLImageElement {
  return (
    typeof HTMLImageElement !== "undefined" && node instanceof HTMLImageElement
  );
}

function isVideoElement(node: Element): node is HTMLVideoElement {
  return (
    typeof HTMLVideoElement !== "undefined" && node instanceof HTMLVideoElement
  );
}

function waitForImageReady(image: HTMLImageElement, timeoutMs: number) {
  const decodeLoadedImage = () => {
    if (image.complete && image.naturalWidth <= 0) return Promise.resolve();

    const decode = (
      image as HTMLImageElement & { decode?: () => Promise<void> }
    ).decode;
    if (typeof decode === "function") {
      return decode.call(image).catch(() => undefined);
    }

    return Promise.resolve();
  };

  if (image.complete) return withTimeout(decodeLoadedImage(), timeoutMs);

  return withTimeout(
    new Promise<void>((resolve) => {
      const onDone = () => {
        image.removeEventListener("load", onDone);
        image.removeEventListener("error", onDone);
        void decodeLoadedImage().then(resolve, resolve);
      };

      image.addEventListener("load", onDone);
      image.addEventListener("error", onDone);
    }),
    timeoutMs,
  );
}

function waitForVideoReady(video: HTMLVideoElement, timeoutMs: number) {
  if (video.readyState >= 2) return Promise.resolve();

  return withTimeout(
    new Promise<void>((resolve) => {
      const onDone = () => {
        video.removeEventListener("loadeddata", onDone);
        video.removeEventListener("error", onDone);
        resolve();
      };

      video.addEventListener("loadeddata", onDone);
      video.addEventListener("error", onDone);
    }),
    timeoutMs,
  );
}

function waitForDocumentFontsReady() {
  if (typeof document === "undefined") return Promise.resolve();

  const fonts = (
    document as Document & {
      fonts?: { status?: string; ready?: Promise<unknown> };
    }
  ).fonts;
  if (!fonts || fonts.status === "loaded" || !fonts.ready) {
    return Promise.resolve();
  }

  return Promise.resolve(fonts.ready)
    .catch(() => undefined)
    .then(() => undefined);
}

function waitForLazyHostReady(host: HTMLElement, timeoutMs: number) {
  if (host.getAttribute("data-rmg-lazyloaded") === "true")
    return Promise.resolve();
  if (!host.querySelector("[data-rmg-lazy-src]")) return Promise.resolve();

  return withTimeout(
    new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        if (
          host.getAttribute("data-rmg-lazyloaded") === "true" ||
          !host.querySelector("[data-rmg-lazy-src]")
        ) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(host, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }),
    timeoutMs,
  );
}

export async function waitForElementMediaReady(
  node: HTMLElement,
  options: WaitForElementMediaReadyOptions = {},
) {
  const timeoutMs =
    typeof options.timeoutMs === "number" && Number.isFinite(options.timeoutMs)
      ? Math.max(0, options.timeoutMs)
      : DEFAULT_DECODE_TIMEOUT_MS;
  const waitForLazy = options.waitForLazy ?? true;
  const media = Array.from(node.querySelectorAll("img,video"));
  const lazyHosts = waitForLazy
    ? Array.from(node.querySelectorAll<HTMLElement>("[data-rmg-lazyload]"))
    : [];

  await Promise.all([
    waitForDocumentFontsReady(),
    ...lazyHosts.map((host) => waitForLazyHostReady(host, timeoutMs)),
    ...media.map((item) => {
      if (isImageElement(item)) return waitForImageReady(item, timeoutMs);
      if (isVideoElement(item)) return waitForVideoReady(item, timeoutMs);
      return Promise.resolve();
    }),
  ]);
}
