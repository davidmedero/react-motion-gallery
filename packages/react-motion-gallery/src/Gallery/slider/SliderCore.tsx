/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import CoreSliderEngine from "./SliderCoreEngine";
import createIndexChannel from "./sliderSub";
import { DEFAULT_SLIDER } from "./defaults";
import type {
  SliderCoreHandle,
  SliderDirection,
  SliderElements,
  SliderMotion,
  SliderScroll,
  SliderUnderflowAlign,
  SliderVirtualizationOptions,
} from "./types";
import type { SliderIndexChannel } from "./sliderSub";

type SliderCoreScroll = Omit<SliderScroll, "groupCells"> & {
  groupCells?: boolean | number;
};

export type SliderCoreProps = {
  children?: React.ReactNode;
  cellCount: number;
  gap: number;
  cellsPerSlide?: number;
  underflowAlign?: SliderUnderflowAlign;
  direction?: SliderDirection;
  align?: "start" | "center";
  scroll?: SliderCoreScroll;
  autoHeight?: boolean;
  motion?: SliderMotion;
  virtualization?: SliderVirtualizationOptions;
  initialIndex?: number;
  indexChannel: SliderIndexChannel;
  indexChannelControlled?: boolean;
  elements?: SliderElements;
};

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

const SliderCore = React.forwardRef<SliderCoreHandle, SliderCoreProps>(
  function SliderCore(props, forwardedRef) {
    const {
      children,
      cellCount,
      gap,
      cellsPerSlide,
      underflowAlign,
      direction,
      align,
      scroll,
      autoHeight,
      motion,
      virtualization,
      initialIndex,
      indexChannel,
      indexChannelControlled,
      elements,
    } = props;

    const [isReady, setIsReady] = React.useState(false);
    const internalIndexChannel = React.useMemo(
      () => createIndexChannel(initialIndex ?? 0, "instant"),
      [initialIndex]
    );

    const coreRef = React.useCallback(
      (handle: SliderCoreHandle | null) => {
        assignRef(forwardedRef, handle);
      },
      [forwardedRef]
    );

    const resolvedMotion = { ...DEFAULT_SLIDER.motion, ...(motion ?? {}) };

    return (
      <CoreSliderEngine
        ref={coreRef}
        children={children}
        cellCount={cellCount}
        isReady={isReady}
        setIsReady={setIsReady}
        loop={scroll?.loop === true}
        containScroll={scroll?.containScroll === true}
        freeScroll={scroll?.freeScroll === true}
        groupCells={scroll?.groupCells}
        centerAlign={align === "center"}
        gap={gap}
        sliderViewportStyles={elements?.viewport?.style}
        sliderViewportClassName={elements?.viewport?.className}
        sliderContainerStyles={elements?.container?.style}
        sliderContainerClassName={elements?.container?.className}
        cellsPerSlide={cellsPerSlide}
        underflowAlign={underflowAlign}
        direction={direction?.dir ?? "ltr"}
        axis={direction?.axis ?? "x"}
        skipSnaps={scroll?.skipSnaps}
        strictSnaps={scroll?.strictSnaps}
        autoHeight={autoHeight}
        selectDuration={resolvedMotion.selectDuration}
        freeScrollDuration={resolvedMotion.freeScrollDuration}
        sliderFriction={resolvedMotion.friction}
        virtualization={virtualization}
        initialIndex={initialIndex}
        indexChannel={indexChannel ?? internalIndexChannel}
        indexChannelControlled={indexChannelControlled}
        sliderImagesReady
      />
    );
  }
);

export default SliderCore;
