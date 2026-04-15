import { a as ZoomPanOptions } from './types-Dhh8xfHo.mjs';
export { Z as ZoomPanImageProps } from './types-Dhh8xfHo.mjs';
import * as React from 'react';

declare const ZoomPanImage: React.ForwardRefExoticComponent<Omit<React.ImgHTMLAttributes<HTMLImageElement>, "style" | "children" | "className"> & {
    className?: string;
    style?: React.CSSProperties;
    imageClassName?: string;
    imageStyle?: React.CSSProperties;
    zoom?: ZoomPanOptions;
    disabled?: boolean;
} & React.RefAttributes<HTMLDivElement>>;

declare const DEFAULT_ZOOM_PAN: Required<ZoomPanOptions>;

export { DEFAULT_ZOOM_PAN, ZoomPanImage, ZoomPanOptions, ZoomPanImage as default };
