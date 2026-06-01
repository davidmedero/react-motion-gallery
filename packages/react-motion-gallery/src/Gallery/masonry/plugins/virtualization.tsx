"use client";

import * as React from "react";
import {
  normalizeDataVirtualizationOptions,
  type DataVirtualizationOptions,
} from "../../shared/dataPlugins";
import type { MasonryPlugin } from "../types";
import type { MasonryPlugin as LightMasonryPlugin } from "../light/types";

export type MasonryVirtualizationOptions = DataVirtualizationOptions;
export type UseMasonryVirtualizerOptions = MasonryVirtualizationOptions;
export type MasonryVirtualizationPlugin = MasonryPlugin & LightMasonryPlugin;

export function masonryVirtualization(
  options: MasonryVirtualizationOptions = {}
): MasonryVirtualizationPlugin {
  return {
    __rmgMasonryPlugin: true,
    __rmgLightMasonryPlugin: true,
    kind: "virtualization",
    options: normalizeDataVirtualizationOptions(options),
  } as MasonryVirtualizationPlugin;
}

export function useMasonryVirtualizer(
  options: UseMasonryVirtualizerOptions = {}
) {
  return React.useMemo(
    () => masonryVirtualization(options),
    [
      options.enabled,
      options.estimateSize,
      options.gap,
      options.overscan,
    ]
  );
}
