'use client';

import * as React from "react";

export function readViewportWidth(): number {
  if (typeof window !== "undefined" && window.innerWidth > 0) {
    return window.innerWidth;
  }

  if (typeof document !== "undefined" && document.documentElement.clientWidth > 0) {
    return document.documentElement.clientWidth;
  }

  return 0;
}

export function useViewportWidth() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      window.addEventListener("resize", onStoreChange);
      window.visualViewport?.addEventListener("resize", onStoreChange);

      return () => {
        window.removeEventListener("resize", onStoreChange);
        window.visualViewport?.removeEventListener("resize", onStoreChange);
      };
    },
    readViewportWidth,
    () => 0
  );
}
