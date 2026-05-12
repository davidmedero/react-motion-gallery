"use client";

import * as React from "react";
import { readViewportWidth } from "./useViewportWidth";

export type WindowSize = { width: number; height: number };

export function readWindowSize(): WindowSize {
  return {
    width: readViewportWidth(),
    height:
      typeof window !== "undefined" && window.innerHeight > 0
        ? window.innerHeight
        : 0,
  };
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = React.useState<WindowSize>(() => {
    // SSR-safe initial value
    if (typeof window === "undefined") return { width: 1024, height: 768 };
    return readWindowSize();
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      const next = readWindowSize();
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next
      );
    };
    window.addEventListener("resize", onResize);
    onResize();

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}
