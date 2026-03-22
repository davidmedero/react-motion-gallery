/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';

function normalizeForStableKey(value: unknown): unknown {
  if (value == null) return null;

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeForStableKey(entry));
  }

  if (typeof value === 'function') {
    return `[function:${value.name || 'anonymous'}]`;
  }

  if (typeof value === 'symbol') {
    return String(value);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    for (const key of Object.keys(record).sort()) {
      normalized[key] = normalizeForStableKey(record[key]);
    }

    return normalized;
  }

  return value;
}

function toStableKey(value: unknown) {
  return JSON.stringify(normalizeForStableKey(value));
}

function getSourceKey(source: any) {
  return toStableKey({
    type: source?.type ?? null,
    poster: source?.poster ?? null,
    title: source?.title ?? null,
    sources: Array.isArray(source?.sources)
      ? source.sources.map((item: any) => ({
          src: item?.src ?? null,
          provider: item?.provider ?? null,
          type: item?.type ?? null,
          size: item?.size ?? null,
        }))
      : [],
    tracks: Array.isArray(source?.tracks)
      ? source.tracks.map((track: any) => ({
          kind: track?.kind ?? null,
          src: track?.src ?? null,
          srclang: track?.srclang ?? null,
          label: track?.label ?? null,
          default: track?.default ?? false,
        }))
      : [],
  });
}

function getOptionsKey(options: any) {
  return toStableKey({
    ratio: options?.ratio ?? null,
    controls: options?.controls ?? null,
    fullscreen: options?.fullscreen ?? null,
    autoplay: options?.autoplay ?? null,
    muted: options?.muted ?? null,
    preload: options?.preload ?? null,
    crossorigin: options?.crossorigin ?? null,
    playsinline: options?.playsinline ?? null,
    loop: options?.loop ?? null,
    youtube: options?.youtube ?? null,
    vimeo: options?.vimeo ?? null,
  });
}

type PlyrProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  source?: any;
  options?: any;
};

export const Plyr = React.forwardRef<any, PlyrProps>(function PlyrForwarded(props, ref) {
  const { source, options = null, className, ...rest } = props;
  const mediaRef = React.useRef<HTMLVideoElement | null>(null);
  const instanceRef = React.useRef<any>(null);
  const latestSourceRef = React.useRef<any>(source);
  const latestOptionsRef = React.useRef<any>(options);
  const latestSourceKeyRef = React.useRef(getSourceKey(source));
  const lastAppliedSourceKeyRef = React.useRef<string | null>(null);
  const [api, setApi] = React.useState<any>(null);
  const sourceKey = React.useMemo(() => getSourceKey(source), [source]);
  const optionsKey = React.useMemo(() => getOptionsKey(options), [options]);

  React.useImperativeHandle(ref, () => api, [api]);

  React.useEffect(() => {
    latestSourceRef.current = source;
    latestSourceKeyRef.current = sourceKey;
  }, [source, sourceKey]);

  React.useEffect(() => {
    latestOptionsRef.current = options;
  }, [options, optionsKey]);

  React.useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || !source) return;
    if (lastAppliedSourceKeyRef.current === sourceKey) return;

    try {
      instance.source = source;
      lastAppliedSourceKeyRef.current = sourceKey;
    } catch {}
  }, [source, sourceKey]);

  React.useEffect(() => {
    let cancelled = false;
    const mediaEl = mediaRef.current;
    if (!mediaEl) return;

    async function setup() {
      const mod = await import('plyr');
      if (cancelled) return;

      const PlyrCtor = mod?.default ?? mod;
      if (!PlyrCtor) {
        throw new Error(
          `LazyPlyr: could not resolve Plyr constructor from plyr import. Keys: ${Object.keys(mod ?? {}).join(
            ', '
          )}`
        );
      }

      const instance = new PlyrCtor(mediaEl as HTMLElement, latestOptionsRef.current ?? {});
      instanceRef.current = instance;

      const nextApi = { plyr: instance };
      setApi(nextApi);

      const nextSource = latestSourceRef.current;
      const nextSourceKey = latestSourceKeyRef.current;
      if (nextSource) {
        try {
          instance.source = nextSource;
          lastAppliedSourceKeyRef.current = nextSourceKey;
        } catch {}
      } else {
        lastAppliedSourceKeyRef.current = null;
      }
    }

    void setup();

    return () => {
      cancelled = true;

      const instance = instanceRef.current;
      instanceRef.current = null;
      lastAppliedSourceKeyRef.current = null;
      setApi(null);

      try {
        instance?.destroy?.();
      } catch {}
    };
  }, [optionsKey]);

  return (
    <video
      ref={mediaRef}
      className={['plyr-react', 'plyr', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});
