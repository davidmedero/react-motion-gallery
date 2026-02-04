/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "../../styles.module.css";
import { SliderLayout } from "../../slider/";
import type { EntriesMediaContainerRender } from "../index";
import { useOptionalGalleryCore } from "../../core";
import { BREAKPOINT_MAP, type BreakpointMap } from "../../shared/responsive";
import type { SliderHandle } from "../../slider/types";

const FALLBACK_BREAKPOINTS: BreakpointMap = {
  xs: 0,
  sm: 500,
  md: 768,
  lg: 1024,
  xl: 1280,
} as any;

const DEFAULT_SLIDER_OBJECT: any = {
  align: 'start',
  direction: { dir: "ltr", axis: "x" },
  size: { height: '320px' },
  scroll: { loop: false, freeScroll: false, groupCells: false, skipSnaps: false },
  motion: { selectDuration: 25, freeScrollDuration: 43, friction: 0.68 },
  controls: {
    arrows: {
      enabled: true,
      arrow: { style: undefined, className: "" },
      prev: { style: undefined, className: "" },
      next: { style: undefined, className: "" },
      render: undefined,
      renderPrev: undefined,
      renderNext: undefined,
    },
    dots: {
      enabled: true,
      root: { style: undefined, className: "" },
      dot: { style: undefined, className: "" },
      render: undefined,
    },
    progress: {
      enabled: false,
      root: { style: undefined, className: "" },
      bar: { style: undefined, className: "" },
      render: undefined,
    },
    ripple: { enabled: true, className: "" },
  },
  auto: {
    play: { enabled: false, speedMs: 3000, pauseMs: 1000, pauseOnHover: true },
    scroll: { enabled: false, speedMs: 3000, pauseMs: 1000, pauseOnHover: true },
  },
  effects: {
    parallax: { enabled: false, bleedPct: undefined, borderRadius: undefined, sideWidth: undefined },
    scale: { enabled: false, amount: undefined },
    fade: { enabled: false },
  },
  elements: { container: {}, viewport: {} },
  transitions: { intro: undefined },
  lazyLoad: false,
};

export type EntriesSliderMediaOptions = {
  sliderObject?: any;
  gap?: number;
  initialHeight?: number | string;
  columns?: number;
  sliderImagesReady?: any;
  renderFsCaption?: any;
  entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
};

function EntriesSliderMediaContainer(props: {
  entryIndex: number;
  mediaNodes: React.ReactNode[];
  opts?: EntriesSliderMediaOptions;
  entrySliderRefs: React.RefObject<Array<SliderHandle | null>>;
}) {
  const { entryIndex, mediaNodes, opts, entrySliderRefs } = props;

  const core = useOptionalGalleryCore();

  const sliderObject = opts?.sliderObject ?? DEFAULT_SLIDER_OBJECT;

  const resolvedInitialHeight =
    opts?.initialHeight ?? sliderObject?.size?.initialHeight ?? 320;

  const effectiveBreakpoints = (core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP });

  return (
    <div
      className={styles.sliderShell}
      style={{
        position: "relative",
        ...(sliderObject?.size?.height != null
          ? ({ ["--rmg-slider-height" as any]: sliderObject.size.height } as any)
          : null),
        ...(resolvedInitialHeight != null
          ? ({ ["--rmg-slider-initial-height" as any]: resolvedInitialHeight } as any)
          : null),
      }}
    >
      <SliderLayout
        {...sliderObject}
        breakpoints={effectiveBreakpoints}
        expandableImgRefs={null}
        ref={(node: any) => {
          entrySliderRefs.current[entryIndex] = (node as SliderHandle) ?? null;
        }}
      >
        {mediaNodes}
      </SliderLayout>
    </div>
  );
}

export function createEntriesSliderMedia(
  opts: EntriesSliderMediaOptions = {}
): EntriesMediaContainerRender {
  const fallbackRefs =
    opts.entrySliderRefs ?? ({ current: [] } as React.RefObject<Array<SliderHandle | null>>);

  return ({ entryIndex, mediaNodes, entrySliderRefs }) => {
    const refs = entrySliderRefs ?? fallbackRefs;

    return (
      <EntriesSliderMediaContainer
        entryIndex={entryIndex}
        mediaNodes={mediaNodes}
        opts={opts}
        entrySliderRefs={refs}
      />
    );
  };
}