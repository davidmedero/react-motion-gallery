/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GridLayout } from "../../grid/GridLayout";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { useOptionalGalleryCore } from "../../core";
import { IntroOptions, LoadingOptions } from "../../grid/types";

export function createEntriesGridMedia(args: {
  gridObject?: any;
  gridLoading?: any;
  gridIntro?: any;
}): EntriesMediaContainerRender {
  const { gridObject, gridLoading, gridIntro } = args;

  const core = useOptionalGalleryCore();

  function normalizeLoading(src?: LoadingOptions) {
    return {
      isLoading: src?.isLoading,
      renderLoading: src?.renderLoading,
      skeleton: src?.skeleton,
      shimmer: src?.shimmer,
    };
  }

  const normalizedLoading = normalizeLoading(gridLoading ?? gridObject?.loading);

  function normalizeIntro(src?: IntroOptions) {
    return {
      renderIntro: src?.renderIntro,
      staggerMs: src?.staggerMs ?? 40,
      transform: src?.transform ?? "translateY(10px) scale(0.99)",
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    };
  }
  
  const normalizedIntro = normalizeIntro(gridIntro ?? gridObject?.intro);

  const viewportWidth = useViewportWidth();

  const breakpoints = (core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP });

  return ({ entryIndex, mediaNodes }) => {
    const cells = mediaNodes.map((node, i) => ({
      id: `entry-${entryIndex}-media-${i}`,
      node,
    }));

    return (
      <GridLayout
        cells={cells}
        grid={gridObject}
        renderMode="passthrough"
        gridItemBaseClass=""
        breakpoints={breakpoints}
        viewportWidth={viewportWidth}
        loading={normalizedLoading}
        intro={normalizedIntro}
        enableFullscreen={false}
        onOpen={() => {}}
        registerExpandableImg={() => {}}
      />
    );
  };
}