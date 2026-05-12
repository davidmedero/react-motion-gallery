"use client";

import * as React from "react";
import type { SliderPluginRuntimeProps, SliderProgress } from "../types";
import { createSliderPlugin } from "./create";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function setProgressDom(
  root: HTMLDivElement | null,
  inner: HTMLDivElement | null,
  progress: number,
  axis: "x" | "y"
) {
  const value = clamp01(progress);
  if (root) {
    root.style.setProperty("--rmg-progress", String(value));
    root.setAttribute("data-rmg-progress", String(value));
    root.setAttribute("aria-valuenow", String(Math.round(value * 100)));
  }
  if (!inner) return;
  if (axis === "y") {
    inner.style.height = `${value * 100}%`;
  } else {
    inner.style.width = `${value * 100}%`;
  }
}

function ProgressRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderProgress }) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  if (options.enabled === false || host.slideCount <= 1) return null;
  const progress = clamp01(host.progress);

  React.useEffect(() => {
    if (options.enabled === false || host.slideCount <= 1) return;

    let raf = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      setProgressDom(
        rootRef.current,
        innerRef.current,
        host.handle?.scrollProgress() ?? progress,
        host.axis
      );
      raf = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [host.axis, host.handle, host.slideCount, options.enabled, progress]);

  if (options.render) {
    return options.render({
      ref: rootRef,
      innerRef,
      hidden: false,
      progress,
      axis: host.axis,
      className: options.root?.className,
      style: options.root?.style,
      innerClassName: options.bar?.className,
      innerStyle: options.bar?.style,
    });
  }

  return (
    <div
      ref={rootRef}
      className={["rmgProgress", options.root?.className].filter(Boolean).join(" ")}
      style={{
        position: "absolute",
        zIndex: 15,
        left: host.axis === "y" ? 6 : "50%",
        top: host.axis === "y" ? "50%" : undefined,
        bottom: host.axis === "y" ? undefined : 6,
        transform: host.axis === "y" ? "translateY(-50%)" : "translateX(-50%)",
        width: host.axis === "y" ? 4 : "60%",
        height: host.axis === "y" ? "60%" : 4,
        borderRadius: 999,
        background: "rgba(80,163,255,.22)",
        overflow: "hidden",
        pointerEvents: "none",
        ["--rmg-progress" as any]: progress,
        ...(options.root?.style ?? {}),
      }}
      aria-hidden
      data-rmg-progress={String(progress)}
    >
      <div
        ref={innerRef}
        className={["rmgProgressBar", options.bar?.className].filter(Boolean).join(" ")}
        style={{
          width: host.axis === "y" ? "100%" : `${progress * 100}%`,
          height: host.axis === "y" ? `${progress * 100}%` : "100%",
          borderRadius: "inherit",
          background: "rgb(80,163,255)",
          transition: "none",
          ...(options.bar?.style ?? {}),
        }}
      />
    </div>
  );
}

export function sliderProgress(options: SliderProgress = {}) {
  return createSliderPlugin("progress", {
    options,
    Runtime: ProgressRuntime as React.ComponentType<any>,
  });
}

export type { SliderProgress };
