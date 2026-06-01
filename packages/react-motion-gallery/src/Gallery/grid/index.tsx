/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { GridLayout } from "./GridLayout";
import { BREAKPOINT_MAP } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import type { BreakpointMap } from "../shared/responsive";
import type { GridHandle, GridOptions, RevealOptions } from "./types";
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

function getStableGridCellId(child: React.ReactNode, sourceIndex: number) {
  if (!React.isValidElement(child) || child.key == null) {
    return `rmg-${sourceIndex + 1}`;
  }

  const rawKey = String(child.key);
  if (!rawKey.startsWith(".$")) {
    return `rmg-${sourceIndex + 1}`;
  }

  let hash = 0;
  for (let index = 0; index < rawKey.length; index += 1) {
    hash = (hash * 31 + rawKey.charCodeAt(index)) | 0;
  }

  return `rmg-k-${Math.abs(hash).toString(36)}`;
}

export const GridLayoutRuntime = React.forwardRef<GridHandle, Props>(function GridLayoutRuntime(
  props,
  forwardedRef
) {
  const { children, breakpoints, gridItemBaseClass, renderMode, ...gridOptions } = props;

  const vw = useViewportWidth();

  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [breakpoints]
  );

  const gridObject: GridOptions = React.useMemo(() => ({ ...gridOptions }), [gridOptions]);

  const cellsState = React.useMemo<GridCell[]>(() => {
    const kids = React.Children.toArray(children);
    const next: GridCell[] = [];

    for (const [sourceIndex, child] of kids.entries()) {
      const normalized = normalizeGridChild(child);
      if (normalized.node == null) continue;

      next.push({
        id: getStableGridCellId(child, sourceIndex),
        node: normalized.node,
        layoutMeta: normalized.layoutMeta,
        sourceIndex,
      });
    }

    return next;
  }, [children]);

  function normalizeReveal(src?: RevealOptions) {
    return {
      staggerMs: src?.staggerMs ?? 60,
      durationMs: src?.durationMs ?? 600,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
      disabled: src?.disabled ?? false,
      staggerLimit: src?.staggerLimit,
    };
  }

  const gridReveal = React.useMemo(
    () => normalizeReveal(gridObject.reveal),
    [gridObject.reveal]
  );

  return (
    <GridLayout
      ref={forwardedRef}
      cells={cellsState}
      grid={gridObject}
      breakpoints={effectiveBreakpoints}
      viewportWidth={vw}
      reveal={gridReveal}
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
