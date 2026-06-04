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
  findPrimaryTrackableImage,
  findTrackableImages,
} from "./imageLifecycle";
import {
  LAZY_LOADED_ATTR,
  LAZY_LOADING_ATTR,
  LAZY_ATTR,
  hydrateLazyImageShell,
  markLazyImageShell,
  restoreLazyImageShell,
  revealLazyImageShell,
  RMG_BLANK,
} from "./lazyShell";

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

type LazySpinnerAnchor = {
  top: string;
  left: string;
};

type RectLike = Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">;

function sameLazySpinnerAnchor(
  a: LazySpinnerAnchor | null,
  b: LazySpinnerAnchor | null
) {
  return a?.top === b?.top && a?.left === b?.left;
}

function isLazyBlockedElement(type: unknown, props: Record<string, unknown>) {
  if (typeof type !== "string") return false;
  if (type === "video" || type === "iframe") return true;
  if (props["data-rmg-plyr"] === true || props["data-rmg-plyr"] === "true") return true;

  const className = props.className;
  return typeof className === "string" && className.split(/\s+/).includes("plyr");
}

function prepareLazyImageElement(
  child: React.ReactElement<any>
): React.ReactElement<any> {
  const props = child.props ?? {};
  const src = typeof props.src === "string" ? props.src : undefined;
  const lazySrc =
    typeof props[LAZY_ATTR] === "string"
      ? props[LAZY_ATTR]
      : src && src !== RMG_BLANK
        ? src
        : undefined;

  if (!lazySrc) return child;

  return React.cloneElement(child, {
    [LAZY_ATTR]: lazySrc,
    src: RMG_BLANK,
    loading: props.loading ?? "lazy",
    decoding: props.decoding ?? "async",
    fetchPriority: props.fetchPriority ?? "low",
    style: {
      ...(props.style ?? {}),
      opacity: "0",
      transition: props.style?.transition ?? "opacity 280ms ease",
    },
  });
}

function prepareLazyChildren(
  children: React.ReactNode,
  blocked = false
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const type = child.type;
    const props = (child.props ?? {}) as Record<string, unknown>;

    if (!blocked && type === "img") {
      return prepareLazyImageElement(child as React.ReactElement<any>);
    }

    const nextBlocked = blocked || isLazyBlockedElement(type, props);
    if (!props.children) return child;

    return React.cloneElement(child as React.ReactElement<any>, {
      children: prepareLazyChildren(props.children as React.ReactNode, nextBlocked),
    });
  });
}

export function resolveLazySpinnerAnchor(args: {
  hostRect?: RectLike | null;
  imageRect?: RectLike | null;
}): LazySpinnerAnchor | null {
  const { hostRect, imageRect } = args;
  if (!hostRect || !imageRect) return null;
  if (hostRect.width <= 0 || hostRect.height <= 0) return null;
  if (imageRect.width <= 0 || imageRect.height <= 0) return null;

  const top = imageRect.top - hostRect.top + imageRect.height / 2;
  const left = imageRect.left - hostRect.left + imageRect.width / 2;

  if (!Number.isFinite(top) || !Number.isFinite(left)) return null;

  return {
    top: `${top}px`,
    left: `${left}px`,
  };
}

export function resolveLazySpinnerStyle(args: {
  isCustom: boolean;
  anchor: LazySpinnerAnchor | null;
  spinnerStyle?: React.CSSProperties;
}): React.CSSProperties | undefined {
  const { isCustom, anchor, spinnerStyle } = args;
  if (isCustom || !anchor) return spinnerStyle;
  return {
    ...anchor,
    ...(spinnerStyle ?? {}),
  };
}

export type LazyItemHostProps = React.HTMLAttributes<HTMLDivElement> & {
  index: number;
  lazyLoad?: GalleryLazyLoadOptions;
  onVisibleIndex?: (index: number) => void;
  registerExpandableImage?: (index: number, node: HTMLImageElement | null) => void;
  revealedIndicesRef?: React.RefObject<Set<number>>;
  resetKey?: React.Key;
};

export const LazyItemHost = React.forwardRef<HTMLDivElement, LazyItemHostProps>(
  function LazyItemHost(
    {
      index,
      lazyLoad,
      onVisibleIndex,
      registerExpandableImage,
      revealedIndicesRef,
      resetKey,
      children,
      className,
      style,
      ...rest
    },
    forwardedRef
  ) {
    const hostRef = React.useRef<HTMLDivElement | null>(null);
    const primaryImageRef = React.useRef<HTMLImageElement | null>(null);
    const [hasTrackableImages, setHasTrackableImages] = React.useState(false);
    const [ready, setReady] = React.useState(true);
    const [spinnerAnchor, setSpinnerAnchor] = React.useState<LazySpinnerAnchor | null>(null);
    const normalizedLazy = React.useMemo(() => normalizeLazyLoad(lazyLoad), [lazyLoad]);
    const visibleSentRef = React.useRef(false);
    const preparedChildren = React.useMemo(
      () => normalizedLazy.enabled ? prepareLazyChildren(children) : children,
      [children, normalizedLazy.enabled]
    );
    const resetSignal = resetKey ?? preparedChildren;

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
      primaryImageRef.current = null;
      setSpinnerAnchor(null);
    }, [index, resetSignal]);

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
    }, [resetSignal, index, onVisibleIndex]);

    React.useLayoutEffect(() => {
      const host = hostRef.current;
      if (!host) return;

      const images = findTrackableImages(host);
      const primary = images[0] ?? null;
      const alreadyRevealed = revealedIndicesRef?.current?.has(index) ?? false;

      primaryImageRef.current = primary;
      registerExpandableImage?.(index, primary);
      setHasTrackableImages(images.length > 0);

      if (!normalizedLazy.enabled || images.length === 0) {
        if (!normalizedLazy.enabled) restoreLazyImageShell(host);
        setSpinnerAnchor(null);
        setReady(true);
        return () => {
          primaryImageRef.current = null;
          registerExpandableImage?.(index, null);
        };
      }

      images.forEach((img) => applyImageHints(img));
      host.removeAttribute(LAZY_LOADING_ATTR);

      if (alreadyRevealed || host.getAttribute(LAZY_LOADED_ATTR) === "true") {
        hydrateLazyImageShell(host, {
          onRevealed: () => {
            revealedIndicesRef?.current?.add(index);
          },
        });
        setReady(true);
        return () => {
          primaryImageRef.current = null;
          registerExpandableImage?.(index, null);
        };
      }

      markLazyImageShell(host);
      setReady(false);
      let cancelled = false;
      let observer: IntersectionObserver | null = null;

      const reveal = async () => {
        if (cancelled) return;
        if (host.getAttribute(LAZY_LOADED_ATTR) === "true") {
          revealedIndicesRef?.current?.add(index);
          setReady(true);
          return;
        }
        if (host.getAttribute(LAZY_LOADING_ATTR) === "true") return;

        host.setAttribute(LAZY_LOADING_ATTR, "true");
        try {
          await revealLazyImageShell(host, {
            onRevealed: () => {
              revealedIndicesRef?.current?.add(index);
            },
            shouldAbort: () => cancelled || hostRef.current !== host,
          });

          if (!cancelled && hostRef.current === host) {
            setReady(true);
          }
        } finally {
          host.removeAttribute(LAZY_LOADING_ATTR);
        }
      };

      if (typeof IntersectionObserver === "undefined") {
        void reveal();
      } else {
        const root = host.closest('[data-rmg-viewport="true"]') as Element | null;
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting || entry.intersectionRatio < 0.25) continue;
              observer?.disconnect();
              observer = null;
              void reveal();
              break;
            }
          },
          {
            root,
            rootMargin: "0px",
            threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
          }
        );
        observer.observe(host);
      }

      return () => {
        cancelled = true;
        observer?.disconnect();
        primaryImageRef.current = null;
        registerExpandableImage?.(index, null);
      };
    }, [resetSignal, index, normalizedLazy.enabled, registerExpandableImage, revealedIndicesRef]);

    React.useLayoutEffect(() => {
      if (!normalizedLazy.enabled || spinnerResolved.isCustom) {
        setSpinnerAnchor(null);
        return;
      }

      const host = hostRef.current;
      const primary = primaryImageRef.current ?? findPrimaryTrackableImage(host);
      if (!host || !primary) {
        setSpinnerAnchor(null);
        return;
      }

      primaryImageRef.current = primary;

      let rafId: number | null = null;

      const measure = () => {
        const next = resolveLazySpinnerAnchor({
          hostRect: host.getBoundingClientRect(),
          imageRect: primary.getBoundingClientRect(),
        });

        setSpinnerAnchor((prev) => (sameLazySpinnerAnchor(prev, next) ? prev : next));
      };

      const scheduleMeasure = () => {
        if (typeof requestAnimationFrame !== "function") {
          measure();
          return;
        }

        if (rafId != null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          rafId = null;
          measure();
        });
      };

      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(() => {
              scheduleMeasure();
            });

      resizeObserver?.observe(host);
      resizeObserver?.observe(primary);

      primary.addEventListener("load", scheduleMeasure);
      primary.addEventListener("error", scheduleMeasure);
      window.addEventListener("resize", scheduleMeasure, { passive: true });
      window.visualViewport?.addEventListener("resize", scheduleMeasure);

      measure();
      scheduleMeasure();

      return () => {
        if (rafId != null && typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(rafId);
        }
        resizeObserver?.disconnect();
        primary.removeEventListener("load", scheduleMeasure);
        primary.removeEventListener("error", scheduleMeasure);
        window.removeEventListener("resize", scheduleMeasure);
        window.visualViewport?.removeEventListener("resize", scheduleMeasure);
      };
    }, [resetSignal, index, normalizedLazy.enabled, spinnerResolved.isCustom]);

    const spinnerAnchorReady = spinnerResolved.isCustom || spinnerAnchor != null;

    const shouldRenderSpinner =
      normalizedLazy.enabled &&
      hasTrackableImages &&
      spinnerResolved.render &&
      spinnerAnchorReady;

    const showSpinner =
      shouldRenderSpinner &&
      !ready;

    const spinnerClassName = [
      spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
      normalizedLazy.spinnerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const spinnerStyle = React.useMemo(
      () => {
        const baseStyle = resolveLazySpinnerStyle({
          isCustom: spinnerResolved.isCustom,
          anchor: spinnerAnchor,
          spinnerStyle: normalizedLazy.spinnerStyle,
        });

        if (!showSpinner) return baseStyle;

        return {
          ...baseStyle,
          opacity: 1,
          visibility: "visible",
        };
      },
      [
        normalizedLazy.spinnerStyle,
        showSpinner,
        spinnerAnchor,
        spinnerResolved.isCustom,
      ]
    );

    const spinnerNode = shouldRenderSpinner ? (
      spinnerResolved.isCustom ? (
        <div
          className={spinnerClassName}
          style={spinnerStyle}
          aria-hidden="true"
          data-rmg-spinner
        >
          {spinnerResolved.node}
        </div>
      ) : (
        <div
          className={spinnerClassName}
          style={spinnerStyle}
          aria-hidden="true"
          data-rmg-spinner
        />
      )
    ) : null;

    const ariaBusy =
      normalizedLazy.enabled &&
      hasTrackableImages &&
      !ready
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
        {preparedChildren}
        {spinnerNode}
      </div>
    );
  }
);
