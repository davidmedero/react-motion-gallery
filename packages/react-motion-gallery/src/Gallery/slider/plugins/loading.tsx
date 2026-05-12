"use client";

import * as React from "react";
import type { SliderLoadingOptions } from "../types";
import styles from "../Slider.module.css";
import { createSliderPlugin } from "./create";

function isForced(force: SliderLoadingOptions["force"]) {
  if (force === true) return true;
  if (typeof force === "object" && force != null) return force.enabled === true;
  return false;
}

function renderLoadingOverlay(host: any, rawOptions?: unknown) {
  const options = (rawOptions ?? {}) as SliderLoadingOptions;
  if (options.enabled === false || !options.renderLoading) return null;
  const show = isForced(options.force) || !host.handle?.isReady();
  if (!show) return null;
  return (
    <div className={styles.loadingLayer} aria-hidden="true">
      {options.renderLoading({ count: Math.max(1, host.cellsInView.length || 1) })}
    </div>
  );
}

export function sliderLoading(options: SliderLoadingOptions = {}) {
  return createSliderPlugin("loading", {
    options,
    renderOverlay: renderLoadingOverlay,
  });
}

export type { SliderLoadingOptions };
