/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { GridLayout } from "../../grid/GridLayout";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { useOptionalGalleryCore } from "../../core";
import type { IntroOptions, LoadingOptions } from "../../grid/types";

export function createEntriesGridMedia(args: {
  gridObject?: any;
  gridLoading?: LoadingOptions;
  gridIntro?: IntroOptions;
}): EntriesMediaContainerRender {
  const { gridObject, gridLoading, gridIntro } = args;

  function normalizeLoading(src?: LoadingOptions) {
    return {
      enabled: src?.enabled,
      force: src?.force,
      renderLoading: src?.renderLoading,
      skeleton: src?.skeleton,
      timing: src?.timing,
    }
  }

  function normalizeIntro(src?: IntroOptions) {
    return {
      renderIntro: src?.renderIntro,
      staggerMs: src?.staggerMs ?? 40,
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
      staggerLimit: src?.staggerLimit,
    }
  }

  const normalizedLoading = normalizeLoading(gridLoading ?? gridObject?.loading);
  const normalizedIntro = normalizeIntro(gridIntro ?? gridObject?.intro);

  function EntriesGridMediaInner(props: { entryIndex: number; mediaNodes: React.ReactNode[] }) {
    const { entryIndex, mediaNodes } = props;

    if (!Array.isArray(mediaNodes) || mediaNodes.length === 0) return null;

    const core = useOptionalGalleryCore();
    const viewportWidth = useViewportWidth();
    const breakpoints = core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP };

    const cells = React.useMemo(
      () =>
        mediaNodes.map((node, i) => ({
          id: `entry-${entryIndex}-media-${i}`,
          node,
        })),
      [entryIndex, mediaNodes]
    );

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
        registerExpandableImage={() => {}}
      />
    );
  }

  return ({ entryIndex, mediaNodes }) => (
    <EntriesGridMediaInner entryIndex={entryIndex} mediaNodes={mediaNodes} />
  );
}
