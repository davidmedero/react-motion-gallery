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
import type { RevealOptions } from "../../grid/types";
import type { GridSkeletonSpec } from "../../skeleton/GridSkeleton";
import { useReportElementMediaReady } from "./useReportMediaReady";
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
  gridReveal?: RevealOptions;
}): EntriesMediaContainerRender {
  const { gridObject, gridLoading, gridReveal } = args;

  function normalizeLoading(src?: EntriesGridLoadingOptions) {
    if (!src) return null;

    return {
      enabled: src?.enabled,
      force: src?.force,
      skeleton: src?.skeleton,
      timing: src?.timing,
    }
  }

  function normalizeReveal(src?: RevealOptions) {
    return {
      staggerMs: src?.staggerMs ?? 40,
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
      disabled: src?.disabled ?? true,
      staggerLimit: src?.staggerLimit,
    }
  }

  const normalizedLoading = normalizeLoading(gridLoading ?? gridObject?.loading);
  const normalizedReveal = normalizeReveal(gridReveal ?? gridObject?.reveal);

  function EntriesGridMediaInner(props: {
    entryIndex: number;
    entryInView?: boolean;
    mediaNodes: React.ReactNode[];
    mediaReadyKey?: React.Key;
    mediaReadyTimeoutMs?: number;
    onMediaReadyChange?: (ready: boolean) => void;
  }) {
    const {
      entryIndex,
      entryInView,
      mediaNodes,
      mediaReadyKey,
      mediaReadyTimeoutMs,
      onMediaReadyChange,
    } = props;

    const hasMedia = Array.isArray(mediaNodes) && mediaNodes.length > 0;
    const core = useOptionalGalleryCore();
    const viewportWidth = useViewportWidth();
    const breakpoints = core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP };
    const gridReady = useGridReady();
    const mediaReadyRootRef = React.useRef<HTMLDivElement | null>(null);
    const mediaReadyResetKey = React.useMemo(
      () => `${entryIndex}:${String(mediaReadyKey ?? mediaNodes.length)}`,
      [entryIndex, mediaNodes.length, mediaReadyKey],
    );

    useReportElementMediaReady({
      enabled: hasMedia,
      rootRef: mediaReadyRootRef,
      timeoutMs: mediaReadyTimeoutMs,
      resetKey: mediaReadyResetKey,
      onMediaReadyChange,
    });

    const cells = React.useMemo(
      () =>
        mediaNodes.map((node, i) => ({
          id: `entry-${entryIndex}-media-${i}`,
          node,
        })),
      [entryIndex, mediaNodes]
    );

    if (!hasMedia) return null;

    const gridNode = (
      <GridLayout
        ref={gridReady.ref}
        cells={cells}
        grid={gridObject}
        renderMode="passthrough"
        gridItemBaseClass=""
        breakpoints={breakpoints}
        viewportWidth={viewportWidth}
        reveal={normalizedReveal}
        revealReady={entryInView ?? true}
      />
    );

    const renderedNode = !normalizedLoading?.skeleton ? (
      gridNode
    ) : (
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

    return (
      <div ref={mediaReadyRootRef} style={{ display: "contents" }}>
        {renderedNode}
      </div>
    );
  }

  return ({
    entryIndex,
    entryInView,
    mediaNodes,
    mediaReadyKey,
    mediaReadyTimeoutMs,
    onMediaReadyChange,
  }) => (
    <EntriesGridMediaInner
      entryIndex={entryIndex}
      entryInView={entryInView}
      mediaNodes={mediaNodes}
      mediaReadyKey={mediaReadyKey}
      mediaReadyTimeoutMs={mediaReadyTimeoutMs}
      onMediaReadyChange={onMediaReadyChange}
    />
  );
}
