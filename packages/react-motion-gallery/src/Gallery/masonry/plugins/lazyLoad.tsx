"use client";

import * as React from "react";
import { LazyItemHost } from "../../shared/lazy/LazyItemHost";
import type { GalleryLazyLoadOptions } from "../../shared/types/lazy";
import type {
  MasonryPlugin,
  MasonryPluginItemRenderArgs,
} from "../types";
import type {
  MasonryPlugin as LightMasonryPlugin,
  MasonryPluginItemRenderArgs as LightMasonryPluginItemRenderArgs,
} from "../light/types";

export type MasonryLazyLoadOptions = GalleryLazyLoadOptions;
export type MasonryLazyLoadPlugin = MasonryPlugin & LightMasonryPlugin;

function normalizeMasonryLazyLoadOptions(options: MasonryLazyLoadOptions) {
  return {
    ...options,
    enabled: options.enabled ?? true,
  };
}

function renderLazyMasonryItem(
  args: MasonryPluginItemRenderArgs | LightMasonryPluginItemRenderArgs,
  options?: unknown
) {
  const lazyLoad = normalizeMasonryLazyLoadOptions(
    (options as MasonryLazyLoadOptions | undefined) ?? {}
  );

  return (
    <LazyItemHost
      ref={args.itemRef}
      index={args.index}
      resetKey={args.itemIndex ?? args.index}
      lazyLoad={lazyLoad}
      revealedIndicesRef={args.revealedIndicesRef}
      {...args.itemProps}
    >
      {args.children}
    </LazyItemHost>
  );
}

export function masonryLazyLoad(
  options: MasonryLazyLoadOptions = {}
): MasonryLazyLoadPlugin {
  const enabled = options.enabled !== false;

  return {
    __rmgMasonryPlugin: true,
    __rmgLightMasonryPlugin: true,
    kind: "lazy-load",
    options,
    blocksReady: enabled,
    renderItem: enabled ? renderLazyMasonryItem : undefined,
  };
}
