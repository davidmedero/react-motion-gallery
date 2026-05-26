import { d as GridPlugin, G as GridFullscreenTrigger } from './types-CYB4fl6-.mjs';
import './responsiveNumber-CouEMJ9O.mjs';

declare function resolveGridFullscreenClick(target: EventTarget | null, options?: {
    fullscreenTrigger?: GridFullscreenTrigger;
}): {
    index: number;
    image: HTMLImageElement;
} | null;
declare function gridFullscreen(): GridPlugin;

export { gridFullscreen, resolveGridFullscreenClick };
