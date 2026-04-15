/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { BreakpointMap } from "../shared/responsive";
import { BREAKPOINT_MAP } from "../shared/responsive";
import { useOptionalGalleryCore } from "../core";
import { createRmgSlideStoreBag } from "../shared/slideStoreBag";
import { DEFAULT_MASONRY } from "./defaults";
import type { IntroOptions, LoadingOptions, MasonryOptions } from "./types";
import { MasonryLayout } from "./MasonryLayout";
import { buildMasonryChildren } from "./buildMasonryChildren";

type Props = MasonryOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
};

type Cell = { id: string; node: React.ReactNode };

function isImgEl(el: unknown): el is HTMLImageElement {
  return el instanceof HTMLImageElement;
}

function findImgInside(host: HTMLElement | null): HTMLImageElement | null {
  if (!host) return null;
  if (isImgEl(host)) return host;

  const img = host.querySelector("img");
  return isImgEl(img) ? img : null;
}

function normalizeLoading(src?: LoadingOptions) {
  return {
    enabled: src?.enabled,
    force: src?.force,
    renderLoading: src?.renderLoading,
    skeleton: src?.skeleton,
    timing: src?.timing,
  };
}

function normalizeIntro(src?: IntroOptions) {
  return {
    renderIntro: src?.renderIntro,
    staggerMs: src?.staggerMs ?? 160,
    durationMs: src?.durationMs ?? 600,
    easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
  };
}

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

  const expandableImageRefs =
    core?.expandableImageRefs ??
    React.useRef<Array<HTMLImageElement | HTMLVideoElement | null>>([]);

  const registerExpandableImage =
    core?.registerExpandableImage ??
    React.useCallback(
      (index: number, node: HTMLElement | null) => {
        const img = findImgInside(node);
        expandableImageRefs.current[index] = img;
      },
      [expandableImageRefs]
    );

  const normalizedItems = core?.normalizedItems ?? [];
  const enableFullscreen = !!core?.fsEnabled;

  const openFullscreenAt = React.useCallback(
    (index: number, originEl?: HTMLElement | null) => {
      if (!enableFullscreen) return;

      const cellCount = normalizedItems.length;
      if (!cellCount) return;

      let imgEl: HTMLImageElement | null = null;

      if (originEl) {
        imgEl = findImgInside(originEl);
      }

      if (!imgEl) {
        const slot: any = expandableImageRefs.current[index] ?? null;
        const slotCurrent: any =
          slot && typeof slot === "object" && "current" in slot ? slot.current : slot;

        if (isImgEl(slotCurrent)) {
          imgEl = slotCurrent;
        } else if (slotCurrent instanceof HTMLElement) {
          imgEl = findImgInside(slotCurrent);
        }
      }

      core!.requestFullscreenOpen({
        source: "masonry",
        index,
        image: imgEl ?? null,
      });
    },
    [core, enableFullscreen, normalizedItems.length, expandableImageRefs]
  );

  const masonryLoading = React.useMemo(() => {
    return normalizeLoading(
      (masonryObject as any).loading ?? (masonryObject as any).transitions?.loading
    );
  }, [masonryObject]);

  const masonryIntro = React.useMemo(() => {
    return normalizeIntro(
      (masonryObject as any).intro ?? (masonryObject as any).transitions?.intro
    );
  }, [masonryObject]);

  const itemClassName = (masonryObject as any).classNames?.item ?? "";
  const itemWrapClassName = (masonryObject as any).itemWrapClassName ?? "";
  const itemWrapStyle = (masonryObject as any).itemWrapStyle;
  const fullscreenTrigger = (masonryObject as any).fullscreenTrigger ?? DEFAULT_MASONRY.fullscreenTrigger;
  const layoutStoreBag = React.useMemo(() => createRmgSlideStoreBag(), []);

  React.useEffect(() => {
    return () => {
      layoutStoreBag.destroyAll();
    };
  }, [layoutStoreBag]);

  const masonryChildren = React.useMemo(() => {
    return buildMasonryChildren({
      cells: cellsState,
      fsEnabled: enableFullscreen,
      fullscreenTrigger,
      openFullscreenAt: (i: number, originEl?: HTMLElement | null) => openFullscreenAt(i, originEl),

      registerExpandableImage: (i: number, node: HTMLElement | null) =>
        registerExpandableImage(i, (node as any) ?? null),

      itemBaseClass: "rmg__masonry-item",
      itemBaseStyleClass: "",
      itemClassName,
      itemWrapClassName,
      itemWrapStyle,
      slideStoreBag: layoutStoreBag,
    });
  }, [
    cellsState,
    enableFullscreen,
    fullscreenTrigger,
    openFullscreenAt,
    registerExpandableImage,
    itemClassName,
    itemWrapClassName,
    itemWrapStyle,
    layoutStoreBag,
  ]);

  return (
    <MasonryLayout
      items={masonryChildren}
      masonry={masonryObject as any}
      breakpoints={effectiveBreakpoints}
      loading={masonryLoading as any}
      intro={masonryIntro as any}
      skeletonCount={cellsState.length}
    />
  );
}
