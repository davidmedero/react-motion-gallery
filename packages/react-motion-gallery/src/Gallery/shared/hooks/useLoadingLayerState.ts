import * as React from "react";

import { scheduleLoadingExit } from "../loading/timing";

type UseLoadingLayerStateArgs = {
  loadingActive: boolean;
  exitMs: number;
  minVisibleMs: number;
};

function getNowMs() {
  return Date.now();
}

export function useLoadingLayerState(args: UseLoadingLayerStateArgs) {
  const { loadingActive, exitMs, minVisibleMs } = args;
  const [showLoadingLayer, setShowLoadingLayer] = React.useState(() => loadingActive);
  const [loadingExiting, setLoadingExiting] = React.useState(false);
  const [revealUnlocked, setRevealUnlocked] = React.useState(() => !loadingActive);
  const loadingVisibleSinceRef = React.useRef<number | null>(null);
  const wasLoadingActiveRef = React.useRef(loadingActive);

  React.useEffect(() => {
    if (showLoadingLayer && loadingVisibleSinceRef.current == null) {
      loadingVisibleSinceRef.current = getNowMs();
      return;
    }

    if (!showLoadingLayer) {
      loadingVisibleSinceRef.current = null;
    }
  }, [showLoadingLayer]);

  React.useEffect(() => {
    if (loadingActive && !wasLoadingActiveRef.current) {
      loadingVisibleSinceRef.current = getNowMs();
    }

    wasLoadingActiveRef.current = loadingActive;
  }, [loadingActive]);

  React.useEffect(() => {
    if (loadingActive) {
      setShowLoadingLayer(true);
      setLoadingExiting(false);
      setRevealUnlocked(false);
      return;
    }

    if (!showLoadingLayer) {
      setRevealUnlocked(true);
      return;
    }

    return scheduleLoadingExit({
      loadingVisibleSinceMs: loadingVisibleSinceRef.current,
      nowMs: getNowMs(),
      exitMs,
      minVisibleMs,
      setLoadingExiting,
      setShowLoadingLayer,
      setRevealUnlocked,
    });
  }, [exitMs, loadingActive, minVisibleMs, showLoadingLayer]);

  return {
    showLoadingLayer,
    loadingExiting,
    revealUnlocked,
  };
}
