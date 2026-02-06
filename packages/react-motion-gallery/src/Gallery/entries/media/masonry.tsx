/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MasonryLayout } from "../../masonry/MasonryLayout";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { useOptionalGalleryCore } from "../../core";
import { IntroOptions, LoadingOptions } from "../../masonry/types";

export function createEntriesMasonryMedia(args: {
  masonryObject?: any;
  viewportWidth?: number;
  masonryLoading?: any;
  masonryIntro?: any;
}): EntriesMediaContainerRender {
  const { masonryObject, masonryLoading, masonryIntro } = args;

  const core = useOptionalGalleryCore();

  function normalizeLoading(src?: LoadingOptions) {
    return {
      isLoading: src?.isLoading,
      renderLoading: src?.renderLoading,
      shimmer: src?.shimmer,
      ratios: src?.ratios
    };
  }

  const normalizedLoading = normalizeLoading(masonryLoading ?? masonryObject.loading);

  function normalizeIntro(src?: IntroOptions) {
    return {
      renderIntro: src?.renderIntro,
      staggerMs: src?.staggerMs ?? 40,
      transform: src?.transform ?? "translateY(10px) scale(0.99)",
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    };
  }
  
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