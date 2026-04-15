import * as React from 'react';

type ZoomPanOptions = {
    clickZoomLevel?: number;
    maxZoomLevel?: number;
    panDuration?: number;
    panFriction?: number;
};
type ZoomPanImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "children" | "className" | "style"> & {
    className?: string;
    style?: React.CSSProperties;
    imageClassName?: string;
    imageStyle?: React.CSSProperties;
    zoom?: ZoomPanOptions;
    disabled?: boolean;
};

export type { ZoomPanImageProps as Z, ZoomPanOptions as a };
