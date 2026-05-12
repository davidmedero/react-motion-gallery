"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  LAZY_ATTR,
  LAZY_LOADED_ATTR,
  LAZY_LOADING_ATTR,
  LAZY_NESTED_IMAGE_ATTR,
  hydrateLazyImageShell,
  markLazyImageShell,
  revealLazyImageShell,
  RMG_BLANK,
} from "../../shared/lazy/lazyShell";
import styles from "../Slider.module.css";
import type { SliderLazyLoadOptions, SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

const INITIAL_LAZY_READY_TIMEOUT_MS = 4000;

function getRenderedSlideNodes(handle: NonNullable<SliderPluginRuntimeProps["host"]["handle"]>) {
  const container = handle.getContainerNode();
  if (!container) return handle.getSlideNodes();

  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-rmg-slide="true"]')
  );
}

function sameNodes(a: HTMLElement[], b: HTMLElement[]) {
  return a.length === b.length && a.every((node, index) => node === b[index]);
}

function detectSlideKind(slide: HTMLElement): "image" | "video" {
  const explicit = slide.getAttribute("data-rmg-kind");
  if (explicit === "video") return "video";
  if (slide.querySelector(".plyr")) return "video";
  if (slide.querySelector('[data-rmg-video-snapshot="true"]')) return "video";
  if (slide.querySelector("video, iframe")) return "video";
  if (slide.querySelector("[data-plyr-provider], [data-plyr-embed-id]")) return "video";
  return "image";
}

function resolveSpinnerNode(
  lazy: SliderLazyLoadOptions,
  args: { kind: "image" | "video"; isClone: boolean }
): { render: boolean; node: React.ReactNode | null; isCustom: boolean } {
  const spinner = lazy.spinner ?? true;
  if (spinner === false) return { render: false, node: null, isCustom: false };
  if (typeof spinner === "function") {
    return { render: true, node: spinner(args), isCustom: true };
  }
  if (spinner === true || spinner == null) {
    return { render: true, node: null, isCustom: false };
  }
  return { render: true, node: spinner, isCustom: true };
}

function parseSlideIndex(slide: HTMLElement) {
  const raw = slide.getAttribute("data-rmg-idx");
  const index = raw == null ? NaN : Number.parseInt(raw, 10);
  return Number.isFinite(index) ? index : null;
}

function isSlideLoaded(slide: HTMLElement) {
  return slide.getAttribute(LAZY_LOADED_ATTR) === "true";
}

function isSlideLoading(slide: HTMLElement) {
  return slide.getAttribute(LAZY_LOADING_ATTR) === "true";
}

function rememberRevealedCanonical(slide: HTMLElement, revealedCanonicals: Set<number>) {
  const index = parseSlideIndex(slide);
  if (index == null) return;
  revealedCanonicals.add(index);
}

function getSlidesForCanonicalIndex(track: HTMLElement, canonicalIndex: number) {
  return Array.from(track.children).filter((child): child is HTMLElement => {
    if (!(child instanceof HTMLElement)) return false;
    return (
      child.getAttribute("data-rmg-slide") === "true" &&
      parseSlideIndex(child) === canonicalIndex
    );
  });
}

function hasPendingLazySlides(track: HTMLElement, canonicalIndices: number[]) {
  return canonicalIndices.some((index) =>
    getSlidesForCanonicalIndex(track, index).some(
      (slide) => slide.hasAttribute("data-rmg-lazyload") && !isSlideLoaded(slide)
    )
  );
}

function waitForLazySlidesReady(
  track: HTMLElement,
  canonicalIndices: number[],
  shouldAbort: () => boolean
) {
  return new Promise<void>((resolve) => {
    const startedAt =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    let raf: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clear = () => {
      if (raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(raf);
      }
      if (timer != null) clearTimeout(timer);
      raf = null;
      timer = null;
    };

    const schedule = () => {
      if (typeof requestAnimationFrame === "function") {
        raf = requestAnimationFrame(check);
        return;
      }
      timer = setTimeout(check, 16);
    };

    const check = () => {
      raf = null;
      timer = null;
      if (shouldAbort()) {
        clear();
        resolve();
        return;
      }

      const now =
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Date.now();

      if (
        !hasPendingLazySlides(track, canonicalIndices) ||
        now - startedAt >= INITIAL_LAZY_READY_TIMEOUT_MS
      ) {
        clear();
        resolve();
        return;
      }

      schedule();
    };

    check();
  });
}

function getVisibleCanonicalIndices(
  handle: NonNullable<SliderPluginRuntimeProps["host"]["handle"]>,
  slideNodes: HTMLElement[]
) {
  const ordered = new Set<number>();

  try {
    handle.cellsInView().forEach((index) => {
      if (Number.isFinite(index)) ordered.add(index);
    });
  } catch {
    // fall through to DOM-derived fallback below
  }

  if (ordered.size === 0) {
    const first = slideNodes.find((slide) => slide.getAttribute("data-rmg-clone") !== "true");
    const fallback = first ? parseSlideIndex(first) : null;
    if (fallback != null) ordered.add(fallback);
  }

  return Array.from(ordered);
}

function hydrateRevealedSlide(slide: HTMLElement, revealedCanonicals: Set<number>) {
  hydrateLazyImageShell(slide, {
    onRevealed: () => rememberRevealedCanonical(slide, revealedCanonicals),
  });
}

async function revealSlide(slide: HTMLElement, revealedCanonicals: Set<number>) {
  await revealLazyImageShell(slide, {
    shouldAbort: () => !slide.isConnected,
    onRevealed: () => rememberRevealedCanonical(slide, revealedCanonicals),
  });
}

async function revealCanonicalSlides(
  track: HTMLElement,
  canonicalIndex: number,
  revealedCanonicals: Set<number>
) {
  const slides = getSlidesForCanonicalIndex(track, canonicalIndex);
  if (!slides.length) return;

  const pending = slides.filter(
    (slide) => slide.hasAttribute("data-rmg-lazyload") && !isSlideLoaded(slide)
  );

  if (!pending.length) return;

  await Promise.all(
    pending.map(async (slide) => {
      if (isSlideLoading(slide)) return;

      slide.setAttribute(LAZY_LOADING_ATTR, "true");
      try {
        await revealSlide(slide, revealedCanonicals);
      } finally {
        slide.removeAttribute(LAZY_LOADING_ATTR);
      }
    })
  );
}

function styleWithHiddenLazyImage(style: React.CSSProperties | undefined) {
  return {
    ...style,
    opacity: style?.opacity ?? 0,
    transition: style?.transition ?? "opacity 280ms ease",
  };
}

function getComponentName(type: React.ElementType) {
  if (typeof type === "string") return type;
  return (type as { displayName?: string; name?: string }).displayName ??
    (type as { name?: string }).name ??
    "";
}

function shouldProxyCustomImageSrc(element: React.ReactElement<any>) {
  if (typeof element.type === "string") return false;
  if (typeof element.props?.src !== "string") return false;
  if (!element.props.src || element.props.src === RMG_BLANK) return false;

  const name = getComponentName(element.type).toLowerCase();
  if (name.includes("video") || name.includes("player") || name.includes("plyr")) {
    return false;
  }

  return true;
}

function transformNode(node: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(node)) return node;
  const element = node as React.ReactElement<any>;
  if (typeof element.type === "string") {
    const type = element.type.toLowerCase();
    if (type === "img") {
      const src = element.props.src;
      const lazySrc = element.props[LAZY_ATTR] ?? src;
      return React.cloneElement(element, {
        src: lazySrc ? RMG_BLANK : src,
        [LAZY_ATTR]: lazySrc,
        loading: element.props.loading ?? "lazy",
        decoding: element.props.decoding ?? "async",
        style: styleWithHiddenLazyImage(element.props.style),
      });
    }
    if (type === "video") {
      return React.cloneElement(element, {
        preload: element.props.preload ?? "metadata",
      });
    }
  }

  if (shouldProxyCustomImageSrc(element)) {
    const src = element.props.src;
    const lazyProxyProps = {
      [LAZY_ATTR]: src,
      [LAZY_NESTED_IMAGE_ATTR]: "true",
    };
    return (
      <span
        data-rmg-lazy-custom-src-proxy="true"
        {...lazyProxyProps}
        style={{ display: "contents" }}
      >
        {React.cloneElement(element, { src: RMG_BLANK })}
      </span>
    );
  }

  const children = element.props?.children;
  if (children == null) return element;
  return React.cloneElement(element, {
    children: React.Children.map(children, transformNode),
  });
}

function LazyLoadRuntime({
  host,
  options = {},
}: SliderPluginRuntimeProps & { options?: unknown }) {
  const lazyOptions = options as SliderLazyLoadOptions;
  const revealedCanonicalsRef = React.useRef(new Set<number>());
  const [slideNodes, setSlideNodes] = React.useState<HTMLElement[]>([]);
  const setReadyRef = React.useRef(host.setPluginReady);
  const handle = host.handle;
  const handledByCore = handle?._usesLegacyEngine === true;
  const layoutReady = host.coreReady;

  React.useEffect(() => {
    setReadyRef.current = host.setPluginReady;
  }, [host.setPluginReady]);

  const syncSlideNodes = React.useCallback(() => {
    if (!handle || handledByCore) {
      setSlideNodes([]);
      return;
    }

    const next = getRenderedSlideNodes(handle);
    setSlideNodes((prev) => (sameNodes(prev, next) ? prev : next));
  }, [handle, handledByCore]);

  React.useLayoutEffect(() => {
    syncSlideNodes();
    if (!handle || handledByCore) return;

    const unsubscribe = handle.onSlidesBuilt(syncSlideNodes);
    const raf =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame(syncSlideNodes)
        : null;

    return () => {
      unsubscribe();
      if (raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(raf);
      }
    };
  }, [handle, handledByCore, host.slideCount, syncSlideNodes]);

  React.useLayoutEffect(() => {
    if (!slideNodes.length || handledByCore) return;
    const revealedCanonicals = revealedCanonicalsRef.current;

    slideNodes.forEach((slide) => {
      const kind = detectSlideKind(slide);
      if (slide.getAttribute("data-rmg-kind") !== kind) {
        slide.setAttribute("data-rmg-kind", kind);
      }

      const index = parseSlideIndex(slide);
      if (index != null && revealedCanonicals.has(index)) {
        hydrateRevealedSlide(slide, revealedCanonicals);
        return;
      }

      if (isSlideLoaded(slide)) {
        rememberRevealedCanonical(slide, revealedCanonicals);
        return;
      }

      markLazyImageShell(slide);
    });
  }, [handledByCore, slideNodes]);

  React.useEffect(() => {
    if (handledByCore) {
      setReadyRef.current(true);
      return;
    }

    if (!handle || !layoutReady) {
      setReadyRef.current(false);
      return;
    }

    const track = handle.getContainerNode();
    if (!track || !slideNodes.length) {
      setReadyRef.current(true);
      return;
    }

    let cancelled = false;
    const revealedCanonicals = revealedCanonicalsRef.current;
    const visibleIndices = getVisibleCanonicalIndices(handle, slideNodes);
    const pending = visibleIndices.some((index) =>
      getSlidesForCanonicalIndex(track, index).some(
        (slide) => slide.hasAttribute("data-rmg-lazyload") && !isSlideLoaded(slide)
      )
    );

    if (!pending) {
      setReadyRef.current(true);
      return;
    }

    setReadyRef.current(false);
    void Promise.all(
      visibleIndices.map((index) => revealCanonicalSlides(track, index, revealedCanonicals))
    )
      .then(() => waitForLazySlidesReady(track, visibleIndices, () => cancelled))
      .finally(() => {
        if (!cancelled) setReadyRef.current(true);
      });

    return () => {
      cancelled = true;
    };
  }, [handle, handledByCore, host.slideCount, layoutReady, slideNodes]);

  React.useEffect(() => {
    if (!handle || handledByCore) return;
    if (!layoutReady) return;
    if (!slideNodes.length) return;
    const root = handle.getViewportNode();
    const track = handle.getContainerNode();
    if (!root || !track) return;

    const slidesToObserve = slideNodes.filter((slide) =>
      slide.hasAttribute("data-rmg-lazyload")
    );
    if (!slidesToObserve.length) return;

    const revealedCanonicals = revealedCanonicalsRef.current;

    if (typeof IntersectionObserver === "undefined") {
      slidesToObserve.forEach((slide) => {
        const index = parseSlideIndex(slide);
        if (index != null) {
          void revealCanonicalSlides(track, index, revealedCanonicals);
          return;
        }

        if (isSlideLoading(slide) || isSlideLoaded(slide)) return;
        slide.setAttribute(LAZY_LOADING_ATTR, "true");
        void revealSlide(slide, revealedCanonicals).finally(() => {
          slide.removeAttribute(LAZY_LOADING_ATTR);
        });
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slide = entry.target as HTMLElement;

          if (isSlideLoaded(slide)) {
            io.unobserve(slide);
            continue;
          }

          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) continue;

          const index = parseSlideIndex(slide);
          if (index != null) {
            void revealCanonicalSlides(track, index, revealedCanonicals);
          } else if (!isSlideLoading(slide)) {
            slide.setAttribute(LAZY_LOADING_ATTR, "true");
            void revealSlide(slide, revealedCanonicals).finally(() => {
              slide.removeAttribute(LAZY_LOADING_ATTR);
            });
          }

          io.unobserve(slide);
        }
      },
      {
        root,
        rootMargin: "0px",
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
      }
    );

    slidesToObserve.forEach((slide) => io.observe(slide));

    return () => io.disconnect();
  }, [handle, handledByCore, host.slideCount, layoutReady, slideNodes]);

  if (!slideNodes.length || handledByCore) return null;

  return (
    <>
      {slideNodes.map((slide, portalIndex) => {
        const isClone = slide.getAttribute("data-rmg-clone") === "true";
        const spinner = resolveSpinnerNode(lazyOptions, {
          kind: detectSlideKind(slide),
          isClone,
        });

        if (!spinner.render) return null;

        const className = [
          spinner.isCustom ? styles.spinnerWrap : styles.spinner,
          lazyOptions.spinnerClassName,
        ]
          .filter(Boolean)
          .join(" ");

        return createPortal(
          spinner.isCustom ? (
            <div
              key="rmg-lazy-spinner"
              data-rmg-spinner
              className={className}
              style={lazyOptions.spinnerStyle}
              aria-hidden="true"
            >
              {spinner.node}
            </div>
          ) : (
            <div
              key="rmg-lazy-spinner"
              data-rmg-spinner
              className={className}
              style={lazyOptions.spinnerStyle}
              aria-hidden="true"
            />
          ),
          slide,
          `rmg-slider-lazy-spinner-${portalIndex}`
        );
      })}
    </>
  );
}

export function sliderLazyLoad(options: SliderLazyLoadOptions = {}) {
  return createSliderPlugin("lazy-load", {
    options,
    blocksReady: options.enabled !== false,
    transformChildren:
      options.enabled === false
        ? undefined
        : lazyLoadChildren,
    Runtime:
      options.enabled === false
        ? undefined
        : LazyLoadRuntime,
  });
}

function lazyLoadChildren(children: React.ReactNode) {
  return React.Children.map(children, transformNode);
}

export type { SliderLazyLoadOptions };
