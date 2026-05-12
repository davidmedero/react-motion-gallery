"use client";

import {
  FullscreenRuntimeHost,
  preloadFullscreenRuntime,
} from "../FullscreenRuntimeHost";
import type { FullscreenPluginKind, FullscreenPluginOptions } from "../types";
import { createFullscreenPlugin } from "./create";

export function createLegacyFullscreenRuntimePlugin(
  kind: FullscreenPluginKind,
  options?: FullscreenPluginOptions
) {
  return createFullscreenPlugin(kind, {
    options,
    RuntimeHost: FullscreenRuntimeHost,
    preload: preloadFullscreenRuntime,
  });
}

