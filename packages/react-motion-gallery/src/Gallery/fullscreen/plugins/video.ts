"use client";

import type { FullscreenVideoOptions } from "../types";
import {
  renderFullscreenCrossfadeSlides,
  renderFullscreenSlides,
} from "../renderFullscreenSlides";
import { defaultPlayerStyle } from "../../video/fullscreenPlayerStyle";
import { usePlyrProps } from "../../video/usePlyrProps";
import { createVideoSnapshotStore } from "../../video/videoSnapshotStore";
import { createFullscreenPlugin } from "./create";

export function fullscreenVideo(options?: FullscreenVideoOptions) {
  return createFullscreenPlugin(
    "video",
    {
      options: options ? { video: options } : undefined,
      runtime: {
        usePlyrProps,
        defaultPlayerStyle,
        createVideoSnapshotStore,
        renderSlides: renderFullscreenSlides,
        renderCrossfadeSlides: renderFullscreenCrossfadeSlides,
      },
    }
  );
}
