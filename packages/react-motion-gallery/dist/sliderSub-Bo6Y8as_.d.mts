import { I as IndexMode } from './responsive-D_xhZmVI.mjs';

type IndexListener = () => void;
type IndexEventMeta = {
    source?: "thumbnail" | "external";
    transition?: "scroll" | "crossfade";
    crossfade?: {
        durationMs?: number;
        easing?: string;
    };
};
type IndexEvent = {
    type: "set";
    index: number;
    mode: IndexMode;
    meta?: IndexEventMeta;
} | {
    type: "bump";
    delta: number;
    mode: IndexMode;
    meta?: IndexEventMeta;
};
type EventListener = (ev: IndexEvent) => void;
type BasePointerDownListener = () => void;
type SliderIndexChannel = ReturnType<typeof createSliderIndexChannel>;
declare function createSliderIndexChannel(initialIndex?: number, initialMode?: IndexMode): {
    get(): {
        index: number;
        mode: IndexMode;
    };
    set(next: number, m?: IndexMode, opts?: {
        silent?: boolean;
        meta?: IndexEventMeta;
    }): void;
    bump(delta: number, m?: IndexMode, opts?: {
        silent?: boolean;
        meta?: IndexEventMeta;
    }): void;
    subscribe(fn: IndexListener): () => void;
    onEvent(fn: EventListener): () => void;
    onBasePointerDown(fn: BasePointerDownListener): () => void;
    emitBasePointerDown: () => void;
};

export { type SliderIndexChannel as S, createSliderIndexChannel as c };
