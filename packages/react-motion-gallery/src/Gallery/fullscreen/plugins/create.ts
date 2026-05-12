"use client";

import type * as React from "react";
import type {
  FullscreenPlugin,
  FullscreenPluginKind,
  FullscreenPluginOptions,
  FullscreenRuntimeFeatures,
} from "../types";
import type { FullscreenRuntimeProps } from "../FullscreenRuntime";

export type CreateFullscreenPluginConfig = {
  options?: FullscreenPluginOptions;
  runtime?: FullscreenRuntimeFeatures;
  RuntimeHost?: React.ComponentType<FullscreenRuntimeProps>;
  preload?: () => void;
};

export function createFullscreenPlugin(
  kind: FullscreenPluginKind,
  config: CreateFullscreenPluginConfig = {}
): FullscreenPlugin {
  return {
    __rmgFullscreenPlugin: true,
    kind,
    options: config.options,
    runtime: config.runtime,
    RuntimeHost: config.RuntimeHost,
    preload: config.preload,
  };
}
