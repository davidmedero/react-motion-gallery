import type * as React from "react";

export type ZoomPanOptions = {
  clickZoomLevel?: number;
  maxZoomLevel?: number;
  panDuration?: number;
  panFriction?: number;
};

export type ZoomPanImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "children" | "className" | "style"
> & {
  className?: string;
  style?: React.CSSProperties;
  imageClassName?: string;
  imageStyle?: React.CSSProperties;
  zoom?: ZoomPanOptions;
  disabled?: boolean;
};
