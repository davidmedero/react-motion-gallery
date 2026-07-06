"use client";

import * as React from "react";
import type { SliderPluginRuntimeProps, SliderScrollbar } from "../types";
import styles from "../Slider.module.css";
import { createSliderPlugin } from "./create";

const RANGE_MIN = 0;
const RANGE_MAX = 1;
const RANGE_STEP = 0.001;
const THUMB_HIT_SLOP_PX = 20;
const DRAG_THRESHOLD_PX = 4;

type ScrollbarPointerState = {
  startX: number;
  startY: number;
  startProgress: number;
  startedOnThumb: boolean;
  moved: boolean;
  pendingProgress: number | null;
};

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

function resolveScrollbarCrossfade(
  host: SliderPluginRuntimeProps["host"],
  options: SliderScrollbar
) {
  if (!host.hasPlugin("crossfade")) return null;

  const crossfade = options.crossfade;
  if (crossfade === false) return null;
  if (crossfade == null || crossfade === true) return {};
  if (crossfade.enabled === false) return null;

  return {
    durationMs: crossfade.durationMs,
    easing: crossfade.easing,
  };
}

function readProgressFromInput(input: HTMLInputElement) {
  const parsed = Number.parseFloat(input.value);
  return Number.isFinite(parsed) ? clamp01(parsed) : 0;
}

function startedNearRangeThumb(
  event: React.PointerEvent<HTMLInputElement>,
  axis: "x" | "y",
  progress: number
) {
  const rect = event.currentTarget.getBoundingClientRect();
  const length = axis === "y" ? rect.height : rect.width;
  if (length <= 0) return false;

  const start = axis === "y" ? rect.top : rect.left;
  const position = axis === "y" ? event.clientY : event.clientX;
  const thumbCenter = start + clamp01(progress) * length;

  return Math.abs(position - thumbCenter) <= THUMB_HIT_SLOP_PX;
}

function ScrollbarRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderScrollbar }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const pointerStateRef = React.useRef<ScrollbarPointerState | null>(null);
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

  const applyProgress = (
    nextProgress: number,
    opts?: { crossfade?: boolean }
  ) => {
    setScrollbarDom(inputRef.current, nextProgress);
    const crossfade = opts?.crossfade
      ? resolveScrollbarCrossfade(host, options)
      : null;

    if (
      host.handle?._scrollToProgressFromUi?.(nextProgress, {
        crossfade: crossfade != null,
        durationMs: crossfade?.durationMs,
        easing: crossfade?.easing,
      })
    ) return;

    const fallbackIndex = Math.round(nextProgress * Math.max(0, host.slideCount - 1));
    host.handle?.setIndex(fallbackIndex);
  };

  const flushPendingProgress = (opts?: { crossfade?: boolean }) => {
    const state = pointerStateRef.current;
    if (!state) return false;

    const pending = state.pendingProgress;
    if (pending == null) return false;

    state.pendingProgress = null;
    applyProgress(pending, opts);
    return true;
  };

  const onProgressInput = (event: React.FormEvent<HTMLInputElement>) => {
    const nextProgress = readProgressFromInput(event.currentTarget);
    setScrollbarDom(inputRef.current, nextProgress);

    const state = pointerStateRef.current;
    if (state && !state.startedOnThumb) {
      if (!state.moved) {
        state.pendingProgress = nextProgress;
        return;
      }

      state.pendingProgress = null;
    }

    applyProgress(nextProgress, { crossfade: false });
  };

  const onProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextProgress = readProgressFromInput(event.currentTarget);
    const state = pointerStateRef.current;

    if (state && !state.startedOnThumb) {
      if (state.pendingProgress == null) {
        state.pendingProgress = nextProgress;
      }

      flushPendingProgress({ crossfade: !state.moved });
      return;
    }

    applyProgress(nextProgress, { crossfade: false });
  };

  const onPointerDown: React.PointerEventHandler<HTMLInputElement> = (event) => {
    const startProgress = readProgressFromInput(event.currentTarget);
    pointerStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startProgress,
      startedOnThumb: startedNearRangeThumb(event, host.axis, startProgress),
      moved: false,
      pendingProgress: null,
    };
  };

  const onPointerMove: React.PointerEventHandler<HTMLInputElement> = (event) => {
    const state = pointerStateRef.current;
    if (!state || state.moved) return;

    const distance = Math.hypot(
      event.clientX - state.startX,
      event.clientY - state.startY
    );
    if (distance < DRAG_THRESHOLD_PX) return;

    state.moved = true;
    flushPendingProgress({ crossfade: false });
  };

  const onPointerUp: React.PointerEventHandler<HTMLInputElement> = () => {
    const state = pointerStateRef.current;
    if (!state) return;

    flushPendingProgress({
      crossfade: !state.startedOnThumb && !state.moved,
    });
    pointerStateRef.current = null;
  };

  const onPointerCancel: React.PointerEventHandler<HTMLInputElement> = () => {
    flushPendingProgress({ crossfade: false });
    pointerStateRef.current = null;
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
      onInput: onProgressInput,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
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
      onInput={onProgressInput}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
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
