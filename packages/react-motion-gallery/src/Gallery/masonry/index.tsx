/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { BreakpointMap } from "../shared/responsive";
import { BREAKPOINT_MAP } from "../shared/responsive";
import { useOptionalGalleryCore } from "../core";
import { createRmgSlideStoreBag } from "../shared/slideStoreBag";
import { resolveDataWindow } from "../shared/dataPlugins";
import { DEFAULT_MASONRY } from "./defaults";
import { MasonryItem, normalizeMasonryChild, type MasonryCell } from "./item";
import type {
  RevealOptions,
  MasonryHandle,
  MasonryOptions,
  MasonryPlugin,
} from "./types";
import { MasonryLayout } from "./MasonryLayout";
import { buildMasonryChildren } from "./buildMasonryChildren";
import MasonrySkeleton from "../skeleton/masonry-structured";

type Props = MasonryOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
};
type MasonryComponent = React.ForwardRefExoticComponent<
  Props & React.RefAttributes<MasonryHandle>
> & {
  Item: typeof MasonryItem;
};

function isImgEl(el: unknown): el is HTMLImageElement {
  return el instanceof HTMLImageElement;
}

function findImgInside(host: HTMLElement | null): HTMLImageElement | null {
  if (!host) return null;
  if (isImgEl(host)) return host;

  const img = host.querySelector("img");
  return isImgEl(img) ? img : null;
}

function normalizeReveal(src?: RevealOptions) {
  return {
    renderReveal: src?.renderReveal,
    staggerMs: src?.staggerMs ?? 160,
    durationMs: src?.durationMs ?? 600,
    easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    disabled: src?.disabled === true,
    staggerLimit: src?.staggerLimit,
  };
}

function isMasonryPlugin(value: unknown): value is MasonryPlugin {
  return (
    typeof value === "object" &&
    value != null &&
    (value as MasonryPlugin).__rmgMasonryPlugin === true
  );
}

function getStableMasonryCellId(child: React.ReactNode, sourceIndex: number) {
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

const MasonryImpl = React.forwardRef<MasonryHandle, Props>(function MasonryImpl(
  props,
  forwardedRef
) {
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
    } as MasonryOptions;
  }, [masonryOptions]);

  const localCellsState = React.useMemo<MasonryCell[]>(() => {
    const kids = React.Children.toArray(children);
    const next: MasonryCell[] = [];

    for (const [sourceIndex, child] of kids.entries()) {
      const normalized = normalizeMasonryChild(child);
      if (normalized.node == null) continue;

      next.push({
        id: getStableMasonryCellId(child, sourceIndex),
        node: normalized.node,
        layoutMeta: normalized.layoutMeta,
        sourceIndex,
      });
    }

    return next;
  }, [children]);

  const coreCells = (core?.cellsState as any as MasonryCell[] | undefined) ?? undefined;
  const cellsState: MasonryCell[] =
    coreCells && coreCells.length > 0 ? coreCells : localCellsState;
  const pluginEntries = React.useMemo(
    () => ((masonryObject as any).plugins ?? []).filter(isMasonryPlugin),
    [masonryObject]
  );
  const dataWindowCells = React.useMemo(
    () =>
      resolveDataWindow(cellsState, pluginEntries).map(({ item, index }) => ({
        ...item,
        sourceIndex: item.sourceIndex ?? index,
      })),
    [cellsState, pluginEntries]
  );

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

  const masonryReveal = React.useMemo(() => {
    return normalizeReveal((masonryObject as any).reveal);
  }, [masonryObject]);

  const itemClassName = (masonryObject as any).classNames?.item ?? "";
  const itemWrapClassName = (masonryObject as any).itemWrapClassName ?? "";
  const itemWrapStyle = (masonryObject as any).itemWrapStyle;
  const fullscreenTrigger = (masonryObject as any).fullscreenTrigger ?? DEFAULT_MASONRY.fullscreenTrigger;
  const layoutStoreBag = React.useMemo(() => createRmgSlideStoreBag(), []);
  const [structuredLoadingReady, setStructuredLoadingReady] =
    React.useState(false);

  React.useEffect(() => {
    return () => {
      layoutStoreBag.destroyAll();
    };
  }, [layoutStoreBag]);

  const masonryChildren = React.useMemo(() => {
    return buildMasonryChildren({
      cells: dataWindowCells,
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
    dataWindowCells,
    enableFullscreen,
    fullscreenTrigger,
    openFullscreenAt,
    registerExpandableImage,
    itemClassName,
    itemWrapClassName,
    itemWrapStyle,
    layoutStoreBag,
  ]);

  const loading = (masonryObject as any).loading;
  const useStructuredLoading =
    loading != null &&
    loading.enabled !== false &&
    loading.skeleton &&
    typeof loading.skeleton !== "function";
  const handleStructuredLoadingReady = React.useCallback((ready: boolean) => {
    setStructuredLoadingReady((previous) =>
      previous === ready ? previous : ready,
    );
  }, []);
  const layoutNode = (
    <MasonryLayout
      ref={forwardedRef}
      items={masonryChildren.map((item) => item.node)}
      itemIndices={masonryChildren.map((item) => item.index)}
      itemRevealKeys={masonryChildren.map((item) => item.revealKey)}
      itemPlaceholders={masonryChildren.map((item) => item.placeholder)}
      itemSpans={masonryChildren.map((item) => item.span)}
      masonry={masonryObject as any}
      breakpoints={effectiveBreakpoints}
      reveal={masonryReveal as any}
      onLoadingReadyChange={
        useStructuredLoading ? handleStructuredLoadingReady : undefined
      }
    />
  );

  if (!useStructuredLoading) return layoutNode;

  return (
    <MasonrySkeleton
      layout={loading.skeleton}
      ready={structuredLoadingReady}
      enabled={loading.enabled}
      force={loading.force}
      timing={loading.timing}
      breakpoints={effectiveBreakpoints}
      masonry={{
        count: loading.count ?? masonryChildren.length,
        columns: masonryObject.columns,
        gap: masonryObject.gap,
        placement: masonryObject.placement,
        spans: masonryChildren.map((item) => item.span),
      }}
    >
      {layoutNode}
    </MasonrySkeleton>
  );
});

const Masonry = Object.assign(MasonryImpl, {
  Item: MasonryItem,
}) as MasonryComponent;

export default Masonry;
export { useMasonryReady } from "./useMasonryReady";
export type { MasonryReadyController } from "./useMasonryReady";
