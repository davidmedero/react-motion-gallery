/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { GridLayout } from "./GridLayout";
import { DEFAULT_GRID } from "./defaults";
import { BREAKPOINT_MAP, resolveNumberFromResponsive } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import type { BreakpointMap } from "../shared/responsive";
import type { GridOptions, IntroOptions, LoadingOptions } from "./types";
import { useOptionalGalleryCore } from "../core";

type Props = GridOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  gridItemBaseClass?: string;
  renderMode?: "wrap" | "passthrough";
};

type Cell = { id: string; node: React.ReactNode };

export default function GridLayoutRuntime(props: Props) {
  const { children, breakpoints, gridItemBaseClass, renderMode, ...gridOptions } = props;

  const core = useOptionalGalleryCore();
  const vw = useViewportWidth();

  const effectiveBreakpoints = React.useMemo(
    () => core?.effectiveBreakpoints ?? ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [core?.effectiveBreakpoints, breakpoints]
  );

  const gridObject: GridOptions = React.useMemo(() => {
    const resolvedColumns =
      gridOptions.columns != null
        ? Math.max(
            1,
            resolveNumberFromResponsive(gridOptions.columns, 0, vw, effectiveBreakpoints) | 0
          )
        : undefined;

    const fallbackGap = (DEFAULT_GRID as any).gap != null ? (DEFAULT_GRID as any).gap : 0;

    const resolvedGap =
      gridOptions.gap != null
        ? Math.max(
            0,
            resolveNumberFromResponsive(gridOptions.gap, fallbackGap, vw, effectiveBreakpoints) | 0
          )
        : fallbackGap;

    return {
      ...gridOptions,
      columns: resolvedColumns,
      minColumnWidth: gridOptions.minColumnWidth ?? (DEFAULT_GRID as any).minColumnWidth,
      gap: resolvedGap,
    };
  }, [gridOptions, vw, effectiveBreakpoints]);

  const idSeqRef = React.useRef(0);
  const newId = React.useCallback(() => `rmg-${++idSeqRef.current}`, []);

  const initialCells = React.useMemo<Cell[]>(() => {
    const kids = React.Children.toArray(children);
    return kids.map((n) => ({ id: newId(), node: n }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cellsState] = React.useState<Cell[]>(initialCells);

  function normalizeLoading(src?: LoadingOptions) {
    return {
      enabled: src?.enabled,
      force: src?.force,
      renderLoading: src?.renderLoading,
      skeleton: src?.skeleton,
    };
  }

  const gridLoading = React.useMemo(() => normalizeLoading(gridObject.loading), [gridObject.loading]);

  function normalizeIntro(src?: IntroOptions) {
    return {
      renderIntro: src?.renderIntro,
      staggerMs: src?.staggerMs ?? 40,
      transform: src?.transform ?? "translateY(10px) scale(0.99)",
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    };
  }

  const gridIntro = React.useMemo(() => normalizeIntro(gridObject.intro), [gridObject.intro]);

  const expandableImageRefs =
    core?.expandableImageRefs ??
    (React.useRef<Array<HTMLImageElement | null>>([]) as React.RefObject<
      Array<HTMLImageElement | null>
    >);

  const registerExpandableImage =
    core?.registerExpandableImage ??
    React.useCallback((index: number, node: HTMLElement | null) => {
      if (!node) {
        expandableImageRefs.current[index] = null;
        return;
      }

      if (node.tagName === "IMG") {
        expandableImageRefs.current[index] = node as HTMLImageElement;
        return;
      }

      const img = node.querySelector("img") as HTMLImageElement | null;
      expandableImageRefs.current[index] = img;
    }, []);

  const getOriginImage = (el: HTMLElement | null): HTMLImageElement | null => {
    if (!el) return null;
    if (el instanceof HTMLImageElement) return el;

    const img = el.querySelector("img") as HTMLImageElement | null;
    return img;
  };

  const onOpen = React.useCallback(
    (gridIndex: number, originEl?: HTMLElement | null) => {
      if (!core?.requestFullscreenOpen) return;

      const img =
        getOriginImage(originEl ?? null) ??
        (expandableImageRefs.current[gridIndex] as HTMLImageElement | null) ??
        null;

      if (!img) return;

      core.requestFullscreenOpen({
        source: "grid",
        index: gridIndex,
        image: img,
        event: undefined,
      });
    },
    [core, expandableImageRefs]
  );

  return (
    <GridLayout
      cells={cellsState}
      grid={gridObject}
      breakpoints={effectiveBreakpoints}
      viewportWidth={vw}
      loading={gridLoading}
      intro={gridIntro}
      enableFullscreen={!!core?.requestFullscreenOpen}
      onOpen={onOpen}
      registerExpandableImage={registerExpandableImage}
      gridItemBaseClass={gridItemBaseClass}
      renderMode={renderMode}
    />
  );
}