"use client";

import * as React from "react";
import type { FullscreenRuntimeProps } from "./FullscreenRuntime";

const loadFullscreenRuntime = () =>
  import("./FullscreenRuntime").then((mod) => ({
    default: mod.default ?? mod.FullscreenRuntime,
  }));

const LazyFullscreenRuntime = React.lazy(loadFullscreenRuntime);

export function preloadFullscreenRuntime() {
  void loadFullscreenRuntime();
}

export function FullscreenRuntimeHost(props: FullscreenRuntimeProps) {
  return (
    <React.Suspense fallback={null}>
      <LazyFullscreenRuntime {...props} />
    </React.Suspense>
  );
}

export default FullscreenRuntimeHost;
