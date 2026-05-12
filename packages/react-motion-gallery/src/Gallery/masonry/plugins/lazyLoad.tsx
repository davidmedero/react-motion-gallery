"use client";

import * as React from "react";
import { LazyItemHost } from "../../shared/lazy/LazyItemHost";
import type { GalleryLazyLoadOptions } from "../../shared/types/lazy";
import type { MasonryPluginItemRenderArgs } from "../types";
import { createMasonryPlugin } from "./create";

export type MasonryLazyLoadOptions = GalleryLazyLoadOptions;

function normalizeMasonryLazyLoadOptions(options: MasonryLazyLoadOptions) {
  return {
    ...options,
    enabled: options.enabled ?? true,
  };
}

function renderLazyMasonryItem(
  args: MasonryPluginItemRenderArgs,
  options?: unknown
) {
  const lazyLoad = normalizeMasonryLazyLoadOptions(
    (options as MasonryLazyLoadOptions | undefined) ?? {}
  );

  return (
    <LazyItemHost
      ref={args.itemRef}
      index={args.index}
      lazyLoad={lazyLoad}
      revealedIndicesRef={args.revealedIndicesRef}
      {...args.itemProps}
    >
      {args.children}
    </LazyItemHost>
  );
}

export function masonryLazyLoad(options: MasonryLazyLoadOptions = {}) {
  const enabled = options.enabled !== false;

  return createMasonryPlugin("lazy-load", {
    options,
    blocksReady: enabled,
    renderItem: enabled ? renderLazyMasonryItem : undefined,
  });
}
