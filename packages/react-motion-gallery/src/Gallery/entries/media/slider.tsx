/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "../../slider/Slider.module.css";
import { Slider } from "../../slider/";
import type { EntriesMediaContainerRender } from "../index";
import { useOptionalGalleryCore } from "../../core";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import type { SliderHandle, SliderOptions } from "../../slider/types";

const DEFAULT_SLIDER_OBJECT: any = {
  align: 'start',
  direction: { dir: "ltr", axis: "x" },
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
    scroll: { enabled: false, speedMs: 0.3, pauseMs: 1000, pauseOnHover: true },
  },
  effects: {
    parallax: { enabled: false, bleedPct: undefined, borderRadius: undefined, sideWidth: undefined },
    scale: { enabled: false, amount: undefined },
    fade: { enabled: false },
    crossfade: { controls: false, drag: false, durationMs: undefined, easing: undefined },
  },
  elements: { container: {}, viewport: {} },
  transitions: { intro: { staggerMs: 0, durationMs: 0 } },
  lazyLoad: {
    enabled: false,
    spinner: true,
    spinnerClassName: "",
    spinnerStyle: {},
  },
};

export type EntriesSliderMediaOptions = {
  sliderObject?: SliderOptions;
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

  const hasMedia = Array.isArray(mediaNodes) && mediaNodes.length > 0;
  if (!hasMedia) {
    if (entrySliderRefs.current) entrySliderRefs.current[entryIndex] = null;
    return null;
  }

  const core = useOptionalGalleryCore();

  const sliderObject = opts?.sliderObject ?? DEFAULT_SLIDER_OBJECT;

  const effectiveBreakpoints = (core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP });

  return (
    <div
      className={styles.sliderShell}
      style={{ 
        minHeight: "var(--rmg-slider-initial-height, var(--rmg-slider-height))" 
      }}
    >
      <Slider
        {...sliderObject}
        breakpoints={effectiveBreakpoints}
        expandableImageRefs={null}
        ref={(node: any) => {
          entrySliderRefs.current[entryIndex] = (node as SliderHandle) ?? null;
        }}
      >
        {mediaNodes}
      </Slider>
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
