'use client';

import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FSEvent } from '../../fullscreen/fullscreenSliderSub';

export type FsSubLike = {
  get: () => number;
  onEvent: (cb: (e: FSEvent) => void) => () => void;
};

export type EntryLink = {
  entryIndex: number;
  mediaIndex: number;
  [k: string]: any;
};

export type EntriesOverlayRenderArgs<EntryT> = {
  entry: EntryT;
  entryIndex: number;
  mediaIndex: number;
  link: EntryLink;
  opacity: number;
  fsIndex: number;
  style: React.CSSProperties;
  containerProps: {
    className?: string;
    style: React.CSSProperties;
  };
};

export type EntriesObjectLike<EntryT> = {
  items?: EntryT[];
  overlay?: {
    className?: string;
    style?: React.CSSProperties;
  };
  render?: {
    overlay?: (args: EntriesOverlayRenderArgs<EntryT>) => React.ReactNode;
  };
};

export type UseFsEntryOverlayArgs<EntryT> = {
  enabled: boolean;
  fsSub: FsSubLike;
  entriesObject: EntriesObjectLike<EntryT>;
  entryMapRef: React.RefObject<EntryLink[] | null>;
  syncFullscreenSourceFromIndex: (nextIndex: number) => void;
  resetAllZoomDom: () => void;
  wrapperBaseStyle?: React.CSSProperties;
  fadeOutMs?: number;
  closing?: boolean;
};

export type UseFsEntryOverlayReturn = {
  setMountEl: (el: HTMLDivElement | null) => void;
  setOpacity: (next: number) => void;
};

export function useFsEntryOverlay<EntryT>(
  args: UseFsEntryOverlayArgs<EntryT>
): UseFsEntryOverlayReturn {
  const {
    enabled,
    fsSub,
    entriesObject,
    entryMapRef,
    syncFullscreenSourceFromIndex,
    resetAllZoomDom,
    wrapperBaseStyle,
    fadeOutMs = 120,
    closing
  } = args;

  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const rootRef = React.useRef<Root | null>(null);
  const rootMountRef = React.useRef<HTMLDivElement | null>(null);

  const fsIndexRef = React.useRef<number>(fsSub.get());

  const entryOpacityRef = React.useRef<number>(1);
  const overlayElRef = React.useRef<HTMLDivElement | null>(null);

  const openTokenRef = React.useRef(0);
  const enteredTokenRef = React.useRef(0);
  const enterRafRef = React.useRef<number>(0);

  const pendingUnmountRef = React.useRef<number>(0);

  const swapJobRef = React.useRef<{ t: any; raf: number } | null>(null);

  const cancelSwapJob = React.useCallback(() => {
    const job = swapJobRef.current;
    if (!job) return;
    if (job.raf) cancelAnimationFrame(job.raf);
    if (job.t) clearTimeout(job.t);
    swapJobRef.current = null;
  }, []);

  const setEntryOverlayOpacity = React.useCallback((next: number) => {
    const el = overlayElRef.current;
    if (!el) return;
    el.style.setProperty('--rmg-entry-opacity', String(next));
  }, []);

  const getEntryIndexForFsIndex = React.useCallback(
    (fsIndex: number): number => {
      const map = entryMapRef.current;
      const link = map?.[fsIndex];
      return link?.entryIndex ?? -1;
    },
    [entryMapRef]
  );

  const renderEntryOverlayForIndex = React.useCallback(
    (index: number) => {
      const mount = mountRef.current;
      if (!mount) return;

      if (rootRef.current && rootMountRef.current !== mount) {
        const oldRoot = rootRef.current;
        rootRef.current = null;
        rootMountRef.current = null;
        requestAnimationFrame(() => {
          try {
            oldRoot.unmount();
          } catch {
            // ignore
          }
        });
      }

      if (!rootRef.current) {
        rootRef.current = createRoot(mount);
        rootMountRef.current = mount;
      }

      const root = rootRef.current;

      const renderOverlay = entriesObject.render?.overlay;
      if (typeof renderOverlay !== 'function') {
        root.render(null);
        overlayElRef.current = null;
        return;
      }

      const map = entryMapRef.current;
      const items = entriesObject.items;
      if (!items?.length || !map?.length) {
        root.render(null);
        overlayElRef.current = null;
        return;
      }

      const link = map[index];
      if (!link) {
        root.render(null);
        overlayElRef.current = null;
        return;
      }

      const entry = items[link.entryIndex];
      if (!entry) {
        root.render(null);
        overlayElRef.current = null;
        return;
      }

      const wrapperStyle: React.CSSProperties = {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
        color: '#fff',
        fontSize: '0.9rem',
        pointerEvents: 'none',
        zIndex: 9999,

        opacity: 'var(--rmg-entry-opacity, 1)' as any,
        transform:
          'translateY(calc(8px * (1 - var(--rmg-entry-opacity, 1))))' as any,
        transition:
          'opacity 300ms cubic-bezier(.4,0,.22,1), transform 180ms cubic-bezier(.4,0,.22,1)',

        ...(wrapperBaseStyle ?? {}),
        ...(entriesObject.overlay?.style ?? {}),
      };

      root.render(
        <div
          className={entriesObject.overlay?.className}
          style={wrapperStyle}
          ref={(el) => {
            overlayElRef.current = el;
            if (!el) return;

            const token = openTokenRef.current;
            if (enteredTokenRef.current === token) return;
            enteredTokenRef.current = token;

            el.style.setProperty('--rmg-entry-opacity', '0');

            void el.getBoundingClientRect();

            if (enterRafRef.current) cancelAnimationFrame(enterRafRef.current);
            enterRafRef.current = requestAnimationFrame(() => {
              enterRafRef.current = 0;
              el.style.setProperty('--rmg-entry-opacity', '1');
            });
          }}
        >
          {renderOverlay({
            entry,
            entryIndex: link.entryIndex,
            mediaIndex: link.mediaIndex,
            link,
            opacity: 1,
            fsIndex: index,
            style: wrapperStyle,
            containerProps: {
              className: entriesObject.overlay?.className,
              style: wrapperStyle,
            },
          })}
        </div>
      );
    },
    [entriesObject, entryMapRef, wrapperBaseStyle]
  );

  const fadeSwapToIndex = React.useCallback(
    (nextIndex: number) => {
      if (closing) return;
      cancelSwapJob();

      setEntryOverlayOpacity(0);

      const job = { t: null as any, raf: 0 };
      swapJobRef.current = job;

      job.t = setTimeout(() => {
        renderEntryOverlayForIndex(nextIndex);
        syncFullscreenSourceFromIndex(nextIndex);
        resetAllZoomDom();

        job.raf = requestAnimationFrame(() => {
          setEntryOverlayOpacity(1);
          swapJobRef.current = null;
        });
      }, fadeOutMs);
    },
    [
      cancelSwapJob,
      fadeOutMs,
      renderEntryOverlayForIndex,
      resetAllZoomDom,
      setEntryOverlayOpacity,
      syncFullscreenSourceFromIndex,
    ]
  );

  const setMountEl = React.useCallback(
    (el: HTMLDivElement | null) => {
      mountRef.current = el;

      if (el) return;

      cancelSwapJob();

      overlayElRef.current = null;

      const root = rootRef.current;
      rootRef.current = null;

      rootMountRef.current = null;

      if (pendingUnmountRef.current) {
        cancelAnimationFrame(pendingUnmountRef.current);
        pendingUnmountRef.current = 0;
      }

      if (root) {
        pendingUnmountRef.current = requestAnimationFrame(() => {
          pendingUnmountRef.current = 0;
          try {
            root.unmount();
          } catch {
            // ignore
          }
        });
      }
    },
    [cancelSwapJob]
  );

  React.useEffect(() => {
    if (closing) {
      cancelSwapJob();
      setEntryOverlayOpacity(0);
      return;
    }
    if (!enabled) return;

    openTokenRef.current += 1;
    enteredTokenRef.current = 0;

    const start = fsSub.get();
    fsIndexRef.current = start;

    renderEntryOverlayForIndex(start);
    syncFullscreenSourceFromIndex(start);

    const off = fsSub.onEvent((e) => {
      if (e.type !== 'internalIndex') return;

      const next = e.index;

      if (next === fsIndexRef.current && overlayElRef.current) return;

      const prevFsIndex = fsIndexRef.current;
      const prevEntryIndex = getEntryIndexForFsIndex(prevFsIndex);
      const nextEntryIndex = getEntryIndexForFsIndex(next);

      fsIndexRef.current = next;

      if (prevEntryIndex !== nextEntryIndex) {
        fadeSwapToIndex(next);
      } else {
        cancelSwapJob();
        renderEntryOverlayForIndex(next);
        syncFullscreenSourceFromIndex(next);
        resetAllZoomDom();
        requestAnimationFrame(() => setEntryOverlayOpacity(1));
      }
    });

    return () => {
      cancelSwapJob();
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    fsSub,
    entriesObject.render?.overlay,
    entriesObject.items,
    cancelSwapJob,
    fadeSwapToIndex,
    getEntryIndexForFsIndex,
    renderEntryOverlayForIndex,
    resetAllZoomDom,
    setEntryOverlayOpacity,
    syncFullscreenSourceFromIndex,
    closing
  ]);

  return { setMountEl, setOpacity: setEntryOverlayOpacity };
}