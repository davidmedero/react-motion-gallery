"use client";

import * as React from "react";

export type WindowSize = { width: number; height: number };

function readSize(): WindowSize {
  return {
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  };
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = React.useState<WindowSize>(() => {
    // SSR-safe initial value
    if (typeof window === "undefined") return { width: 1024, height: 768 };
    return readSize();
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      const next = readSize();
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
