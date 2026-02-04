/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { MasonryLayout } from "../../masonry/MasonryLayout";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP, type BreakpointMap } from "../../shared/responsive";
import { normalizeLoading } from "../../shared/normalize/normalizeLoading";
import { normalizeIntro } from "../../shared/normalize/normalizeIntro";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { useOptionalGalleryCore } from "../../core";

export function createEntriesMasonryMedia(args: {
  masonryObject?: any;
  viewportWidth?: number;
  masonryLoading?: any;
  masonryIntro?: any;
}): EntriesMediaContainerRender {
  const { masonryObject, masonryLoading, masonryIntro } = args;

  const core = useOptionalGalleryCore();

  const normalizedLoading = normalizeLoading(masonryLoading ?? masonryObject.loading);
  const normalizedIntro = normalizeIntro(masonryIntro ?? masonryObject.intro);

  const viewportWidth = useViewportWidth();

  const breakpoints = (core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP });

  return ({ mediaNodes }) => {
    return (
      <MasonryLayout
        items={mediaNodes}
        masonry={masonryObject}
        breakpoints={breakpoints}
        viewportWidth={viewportWidth}
        loading={normalizedLoading}
        intro={normalizedIntro}
        skeletonCount={mediaNodes.length}
      />
    );
  };
}