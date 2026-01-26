'use client';

import * as React from 'react';

export function useMediaReady(
  enabled: boolean,
  ref: React.RefObject<HTMLElement | null>,
  setReady: React.Dispatch<React.SetStateAction<boolean>>
) {
  React.useEffect(() => {
    if (!enabled) return;
    setReady(false);
  }, [enabled, setReady]);

  React.useEffect(() => {
    if (!enabled) return;
    const root = ref.current;
    if (!root) return;

    const media = Array.from(root.querySelectorAll('img,video')) as
      (HTMLImageElement | HTMLVideoElement)[];

    if (media.length === 0) {
      setReady(true);
      return;
    }

    let cancelled = false;
    let loadedCount = 0;

    const tryDone = () => {
      if (cancelled) return;
      if (loadedCount >= media.length) setReady(true);
    };

    const offs: Array<() => void> = [];

    for (const el of media) {
      const mark = () => {
        if (cancelled) return;
        loadedCount += 1;
        tryDone();
      };

      if (el instanceof HTMLImageElement) {
        if (el.complete && el.naturalWidth > 0) { mark(); continue; }

        const onDone = () => {
          el.removeEventListener('load', onDone);
          el.removeEventListener('error', onDone);
          mark();
        };

        el.addEventListener('load', onDone);
        el.addEventListener('error', onDone);
        offs.push(() => {
          el.removeEventListener('load', onDone);
          el.removeEventListener('error', onDone);
        });
      } else {
        if (el.readyState >= 2) { mark(); continue; }

        const onDone = () => {
          el.removeEventListener('loadeddata', onDone);
          el.removeEventListener('error', onDone);
          mark();
        };

        el.addEventListener('loadeddata', onDone);
        el.addEventListener('error', onDone);
        offs.push(() => {
          el.removeEventListener('loadeddata', onDone);
          el.removeEventListener('error', onDone);
        });
      }
    }

    tryDone();

    return () => {
      cancelled = true;
      offs.forEach((off) => off());
    };
  }, [enabled, ref, setReady]);
}