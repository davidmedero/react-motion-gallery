import * as React from "react";

type RevealQueueItem = {
  key: React.Key;
  reveal: () => void;
};

export function useItemRevealScheduler(args: {
  staggerMs: number;
  revealedKeysRef: React.RefObject<Set<React.Key>>;
}) {
  const { staggerMs, revealedKeysRef } = args;
  const queuedRevealKeysRef = React.useRef(new Set<React.Key>());
  const revealQueueRef = React.useRef<RevealQueueItem[]>([]);
  const revealSchedulerActiveRef = React.useRef(false);
  const revealSchedulerTimerRef = React.useRef<number | null>(null);
  const revealSchedulerFrameIdsRef = React.useRef<number[]>([]);

  const clearRevealScheduler = React.useCallback(() => {
    if (typeof window !== "undefined") {
      if (revealSchedulerTimerRef.current != null) {
        window.clearTimeout(revealSchedulerTimerRef.current);
      }

      if (typeof window.cancelAnimationFrame === "function") {
        revealSchedulerFrameIdsRef.current.forEach((frameId) => {
          window.cancelAnimationFrame(frameId);
        });
      }
    }

    revealSchedulerTimerRef.current = null;
    revealSchedulerFrameIdsRef.current = [];
    revealSchedulerActiveRef.current = false;
  }, []);

  const scheduleQueuedReveal = React.useCallback(
    (delayMs = 0) => {
      if (revealSchedulerActiveRef.current || revealQueueRef.current.length === 0) {
        return;
      }

      const releaseNextItem = () => {
        revealSchedulerActiveRef.current = false;
        revealSchedulerTimerRef.current = null;
        revealSchedulerFrameIdsRef.current = [];

        const item = revealQueueRef.current.shift();
        if (!item) return;

        queuedRevealKeysRef.current.delete(item.key);
        item.reveal();

        if (revealQueueRef.current.length > 0) {
          scheduleQueuedReveal(Math.max(0, staggerMs));
        }
      };

      const releaseAfterPaint = () => {
        if (
          typeof window === "undefined" ||
          typeof window.requestAnimationFrame !== "function"
        ) {
          releaseNextItem();
          return;
        }

        const firstFrame = window.requestAnimationFrame(() => {
          const secondFrame = window.requestAnimationFrame(releaseNextItem);
          revealSchedulerFrameIdsRef.current = [firstFrame, secondFrame];
        });
        revealSchedulerFrameIdsRef.current = [firstFrame];
      };

      revealSchedulerActiveRef.current = true;

      if (delayMs > 0 && typeof window !== "undefined") {
        revealSchedulerTimerRef.current = window.setTimeout(releaseAfterPaint, delayMs);
        return;
      }

      releaseAfterPaint();
    },
    [staggerMs]
  );

  const scheduleReveal = React.useCallback(
    (key: React.Key, revealItem: () => void, staggerMsOverride?: number) => {
      const effectiveStaggerMs =
        staggerMsOverride == null ? staggerMs : staggerMsOverride;

      if (revealedKeysRef.current.has(key)) {
        revealItem();
        return () => {};
      }

      if (Math.max(0, effectiveStaggerMs) <= 0) {
        let cancelled = false;
        let firstFrame: number | null = null;
        let secondFrame: number | null = null;
        let timeout: ReturnType<typeof globalThis.setTimeout> | null = null;

        const releaseItem = () => {
          if (cancelled) return;
          revealItem();
        };

        if (
          typeof window === "undefined" ||
          typeof window.requestAnimationFrame !== "function"
        ) {
          timeout = globalThis.setTimeout(releaseItem, 0);
        } else {
          firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(releaseItem);
          });
        }

        return () => {
          cancelled = true;
          if (timeout != null) {
            globalThis.clearTimeout(timeout);
          }
          if (
            typeof window !== "undefined" &&
            typeof window.cancelAnimationFrame === "function"
          ) {
            if (firstFrame != null) window.cancelAnimationFrame(firstFrame);
            if (secondFrame != null) window.cancelAnimationFrame(secondFrame);
          }
        };
      }

      if (queuedRevealKeysRef.current.has(key)) {
        return () => {};
      }

      revealQueueRef.current.push({ key, reveal: revealItem });
      queuedRevealKeysRef.current.add(key);
      scheduleQueuedReveal();

      return () => {
        if (revealedKeysRef.current.has(key)) return;

        queuedRevealKeysRef.current.delete(key);
        revealQueueRef.current = revealQueueRef.current.filter((item) => item.key !== key);

        if (revealQueueRef.current.length === 0) {
          clearRevealScheduler();
        }
      };
    },
    [clearRevealScheduler, revealedKeysRef, scheduleQueuedReveal, staggerMs]
  );

  const pruneRevealQueue = React.useCallback(
    (currentKeys: Set<React.Key>) => {
      queuedRevealKeysRef.current.forEach((key) => {
        if (!currentKeys.has(key)) queuedRevealKeysRef.current.delete(key);
      });

      revealQueueRef.current = revealQueueRef.current.filter((item) =>
        currentKeys.has(item.key)
      );

      if (revealQueueRef.current.length === 0) {
        clearRevealScheduler();
      }
    },
    [clearRevealScheduler]
  );

  React.useEffect(() => {
    return () => {
      revealQueueRef.current = [];
      queuedRevealKeysRef.current.clear();
      clearRevealScheduler();
    };
  }, [clearRevealScheduler]);

  return {
    clearRevealScheduler,
    pruneRevealQueue,
    scheduleReveal,
  };
}
