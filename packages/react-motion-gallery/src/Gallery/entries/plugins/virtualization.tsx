"use client";

import * as React from "react";
import type { EntriesVirtualizationOptions } from "../types";
import { createEntriesPlugin } from "./create";

export type UseEntriesVirtualizerOptions = EntriesVirtualizationOptions;

export function entriesVirtualization(
  options: EntriesVirtualizationOptions = {}
) {
  return createEntriesPlugin("virtualization", {
    ...options,
    enabled: options.enabled ?? true,
    ...(options.layout ? { layout: options.layout } : {}),
    estimateSize: Math.max(1, options.estimateSize ?? 420),
    gap: Math.max(0, options.gap ?? 24),
    overscan: Math.max(0, options.overscan ?? 3),
  });
}

export function useEntriesVirtualizer(
  options: UseEntriesVirtualizerOptions = {}
) {
  return React.useMemo(
    () => entriesVirtualization(options),
    [
      options.enabled,
      options.layout,
      options.estimateSize,
      options.gap,
      options.overscan,
    ]
  );
}
