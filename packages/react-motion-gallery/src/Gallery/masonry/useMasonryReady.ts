"use client";

import * as React from "react";
import type { MasonryHandle } from "./types";

export type MasonryReadyController = {
  ref: React.RefCallback<MasonryHandle>;
  ready: boolean;
  handleRef: React.MutableRefObject<MasonryHandle | null>;
};

export function useMasonryReady(): MasonryReadyController {
  const handleRef = React.useRef<MasonryHandle | null>(null);
  const rootNodeRef = React.useRef<HTMLElement | null>(null);
  const unsubscribeRef = React.useRef<(() => void) | null>(null);
  const readyRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  const setReadyState = React.useCallback((value: boolean) => {
    readyRef.current = value;
    setReady(value);
  }, []);

  const ref = React.useCallback(
    (handle: MasonryHandle | null) => {
      const previousRoot = rootNodeRef.current;
      const nextRoot = handle?.getRootNode() ?? null;
      const sameMasonry = !!handle && !!previousRoot && previousRoot === nextRoot;

      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      handleRef.current = handle;
      rootNodeRef.current = nextRoot;

      if (!handle) {
        rootNodeRef.current = null;
        setReadyState(false);
        return;
      }

      if (!sameMasonry) {
        setReadyState(false);
      }

      if (!readyRef.current && handle.isReady()) {
        setReadyState(true);
      }

      unsubscribeRef.current = handle.onReady(() => {
        if (!readyRef.current) setReadyState(true);
      });
    },
    [setReadyState]
  );

  React.useEffect(
    () => () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      rootNodeRef.current = null;
      readyRef.current = false;
    },
    []
  );

  return React.useMemo(
    () => ({
      ref,
      ready,
      handleRef,
    }),
    [ref, ready]
  );
}
