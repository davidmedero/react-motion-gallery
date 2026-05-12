"use client";

import * as React from "react";
import { LazyItemHost } from "../../shared/lazy/LazyItemHost";
import type { GalleryLazyLoadOptions } from "../../shared/types/lazy";
import type { GridPluginItemRenderArgs } from "../types";
import { createGridPlugin } from "./create";

export type GridLazyLoadOptions = GalleryLazyLoadOptions;

function normalizeGridLazyLoadOptions(options: GridLazyLoadOptions) {
  return {
    ...options,
    enabled: options.enabled ?? true,
  };
}

function renderLazyGridItem(
  args: GridPluginItemRenderArgs,
  options?: unknown
) {
  const lazyLoad = normalizeGridLazyLoadOptions(
    (options as GridLazyLoadOptions | undefined) ?? {}
  );

  return (
    <LazyItemHost
      key={args.key}
      index={args.index}
      lazyLoad={lazyLoad}
      registerExpandableImage={args.registerExpandableImage}
      revealedIndicesRef={args.revealedIndicesRef}
      {...args.itemProps}
    >
      {args.children}
    </LazyItemHost>
  );
}

export function gridLazyLoad(options: GridLazyLoadOptions = {}) {
  const enabled = options.enabled !== false;

  return createGridPlugin("lazy-load", {
    options,
    blocksReady: enabled,
    renderItem: enabled ? renderLazyGridItem : undefined,
  });
}
