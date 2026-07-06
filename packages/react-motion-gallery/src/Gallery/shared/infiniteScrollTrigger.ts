"use client";

import * as React from "react";
import {
  approximateIntersectionRatio,
  passesIntersectionThreshold,
} from "./itemLifecycle";

export type InfiniteScrollRootSource =
  | Element
  | React.RefObject<Element | null>
  | (() => Element | null)
  | null;

type UseReliableInfiniteTriggerOptions = {
  enabled: boolean;
  hasMore: boolean;
  loading: boolean;
  rootMargin: string;
  threshold: number;
  resetKey?: React.Key;
  scrollRoot?: InfiniteScrollRootSource;
  onLoadMore?: () => void;
};

const NO_REQUEST_KEY = Symbol("rmg-infinite-scroll-request");

function requestFrame(callback: FrameRequestCallback) {
  if (typeof window.requestAnimationFrame === "function") {
    return window.requestAnimationFrame(callback);
  }

  return window.setTimeout(
    () => callback(window.performance?.now?.() ?? Date.now()),
    0,
  );
}

function cancelFrame(handle: number) {
  if (typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(handle);
    return;
  }

  window.clearTimeout(handle);
}

function resolveInfiniteScrollRoot(
  scrollRoot: InfiniteScrollRootSource | undefined,
) {
  if (!scrollRoot) return null;
  if (typeof scrollRoot === "function") return scrollRoot();
  if (typeof Element !== "undefined" && scrollRoot instanceof Element) {
    return scrollRoot;
  }
  if (typeof scrollRoot === "object" && "current" in scrollRoot) {
    return scrollRoot.current;
  }
  return null;
}

function measureInfiniteTrigger(args: {
  node: Element;
  root: Element | null;
  rootMargin: string;
  threshold: number;
}) {
  const rect = args.node.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const ratio = approximateIntersectionRatio(
    args.node,
    args.root,
    args.rootMargin,
  );
  return passesIntersectionThreshold(ratio, args.threshold);
}

export function useReliableInfiniteTrigger(
  sentinelRef: React.RefObject<Element | null>,
  options: UseReliableInfiniteTriggerOptions,
) {
  const defaultRequestKeyRef = React.useRef(Symbol("rmg-infinite-scroll"));
  const lastRequestKeyRef = React.useRef<unknown>(NO_REQUEST_KEY);
  const observerTriggeredRef = React.useRef(false);
  const frameRef = React.useRef<number | null>(null);
  const onLoadMoreRef = React.useRef(options.onLoadMore);
  const checkCurrentTriggerRef = React.useRef<() => void>(() => undefined);

  React.useEffect(() => {
    onLoadMoreRef.current = options.onLoadMore;
  }, [options.onLoadMore]);

  const requestKey = options.resetKey ?? defaultRequestKeyRef.current;

  const requestIfReady = React.useCallback(() => {
    if (!options.enabled || !options.hasMore || options.loading) return;
    if (lastRequestKeyRef.current === requestKey) return;

    lastRequestKeyRef.current = requestKey;
    onLoadMoreRef.current?.();
  }, [options.enabled, options.hasMore, options.loading, requestKey]);

  const checkCurrentTrigger = React.useCallback(() => {
    const node = sentinelRef.current;
    if (!node || typeof window === "undefined") return;

    const root = resolveInfiniteScrollRoot(options.scrollRoot);
    const measured = measureInfiniteTrigger({
      node,
      root,
      rootMargin: options.rootMargin,
      threshold: options.threshold,
    });
    const triggered = measured ?? observerTriggeredRef.current;

    if (!triggered) {
      lastRequestKeyRef.current = NO_REQUEST_KEY;
      return;
    }

    requestIfReady();
  }, [
    options.rootMargin,
    options.scrollRoot,
    options.threshold,
    requestIfReady,
    sentinelRef,
  ]);
  checkCurrentTriggerRef.current = checkCurrentTrigger;

  const scheduleCheck = React.useCallback(() => {
    if (typeof window === "undefined") return;
    if (frameRef.current != null) return;

    frameRef.current = requestFrame(() => {
      frameRef.current = null;
      checkCurrentTriggerRef.current();
    });
  }, []);

  React.useEffect(
    () => () => {
      if (frameRef.current == null || typeof window === "undefined") return;
      cancelFrame(frameRef.current);
      frameRef.current = null;
    },
    [],
  );

  React.useEffect(() => {
    if (!options.enabled || !options.hasMore) {
      observerTriggeredRef.current = false;
      lastRequestKeyRef.current = NO_REQUEST_KEY;
      return;
    }

    scheduleCheck();
  }, [
    options.enabled,
    options.hasMore,
    options.loading,
    options.rootMargin,
    options.scrollRoot,
    options.threshold,
    requestKey,
    scheduleCheck,
  ]);

  React.useEffect(() => {
    if (
      !options.enabled ||
      !options.hasMore ||
      typeof window === "undefined"
    ) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) return;

    const handleChange = () => scheduleCheck();
    const root = resolveInfiniteScrollRoot(options.scrollRoot);
    const scrollTarget: Element | Window = root ?? window;

    scrollTarget.addEventListener("scroll", handleChange, { passive: true });
    window.addEventListener("resize", handleChange);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleChange);
    resizeObserver?.observe(node);
    if (node.parentElement) resizeObserver?.observe(node.parentElement);
    if (root) resizeObserver?.observe(root);

    scheduleCheck();

    return () => {
      scrollTarget.removeEventListener("scroll", handleChange);
      window.removeEventListener("resize", handleChange);
      resizeObserver?.disconnect();
    };
  }, [
    options.enabled,
    options.hasMore,
    options.scrollRoot,
    scheduleCheck,
    sentinelRef,
  ]);

  React.useEffect(() => {
    if (
      !options.enabled ||
      !options.hasMore ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const triggered = entries.some(
          (entry) =>
            entry.isIntersecting &&
            passesIntersectionThreshold(
              entry.intersectionRatio,
              options.threshold,
            ),
        );
        observerTriggeredRef.current = triggered;

        if (!triggered) {
          lastRequestKeyRef.current = NO_REQUEST_KEY;
          return;
        }

        requestIfReady();
      },
      {
        root: resolveInfiniteScrollRoot(options.scrollRoot),
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      },
    );

    observer.observe(node);
    scheduleCheck();

    return () => observer.disconnect();
  }, [
    options.enabled,
    options.hasMore,
    options.rootMargin,
    options.scrollRoot,
    options.threshold,
    requestIfReady,
    scheduleCheck,
    sentinelRef,
  ]);
}
