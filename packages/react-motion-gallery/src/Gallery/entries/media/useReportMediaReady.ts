import * as React from "react";
import { waitForElementMediaReady } from "../../shared/itemLifecycle";

type ReportMediaReady = ((ready: boolean) => void) | undefined;

function useLatestMediaReadyCallback(callback: ReportMediaReady) {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return callbackRef;
}

export function useReportMediaReady(
  ready: boolean,
  onMediaReadyChange: ReportMediaReady,
) {
  const onMediaReadyChangeRef = useLatestMediaReadyCallback(onMediaReadyChange);

  React.useEffect(() => {
    onMediaReadyChangeRef.current?.(ready);
  }, [onMediaReadyChangeRef, ready]);
}

export function useReportElementMediaReady(args: {
  enabled: boolean;
  rootRef: React.RefObject<HTMLElement | null>;
  timeoutMs?: number;
  resetKey?: React.Key;
  onMediaReadyChange?: ReportMediaReady;
}) {
  const {
    enabled,
    rootRef,
    timeoutMs,
    resetKey,
    onMediaReadyChange,
  } = args;
  const onMediaReadyChangeRef = useLatestMediaReadyCallback(onMediaReadyChange);

  React.useEffect(() => {
    if (!enabled) {
      onMediaReadyChangeRef.current?.(true);
      return;
    }

    const root = rootRef.current;
    if (!root) {
      onMediaReadyChangeRef.current?.(false);
      return;
    }

    let cancelled = false;
    onMediaReadyChangeRef.current?.(false);

    void waitForElementMediaReady(root, {
      timeoutMs,
      waitForLazy: true,
    }).then(() => {
      if (!cancelled) onMediaReadyChangeRef.current?.(true);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, onMediaReadyChangeRef, resetKey, rootRef, timeoutMs]);
}
