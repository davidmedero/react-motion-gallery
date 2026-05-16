/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { GridLayout } from "../../grid/GridLayout";
import { useGridReady } from "../../grid/useGridReady";
import { GridSkeleton as Skeleton } from "../../skeleton/grid";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { useOptionalGalleryCore } from "../../core";
import type { IntroOptions } from "../../grid/types";
import type { GridSkeletonSpec } from "../../skeleton/grid";
import type {
  SkeletonForceOptions,
  SkeletonTimingOptions,
} from "../../skeleton/base";

type EntriesGridLoadingOptions = {
  enabled?: boolean;
  force?: SkeletonForceOptions;
  skeleton?: GridSkeletonSpec;
  timing?: SkeletonTimingOptions;
};

export function createEntriesGridMedia(args: {
  gridObject?: any;
  gridLoading?: EntriesGridLoadingOptions;
  gridIntro?: IntroOptions;
}): EntriesMediaContainerRender {
  const { gridObject, gridLoading, gridIntro } = args;

  function normalizeLoading(src?: EntriesGridLoadingOptions) {
    if (!src) return null;

    return {
      enabled: src?.enabled,
      force: src?.force,
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

  function EntriesGridMediaInner(props: {
    entryIndex: number;
    entryInView?: boolean;
    mediaNodes: React.ReactNode[];
  }) {
    const { entryIndex, entryInView, mediaNodes } = props;

    if (!Array.isArray(mediaNodes) || mediaNodes.length === 0) return null;

    const core = useOptionalGalleryCore();
    const viewportWidth = useViewportWidth();
    const breakpoints = core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP };
    const gridReady = useGridReady();

    const cells = React.useMemo(
      () =>
        mediaNodes.map((node, i) => ({
          id: `entry-${entryIndex}-media-${i}`,
          node,
        })),
      [entryIndex, mediaNodes]
    );

    const gridNode = (
      <GridLayout
        ref={gridReady.ref}
        cells={cells}
        grid={gridObject}
        renderMode="passthrough"
        gridItemBaseClass=""
        breakpoints={breakpoints}
        viewportWidth={viewportWidth}
        intro={normalizedIntro}
        enableFullscreen={false}
        onOpen={() => {}}
        registerExpandableImage={() => {}}
        introReady={entryInView ?? true}
      />
    );

    if (!normalizedLoading?.skeleton) return gridNode;

    return (
      <Skeleton
        layout={normalizedLoading.skeleton}
        ready={gridReady.ready}
        enabled={normalizedLoading.enabled}
        force={normalizedLoading.force}
        timing={normalizedLoading.timing}
        grid={{
          count: cells.length,
          columns: gridObject?.columns,
          templateColumns: gridObject?.templateColumns,
          minColumnWidth: gridObject?.minColumnWidth,
          gap: gridObject?.gap,
        }}
      >
        {gridNode}
      </Skeleton>
    );
  }

  return ({ entryIndex, entryInView, mediaNodes }) => (
    <EntriesGridMediaInner
      entryIndex={entryIndex}
      entryInView={entryInView}
      mediaNodes={mediaNodes}
    />
  );
}
