/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { GridLayout } from "./GridLayout";
import { BREAKPOINT_MAP } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import type { BreakpointMap } from "../shared/responsive";
import type { GridHandle, GridOptions, RevealOptions } from "./types";
import { useOptionalGalleryCore } from "../core";
import { GridItem, normalizeGridChild, type GridCell } from "./item";

type Props = GridOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  gridItemBaseClass?: string;
  renderMode?: "wrap" | "passthrough";
};

type GridComponent = React.ForwardRefExoticComponent<
  Props & React.RefAttributes<GridHandle>
> & {
  Item: typeof GridItem;
};

export const GridLayoutRuntime = React.forwardRef<GridHandle, Props>(function GridLayoutRuntime(
  props,
  forwardedRef
) {
  const { children, breakpoints, gridItemBaseClass, renderMode, ...gridOptions } = props;

  const core = useOptionalGalleryCore();
  const vw = useViewportWidth();

  const effectiveBreakpoints = React.useMemo(
    () => core?.effectiveBreakpoints ?? ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [core?.effectiveBreakpoints, breakpoints]
  );

  const gridObject: GridOptions = React.useMemo(() => ({ ...gridOptions }), [gridOptions]);

  const idSeqRef = React.useRef(0);
  const newId = React.useCallback(() => `rmg-${++idSeqRef.current}`, []);

  const initialCells = React.useMemo<GridCell[]>(() => {
    const kids = React.Children.toArray(children);
    const next: GridCell[] = [];

    for (const child of kids) {
      const normalized = normalizeGridChild(child);
      if (normalized.node == null) continue;

      next.push({
        id: newId(),
        node: normalized.node,
        layoutMeta: normalized.layoutMeta,
      });
    }

    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cellsState] = React.useState<GridCell[]>(initialCells);

  function normalizeReveal(src?: RevealOptions) {
    return {
      renderReveal: src?.renderReveal,
      staggerMs: src?.staggerMs ?? 60,
      durationMs: src?.durationMs ?? 600,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    };
  }

  const gridReveal = React.useMemo(
    () => normalizeReveal(gridObject.reveal),
    [gridObject.reveal]
  );

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
      ref={forwardedRef}
      cells={cellsState}
      grid={gridObject}
      breakpoints={effectiveBreakpoints}
      viewportWidth={vw}
      reveal={gridReveal}
      enableFullscreen={!!core?.fsEnabled}
      onOpen={onOpen}
      registerExpandableImage={registerExpandableImage}
      gridItemBaseClass={gridItemBaseClass}
      renderMode={renderMode}
    />
  );
});

export const Grid = Object.assign(GridLayoutRuntime, {
  Item: GridItem,
}) as GridComponent;

export { useGridReady } from "./useGridReady";
export type { GridReadyController } from "./useGridReady";
export default Grid;
