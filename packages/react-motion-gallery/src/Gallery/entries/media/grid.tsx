/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { GridLayout } from "../../grid/GridLayout";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP, type BreakpointMap } from "../../shared/responsive";
import { normalizeIntro } from "../../shared/normalize/normalizeIntro";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { normalizeLoading } from "../../shared/normalize/normalizeLoading";
import { useOptionalGalleryCore } from "../../core";

export function createEntriesGridMedia(args: {
  gridObject?: any;
  gridLoading?: any;
  gridIntro?: any;
}): EntriesMediaContainerRender {
  const { gridObject, gridLoading, gridIntro } = args;

  const core = useOptionalGalleryCore();

  const normalizedLoading = normalizeLoading(gridLoading ?? gridObject?.loading);
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