import * as React from 'react';

type GalleryLazyLoadRenderArgs = {
    kind: "image" | "video";
    isClone: boolean;
};
type GalleryLazyLoadOptions = {
    enabled?: boolean;
    spinner?: boolean | React.ReactNode | ((args: GalleryLazyLoadRenderArgs) => React.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React.CSSProperties;
};

export type { GalleryLazyLoadOptions as G };
