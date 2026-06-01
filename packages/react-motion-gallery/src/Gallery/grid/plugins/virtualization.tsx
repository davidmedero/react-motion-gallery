"use client";

import * as React from "react";
import {
  normalizeDataVirtualizationOptions,
  type DataVirtualizationOptions,
} from "../../shared/dataPlugins";
import { createGridPlugin } from "./create";

export type GridVirtualizationOptions = DataVirtualizationOptions;
export type UseGridVirtualizerOptions = GridVirtualizationOptions;

export function gridVirtualization(options: GridVirtualizationOptions = {}) {
  return createGridPlugin("virtualization", {
    options: normalizeDataVirtualizationOptions(options),
  });
}

export function useGridVirtualizer(options: UseGridVirtualizerOptions = {}) {
  return React.useMemo(
    () => gridVirtualization(options),
    [
      options.enabled,
      options.estimateSize,
      options.gap,
      options.overscan,
    ]
  );
}
