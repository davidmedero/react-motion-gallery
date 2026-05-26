import { M as MasonryPlugin } from './types-0ntfoMKP.mjs';
import 'react';

declare function resolveMasonryFullscreenClick(target: EventTarget | null): {
    index: number;
    image: HTMLImageElement;
} | null;
declare function masonryFullscreen(): MasonryPlugin;

export { masonryFullscreen, resolveMasonryFullscreenClick };
