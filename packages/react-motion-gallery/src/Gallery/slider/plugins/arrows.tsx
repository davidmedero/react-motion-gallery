"use client";

import * as React from "react";
import type { SliderArrows, SliderPluginRuntimeProps } from "../types";
import { createSliderPlugin } from "./create";

function chevron(axis: "x" | "y", dir: "prev" | "next", rtl: boolean) {
  const rotate = axis === "y" ? " rotate(90 12 12)" : "";
  const visualDir = axis === "x" && rtl
    ? dir === "prev"
      ? "next"
      : "prev"
    : dir;
  const path =
    visualDir === "prev"
      ? "M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z"
      : "M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z";
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
      <path d={path} transform={rotate} />
    </svg>
  );
}

function basePlacement(
  axis: "x" | "y",
  dir: "prev" | "next",
  rtl: boolean
): React.CSSProperties {
  if (axis === "y") {
    return dir === "prev"
      ? { top: 10, left: "50%", transform: "translateX(-50%)" }
      : { bottom: 10, left: "50%", transform: "translateX(-50%)" };
  }
  if (rtl) {
    return dir === "prev"
      ? { right: 10, top: "50%", transform: "translateY(-50%)" }
      : { left: 10, top: "50%", transform: "translateY(-50%)" };
  }
  return dir === "prev"
    ? { left: 10, top: "50%", transform: "translateY(-50%)" }
    : { right: 10, top: "50%", transform: "translateY(-50%)" };
}

function ArrowRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderArrows }) {
  const prevRef = React.useRef<HTMLDivElement | null>(null);
  const nextRef = React.useRef<HTMLDivElement | null>(null);
  const enabled = options.enabled !== false;
  if (!enabled || host.slideCount <= 1) return null;

  const renderOne = (dir: "prev" | "next") => {
    const max = Math.max(0, host.slideCount - 1);
    const atFirst = host.index <= 0;
    const atLast = host.index >= max;
    const disabled = !host.loop && (dir === "prev" ? atFirst : atLast);
    const hidden = false;
    const ref = dir === "prev" ? prevRef : nextRef;
    const onClick = () => {
      if (disabled) return;
      const delta = dir === "prev" ? -1 : 1;
      const raw = host.index + delta;
      const next = host.loop ? (raw < 0 ? max : raw > max ? 0 : raw) : raw;
      host.handle?.setIndexFromUi(Math.max(0, Math.min(max, next)), {
        crossfade: host.hasPlugin("crossfade"),
      });
    };
    const className = [
      "rmgArrow",
      `rmgArrow--${dir}`,
      options.arrow?.className,
      dir === "prev" ? options.prev?.className : options.next?.className,
    ]
      .filter(Boolean)
      .join(" ");

    const args = {
      ref,
      onClick,
      hidden,
      disabled,
      createRipple: host.createRipple,
      className,
    };

    const custom =
      dir === "prev"
        ? options.renderPrev?.(args)
        : options.renderNext?.(args);
    if (custom) return custom;
    if (options.render) return options.render({ ...args, dir });

    const mergedStyle: React.CSSProperties = {
      position: "absolute",
      zIndex: 20,
      width: 36,
      height: 36,
      borderRadius: "999px",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,255,255,.75)",
      boxShadow: "0 0 5px rgba(0,0,0,.35)",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.35 : 1,
      transition: "opacity 120ms ease",
      pointerEvents: "auto",
      ...basePlacement(host.axis, dir, host.dir === "rtl"),
      ...(options.arrow?.style ?? {}),
      ...(dir === "prev" ? options.prev?.style : options.next?.style ?? {}),
    };

    return (
      <div
        ref={ref}
        className={className}
        role="button"
        aria-disabled={disabled ? "true" : "false"}
        aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
        onClick={(event) => {
          host.createRipple(event.currentTarget);
          onClick();
        }}
        style={mergedStyle}
      >
        {chevron(host.axis, dir, host.dir === "rtl")}
      </div>
    );
  };

  return (
    <>
      {renderOne("prev")}
      {renderOne("next")}
    </>
  );
}

export function sliderArrows(options: SliderArrows = {}) {
  return createSliderPlugin("arrows", {
    options,
    Runtime: ArrowRuntime as React.ComponentType<any>,
  });
}

export type { SliderArrows };
