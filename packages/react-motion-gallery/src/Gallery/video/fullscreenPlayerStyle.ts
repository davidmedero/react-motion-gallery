import type * as React from "react";

export const defaultPlayerStyle: React.CSSProperties = {
  aspectRatio: "16 / 9",
  height: "auto",
  width: "100%",
  maxWidth: "calc(100dvh * (16 / 9))",
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
};