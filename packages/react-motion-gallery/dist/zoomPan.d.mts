import { b as ZoomPanOptions } from './types-CLMzNXt4.mjs';
export { Z as ZoomPanHoverOptions, a as ZoomPanImageProps, c as ZoomPanPlugin, d as ZoomPanPluginKind } from './types-CLMzNXt4.mjs';
import * as React from 'react';

declare const ZoomPanImage: React.ForwardRefExoticComponent<Omit<React.ImgHTMLAttributes<HTMLImageElement>, "style" | "children" | "className"> & {
    className?: string;
    style?: React.CSSProperties;
    imageClassName?: string;
    imageStyle?: React.CSSProperties;
    zoom?: ZoomPanOptions;
    disabled?: boolean;
} & React.RefAttributes<HTMLDivElement>>;

export { ZoomPanImage, ZoomPanOptions, ZoomPanImage as default };
