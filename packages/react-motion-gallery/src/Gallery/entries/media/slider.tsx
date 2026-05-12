/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "../../slider/Slider.module.css";
import { Slider } from "../../slider/";
import type { EntriesMediaContainerRender } from "../index";
import { useOptionalGalleryCore } from "../../core";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { sliderArrows } from "../../slider/plugins/arrows";
import { sliderDots } from "../../slider/plugins/dots";
import type { SliderHandle, SliderOptions } from "../../slider/types";

const DEFAULT_SLIDER_OBJECT: SliderOptions = {
  align: 'start',
  direction: { dir: "ltr", axis: "x" },
  scroll: { loop: false, freeScroll: false, groupCells: false, skipSnaps: false },
  motion: { selectDuration: 25, freeScrollDuration: 43, friction: 0.68 },
  elements: { container: {}, viewport: {} },
  transitions: { intro: { staggerMs: 0, durationMs: 0 } },
  plugins: [sliderArrows(), sliderDots()],
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
  entryInView?: boolean;
  mediaNodes: React.ReactNode[];
  opts?: EntriesSliderMediaOptions;
  entrySliderRefs: React.RefObject<Array<SliderHandle | null>>;
}) {
  const { entryIndex, entryInView, mediaNodes, opts, entrySliderRefs } = props;

  const hasMedia = Array.isArray(mediaNodes) && mediaNodes.length > 0;
  if (!hasMedia) {
    if (entrySliderRefs.current) entrySliderRefs.current[entryIndex] = null;
    return null;
  }

  const core = useOptionalGalleryCore();

  const sliderObject = React.useMemo(() => {
    const src = opts?.sliderObject;

    return {
      ...(src ?? DEFAULT_SLIDER_OBJECT),
      transitions: {
        ...DEFAULT_SLIDER_OBJECT.transitions,
        ...(src?.transitions ?? {}),
        intro: {
          ...(DEFAULT_SLIDER_OBJECT.transitions?.intro ?? {}),
          ...(src?.transitions?.intro ?? {}),
          inView: entryInView,
        },
      },
    } satisfies SliderOptions;
  }, [entryInView, opts?.sliderObject]);

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

  return ({ entryIndex, entryInView, mediaNodes, entrySliderRefs }) => {
    const refs = entrySliderRefs ?? fallbackRefs;

    return (
      <EntriesSliderMediaContainer
        entryIndex={entryIndex}
        entryInView={entryInView}
        mediaNodes={mediaNodes}
        opts={opts}
        entrySliderRefs={refs}
      />
    );
  };
}
