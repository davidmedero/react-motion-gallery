"use client";

import * as React from "react";
import type { SliderDots, SliderPluginRuntimeProps } from "../types";
import styles from "../Slider.module.css";
import { createSliderPlugin } from "./create";

function DotsRuntime({
  host,
  options,
}: SliderPluginRuntimeProps & { options: SliderDots }) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const dotRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const enabled = options.enabled !== false;
  if (!enabled || host.slideCount <= 1) return null;

  const goTo = (index: number) => {
    host.handle?.setIndexFromUi(index, {
      crossfade: host.hasPlugin("crossfade"),
    });
  };

  const hidden = false;
  const render = options.render;
  if (render) {
    return render({
      ref: rootRef,
      count: host.slideCount,
      activeIndex: host.index,
      hidden,
      goTo,
      getDotRef: (index: number) => (node: HTMLDivElement | null) => {
        dotRefs.current[index] = node;
      },
      createRipple: host.createRipple,
      classNameContainer: options.root?.className,
      classNameDot: options.dot?.className,
    } as any);
  }

  return (
    <div
      ref={rootRef}
      data-rmg-part="dots"
      data-rmg-axis={host.axis}
      className={[
        styles.dotsRoot,
        host.axis === "y" ? styles.dotsRootY : styles.dotsRootX,
        "rmgDots",
        options.root?.className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        visibility: hidden ? "hidden" : "visible",
        opacity: hidden ? 0 : 1,
        direction: host.dir,
        ...(options.root?.style ?? {}),
      }}
    >
      {Array.from({ length: host.slideCount }).map((_, index) => {
        const active = host.index === index;
        return (
          <div
            key={index}
            ref={(node) => {
              dotRefs.current[index] = node;
            }}
            className={[
              styles.pagination_dot,
              active ? styles.active : styles.inactive,
              "rmgDot",
              options.dot?.className,
            ]
              .filter(Boolean)
              .join(" ")}
            style={options.dot?.style}
            onMouseDown={(event) => host.createRipple(event.currentTarget)}
            onClick={() => goTo(index)}
          />
        );
      })}
    </div>
  );
}

export function sliderDots(options: SliderDots = {}) {
  return createSliderPlugin("dots", {
    options,
    Runtime: DotsRuntime as React.ComponentType<any>,
  });
}

export type { SliderDots };
