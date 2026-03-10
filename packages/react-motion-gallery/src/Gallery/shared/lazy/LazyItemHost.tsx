"use client";

import * as React from "react";
import styles from "./LazyItemHost.module.css";
import type {
  GalleryLazyLoadOptions,
  GalleryLazyLoadRenderArgs,
  GalleryLazyLoadResolved,
} from "../types/lazy";
import {
  applyImageHints,
  findTrackableImages,
  nextFrame,
  prepareImage,
  restorePreparedImage,
  revealPreparedImage,
  waitForImageDecode,
} from "./imageLifecycle";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else if (typeof ref === "object") (ref as any).current = node;
    }
  };
}

export function normalizeLazyLoad(src?: GalleryLazyLoadOptions): GalleryLazyLoadResolved {
  return {
    enabled: src?.enabled ?? false,
    spinner: src?.spinner ?? true,
    spinnerClassName: src?.spinnerClassName,
    spinnerStyle: src?.spinnerStyle,
  };
}

export function resolveLazySpinnerNode(args: {
  lazy: GalleryLazyLoadResolved;
  kind: GalleryLazyLoadRenderArgs["kind"];
  isClone: boolean;
}): { render: boolean; node: React.ReactNode | null; isCustom: boolean } {
  const { lazy, kind, isClone } = args;
  if (!lazy.enabled) return { render: false, node: null, isCustom: false };

  const spinner = lazy.spinner;
  if (spinner === false) return { render: false, node: null, isCustom: false };
  if (typeof spinner === "function") {
    return { render: true, node: spinner({ kind, isClone }), isCustom: true };
  }
  if (spinner === true || spinner == null) {
    return { render: true, node: null, isCustom: false };
  }
  return { render: true, node: spinner, isCustom: true };
}

export type LazyItemHostProps = React.HTMLAttributes<HTMLDivElement> & {
  index: number;
  lazyLoad?: GalleryLazyLoadOptions;
  onVisibleIndex?: (index: number) => void;
  registerExpandableImage?: (index: number, node: HTMLImageElement | null) => void;
};

export const LazyItemHost = React.forwardRef<HTMLDivElement, LazyItemHostProps>(
  function LazyItemHost(
    {
      index,
      lazyLoad,
      onVisibleIndex,
      registerExpandableImage,
      children,
      className,
      style,
      ...rest
    },
    forwardedRef
  ) {
    const hostRef = React.useRef<HTMLDivElement | null>(null);
    const [hasTrackableImages, setHasTrackableImages] = React.useState(false);
    const [ready, setReady] = React.useState(true);
    const normalizedLazy = React.useMemo(() => normalizeLazyLoad(lazyLoad), [lazyLoad]);
    const visibleSentRef = React.useRef(false);

    const spinnerResolved = React.useMemo(
      () => resolveLazySpinnerNode({ lazy: normalizedLazy, kind: "image", isClone: false }),
      [normalizedLazy]
    );

    const mergedRef = React.useMemo(
      () => mergeRefs<HTMLDivElement>(hostRef, forwardedRef),
      [forwardedRef]
    );

    React.useEffect(() => {
      visibleSentRef.current = false;
    }, [index, children]);

    React.useEffect(() => {
      if (!onVisibleIndex) return;

      const host = hostRef.current;
      if (!host || visibleSentRef.current) return;

      const root = host.closest('[data-rmg-viewport="true"]') as Element | null;
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;

          visibleSentRef.current = true;
          onVisibleIndex(index);
          io.disconnect();
        },
        { root, rootMargin: "200px", threshold: 0.15 }
      );

      io.observe(host);
      return () => io.disconnect();
    }, [children, index, onVisibleIndex]);

    React.useLayoutEffect(() => {
      const host = hostRef.current;
      if (!host) return;

      const images = findTrackableImages(host);
      const primary = images[0] ?? null;
      const preparedImages = normalizedLazy.enabled ? images.map(prepareImage) : [];

      registerExpandableImage?.(index, primary);
      setHasTrackableImages(images.length > 0);

      if (!normalizedLazy.enabled || images.length === 0) {
        setReady(true);
        return () => {
          registerExpandableImage?.(index, null);
        };
      }

      images.forEach((img) => applyImageHints(img));

      setReady(false);
      let cancelled = false;
      let revealed = false;

      void (async () => {
        await Promise.all(images.map((img) => waitForImageDecode(img)));
        await nextFrame();

        if (cancelled) return;

        preparedImages.forEach(revealPreparedImage);
        revealed = true;
        setReady(true);
      })();

      return () => {
        cancelled = true;
        if (!revealed) {
          preparedImages.forEach(restorePreparedImage);
        }
        registerExpandableImage?.(index, null);
      };
    }, [children, index, normalizedLazy.enabled, registerExpandableImage]);

    const showSpinner =
      normalizedLazy.enabled &&
      hasTrackableImages &&
      !ready &&
      spinnerResolved.render;

    const spinnerClassName = [
      spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
      normalizedLazy.spinnerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const spinnerNode = showSpinner ? (
      spinnerResolved.isCustom ? (
        <div
          className={spinnerClassName}
          style={normalizedLazy.spinnerStyle}
          aria-hidden="true"
          data-rmg-spinner
        >
          {spinnerResolved.node}
        </div>
      ) : (
        <div
          className={spinnerClassName}
          style={normalizedLazy.spinnerStyle}
          aria-hidden="true"
          data-rmg-spinner
        />
      )
    ) : null;

    const ariaBusy =
      normalizedLazy.enabled && hasTrackableImages && !ready
        ? true
        : rest["aria-busy"];

    return (
      <div
        {...rest}
        ref={mergedRef}
        className={className}
        style={style}
        aria-busy={ariaBusy}
      >
        {children}
        {spinnerNode}
      </div>
    );
  }
);
