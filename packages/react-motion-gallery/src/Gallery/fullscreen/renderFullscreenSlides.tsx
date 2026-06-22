"use client";

import * as React from "react";
import type { APITypes } from "../video/plyrTypes";
import { bindEmbedReady, detectProvider, PlyrProp } from "../video/plyr";
import { VideoCloneSnapshot } from "../video/VideoCloneSnapshot";
import { Plyr } from "../video/LazyPlyr";
import { MediaItem } from "../shared/types/media";
import {
  FsCaptionPlacement,
  FsCaptionRenderArgs,
  FullscreenLazyLoadOptions,
  FullscreenLazyLoadConfig,
} from "./types";
import type { FullscreenCaptionZoomMotion } from "./captionZoomMotion";
import styles from "./Fullscreen.module.css";
import type { VideoSnapshotStore } from "../video/videoSnapshotStore";
import { installDragClickSwallower } from "../video/plyrGuards";
import {
  applyImageHints,
  findPrimaryTrackableImage,
  nextFrame,
  prepareImage,
  readResolvedImageSrc,
  restorePreparedImage,
  revealPreparedImage,
  waitForImageDecode,
} from "../shared/lazy/imageLifecycle";
import {
  BREAKPOINT_MAP,
  BreakpointMap,
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
  ResponsiveCaptionPlacement,
  ResponsiveLength,
} from "../shared/responsive";
import { readViewportWidth } from "../shared/hooks/useViewportWidth";
import {
  shouldHydrateFullscreenSlide,
  updateFullscreenCellRef,
} from "./slideWindow";

type ResolvedPlyrOptions = NonNullable<PlyrProp>["options"];
export type RenderFullscreenSlidesMode = "track" | "crossfade";

type RenderFullscreenSlidesArgs = {
  items: MediaItem[];
  plyrList: PlyrProp[];
  getTransform: (index: number) => string;
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
  playerRefs: React.RefObject<(APITypes | null)[]>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  isZoomed: boolean;
  showFullscreenSlider: boolean;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;
  onPanPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onHoverPointerEnter?: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onHoverPointerMove?: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onHoverPointerLeave?: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onSuppressNextClickCapture: (e: React.SyntheticEvent) => void;
  renderCaption?: (args: FsCaptionRenderArgs) => React.ReactNode;
  captionClassName?: string;
  captionStyle?: React.CSSProperties;
  captionZoomMotion?: FullscreenCaptionZoomMotion;
  fsCaptionPlacement?: ResponsiveCaptionPlacement;
  fsCaptionWidth?: ResponsiveLength;
  fsCaptionHeight?: ResponsiveLength;
  fsCaptionBreakpoint?: number;
  fsCaptionLayout?: "overlay" | "slide";
  fsViewportOverlayPlacement?: ResponsiveCaptionPlacement;
  fsViewportOverlayWidth?: ResponsiveLength;
  fsViewportOverlayHeight?: ResponsiveLength;
  fsViewportOverlayBreakpoint?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  breakpointMap?: BreakpointMap;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
  styles: {
    imgMargin: string;
    fullscreenImages: string;
  };
  renderImage?: (args: {
    item: Extract<MediaItem, { kind: "image" }>;
    index: number;
    isZoomed: boolean;
    className: string;
    baseStyle: React.CSSProperties;
  }) => React.ReactNode;
  fsLazy?: FullscreenLazyLoadOptions;
  fsLazyAllowedImagesRef?: React.RefObject<Set<number>>;
  fsLazyListenersImagesRef?: React.RefObject<Set<() => void>>;
  fsLazyAllowedVideosRef?: React.RefObject<Set<number>>;
  fsLazyListenersVideosRef?: React.RefObject<Set<() => void>>;
  canonicalLength?: number;
  activeCanonicalIndex?: number | null;
  openingCanonicalIndex?: number | null;
  openingInProgress?: boolean;
  deferLiveVideoUntilVisible?: boolean;
  fsDecodedImagesRef: React.RefObject<Set<string>>;
  fsCustomDecodedImagesRef: React.RefObject<Set<string>>;
  fsCustomResolvedSrcByKeyRef: React.RefObject<Map<string, string>>;
  fsPreparedVideosRef: React.RefObject<Set<string>>;
  videoSnapshotStore?: VideoSnapshotStore;
  getMediaKey: (item: MediaItem) => string;
  renderMode?: RenderFullscreenSlidesMode;
};

function subtractReservedSpace(base: string, reservedPx: number): string {
  if (!(reservedPx > 0)) return base;
  return `calc(${base} - ${reservedPx}px)`;
}

export function shouldUseFsStaticVideoPreview(args: {
  isClone: boolean;
  renderMode?: RenderFullscreenSlidesMode;
}) {
  return args.isClone || args.renderMode === "crossfade";
}

export function shouldUseFsStaticInactiveVideo(args: {
  activeCanonicalIndex?: number | null;
  canonicalIndex: number;
  lazyAllowed?: boolean;
  lazyEnabled: boolean;
  liveReady: boolean;
}) {
  return (
    args.lazyEnabled &&
    !args.liveReady &&
    !args.lazyAllowed &&
    args.activeCanonicalIndex != null &&
    args.canonicalIndex !== args.activeCanonicalIndex
  );
}

function isWrappedItems(itemsLen: number, canonicalLen: number) {
  return canonicalLen > 1 && itemsLen === canonicalLen + 2;
}

function toCanonicalIndex(
  renderedIndex: number,
  itemsLen: number,
  canonicalLen: number
) {
  if (!isWrappedItems(itemsLen, canonicalLen)) {
    const len = canonicalLen || itemsLen || 1;
    return ((renderedIndex % len) + len) % len;
  }

  if (renderedIndex === 0) return canonicalLen - 1;
  if (renderedIndex === itemsLen - 1) return 0;
  return renderedIndex - 1;
}

function isCloneIndex(
  renderedIndex: number,
  itemsLen: number,
  canonicalLen: number
) {
  return (
    isWrappedItems(itemsLen, canonicalLen) &&
    (renderedIndex === 0 || renderedIndex === itemsLen - 1)
  );
}

function resolveFsSpinnerNode<K extends "image" | "video">(
  spinner: FullscreenLazyLoadConfig["spinner"] | undefined,
  args: { kind: K; isClone?: boolean }
): { render: boolean; node: React.ReactNode | null; isCustom: boolean } {
  if (spinner === false) return { render: false, node: null, isCustom: false };
  if (typeof spinner === "function")
    return { render: true, node: spinner(args as any), isCustom: true };
  if (spinner === true || spinner == null)
    return { render: true, node: null, isCustom: false };
  return { render: true, node: spinner, isCustom: true };
}

function setPlayerVisible(
  playerEl: HTMLElement | null,
  visible: boolean,
  interactive = visible
) {
  if (!playerEl) return;
  playerEl.style.opacity = visible ? "1" : "0";
  playerEl.style.visibility = visible ? "visible" : "hidden";
  playerEl.style.pointerEvents = interactive ? "auto" : "none";
}

function showSpinnerEl(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  spinnerEl.style.setProperty("opacity", "1", "important");
  spinnerEl.style.setProperty("visibility", "visible", "important");
  spinnerEl.style.setProperty("pointer-events", "none", "important");
}

function hideSpinnerEl(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  spinnerEl.style.setProperty("opacity", "0", "important");
  spinnerEl.style.setProperty("visibility", "hidden", "important");
  spinnerEl.style.setProperty("pointer-events", "none", "important");
}

function pauseApi(api: APITypes | null) {
  if (!api) return;

  try {
    (api as any)?.pause?.();
  } catch {}

  const plyr = (api as any)?.plyr ?? null;

  try {
    plyr?.pause?.();
  } catch {}

  try {
    const media: HTMLMediaElement | undefined = plyr?.media;
    media?.pause?.();
  } catch {}
}

function parsePlyrRatio(r: unknown): number | null {
  if (typeof r === "number" && Number.isFinite(r) && r > 0) return r;

  if (typeof r === "string") {
    const s = r.trim();
    const mColon = s.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (mColon) {
      const w = parseFloat(mColon[1]);
      const h = parseFloat(mColon[2]);
      if (w > 0 && h > 0) return w / h;
    }

    const mSlash = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (mSlash) {
      const w = parseFloat(mSlash[1]);
      const h = parseFloat(mSlash[2]);
      if (w > 0 && h > 0) return w / h;
    }

    const asNum = Number(s);
    if (Number.isFinite(asNum) && asNum > 0) return asNum;
  }

  if (typeof r === "object" && r) {
    const w = (r as any).w ?? (r as any).width;
    const h = (r as any).h ?? (r as any).height;
    if (typeof w === "number" && typeof h === "number" && w > 0 && h > 0) {
      return w / h;
    }
  }

  return null;
}

function resolveVideoPoster(item: Extract<MediaItem, { kind: "video" }>, plyr: PlyrProp): string | undefined {
  const poster = (plyr?.source as any)?.poster ?? (item as any).poster ?? (item as any).thumb;
  return typeof poster === "string" && poster ? poster : undefined;
}

function resolveVideoSrc(item: Extract<MediaItem, { kind: "video" }>, plyr: PlyrProp): string {
  const sourceSrc = (plyr?.source as any)?.sources?.[0]?.src;
  const src = sourceSrc ?? (item as any).src ?? "";
  return typeof src === "string" ? src : String(src ?? "");
}

function isCrossOriginMediaUrl(src: string) {
  if (typeof window === "undefined") return false;

  try {
    const url = new URL(src, window.location.href);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function withSnapshotCrossoriginOptions(
  options: ResolvedPlyrOptions | undefined,
  forceCrossorigin: boolean
): ResolvedPlyrOptions | undefined {
  if (!forceCrossorigin) return options;
  const base = (options ?? {}) as any;
  if (base.crossorigin != null) return base;
  return {
    ...base,
    crossorigin: true,
  } as any;
}

function FsLazyCustomImageContent(props: {
  item: Extract<MediaItem, { kind: "image" }>;
  renderedIndex: number;
  canonicalIndex: number;
  activeCanonicalIndex?: number | null;
  isClone: boolean;
  openingCanonicalIndex?: number | null;
  openingInProgress?: boolean;
  isZoomed: boolean;
  className: string;
  baseStyle: React.CSSProperties;
  renderImage: NonNullable<RenderFullscreenSlidesArgs["renderImage"]>;
  fsLazy: FullscreenLazyLoadConfig;
  fsLazyAllowedRef?: React.RefObject<Set<number>>;
  fsLazyListenersRef?: React.RefObject<Set<() => void>>;
  fsCustomDecodedImagesRef: React.RefObject<Set<string>>;
  fsCustomResolvedSrcByKeyRef: React.RefObject<Map<string, string>>;
  getMediaKey: (item: MediaItem) => string;
}) {
  const {
    item,
    renderedIndex,
    canonicalIndex,
    activeCanonicalIndex,
    isClone,
    openingCanonicalIndex,
    openingInProgress,
    isZoomed,
    className,
    baseStyle,
    renderImage,
    fsLazy,
    fsLazyAllowedRef,
    fsLazyListenersRef,
    fsCustomDecodedImagesRef,
    fsCustomResolvedSrcByKeyRef,
    getMediaKey,
  } = props;

  const key = React.useMemo(() => getMediaKey(item), [
    getMediaKey,
    item,
    (item as any).src,
    (item as any).srcSet,
    (item as any).sizes,
  ]);

  const seenBefore = fsCustomDecodedImagesRef.current.has(key);
  const cachedResolvedSrc = fsCustomResolvedSrcByKeyRef.current.get(key) ?? "";
  const isOpeningTarget =
    !!openingInProgress &&
    !isClone &&
    openingCanonicalIndex === canonicalIndex;

  const computeAllowed = React.useCallback(() => {
    if (isOpeningTarget) return true;
    if (seenBefore) return true;
    return !!fsLazyAllowedRef?.current?.has(canonicalIndex);
  }, [isOpeningTarget, seenBefore, fsLazyAllowedRef, canonicalIndex]);

  const [mountRenderer, setMountRenderer] = React.useState<boolean>(() => computeAllowed());

  const hostRef = React.useRef<HTMLSpanElement | null>(null);
  const spinnerRef = React.useRef<HTMLDivElement | null>(null);

  const showSpinner = React.useCallback((show: boolean) => {
    const sp = spinnerRef.current;
    if (!sp) return;
    if (show) showSpinnerEl(sp);
    else hideSpinnerEl(sp);
  }, []);

  const spinnerResolved = React.useMemo(() => {
    return resolveFsSpinnerNode(fsLazy.spinner, { kind: "image", isClone });
  }, [fsLazy.spinner, isClone]);

  const spinnerClassName = React.useMemo(() => {
    return [
      spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
      fsLazy.spinnerClassName,
    ]
      .filter(Boolean)
      .join(" ");
  }, [spinnerResolved.isCustom, fsLazy.spinnerClassName]);

  const spinnerEl = spinnerResolved.render ? (
    spinnerResolved.isCustom ? (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy.spinnerStyle}
        data-rmg-image-spinner
      >
        {spinnerResolved.node}
      </div>
    ) : (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy.spinnerStyle}
        data-rmg-image-spinner
      />
    )
  ) : null;

  React.useEffect(() => {
    if (computeAllowed()) {
      setMountRenderer(true);
      return;
    }

    setMountRenderer(false);

    const cb = () => {
      if (!computeAllowed()) return;
      setMountRenderer(true);
      fsLazyListenersRef?.current?.delete(cb);
    };

    fsLazyListenersRef?.current?.add(cb);

    return () => {
      fsLazyListenersRef?.current?.delete(cb);
    };
  }, [computeAllowed, fsLazyListenersRef, key]);

  React.useLayoutEffect(() => {
    if (!mountRenderer) {
      showSpinner(true);
      return;
    }

    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let revealed = false;
    let timedOut = false;
    let observer: MutationObserver | null = null;
    let timeoutId = 0;
    let activeImg: HTMLImageElement | null = null;
    let prepared: ReturnType<typeof prepareImage> | null = null;

    const cleanupPrepared = () => {
      if (!prepared || revealed) return;
      restorePreparedImage(prepared);
      prepared = null;
    };

    const finish = (img: HTMLImageElement | null, markReady: boolean) => {
      if (cancelled) return;

      cleanupPrepared();
      showSpinner(false);

      if (markReady && img?.naturalWidth) {
        fsCustomDecodedImagesRef.current.add(key);
        const resolvedSrc = readResolvedImageSrc(img);
        if (resolvedSrc) {
          fsCustomResolvedSrcByKeyRef.current.set(key, resolvedSrc);
        }
      }
    };

    const manageImage = async (img: HTMLImageElement) => {
      if (cancelled || timedOut) return;
      if (activeImg === img) return;

      activeImg = img;
      applyImageHints(img, { eager: isOpeningTarget });

      const resolvedSrc = readResolvedImageSrc(img);
      const reuseDecodedImage =
        seenBefore &&
        !!cachedResolvedSrc &&
        resolvedSrc === cachedResolvedSrc &&
        img.complete &&
        img.naturalWidth > 0;

      if (reuseDecodedImage) {
        finish(img, false);
        return;
      }

      prepared = prepareImage(img);
      showSpinner(true);

      await waitForImageDecode(img).catch(() => {});
      await nextFrame();

      if (cancelled || timedOut || !prepared) return;

      revealPreparedImage(prepared);
      revealed = true;
      prepared = null;

      finish(img, img.naturalWidth > 0);
    };

    const tryFindPrimaryImage = () => {
      const primaryImg = findPrimaryTrackableImage(host);
      if (!primaryImg) return false;

      observer?.disconnect();
      observer = null;
      if (timeoutId) window.clearTimeout(timeoutId);
      void manageImage(primaryImg);
      return true;
    };

    showSpinner(true);

    if (!tryFindPrimaryImage()) {
      observer = new MutationObserver(() => {
        tryFindPrimaryImage();
      });
      observer.observe(host, { childList: true, subtree: true });

      timeoutId = window.setTimeout(() => {
        timedOut = true;
        observer?.disconnect();
        observer = null;
        cleanupPrepared();
        showSpinner(false);
      }, 1000);
    }

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      observer?.disconnect();
      cleanupPrepared();
    };
  }, [
    mountRenderer,
    showSpinner,
    key,
    isOpeningTarget,
    seenBefore,
    cachedResolvedSrc,
    fsCustomDecodedImagesRef,
    fsCustomResolvedSrcByKeyRef,
  ]);

  return (
    <>
      {mountRenderer ? (
        <span ref={hostRef} style={{ display: "contents" }} data-rmg-fs-custom-image-host="true">
          {renderImage({
            item,
            index: renderedIndex,
            isZoomed,
            className,
            baseStyle,
          }) as any}
        </span>
      ) : null}
      {spinnerEl}
    </>
  );
}

function FsImageContent(props: {
  item: Extract<MediaItem, { kind: "image" }>;
  renderedIndex: number;
  canonicalIndex: number;
  isClone: boolean;
  openingCanonicalIndex?: number | null;
  openingInProgress?: boolean;
  isZoomed: boolean;
  className: string;
  baseStyle: React.CSSProperties;
  renderImage?: RenderFullscreenSlidesArgs["renderImage"];
  fsLazy?: FullscreenLazyLoadConfig;
  fsLazyAllowedRef?: React.RefObject<Set<number>>;
  fsLazyListenersRef?: React.RefObject<Set<() => void>>;
  fsDecodedImagesRef: React.RefObject<Set<string>>;
  fsCustomDecodedImagesRef: React.RefObject<Set<string>>;
  fsCustomResolvedSrcByKeyRef: React.RefObject<Map<string, string>>;
  getMediaKey: (item: MediaItem) => string;
}) {
  const {
    item,
    renderedIndex,
    canonicalIndex,
    isClone,
    openingCanonicalIndex,
    openingInProgress,
    isZoomed,
    className,
    baseStyle,
    renderImage,
    fsLazy,
    fsLazyAllowedRef,
    fsLazyListenersRef,
    fsDecodedImagesRef,
    fsCustomDecodedImagesRef,
    fsCustomResolvedSrcByKeyRef,
    getMediaKey,
  } = props;

  const lazyEnabled = !!fsLazy?.enabled;

  if (renderImage && !lazyEnabled) {
    return renderImage({
      item,
      index: renderedIndex,
      isZoomed,
      className,
      baseStyle,
    }) as any;
  }

  if (renderImage && fsLazy) {
    return (
      <FsLazyCustomImageContent
        item={item}
        renderedIndex={renderedIndex}
        canonicalIndex={canonicalIndex}
        isClone={isClone}
        openingCanonicalIndex={openingCanonicalIndex}
        openingInProgress={openingInProgress}
        isZoomed={isZoomed}
        className={className}
        baseStyle={baseStyle}
        renderImage={renderImage}
        fsLazy={fsLazy}
        fsLazyAllowedRef={fsLazyAllowedRef}
        fsLazyListenersRef={fsLazyListenersRef}
        fsCustomDecodedImagesRef={fsCustomDecodedImagesRef}
        fsCustomResolvedSrcByKeyRef={fsCustomResolvedSrcByKeyRef}
        getMediaKey={getMediaKey}
      />
    );
  }

  const key = React.useMemo(() => getMediaKey(item), [
    getMediaKey,
    item,
    (item as any).src,
    (item as any).srcSet,
    (item as any).sizes,
  ]);

  const seenBefore = fsDecodedImagesRef.current.has(key);

  const spinnerRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const cleanupRef = React.useRef<null | (() => void)>(null);
  const didRevealRef = React.useRef(false);

  const any = item as any;
  const isOpeningTarget =
    !!openingInProgress &&
    !isClone &&
    openingCanonicalIndex === canonicalIndex;

  const computeAllowed = React.useCallback(() => {
    if (isOpeningTarget) return true;
    if (seenBefore) return true;
    if (!lazyEnabled) return true;
    return !!fsLazyAllowedRef?.current?.has(canonicalIndex);
  }, [isOpeningTarget, seenBefore, lazyEnabled, fsLazyAllowedRef, canonicalIndex]);

  const showSpinner = React.useCallback((show: boolean) => {
    const sp = spinnerRef.current;
    if (!sp) return;
    if (show) showSpinnerEl(sp);
    else hideSpinnerEl(sp);
  }, []);

  const spinnerResolved = React.useMemo(() => {
    return resolveFsSpinnerNode(fsLazy?.spinner, { kind: "image", isClone });
  }, [fsLazy?.spinner, isClone]);

  const shouldRenderSpinner = lazyEnabled && spinnerResolved.render;

  const spinnerClassName = React.useMemo(() => {
    return [
      spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
      fsLazy?.spinnerClassName,
    ]
      .filter(Boolean)
      .join(" ");
  }, [spinnerResolved.isCustom, fsLazy?.spinnerClassName]);

  const spinnerEl = shouldRenderSpinner ? (
    spinnerResolved.isCustom ? (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-image-spinner
      >
        {spinnerResolved.node}
      </div>
    ) : (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-image-spinner
      />
    )
  ) : null;

  const applySrc = React.useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const nextSrc = any.src ?? item.src;
    const nextSrcSet = any.srcSet ?? "";
    const nextSizes = any.sizes ?? "";

    if (img.getAttribute("data-rmg-src-applied") === "true") return;

    img.setAttribute("data-rmg-src-applied", "true");
    img.src = nextSrc;
    if (nextSrcSet) img.srcset = nextSrcSet;
    if (nextSizes) img.sizes = nextSizes;
  }, [any.src, any.srcSet, any.sizes, item.src]);

  const primeOpeningImage = React.useCallback(() => {
    if (!isOpeningTarget) return;

    const img = imgRef.current;
    if (!img) return;

    applySrc();

    if (typeof img.decode === "function") {
      void img.decode().catch(() => {});
    }
  }, [applySrc, isOpeningTarget]);

  const fadeIn = React.useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    showSpinner(false);

    if (isOpeningTarget) {
      img.style.removeProperty("transition");
      img.style.opacity = "1";
      img.style.willChange = "";

      if (!didRevealRef.current) {
        didRevealRef.current = true;
        fsDecodedImagesRef.current.add(key);
      }

      return;
    }

    img.style.opacity = "0";
    img.style.transition = "none";
    img.style.willChange = "opacity";

    requestAnimationFrame(() => {
      const liveImg = imgRef.current;
      if (!liveImg) return;

      liveImg.style.transition = "opacity 300ms ease";
      liveImg.style.opacity = "1";

      if (!didRevealRef.current) {
        didRevealRef.current = true;
        fsDecodedImagesRef.current.add(key);
      }

      let cleared = false;
      const clear = (ev?: TransitionEvent) => {
        if (ev?.propertyName && ev.propertyName !== "opacity") return;
        if (cleared) return;
        cleared = true;
        liveImg.style.willChange = "";
        liveImg.style.removeProperty("transition");
        liveImg.removeEventListener("transitionend", clear);
      };

      liveImg.addEventListener("transitionend", clear);
      window.setTimeout(() => clear(), 360);
    });
  }, [fsDecodedImagesRef, isOpeningTarget, key, showSpinner]);

  React.useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (isOpeningTarget) {
      applySrc();
      primeOpeningImage();

      if (seenBefore) {
        img.style.opacity = "1";
        img.style.removeProperty("transition");
        img.style.willChange = "";
        showSpinner(false);
        return;
      }

      img.style.opacity = "0";
      img.style.transition = "none";
      img.style.willChange = "opacity";
      showSpinner(true);
      return;
    }

    if (seenBefore) {
      img.style.opacity = "1";
      img.style.removeProperty("transition");
      showSpinner(false);
      applySrc();
      return;
    }

    img.style.opacity = "0";
    img.style.transition = "none";
    img.style.willChange = "opacity";

    if (!computeAllowed()) {
      showSpinner(true);
      return;
    }

    showSpinner(true);
    applySrc();
  }, [isOpeningTarget, seenBefore, computeAllowed, applySrc, primeOpeningImage, showSpinner]);

  React.useEffect(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;

    const img = imgRef.current;
    if (!img) return;

    let cancelled = false;

    const revealAfterDecode = async () => {
      if (cancelled) return;

      try {
        if (img.getAttribute("data-rmg-src-applied") !== "true") return;

        if (!img.complete || img.naturalWidth === 0) {
          await new Promise<void>((resolve) => {
            const done = () => {
              img.removeEventListener("load", done);
              img.removeEventListener("error", done);
              resolve();
            };
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          });
        }

        if (cancelled) return;

        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {}
        }

        if (cancelled) return;
        await nextFrame();
        if (cancelled) return;

        fadeIn();
      } catch {
        if (!cancelled) fadeIn();
      }
    };

    const ensureAllowedThenLoad = () => {
      if (cancelled) return false;

      if (computeAllowed()) {
        applySrc();
        showSpinner(true);
        void revealAfterDecode();
        return true;
      }

      return false;
    };

    if (isOpeningTarget) {
      primeOpeningImage();

      if (seenBefore) {
        applySrc();
        showSpinner(false);

        img.style.removeProperty("transition");
        img.style.opacity = "1";
        img.style.willChange = "";

        cleanupRef.current = () => {
          cancelled = true;
        };
        return cleanupRef.current;
      }

      applySrc();
      showSpinner(true);
      void revealAfterDecode();

      cleanupRef.current = () => {
        cancelled = true;
      };
      return cleanupRef.current;
    }

    if (seenBefore) {
      applySrc();
      showSpinner(false);

      img.style.removeProperty("transition");
      img.style.opacity = "1";
      img.style.willChange = "";

      cleanupRef.current = () => {
        cancelled = true;
      };
      return cleanupRef.current;
    }

    if (ensureAllowedThenLoad()) {
      cleanupRef.current = () => {
        cancelled = true;
      };
      return cleanupRef.current;
    }

    const cb = () => {
      if (ensureAllowedThenLoad()) {
        fsLazyListenersRef?.current?.delete(cb);
      }
    };

    if (lazyEnabled) {
      fsLazyListenersRef?.current?.add(cb);
    }

    showSpinner(true);

    cleanupRef.current = () => {
      cancelled = true;
      fsLazyListenersRef?.current?.delete(cb);
    };

    return cleanupRef.current;
  }, [
    isOpeningTarget,
    seenBefore,
    lazyEnabled,
    fsLazyListenersRef,
    computeAllowed,
    applySrc,
    fadeIn,
    primeOpeningImage,
    showSpinner,
  ]);

  return (
    <>
      <img
        ref={imgRef}
        alt={item.alt ?? `cell-${renderedIndex}`}
        data-index={renderedIndex}
        className={className}
        draggable="false"
        decoding="async"
        loading={isOpeningTarget ? "eager" : "lazy"}
        fetchPriority={isOpeningTarget ? "high" : "low"}
        style={{
          ...baseStyle,
          display: "block",
        }}
      />
      {spinnerEl}
    </>
  );
}

function FsCloneVideoPreview(props: {
  item: Extract<MediaItem, { kind: "video" }>;
  renderedIndex: number;
  canonicalIndex: number;
  plyr: PlyrProp;
  videoSnapshotStore?: VideoSnapshotStore;
  playerRefs: React.RefObject<(APITypes | null)[]>;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;
  fsLazy?: FullscreenLazyLoadConfig;
  showFullscreenSlider: boolean;
}) {
  const {
    item,
    renderedIndex,
    canonicalIndex,
    plyr,
    videoSnapshotStore,
    playerRefs,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    fsLazy,
    showFullscreenSlider,
  } = props;

  React.useEffect(() => {
      playerRefs.current[renderedIndex] = null;
    return () => {
      playerRefs.current[renderedIndex] = null;
    };
  }, [playerRefs, renderedIndex]);

  if (!videoSnapshotStore) return null;

  return (
    <VideoCloneSnapshot
      canonicalIndex={canonicalIndex}
      store={videoSnapshotStore}
      src={resolveVideoSrc(item, plyr)}
      poster={resolveVideoPoster(item, plyr)}
      source={plyr?.source ?? undefined}
      options={plyr?.options ?? undefined}
      className={["rmg__player", fsVideoClassName].filter(Boolean).join(" ")}
      style={{
        ...defaultPlayerStyle,
        ...(fsVideoStyle ?? {}),
        zIndex: 2,
        pointerEvents: "none",
        visibility: showFullscreenSlider ? "visible" : "hidden",
        opacity: showFullscreenSlider ? 1 : 0,
        transition: "opacity 220ms ease",
        willChange: "opacity",
      }}
      lazyLoad={fsLazy}
    />
  );
}

function FsLiveVideoContent(props: {
  item: Extract<MediaItem, { kind: "video" }>;
  renderedIndex: number;
  canonicalIndex: number;
  plyr: PlyrProp;
  videoSnapshotStore?: VideoSnapshotStore;
  playerRefs: React.RefObject<(APITypes | null)[]>;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;
  fsLazy?: FullscreenLazyLoadConfig;
  fsLazyAllowedRef?: React.RefObject<Set<number>>;
  fsLazyListenersRef?: React.RefObject<Set<() => void>>;
  fsPreparedVideosRef: React.RefObject<Set<string>>;
  getMediaKey: (item: MediaItem) => string;
  showFullscreenSlider: boolean;
}) {
  const {
    item,
    renderedIndex,
    canonicalIndex,
    plyr,
    videoSnapshotStore,
    playerRefs,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    fsLazy,
    fsLazyAllowedRef,
    fsLazyListenersRef,
    fsPreparedVideosRef,
    getMediaKey,
    showFullscreenSlider,
  } = props;

  const lazyEnabled = !!fsLazy?.enabled;
  const key = React.useMemo(() => `video:${getMediaKey(item)}`, [
    getMediaKey,
    item,
    (item as any).src,
    (item as any).poster,
  ]);
  const seenBefore = fsPreparedVideosRef.current.has(key);
  const provider = React.useMemo(() => detectProvider(plyr?.source), [plyr?.source]);
  const src = React.useMemo(() => resolveVideoSrc(item, plyr), [item, plyr]);
  const poster = React.useMemo(() => resolveVideoPoster(item, plyr), [item, plyr]);
  const shouldForceSnapshotCrossorigin = React.useMemo(() => {
    if (provider !== "mp4") return false;
    return isCrossOriginMediaUrl(src);
  }, [provider, src]);
  const effectivePlyrOptions = React.useMemo(
    () => withSnapshotCrossoriginOptions(plyr?.options, shouldForceSnapshotCrossorigin),
    [plyr?.options, shouldForceSnapshotCrossorigin]
  );
  const ratio = React.useMemo(
    () => parsePlyrRatio((effectivePlyrOptions as any)?.ratio ?? null),
    [effectivePlyrOptions]
  );
  const spinnerRef = React.useRef<HTMLDivElement | null>(null);
  const playerWrapRef = React.useRef<HTMLDivElement | null>(null);
  const apiRef = React.useRef<APITypes | null>(null);

  const mountedRef = React.useRef(false);
  const readyRef = React.useRef(false);
  const revealedRef = React.useRef(false);
  const [revealed, setRevealed] = React.useState(false);
  const [everMounted, setEverMounted] = React.useState(false);
  const gateRef = React.useRef<HTMLDivElement | null>(null);
  const visibleRef = React.useRef(false);

  const computeAllowed = React.useCallback(() => {
    if (seenBefore || readyRef.current) return true;
    if (!lazyEnabled) return true;
    return !!fsLazyAllowedRef?.current?.has(canonicalIndex);
  }, [seenBefore, lazyEnabled, fsLazyAllowedRef, canonicalIndex]);

  const promoteCanonicalWhenVisible = React.useCallback(() => {
    if (!lazyEnabled) return;

    const allowSet = fsLazyAllowedRef?.current;
    if (!allowSet) return;
    if (allowSet.has(canonicalIndex)) return;

    allowSet.add(canonicalIndex);

    const listeners = fsLazyListenersRef?.current;
    if (!listeners?.size) return;

    for (const cb of Array.from(listeners)) {
      try {
        cb();
      } catch {}
    }
  }, [lazyEnabled, fsLazyAllowedRef, fsLazyListenersRef, canonicalIndex]);

  const syncSpinner = React.useCallback((wantVisible: boolean) => {
    const sp = spinnerRef.current;
    if (!sp) return;
    if (wantVisible) showSpinnerEl(sp);
    else hideSpinnerEl(sp);
  }, []);

  const spinnerResolved = React.useMemo(() => {
    return resolveFsSpinnerNode(fsLazy?.spinner, { kind: "video", isClone: false });
  }, [fsLazy?.spinner]);

  const shouldRenderSpinner = (fsLazy?.enabled ?? false) && spinnerResolved.render;

  const spinnerClassName = React.useMemo(() => {
    return [
      spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
      fsLazy?.spinnerClassName,
    ]
      .filter(Boolean)
      .join(" ");
  }, [spinnerResolved.isCustom, fsLazy?.spinnerClassName]);

  const setWrapVisible = React.useCallback(
    (visible: boolean) => {
      setPlayerVisible(playerWrapRef.current, showFullscreenSlider && visible, showFullscreenSlider && visible);
    },
    [showFullscreenSlider]
  );

  const syncRuntimeRegistration = React.useCallback(
    (api: APITypes | null) => {
      if (!videoSnapshotStore) return;

      const hostEl = playerWrapRef.current;
      if (!api || !hostEl || !readyRef.current) {
        videoSnapshotStore.unregisterOriginal(canonicalIndex);
        return;
      }

      videoSnapshotStore.registerOriginal({
        canonicalIndex,
        api,
        hostEl,
        provider,
        src,
        poster,
        ratio,
      });
    },
    [canonicalIndex, poster, provider, ratio, src, videoSnapshotStore]
  );

  React.useLayoutEffect(() => {
    if (seenBefore || readyRef.current) {
      setWrapVisible(true);
      syncSpinner(false);
      revealedRef.current = true;
      setRevealed(true);
      if (!everMounted) setEverMounted(true);
      return;
    }

    setWrapVisible(false);
    syncSpinner(true);
  }, [seenBefore, setWrapVisible, syncSpinner, everMounted]);

  React.useEffect(() => {
    if (seenBefore || readyRef.current) return;

    const tryReveal = () => {
      if (revealedRef.current) return true;
      if (!computeAllowed()) return false;

      revealedRef.current = true;
      setRevealed(true);
      return true;
    };

    if (tryReveal()) return;

    const cb = () => {
      if (tryReveal()) {
        fsLazyListenersRef?.current?.delete(cb);
      }
    };

    if (lazyEnabled) fsLazyListenersRef?.current?.add(cb);

    return () => {
      fsLazyListenersRef?.current?.delete(cb);
    };
  }, [seenBefore, lazyEnabled, computeAllowed, fsLazyListenersRef]);

  React.useEffect(() => {
    if (!revealed) return;
    if (mountedRef.current) return;

    mountedRef.current = true;
    setWrapVisible(false);
    syncSpinner(lazyEnabled);
    if (!lazyEnabled) syncSpinner(false);
    setEverMounted(true);
  }, [revealed, lazyEnabled, setWrapVisible, syncSpinner]);

  const markReady = React.useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;

    requestAnimationFrame(() => {
      syncSpinner(false);
      setWrapVisible(true);
      fsPreparedVideosRef.current.add(key);
      syncRuntimeRegistration(apiRef.current);
    });
  }, [fsPreparedVideosRef, key, setWrapVisible, syncRuntimeRegistration, syncSpinner]);

  const readyCleanupRef = React.useRef<(() => void) | null>(null);
  const guardedPlyrRef = React.useRef<any>(null);

  const cleanupDragSwallowGuard = React.useCallback(() => {
    const guardedPlyr = guardedPlyrRef.current;
    if (!guardedPlyr) return;

    try {
      guardedPlyr.__rmgDragSwallowCleanup?.();
    } catch {}

    guardedPlyrRef.current = null;
  }, []);

  const handlePlyrRef = React.useCallback(
    (api: any) => {
      readyCleanupRef.current?.();
      readyCleanupRef.current = null;

      const apiOrNull = (api ?? null) as APITypes | null;
      apiRef.current = apiOrNull;
      playerRefs.current[renderedIndex] = apiOrNull;
      syncRuntimeRegistration(apiOrNull);

      requestAnimationFrame(() => {
        setWrapVisible(readyRef.current || seenBefore);
        syncSpinner(!(readyRef.current || seenBefore));
      });

      if (!api) {
        cleanupDragSwallowGuard();
        return;
      }

      const plyrInstance = (api as any)?.plyr ?? api;
      if (guardedPlyrRef.current !== plyrInstance) {
        cleanupDragSwallowGuard();
        installDragClickSwallower(plyrInstance);
        guardedPlyrRef.current = plyrInstance;
      }

      try {
        if (provider === "youtube" || provider === "vimeo") {
          readyCleanupRef.current = bindEmbedReady(plyrInstance, markReady, {
            provider,
            posterSrc: poster ?? null,
          });

          return;
        }

        const media: HTMLMediaElement | undefined = plyrInstance?.media;
        if (media) {
          const onCanPlay = () => markReady();

          media.addEventListener("loadedmetadata", onCanPlay, { once: true });
          media.addEventListener("loadeddata", onCanPlay, { once: true });
          media.addEventListener("canplay", onCanPlay, { once: true });

          readyCleanupRef.current = () => {
            try {
              media.removeEventListener("loadedmetadata", onCanPlay);
            } catch {}
            try {
              media.removeEventListener("loadeddata", onCanPlay);
            } catch {}
            try {
              media.removeEventListener("canplay", onCanPlay);
            } catch {}
          };

          try {
            const rs = media.readyState ?? 0;
            const vw = (media as any).videoWidth ?? 0;
            const vh = (media as any).videoHeight ?? 0;
            if (rs >= 1 || (vw > 0 && vh > 0)) markReady();
          } catch {}
        }
      } catch {}
    },
    [
      cleanupDragSwallowGuard,
      markReady,
      playerRefs,
      provider,
      renderedIndex,
      seenBefore,
      setWrapVisible,
      syncRuntimeRegistration,
      syncSpinner,
    ]
  );

  React.useEffect(() => {
    syncRuntimeRegistration(apiRef.current);

    return () => {
      syncRuntimeRegistration(null);
    };
  }, [syncRuntimeRegistration]);

  React.useEffect(() => {
    return () => {
      readyCleanupRef.current?.();
      readyCleanupRef.current = null;
      cleanupDragSwallowGuard();
    };
  }, [cleanupDragSwallowGuard]);

  React.useEffect(() => {
    return () => {
      pauseApi(apiRef.current);
      apiRef.current = null;
      playerRefs.current[renderedIndex] = null;
      syncRuntimeRegistration(null);
    };
  }, [playerRefs, renderedIndex, syncRuntimeRegistration]);

  React.useEffect(() => {
    const gateEl = gateRef.current;
    if (!gateEl) return;

    const root =
      gateEl.closest("[data-rmg-viewport='true']") ??
      gateEl.closest("[data-rmg-fs-viewport='true']") ??
      null;

    const ENTER = 0.7;
    const LEAVE = 0.55;

    const io = new IntersectionObserver(
      ([ent]) => {
        const ratio = ent.intersectionRatio ?? 0;

        const nowVisible = visibleRef.current
          ? !!(ent.isIntersecting && ratio >= LEAVE)
          : !!(ent.isIntersecting && ratio >= ENTER);

        if (nowVisible === visibleRef.current) return;
        visibleRef.current = nowVisible;

        if (!nowVisible) {
          pauseApi(apiRef.current);
          if (!readyRef.current) setWrapVisible(false);
          return;
        }

        promoteCanonicalWhenVisible();

        requestAnimationFrame(() => {
          setWrapVisible(readyRef.current || seenBefore);
          syncSpinner(!(readyRef.current || seenBefore));
        });
      },
      {
        root: root as Element | null,
        threshold: [0, LEAVE, ENTER, 1],
        rootMargin: "0px",
      }
    );

    io.observe(gateEl);
    return () => io.disconnect();
  }, [promoteCanonicalWhenVisible, seenBefore, setWrapVisible, syncSpinner]);

  const spinnerEl = shouldRenderSpinner ? (
    spinnerResolved.isCustom ? (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-video-spinner
      >
        {spinnerResolved.node}
      </div>
    ) : (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-video-spinner
      />
    )
  ) : null;

  const livePreview = videoSnapshotStore ? (
    <VideoCloneSnapshot
      canonicalIndex={canonicalIndex}
      store={videoSnapshotStore}
      src={src}
      poster={poster}
      source={plyr?.source ?? undefined}
      options={effectivePlyrOptions}
      className={["rmg__player", fsVideoClassName].filter(Boolean).join(" ")}
      style={{
        ...defaultPlayerStyle,
        ...(fsVideoStyle ?? {}),
        zIndex: 1,
        pointerEvents: "none",
        visibility: showFullscreenSlider ? "visible" : "hidden",
        opacity: showFullscreenSlider ? 1 : 0,
      }}
    />
  ) : null;

  return (
    <>
      <div
        ref={gateRef}
        style={{ position: "absolute", inset: 0, pointerEvents: showFullscreenSlider ? "auto" : "none" }}
      />
      {livePreview}
      {spinnerEl}
      <div
        ref={playerWrapRef}
        data-index={renderedIndex}
        style={{
          ...defaultPlayerStyle,
          ...(fsVideoStyle ?? {}),
          zIndex: 2,
          pointerEvents: showFullscreenSlider ? "auto" : "none",
          visibility: "hidden",
          opacity: 0,
          transition: "opacity 220ms ease",
          willChange: "opacity",
        }}
        className={["rmg__player", fsVideoClassName].filter(Boolean).join(" ")}
        data-rmg-live-video="true"
        data-rmg-plyr="true"
        data-rmg-plyr-index={String(renderedIndex)}
        data-rmg-plyr-provider={provider}
      >
        {revealed && everMounted ? (
          <Plyr
            source={plyr?.source}
            options={effectivePlyrOptions}
            ref={handlePlyrRef as any}
          />
        ) : null}
      </div>
    </>
  );
}

function FsSlide(props: {
  item: MediaItem;
  index: number;
  canonicalIndex: number;
  activeCanonicalIndex?: number | null;
  isClone: boolean;
  openingCanonicalIndex?: number | null;
  openingInProgress?: boolean;
  deferLiveVideoUntilVisible?: boolean;
  plyr?: PlyrProp;
  imageRef: React.RefObject<HTMLDivElement | null>;
  playerRefs: React.RefObject<(APITypes | null)[]>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  isZoomed: boolean;
  showFullscreenSlider: boolean;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;
  onPanPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onSuppressNextClickCapture: (e: React.SyntheticEvent) => void;
  captionNode: React.ReactNode;
  captionFirst: boolean;
  captionClassName?: string;
  captionStyle?: React.CSSProperties;
  captionZoomMotion?: FullscreenCaptionZoomMotion;
  captionLayout?: "overlay" | "slide";
  isHorizontal: boolean;
  isVertical: boolean;
  fsCaptionWidth?: ResponsiveLength;
  fsCaptionHeight?: ResponsiveLength;
  viewportOverlayPlacement?: FsCaptionPlacement | null;
  fsViewportOverlayWidth?: ResponsiveLength;
  fsViewportOverlayHeight?: ResponsiveLength;
  viewportOverlaySideWidth?: number;
  viewportOverlayTopBottomHeight?: number;
  sideWidth: number;
  topBottomHeight: number;
  getTransform: (index: number) => string;
  styles: { imgMargin: string; fullscreenImages: string };
  renderImage?: RenderFullscreenSlidesArgs["renderImage"];
  fsLazy?: FullscreenLazyLoadOptions;
  fsLazyAllowedImagesRef?: React.RefObject<Set<number>>;
  fsLazyListenersImagesRef?: React.RefObject<Set<() => void>>;
  fsLazyAllowedVideosRef?: React.RefObject<Set<number>>;
  fsLazyListenersVideosRef?: React.RefObject<Set<() => void>>;
  fsDecodedImagesRef: React.RefObject<Set<string>>;
  fsCustomDecodedImagesRef: React.RefObject<Set<string>>;
  fsCustomResolvedSrcByKeyRef: React.RefObject<Map<string, string>>;
  fsPreparedVideosRef: React.RefObject<Set<string>>;
  videoSnapshotStore?: VideoSnapshotStore;
  getMediaKey: (item: MediaItem) => string;
  renderMode?: RenderFullscreenSlidesMode;
  interactive?: boolean;
  registerCell?: boolean;
  hydrateContent?: boolean;
}) {
  const {
    item,
    index,
    canonicalIndex,
    activeCanonicalIndex,
    isClone,
    openingCanonicalIndex,
    openingInProgress,
    deferLiveVideoUntilVisible,
    plyr,
    imageRef,
    playerRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    onPanPointerDown,
    onHoverPointerEnter,
    onHoverPointerMove,
    onHoverPointerLeave,
    onSuppressNextClickCapture,
    captionNode,
    captionFirst,
    captionClassName,
    captionStyle,
    captionZoomMotion,
    captionLayout,
    isHorizontal,
    isVertical,
    fsCaptionWidth,
    fsCaptionHeight,
    viewportOverlayPlacement,
    fsViewportOverlayWidth,
    fsViewportOverlayHeight,
    viewportOverlaySideWidth = 0,
    viewportOverlayTopBottomHeight = 0,
    sideWidth,
    topBottomHeight,
    getTransform,
    styles,
    renderImage,
    fsLazy,
    fsLazyAllowedImagesRef,
    fsLazyListenersImagesRef,
    fsLazyAllowedVideosRef,
    fsLazyListenersVideosRef,
    fsDecodedImagesRef,
    fsCustomDecodedImagesRef,
    fsCustomResolvedSrcByKeyRef,
    fsPreparedVideosRef,
    videoSnapshotStore,
    getMediaKey,
    renderMode = "track",
    interactive = showFullscreenSlider,
    registerCell = true,
    hydrateContent = true,
  } = props;

  const isInteractive = interactive && hydrateContent;
  const isNode = item.kind === "node";
  const shouldDeferLiveVideo = !!deferLiveVideoUntilVisible && !showFullscreenSlider;
  const liveVideoKey =
    item.kind === "video" ? `video:${getMediaKey(item)}` : null;
  const liveVideoReady =
    liveVideoKey != null && fsPreparedVideosRef.current.has(liveVideoKey);
  const liveVideoLazyAllowed =
    item.kind === "video" &&
    !!fsLazyAllowedVideosRef?.current?.has(canonicalIndex);
  const shouldUseStaticInactiveVideo =
    item.kind === "video" &&
    shouldUseFsStaticInactiveVideo({
      activeCanonicalIndex,
      canonicalIndex,
      lazyAllowed: liveVideoLazyAllowed,
      lazyEnabled: !!fsLazy?.videos?.enabled,
      liveReady: liveVideoReady,
    });
  const shouldRenderStaticVideo = shouldUseFsStaticVideoPreview({
    isClone,
    renderMode,
  }) || shouldUseStaticInactiveVideo;

  const baseImgStyle: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    touchAction: "manipulation",
    transformOrigin: "0 0",
    cursor: isInteractive ? (isZoomed ? "grab" : "zoom-in") : "default",
    userSelect: "none",
    WebkitUserSelect: "none",
  };
  const captionInteractive = isInteractive && (captionZoomMotion?.interactive ?? true);
  const captionContentStyle = captionZoomMotion?.contentStyle;
  const captionContent = captionNode ? (
    <div
      data-rmg-fs-caption-content="true"
      style={{
        width: "100%",
        ...captionContentStyle,
      }}
    >
      {captionNode}
    </div>
  ) : null;
  const captionOverlayReservedLeft =
    captionLayout === "overlay" && isHorizontal && captionFirst && fsCaptionWidth != null
      ? sideWidth
      : 0;
  const captionOverlayReservedRight =
    captionLayout === "overlay" && isHorizontal && !captionFirst && fsCaptionWidth != null
      ? sideWidth
      : 0;
  const captionOverlayReservedTop =
    captionLayout === "overlay" && isVertical && captionFirst && fsCaptionHeight != null
      ? topBottomHeight
      : 0;
  const captionOverlayReservedBottom =
    captionLayout === "overlay" && isVertical && !captionFirst && fsCaptionHeight != null
      ? topBottomHeight
      : 0;

  const viewportOverlayReservedLeft =
    viewportOverlayPlacement === "left" && fsViewportOverlayWidth != null
      ? viewportOverlaySideWidth
      : 0;
  const viewportOverlayReservedRight =
    viewportOverlayPlacement === "right" && fsViewportOverlayWidth != null
      ? viewportOverlaySideWidth
      : 0;
  const viewportOverlayReservedTop =
    viewportOverlayPlacement === "top" && fsViewportOverlayHeight != null
      ? viewportOverlayTopBottomHeight
      : 0;
  const viewportOverlayReservedBottom =
    viewportOverlayPlacement === "bottom" && fsViewportOverlayHeight != null
      ? viewportOverlayTopBottomHeight
      : 0;

  const reservedLeftWidth = captionOverlayReservedLeft + viewportOverlayReservedLeft;
  const reservedRightWidth = captionOverlayReservedRight + viewportOverlayReservedRight;
  const reservedTopHeight = captionOverlayReservedTop + viewportOverlayReservedTop;
  const reservedBottomHeight = captionOverlayReservedBottom + viewportOverlayReservedBottom;
  const reservedBefore = isHorizontal ? reservedLeftWidth : reservedTopHeight;
  const reservedAfter = isHorizontal ? reservedRightWidth : reservedBottomHeight;
  const mediaViewportBaseWidth =
    !isHorizontal || captionLayout === "overlay" || !captionNode
      ? "100%"
      : `calc(100% - ${sideWidth}px)`;
  const mediaViewportBaseHeight =
    !isVertical || captionLayout === "overlay" || !captionNode
      ? "100%"
      : `calc(100% - ${topBottomHeight}px)`;
  const mediaViewportWidth = subtractReservedSpace(
    mediaViewportBaseWidth,
    reservedLeftWidth + reservedRightWidth
  );
  const mediaViewportHeight = subtractReservedSpace(
    mediaViewportBaseHeight,
    reservedTopHeight + reservedBottomHeight
  );

  return (
    <div
      key={`${(item as any).src ?? "slide"}-${index}`}
      data-rmg-fs-slide="true"
      data-index={index}
      data-rmg-canonical-idx={canonicalIndex}
      data-rmg-clone={isClone ? "true" : "false"}
      data-rmg-fs-render-mode={renderMode}
      ref={(el: HTMLDivElement | null) => {
        if (registerCell) {
          updateFullscreenCellRef(cells, index, el);
        }
      }}
      style={{
        transform: renderMode === "crossfade" ? "none" : getTransform(index),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        inset: renderMode === "crossfade" ? 0 : undefined,
        left: renderMode === "crossfade" ? undefined : 0,
        top: renderMode === "crossfade" ? undefined : 0,
        width: renderMode === "crossfade" ? "100%" : undefined,
        minWidth: "100%",
        height: "100%",
        margin: "auto",
        touchAction: isInteractive ? "none" : "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: isInteractive ? "auto" : "none",
      }}
      className={styles.imgMargin}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          justifyContent: "center",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {captionNode && captionFirst && captionLayout !== "overlay" && (
          <div
            className={captionClassName}
            data-rmg-fs-caption="true"
            aria-hidden={captionInteractive ? undefined : true}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: isHorizontal ? `0 0 ${sideWidth}px` : "0 0 auto",
              alignSelf: "stretch",
              textAlign: "left",
              pointerEvents: captionInteractive ? "auto" : "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              padding: "0.75rem 1rem",
              color: "#fff",
              fontSize: "0.875rem",
              width: isHorizontal ? sideWidth : "100%",
              height: isVertical ? topBottomHeight : "auto",
              boxSizing: "border-box",
              ...captionStyle,
            }}
          >
            {captionContent}
          </div>
        )}
        {reservedBefore > 0 && (
          <div
            aria-hidden
            style={{
              flex: `0 0 ${reservedBefore}px`,
              pointerEvents: "none",
              visibility: "hidden",
            }}
          />
        )}

        <div
          ref={imageRef}
          data-rmg-zoom-pan-root="true"
          data-rmg-fs-media="true"
          data-rmg-fs-media-viewport="true"
          onPointerDown={
            isNode || !isInteractive
              ? undefined
              : (e) => onPanPointerDown(e, imageRef)
          }
          onPointerEnter={
            isNode || !isInteractive || !onHoverPointerEnter
              ? undefined
              : (e) => onHoverPointerEnter(e, imageRef)
          }
          onPointerMove={
            isNode || !isInteractive || !onHoverPointerMove
              ? undefined
              : (e) => onHoverPointerMove(e, imageRef)
          }
          onPointerLeave={
            isNode || !isInteractive || !onHoverPointerLeave
              ? undefined
              : (e) => onHoverPointerLeave(e, imageRef)
          }
          onClickCapture={onSuppressNextClickCapture as any}
          style={{
            overflow: "visible",
            touchAction: "none",
            width: mediaViewportWidth,
            height: mediaViewportHeight,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            pointerEvents: isInteractive ? "auto" : "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {hydrateContent ? (
            isNode ? (
              <div
                data-rmg-fs-node="true"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  pointerEvents: isInteractive ? "auto" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                {(item as any).node}
              </div>
            ) : item.kind === "video" ? (
              shouldRenderStaticVideo ? (
                <FsCloneVideoPreview
                  item={item as any}
                  renderedIndex={index}
                  canonicalIndex={canonicalIndex}
                  plyr={plyr!}
                  videoSnapshotStore={videoSnapshotStore}
                  playerRefs={playerRefs}
                  defaultPlayerStyle={defaultPlayerStyle}
                  fsVideoStyle={fsVideoStyle}
                  fsVideoClassName={fsVideoClassName}
                  fsLazy={renderMode === "crossfade" ? undefined : fsLazy?.videos}
                  showFullscreenSlider={
                    showFullscreenSlider || renderMode === "crossfade"
                  }
                />
              ) : (
                shouldDeferLiveVideo ? null : (
                  <FsLiveVideoContent
                    item={item as any}
                    renderedIndex={index}
                    canonicalIndex={canonicalIndex}
                    plyr={plyr!}
                    videoSnapshotStore={videoSnapshotStore}
                    playerRefs={playerRefs}
                    defaultPlayerStyle={defaultPlayerStyle}
                    fsVideoStyle={fsVideoStyle}
                    fsVideoClassName={fsVideoClassName}
                    fsLazy={fsLazy?.videos}
                    fsLazyAllowedRef={fsLazyAllowedVideosRef}
                    fsLazyListenersRef={fsLazyListenersVideosRef}
                    fsPreparedVideosRef={fsPreparedVideosRef}
                    getMediaKey={getMediaKey}
                    showFullscreenSlider={showFullscreenSlider}
                  />
                )
              )
            ) : (
              <FsImageContent
                item={item as any}
                renderedIndex={index}
                canonicalIndex={canonicalIndex}
                isClone={isClone}
                openingCanonicalIndex={openingCanonicalIndex}
                openingInProgress={openingInProgress}
                isZoomed={isZoomed}
                className={styles.fullscreenImages}
                baseStyle={baseImgStyle}
                renderImage={renderImage}
                fsLazy={renderMode === "crossfade" ? undefined : fsLazy?.images}
                fsLazyAllowedRef={fsLazyAllowedImagesRef}
                fsLazyListenersRef={fsLazyListenersImagesRef}
                fsDecodedImagesRef={fsDecodedImagesRef}
                fsCustomDecodedImagesRef={fsCustomDecodedImagesRef}
                fsCustomResolvedSrcByKeyRef={fsCustomResolvedSrcByKeyRef}
                getMediaKey={getMediaKey}
              />
            )
          ) : null}
        </div>

        {captionNode && !captionFirst && captionLayout !== "overlay" && (
          <div
            className={captionClassName}
            data-rmg-fs-caption="true"
            aria-hidden={captionInteractive ? undefined : true}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: isHorizontal ? `0 0 ${sideWidth}px` : "0 0 auto",
              alignSelf: "stretch",
              textAlign: "left",
              pointerEvents: captionInteractive ? "auto" : "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              padding: "0.75rem 1rem",
              color: "#fff",
              fontSize: "0.875rem",
              width: isHorizontal ? sideWidth : "100%",
              height: isVertical ? topBottomHeight : "100%",
              boxSizing: "border-box",
              ...captionStyle,
            }}
          >
            {captionContent}
          </div>
        )}
        {reservedAfter > 0 && (
          <div
            aria-hidden
            style={{
              flex: `0 0 ${reservedAfter}px`,
              pointerEvents: "none",
              visibility: "hidden",
            }}
          />
        )}
      </div>
    </div>
  );
}

export function renderFullscreenSlides(opts: RenderFullscreenSlidesArgs) {
  const {
    items,
    plyrList,
    getTransform,
    imageRefs,
    playerRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    onPanPointerDown,
    onSuppressNextClickCapture,
    renderCaption,
    captionClassName,
    captionStyle,
    captionZoomMotion,
    fsCaptionPlacement,
    fsCaptionWidth,
    fsCaptionHeight,
    fsCaptionBreakpoint,
    fsCaptionLayout,
    fsViewportOverlayPlacement,
    fsViewportOverlayWidth,
    fsViewportOverlayHeight,
    fsViewportOverlayBreakpoint,
    breakpointMap,
    resolveFsCaptionPlacement,
    styles,
    renderImage,
    fsLazy,
    fsLazyAllowedImagesRef,
    fsLazyListenersImagesRef,
    fsLazyAllowedVideosRef,
    fsLazyListenersVideosRef,
    canonicalLength,
    activeCanonicalIndex,
    openingCanonicalIndex,
    openingInProgress,
    deferLiveVideoUntilVisible,
    fsDecodedImagesRef,
    fsCustomDecodedImagesRef,
    fsCustomResolvedSrcByKeyRef,
    fsPreparedVideosRef,
    videoSnapshotStore,
    getMediaKey,
    renderMode = "track",
  } = opts;

  const vw = effectiveViewportWidth(
    opts.viewportWidth ??
      (typeof window !== "undefined" ? readViewportWidth() : 0)
  );
  const vh = effectiveViewportHeight(
    opts.viewportHeight ??
      (typeof window !== "undefined" ? window.innerHeight : 0)
  );

  const effectivePlacement = resolveFsCaptionPlacement(
    fsCaptionPlacement,
    fsCaptionBreakpoint,
    vw
  );

  const captionFirst =
    effectivePlacement === "left" || effectivePlacement === "top";

  const DEFAULT_SIDE = 280;
  const DEFAULT_TOP_BOTTOM = 200;

  const sideWidth = resolveLengthFromResponsive(
    fsCaptionWidth,
    DEFAULT_SIDE,
    vw,
    vw,
    breakpointMap ?? BREAKPOINT_MAP
  );

  const topBottomHeight = resolveLengthFromResponsive(
    fsCaptionHeight,
    DEFAULT_TOP_BOTTOM,
    vw,
    vh,
    breakpointMap ?? BREAKPOINT_MAP
  );

  const effectiveViewportOverlayPlacement = resolveFsCaptionPlacement(
    fsViewportOverlayPlacement,
    fsViewportOverlayBreakpoint,
    vw
  );

  const layoutPlacement = effectivePlacement ?? effectiveViewportOverlayPlacement;

  const viewportOverlaySideWidth = resolveLengthFromResponsive(
    fsViewportOverlayWidth,
    DEFAULT_SIDE,
    vw,
    vw,
    breakpointMap ?? BREAKPOINT_MAP
  );

  const viewportOverlayTopBottomHeight = resolveLengthFromResponsive(
    fsViewportOverlayHeight,
    DEFAULT_TOP_BOTTOM,
    vw,
    vh,
    breakpointMap ?? BREAKPOINT_MAP
  );

  const canonLen = canonicalLength ?? items.length;

  const isHorizontal =
    layoutPlacement === "left" || layoutPlacement === "right";
  const isVertical =
    layoutPlacement === "top" || layoutPlacement === "bottom";

  return items.map((item, index) => {
    const imageRef = imageRefs.current[index];
    const plyr = plyrList[index];
    const canonicalIndex = toCanonicalIndex(index, items.length, canonLen);
    const hydrateContent = shouldHydrateFullscreenSlide({
      renderedIndex: index,
      itemsLength: items.length,
      canonicalLength: canonLen,
      activeCanonicalIndex,
      renderMode,
    });

    const captionNode = hydrateContent && renderCaption
      ? renderCaption({ item, index: canonicalIndex, isZoomed })
      : null;

    const isClone = isCloneIndex(index, items.length, canonLen);

    if (!hydrateContent) return null;

    return (
      <FsSlide
        key={`${(item as any).src ?? "slide"}-${index}`}
        item={item}
        index={index}
        canonicalIndex={canonicalIndex}
        activeCanonicalIndex={activeCanonicalIndex}
        isClone={isClone}
        openingCanonicalIndex={openingCanonicalIndex}
        openingInProgress={openingInProgress}
        deferLiveVideoUntilVisible={deferLiveVideoUntilVisible}
        plyr={plyr}
        imageRef={imageRef}
        playerRefs={playerRefs}
        cells={cells}
        isZoomed={isZoomed}
        showFullscreenSlider={showFullscreenSlider}
        defaultPlayerStyle={defaultPlayerStyle}
        fsVideoStyle={fsVideoStyle}
        fsVideoClassName={fsVideoClassName}
        onPanPointerDown={onPanPointerDown}
        onSuppressNextClickCapture={onSuppressNextClickCapture}
        captionNode={captionNode}
        captionFirst={captionFirst}
        captionClassName={captionClassName}
        captionStyle={captionStyle}
        captionZoomMotion={captionZoomMotion}
        captionLayout={fsCaptionLayout}
        isHorizontal={!!isHorizontal}
        isVertical={!!isVertical}
        fsCaptionWidth={fsCaptionWidth}
        fsCaptionHeight={fsCaptionHeight}
        viewportOverlayPlacement={effectiveViewportOverlayPlacement}
        fsViewportOverlayWidth={fsViewportOverlayWidth}
        fsViewportOverlayHeight={fsViewportOverlayHeight}
        viewportOverlaySideWidth={viewportOverlaySideWidth}
        viewportOverlayTopBottomHeight={viewportOverlayTopBottomHeight}
        sideWidth={sideWidth}
        topBottomHeight={topBottomHeight}
        getTransform={getTransform}
        styles={styles}
        renderImage={renderImage}
        fsLazy={fsLazy}
        fsLazyAllowedImagesRef={fsLazyAllowedImagesRef}
        fsLazyListenersImagesRef={fsLazyListenersImagesRef}
        fsLazyAllowedVideosRef={fsLazyAllowedVideosRef}
        fsLazyListenersVideosRef={fsLazyListenersVideosRef}
        fsDecodedImagesRef={fsDecodedImagesRef}
        fsCustomDecodedImagesRef={fsCustomDecodedImagesRef}
        fsCustomResolvedSrcByKeyRef={fsCustomResolvedSrcByKeyRef}
        fsPreparedVideosRef={fsPreparedVideosRef}
        videoSnapshotStore={videoSnapshotStore}
        getMediaKey={getMediaKey}
        renderMode={renderMode}
        interactive={renderMode === "track" && showFullscreenSlider}
        registerCell={renderMode === "track"}
        hydrateContent={hydrateContent}
      />
    );
  });
}

export function renderFullscreenCrossfadeSlides(
  opts: RenderFullscreenSlidesArgs
) {
  return renderFullscreenSlides({
    ...opts,
    renderMode: "crossfade",
    showFullscreenSlider: true,
  });
}
