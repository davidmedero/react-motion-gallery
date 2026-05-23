import type * as React from "react";

export type ZoomPanPluginKind = "hover";

export type ZoomPanPlugin<TOptions = unknown> = {
  readonly __rmgZoomPanPlugin: true;
  readonly kind: ZoomPanPluginKind;
  readonly options?: TOptions;
};

export type ZoomPanHoverOptions = {
  enabled?: boolean;
  zoomLevel?: number;
  zoomInDurationMs?: number;
  zoomOutDurationMs?: number;
};

export type ZoomPanOptions = {
  clickZoomLevel?: number;
  maxZoomLevel?: number;
  panDuration?: number;
  panFriction?: number;
  plugins?: ZoomPanPlugin[];
};

export type ResolvedZoomPanOptions = Required<Omit<ZoomPanOptions, "plugins">> & {
  plugins?: ZoomPanPlugin[];
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
