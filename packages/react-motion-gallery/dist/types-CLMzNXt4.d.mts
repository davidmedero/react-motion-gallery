import * as React from 'react';

type ZoomPanPluginKind = "hover";
type ZoomPanPlugin<TOptions = unknown> = {
    readonly __rmgZoomPanPlugin: true;
    readonly kind: ZoomPanPluginKind;
    readonly options?: TOptions;
};
type ZoomPanHoverOptions = {
    enabled?: boolean;
    zoomLevel?: number;
    zoomInDurationMs?: number;
    zoomOutDurationMs?: number;
};
type ZoomPanOptions = {
    clickZoomLevel?: number;
    maxZoomLevel?: number;
    panDuration?: number;
    panFriction?: number;
    plugins?: ZoomPanPlugin[];
};
type ZoomPanImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "children" | "className" | "style"> & {
    className?: string;
    style?: React.CSSProperties;
    imageClassName?: string;
    imageStyle?: React.CSSProperties;
    zoom?: ZoomPanOptions;
    disabled?: boolean;
};

export type { ZoomPanHoverOptions as Z, ZoomPanImageProps as a, ZoomPanOptions as b, ZoomPanPlugin as c, ZoomPanPluginKind as d };
