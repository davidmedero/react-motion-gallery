"use client";

import * as React from "react";
import type { EntriesHandle } from "./types";

export type EntriesReadyController = {
  ref: React.RefCallback<EntriesHandle>;
  ready: boolean;
  handleRef: React.MutableRefObject<EntriesHandle | null>;
};

export type UseEntriesReadyOptions = {
  dataReady?: boolean;
};

export function useEntriesReady(
  options: UseEntriesReadyOptions = {}
): EntriesReadyController {
  const dataReady = options.dataReady ?? true;
  const handleRef = React.useRef<EntriesHandle | null>(null);
  const rootNodeRef = React.useRef<HTMLElement | null>(null);
  const unsubscribeRef = React.useRef<(() => void) | null>(null);
  const readyRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  const setReadyState = React.useCallback((value: boolean) => {
    readyRef.current = value;
    setReady(value);
  }, []);

  const syncReady = React.useCallback(
    (handle: EntriesHandle | null) => {
      const nextReady = !!dataReady && !!handle?.isReady();
      if (readyRef.current !== nextReady) setReadyState(nextReady);
    },
    [dataReady, setReadyState]
  );

  const ref = React.useCallback(
    (handle: EntriesHandle | null) => {
      const previousRoot = rootNodeRef.current;
      const nextRoot = handle?.getRootNode() ?? null;
      const sameEntries = !!handle && !!previousRoot && previousRoot === nextRoot;

      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      handleRef.current = handle;
      rootNodeRef.current = nextRoot;

      if (!handle) {
        rootNodeRef.current = null;
        setReadyState(false);
        return;
      }

      if (!sameEntries) {
        setReadyState(false);
      }

      syncReady(handle);
      unsubscribeRef.current = handle.onReady(() => {
        syncReady(handle);
      });
    },
    [setReadyState, syncReady]
  );

  React.useEffect(() => {
    syncReady(handleRef.current);
  }, [dataReady, syncReady]);

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
    [ready, ref]
  );
}
