/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { BreakpointMap } from "../shared/responsive";
import { BREAKPOINT_MAP } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { useOptionalGalleryCore } from "../core";
import { DEFAULT_MASONRY } from "./defaults";
import type { IntroOptions, LoadingOptions, MasonryOptions } from "./types";
import { MasonryLayout } from "./MasonryLayout";
import { buildMasonryChildren } from "./buildMasonryChildren";

type Props = MasonryOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
};

type Cell = { id: string; node: React.ReactNode };

export default function Masonry(props: Props) {
  const { children, breakpoints, ...masonryOptions } = props;

  const core = useOptionalGalleryCore();

  const effectiveBreakpoints = React.useMemo(
    () => core?.effectiveBreakpoints ?? ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [core?.effectiveBreakpoints, breakpoints]
  );

  const masonryObject = React.useMemo(() => {
    const src = masonryOptions ?? {};
    return {
      ...DEFAULT_MASONRY,
      ...(src as any),
      placement: (src as any)?.placement ?? DEFAULT_MASONRY.placement,
      classNames: {
        ...(DEFAULT_MASONRY as any).classNames,
        ...((src as any)?.classNames ?? {}),
      },
      layout: {
        ...(DEFAULT_MASONRY as any).layout,
        ...((src as any)?.layout ?? {}),
      },
      transitions: {
        ...(DEFAULT_MASONRY as any).transitions,
        ...((src as any)?.transitions ?? {}),
      },
    } as MasonryOptions;
  }, [masonryOptions]);

  const idSeqRef = React.useRef(0);
  const newId = React.useCallback(() => `rmg-${++idSeqRef.current}`, []);

  const initialCells = React.useMemo<Cell[]>(() => {
    const kids = React.Children.toArray(children);
    return kids.map((n) => ({ id: newId(), node: n }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [localCellsState] = React.useState<Cell[]>(initialCells);

  const coreCells = (core?.cellsState as any as Cell[] | undefined) ?? undefined;
  const cellsState: Cell[] =
    coreCells && coreCells.length > 0 ? coreCells : localCellsState;

  const isClick = React.useRef(false);
  const expandableImgRefs =
    core?.expandableImgRefs ?? React.useRef<Array<HTMLImageElement | null>>([]);

  const registerExpandableImg =
    core?.registerExpandableImg ??
    React.useCallback((index: number, node: HTMLElement | null) => {
      if (!node) {
        expandableImgRefs.current[index] = null;
        return;
      }
      const img =
        node.tagName === "IMG"
          ? (node as HTMLImageElement)
          : (node.querySelector("img") as HTMLImageElement | null);

      expandableImgRefs.current[index] = img;
  }, []);

  const normalizedItems = core?.normalizedItems ?? [];
  const enableFullscreen = !!core?.requestFullscreenOpen;

  const openFullscreenAt = React.useCallback(
    (index: number, originEl?: HTMLElement | null) => {
      if (!enableFullscreen) return;

      const imageCount = normalizedItems.length;
      if (!imageCount) return;

      let imgEl: HTMLImageElement | null = null;

      if (originEl) {
        imgEl =
          originEl.tagName === "IMG"
            ? (originEl as HTMLImageElement)
            : (originEl.querySelector("img") as HTMLImageElement | null);
      }

      if (!imgEl) {
        const slot: any = expandableImgRefs.current[index] ?? null;
        const slotCurrent: any =
          slot && typeof slot === "object" && "current" in slot ? slot.current : slot;

        if (slotCurrent?.tagName === "IMG") imgEl = slotCurrent as HTMLImageElement;
        else if (slotCurrent) imgEl = (slotCurrent as HTMLElement).querySelector?.("img") ?? null;
      }

      isClick.current = true;

      core!.requestFullscreenOpen({
        source: "masonry",
        index,
        img: imgEl ?? null,
      });
    },
    [core, enableFullscreen, normalizedItems.length]
  );

  const viewportWidth = useViewportWidth();

  function normalizeLoading(src?: LoadingOptions) {
    return {
      isLoading: src?.isLoading,
      renderLoading: src?.renderLoading,
      shimmer: src?.shimmer,
      ratios: src?.ratios
    };
  }

  const masonryLoading = React.useMemo(() => {
    return normalizeLoading((masonryObject as any).loading ?? (masonryObject as any).transitions?.loading);
  }, [masonryObject]);

  function normalizeIntro(src?: IntroOptions) {
    return {
      renderIntro: src?.renderIntro,
      staggerMs: src?.staggerMs ?? 40,
      transform: src?.transform ?? "translateY(10px) scale(0.99)",
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    };
  }

  const masonryIntro = React.useMemo(() => {
    return normalizeIntro((masonryObject as any).intro ?? (masonryObject as any).transitions?.intro);
  }, [masonryObject]);

  const itemClassName = (masonryObject as any).classNames?.item ?? "";

  const masonryChildren = React.useMemo(() => {
    return buildMasonryChildren({
      cells: cellsState,
      fsEnabled: enableFullscreen,
      openFullscreenAt: (i: number, originEl?: HTMLElement | null) => openFullscreenAt(i, originEl),
      registerExpandableImg: (i: number, node: HTMLElement | null) => registerExpandableImg(i, node),
      itemBaseClass: "rmg__masonry-item",
      itemBaseStyleClass: "",
      itemClassName,
    });
  }, [cellsState, enableFullscreen, openFullscreenAt, registerExpandableImg, itemClassName]);

  return (
    <MasonryLayout
      items={masonryChildren}
      masonry={masonryObject as any}
      breakpoints={effectiveBreakpoints}
      viewportWidth={viewportWidth}
      loading={masonryLoading as any}
      intro={masonryIntro as any}
      skeletonCount={cellsState.length}
    />
  );
}