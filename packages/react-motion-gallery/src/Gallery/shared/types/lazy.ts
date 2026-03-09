import type * as React from "react";

export type GalleryLazyLoadRenderArgs = {
  kind: "image" | "video";
  isClone: boolean;
};

export type GalleryLazyLoadOptions = {
  enabled?: boolean;
  spinner?:
    | boolean
    | React.ReactNode
    | ((args: GalleryLazyLoadRenderArgs) => React.ReactNode);
  spinnerClassName?: string;
  spinnerStyle?: React.CSSProperties;
};

export type GalleryLazyLoadResolved = {
  enabled: boolean;
  spinner: GalleryLazyLoadOptions["spinner"];
  spinnerClassName?: string;
  spinnerStyle?: React.CSSProperties;
};
