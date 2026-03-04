'use client';

import * as React from "react";

export function useViewportWidth() {
  const [vw, setVw] = React.useState(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return vw;
}