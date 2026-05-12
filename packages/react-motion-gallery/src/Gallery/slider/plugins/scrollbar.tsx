"use client";

import * as React from "react";
import type { SliderPluginRuntimeProps, SliderScrollbar } from "../types";
import styles from "../Slider.module.css";
import { createSliderPlugin } from "./create";

const RANGE_MIN = 0;
const RANGE_MAX = 1;
const RANGE_STEP = 0.001;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function setScrollbarDom(input: HTMLInputElement | null, progress: number) {
  if (!input) return;

  const value = String(clamp01(progress));
  input.value = value;
  input.style.setProperty("--rmg-scrollbar-progress", value);
  input.setAttribute("data-rmg-scrollbar-progress", value);
  input.setAttribute("aria-valuenow", String(Math.round(Number(value) * 100)));
}

function ScrollbarRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderScrollbar }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const disabled = options.enabled === false || host.slideCount <= 1;
  const progress = clamp01(host.progress);

  React.useEffect(() => {
    if (disabled) return;

    let raf = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      setScrollbarDom(inputRef.current, host.handle?.scrollProgress() ?? progress);
      raf = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [disabled, host.handle, progress]);

  if (disabled) return null;

  const onProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextProgress = Number.parseFloat(event.currentTarget.value);
    if (!Number.isFinite(nextProgress)) return;

    setScrollbarDom(inputRef.current, nextProgress);
    if (host.handle?._scrollToProgressFromUi?.(nextProgress)) return;

    const fallbackIndex = Math.round(nextProgress * Math.max(0, host.slideCount - 1));
    host.handle?.setIndex(fallbackIndex);
  };

  if (options.render) {
    return options.render({
      ref: inputRef,
      hidden: false,
      value: progress,
      axis: host.axis,
      min: RANGE_MIN,
      max: RANGE_MAX,
      step: RANGE_STEP,
      onChange: onProgressChange,
      className: options.root?.className,
      style: options.root?.style,
    });
  }

  return (
    <input
      ref={inputRef}
      aria-label="Slider position"
      type="range"
      min={RANGE_MIN}
      max={RANGE_MAX}
      step={RANGE_STEP}
      defaultValue={progress}
      className={[
        styles.scrollbar,
        host.axis === "y" ? styles.scrollbarY : "",
        options.root?.className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        position: "absolute",
        zIndex: 16,
        left: host.axis === "y" ? 10 : "50%",
        top: host.axis === "y" ? "50%" : undefined,
        bottom: host.axis === "y" ? undefined : 10,
        transform:
          host.axis === "y"
            ? "translateY(-50%) rotate(-90deg)"
            : "translateX(-50%)",
        width: host.axis === "y" ? "60%" : "min(60%, 28rem)",
        ["--rmg-scrollbar-progress" as any]: progress,
        ...(options.root?.style ?? {}),
      }}
      onChange={onProgressChange}
      onInput={(event) => onProgressChange(event as unknown as React.ChangeEvent<HTMLInputElement>)}
    />
  );
}

export function sliderScrollbar(options: SliderScrollbar = {}) {
  return createSliderPlugin("scrollbar", {
    options,
    Runtime: ScrollbarRuntime as React.ComponentType<any>,
  });
}

export type { SliderScrollbar };
