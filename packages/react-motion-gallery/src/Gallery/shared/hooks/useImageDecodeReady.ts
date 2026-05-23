"use client";

import * as React from "react";

export type ImageDecodeReadyOptions = {
  src?: string | null;
  srcSet?: string;
  sizes?: string;
  enabled?: boolean;
  timeoutMs?: number;
};

export type ImageDecodeReadyResult = {
  ready: boolean;
  loading: boolean;
  error: boolean;
};

const DEFAULT_IMAGE_DECODE_TIMEOUT_MS = 8000;

function resolveTimeoutMs(timeoutMs: number | undefined) {
  return typeof timeoutMs === "number" && Number.isFinite(timeoutMs)
    ? Math.max(0, timeoutMs)
    : DEFAULT_IMAGE_DECODE_TIMEOUT_MS;
}

function isUsableSrc(src: string | null | undefined): src is string {
  return typeof src === "string" && src.length > 0;
}

const READY_STATE: ImageDecodeReadyResult = {
  ready: true,
  loading: false,
  error: false,
};

const LOADING_STATE: ImageDecodeReadyResult = {
  ready: false,
  loading: true,
  error: false,
};

type InternalImageDecodeReadyState = ImageDecodeReadyResult & {
  key: string;
};

export function useImageDecodeReady(
  options: ImageDecodeReadyOptions = {}
): ImageDecodeReadyResult {
  const { enabled = true, src, srcSet, sizes } = options;
  const timeoutMs = resolveTimeoutMs(options.timeoutMs);
  const resolvedSrc = isUsableSrc(src) ? src : "";
  const shouldLoad = enabled !== false && resolvedSrc.length > 0;
  const loadKey = shouldLoad
    ? `${resolvedSrc}\u0000${srcSet ?? ""}\u0000${sizes ?? ""}`
    : "";

  const [state, setState] = React.useState<InternalImageDecodeReadyState>(() =>
    shouldLoad ? { ...LOADING_STATE, key: loadKey } : { ...READY_STATE, key: loadKey }
  );

  React.useEffect(() => {
    if (!shouldLoad || typeof Image === "undefined") {
      setState({ ...READY_STATE, key: loadKey });
      return;
    }

    let cancelled = false;
    let settled = false;
    let timeoutId: number | undefined;
    const img = new Image();

    const cleanup = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };

    const finish = (error: boolean) => {
      if (cancelled || settled) return;
      settled = true;
      cleanup();
      setState({
        ready: true,
        loading: false,
        error,
        key: loadKey,
      });
    };

    const decodeLoadedImage = () => {
      if (cancelled) return;

      if (img.naturalWidth <= 0) {
        finish(true);
        return;
      }

      const decode = (img as HTMLImageElement & { decode?: () => Promise<void> })
        .decode;

      if (typeof decode !== "function") {
        finish(false);
        return;
      }

      decode.call(img).then(
        () => finish(false),
        () => finish(true)
      );
    };

    function onLoad() {
      decodeLoadedImage();
    }

    function onError() {
      finish(true);
    }

    setState({ ...LOADING_STATE, key: loadKey });

    img.decoding = "async";
    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    if (srcSet) img.srcset = srcSet;
    if (sizes) img.sizes = sizes;
    img.src = resolvedSrc;

    if (img.complete) {
      decodeLoadedImage();
    }

    timeoutId = window.setTimeout(() => {
      finish(false);
    }, timeoutMs);

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [shouldLoad, loadKey, resolvedSrc, srcSet, sizes, timeoutMs]);

  if (state.key !== loadKey) {
    return shouldLoad ? LOADING_STATE : READY_STATE;
  }

  return {
    ready: state.ready,
    loading: state.loading,
    error: state.error,
  };
}
